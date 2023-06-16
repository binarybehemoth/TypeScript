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
exports.getModuleNameStringLiteralAt = exports.getResolutionDiagnostic = exports.resolveProjectReferencePath = exports.createPrependNodes = exports.parseConfigHostFromCompilerHostLike = exports.filterSemanticDiagnostics = exports.handleNoEmitOptions = exports.emitSkippedWithNoDiagnostics = exports.createProgram = exports.plainJSErrors = exports.getImpliedNodeFormatForFileWorker = exports.getImpliedNodeFormatForFile = exports.getConfigFileParsingDiagnostics = exports.isProgramUptoDate = exports.getReferencedFileLocation = exports.isReferenceFileLocation = exports.isReferencedFile = exports.getInferredLibraryNameResolveFrom = exports.inferredTypesContainingFile = exports.forEachResolvedProjectReference = exports.loadWithModeAwareCache = exports.createTypeReferenceResolutionLoader = exports.typeReferenceResolutionNameAndModeGetter = exports.createModuleResolutionLoader = exports.moduleResolutionNameAndModeGetter = exports.getResolutionModeOverrideForClause = exports.getModeForUsageLocation = exports.isExclusivelyTypeOnlyImportOrExport = exports.getModeForResolutionAtIndex = exports.getModeForFileReference = exports.flattenDiagnosticMessageText = exports.formatDiagnosticsWithColorAndContext = exports.formatLocation = exports.formatColorAndReset = exports.ForegroundColorEscapeSequences = exports.formatDiagnostic = exports.formatDiagnostics = exports.getPreEmitDiagnostics = exports.changeCompilerHostLikeToUseCache = exports.createCompilerHostWorker = exports.createWriteFileMeasuringIO = exports.createGetSourceFile = exports.createCompilerHost = exports.computeCommonSourceDirectoryOfFilenames = exports.resolveTripleslashReference = exports.findConfigFile = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
function findConfigFile(searchPath, fileExists, configName) {
    if (configName === void 0) { configName = "tsconfig.json"; }
    return (0, ts_1.forEachAncestorDirectory)(searchPath, function (ancestor) {
        var fileName = (0, ts_1.combinePaths)(ancestor, configName);
        return fileExists(fileName) ? fileName : undefined;
    });
}
exports.findConfigFile = findConfigFile;
function resolveTripleslashReference(moduleName, containingFile) {
    var basePath = (0, ts_1.getDirectoryPath)(containingFile);
    var referencedFileName = (0, ts_1.isRootedDiskPath)(moduleName) ? moduleName : (0, ts_1.combinePaths)(basePath, moduleName);
    return (0, ts_1.normalizePath)(referencedFileName);
}
exports.resolveTripleslashReference = resolveTripleslashReference;
/** @internal */
function computeCommonSourceDirectoryOfFilenames(fileNames, currentDirectory, getCanonicalFileName) {
    var commonPathComponents;
    var failed = (0, ts_1.forEach)(fileNames, function (sourceFile) {
        // Each file contributes into common source file path
        var sourcePathComponents = (0, ts_1.getNormalizedPathComponents)(sourceFile, currentDirectory);
        sourcePathComponents.pop(); // The base file name is not part of the common directory path
        if (!commonPathComponents) {
            // first file
            commonPathComponents = sourcePathComponents;
            return;
        }
        var n = Math.min(commonPathComponents.length, sourcePathComponents.length);
        for (var i = 0; i < n; i++) {
            if (getCanonicalFileName(commonPathComponents[i]) !== getCanonicalFileName(sourcePathComponents[i])) {
                if (i === 0) {
                    // Failed to find any common path component
                    return true;
                }
                // New common path found that is 0 -> i-1
                commonPathComponents.length = i;
                break;
            }
        }
        // If the sourcePathComponents was shorter than the commonPathComponents, truncate to the sourcePathComponents
        if (sourcePathComponents.length < commonPathComponents.length) {
            commonPathComponents.length = sourcePathComponents.length;
        }
    });
    // A common path can not be found when paths span multiple drives on windows, for example
    if (failed) {
        return "";
    }
    if (!commonPathComponents) { // Can happen when all input files are .d.ts files
        return currentDirectory;
    }
    return (0, ts_1.getPathFromPathComponents)(commonPathComponents);
}
exports.computeCommonSourceDirectoryOfFilenames = computeCommonSourceDirectoryOfFilenames;
function createCompilerHost(options, setParentNodes) {
    return createCompilerHostWorker(options, setParentNodes);
}
exports.createCompilerHost = createCompilerHost;
/** @internal */
function createGetSourceFile(readFile, getCompilerOptions, setParentNodes) {
    return function (fileName, languageVersionOrOptions, onError) {
        var text;
        try {
            performance.mark("beforeIORead");
            text = readFile(fileName, getCompilerOptions().charset);
            performance.mark("afterIORead");
            performance.measure("I/O Read", "beforeIORead", "afterIORead");
        }
        catch (e) {
            if (onError) {
                onError(e.message);
            }
            text = "";
        }
        return text !== undefined ? (0, ts_1.createSourceFile)(fileName, text, languageVersionOrOptions, setParentNodes) : undefined;
    };
}
exports.createGetSourceFile = createGetSourceFile;
/** @internal */
function createWriteFileMeasuringIO(actualWriteFile, createDirectory, directoryExists) {
    return function (fileName, data, writeByteOrderMark, onError) {
        try {
            performance.mark("beforeIOWrite");
            // NOTE: If patchWriteFileEnsuringDirectory has been called,
            // the system.writeFile will do its own directory creation and
            // the ensureDirectoriesExist call will always be redundant.
            (0, ts_1.writeFileEnsuringDirectories)(fileName, data, writeByteOrderMark, actualWriteFile, createDirectory, directoryExists);
            performance.mark("afterIOWrite");
            performance.measure("I/O Write", "beforeIOWrite", "afterIOWrite");
        }
        catch (e) {
            if (onError) {
                onError(e.message);
            }
        }
    };
}
exports.createWriteFileMeasuringIO = createWriteFileMeasuringIO;
/** @internal */
function createCompilerHostWorker(options, setParentNodes, system) {
    if (system === void 0) { system = ts_1.sys; }
    var existingDirectories = new Map();
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(system.useCaseSensitiveFileNames);
    function directoryExists(directoryPath) {
        if (existingDirectories.has(directoryPath)) {
            return true;
        }
        if ((compilerHost.directoryExists || system.directoryExists)(directoryPath)) {
            existingDirectories.set(directoryPath, true);
            return true;
        }
        return false;
    }
    function getDefaultLibLocation() {
        return (0, ts_1.getDirectoryPath)((0, ts_1.normalizePath)(system.getExecutingFilePath()));
    }
    var newLine = (0, ts_1.getNewLineCharacter)(options);
    var realpath = system.realpath && (function (path) { return system.realpath(path); });
    var compilerHost = {
        getSourceFile: createGetSourceFile(function (fileName) { return compilerHost.readFile(fileName); }, function () { return options; }, setParentNodes),
        getDefaultLibLocation: getDefaultLibLocation,
        getDefaultLibFileName: function (options) { return (0, ts_1.combinePaths)(getDefaultLibLocation(), (0, ts_1.getDefaultLibFileName)(options)); },
        writeFile: createWriteFileMeasuringIO(function (path, data, writeByteOrderMark) { return system.writeFile(path, data, writeByteOrderMark); }, function (path) { return (compilerHost.createDirectory || system.createDirectory)(path); }, function (path) { return directoryExists(path); }),
        getCurrentDirectory: (0, ts_1.memoize)(function () { return system.getCurrentDirectory(); }),
        useCaseSensitiveFileNames: function () { return system.useCaseSensitiveFileNames; },
        getCanonicalFileName: getCanonicalFileName,
        getNewLine: function () { return newLine; },
        fileExists: function (fileName) { return system.fileExists(fileName); },
        readFile: function (fileName) { return system.readFile(fileName); },
        trace: function (s) { return system.write(s + newLine); },
        directoryExists: function (directoryName) { return system.directoryExists(directoryName); },
        getEnvironmentVariable: function (name) { return system.getEnvironmentVariable ? system.getEnvironmentVariable(name) : ""; },
        getDirectories: function (path) { return system.getDirectories(path); },
        realpath: realpath,
        readDirectory: function (path, extensions, include, exclude, depth) { return system.readDirectory(path, extensions, include, exclude, depth); },
        createDirectory: function (d) { return system.createDirectory(d); },
        createHash: (0, ts_1.maybeBind)(system, system.createHash)
    };
    return compilerHost;
}
exports.createCompilerHostWorker = createCompilerHostWorker;
/** @internal */
function changeCompilerHostLikeToUseCache(host, toPath, getSourceFile) {
    var originalReadFile = host.readFile;
    var originalFileExists = host.fileExists;
    var originalDirectoryExists = host.directoryExists;
    var originalCreateDirectory = host.createDirectory;
    var originalWriteFile = host.writeFile;
    var readFileCache = new Map();
    var fileExistsCache = new Map();
    var directoryExistsCache = new Map();
    var sourceFileCache = new Map();
    var readFileWithCache = function (fileName) {
        var key = toPath(fileName);
        var value = readFileCache.get(key);
        if (value !== undefined)
            return value !== false ? value : undefined;
        return setReadFileCache(key, fileName);
    };
    var setReadFileCache = function (key, fileName) {
        var newValue = originalReadFile.call(host, fileName);
        readFileCache.set(key, newValue !== undefined ? newValue : false);
        return newValue;
    };
    host.readFile = function (fileName) {
        var key = toPath(fileName);
        var value = readFileCache.get(key);
        if (value !== undefined)
            return value !== false ? value : undefined; // could be .d.ts from output
        // Cache json or buildInfo
        if (!(0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */) && !(0, ts_1.isBuildInfoFile)(fileName)) {
            return originalReadFile.call(host, fileName);
        }
        return setReadFileCache(key, fileName);
    };
    var getSourceFileWithCache = getSourceFile ? function (fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) {
        var key = toPath(fileName);
        var impliedNodeFormat = typeof languageVersionOrOptions === "object" ? languageVersionOrOptions.impliedNodeFormat : undefined;
        var forImpliedNodeFormat = sourceFileCache.get(impliedNodeFormat);
        var value = forImpliedNodeFormat === null || forImpliedNodeFormat === void 0 ? void 0 : forImpliedNodeFormat.get(key);
        if (value)
            return value;
        var sourceFile = getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
        if (sourceFile && ((0, ts_1.isDeclarationFileName)(fileName) || (0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */))) {
            sourceFileCache.set(impliedNodeFormat, (forImpliedNodeFormat || new Map()).set(key, sourceFile));
        }
        return sourceFile;
    } : undefined;
    // fileExists for any kind of extension
    host.fileExists = function (fileName) {
        var key = toPath(fileName);
        var value = fileExistsCache.get(key);
        if (value !== undefined)
            return value;
        var newValue = originalFileExists.call(host, fileName);
        fileExistsCache.set(key, !!newValue);
        return newValue;
    };
    if (originalWriteFile) {
        host.writeFile = function (fileName, data) {
            var rest = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                rest[_i - 2] = arguments[_i];
            }
            var key = toPath(fileName);
            fileExistsCache.delete(key);
            var value = readFileCache.get(key);
            if (value !== undefined && value !== data) {
                readFileCache.delete(key);
                sourceFileCache.forEach(function (map) { return map.delete(key); });
            }
            else if (getSourceFileWithCache) {
                sourceFileCache.forEach(function (map) {
                    var sourceFile = map.get(key);
                    if (sourceFile && sourceFile.text !== data) {
                        map.delete(key);
                    }
                });
            }
            originalWriteFile.call.apply(originalWriteFile, __spreadArray([host, fileName, data], rest, false));
        };
    }
    // directoryExists
    if (originalDirectoryExists) {
        host.directoryExists = function (directory) {
            var key = toPath(directory);
            var value = directoryExistsCache.get(key);
            if (value !== undefined)
                return value;
            var newValue = originalDirectoryExists.call(host, directory);
            directoryExistsCache.set(key, !!newValue);
            return newValue;
        };
        if (originalCreateDirectory) {
            host.createDirectory = function (directory) {
                var key = toPath(directory);
                directoryExistsCache.delete(key);
                originalCreateDirectory.call(host, directory);
            };
        }
    }
    return {
        originalReadFile: originalReadFile,
        originalFileExists: originalFileExists,
        originalDirectoryExists: originalDirectoryExists,
        originalCreateDirectory: originalCreateDirectory,
        originalWriteFile: originalWriteFile,
        getSourceFileWithCache: getSourceFileWithCache,
        readFileWithCache: readFileWithCache
    };
}
exports.changeCompilerHostLikeToUseCache = changeCompilerHostLikeToUseCache;
function getPreEmitDiagnostics(program, sourceFile, cancellationToken) {
    var diagnostics;
    diagnostics = (0, ts_1.addRange)(diagnostics, program.getConfigFileParsingDiagnostics());
    diagnostics = (0, ts_1.addRange)(diagnostics, program.getOptionsDiagnostics(cancellationToken));
    diagnostics = (0, ts_1.addRange)(diagnostics, program.getSyntacticDiagnostics(sourceFile, cancellationToken));
    diagnostics = (0, ts_1.addRange)(diagnostics, program.getGlobalDiagnostics(cancellationToken));
    diagnostics = (0, ts_1.addRange)(diagnostics, program.getSemanticDiagnostics(sourceFile, cancellationToken));
    if ((0, ts_1.getEmitDeclarations)(program.getCompilerOptions())) {
        diagnostics = (0, ts_1.addRange)(diagnostics, program.getDeclarationDiagnostics(sourceFile, cancellationToken));
    }
    return (0, ts_1.sortAndDeduplicateDiagnostics)(diagnostics || ts_1.emptyArray);
}
exports.getPreEmitDiagnostics = getPreEmitDiagnostics;
function formatDiagnostics(diagnostics, host) {
    var output = "";
    for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
        var diagnostic = diagnostics_1[_i];
        output += formatDiagnostic(diagnostic, host);
    }
    return output;
}
exports.formatDiagnostics = formatDiagnostics;
function formatDiagnostic(diagnostic, host) {
    var errorMessage = "".concat((0, ts_1.diagnosticCategoryName)(diagnostic), " TS").concat(diagnostic.code, ": ").concat(flattenDiagnosticMessageText(diagnostic.messageText, host.getNewLine())).concat(host.getNewLine());
    if (diagnostic.file) {
        var _a = (0, ts_1.getLineAndCharacterOfPosition)(diagnostic.file, diagnostic.start), line = _a.line, character = _a.character; // TODO: GH#18217
        var fileName = diagnostic.file.fileName;
        var relativeFileName = (0, ts_1.convertToRelativePath)(fileName, host.getCurrentDirectory(), function (fileName) { return host.getCanonicalFileName(fileName); });
        return "".concat(relativeFileName, "(").concat(line + 1, ",").concat(character + 1, "): ") + errorMessage;
    }
    return errorMessage;
}
exports.formatDiagnostic = formatDiagnostic;
/** @internal */
var ForegroundColorEscapeSequences;
(function (ForegroundColorEscapeSequences) {
    ForegroundColorEscapeSequences["Grey"] = "\u001B[90m";
    ForegroundColorEscapeSequences["Red"] = "\u001B[91m";
    ForegroundColorEscapeSequences["Yellow"] = "\u001B[93m";
    ForegroundColorEscapeSequences["Blue"] = "\u001B[94m";
    ForegroundColorEscapeSequences["Cyan"] = "\u001B[96m";
})(ForegroundColorEscapeSequences || (exports.ForegroundColorEscapeSequences = ForegroundColorEscapeSequences = {}));
var gutterStyleSequence = "\u001b[7m";
var gutterSeparator = " ";
var resetEscapeSequence = "\u001b[0m";
var ellipsis = "...";
var halfIndent = "  ";
var indent = "    ";
function getCategoryFormat(category) {
    switch (category) {
        case ts_1.DiagnosticCategory.Error: return ForegroundColorEscapeSequences.Red;
        case ts_1.DiagnosticCategory.Warning: return ForegroundColorEscapeSequences.Yellow;
        case ts_1.DiagnosticCategory.Suggestion: return ts_1.Debug.fail("Should never get an Info diagnostic on the command line.");
        case ts_1.DiagnosticCategory.Message: return ForegroundColorEscapeSequences.Blue;
    }
}
/** @internal */
function formatColorAndReset(text, formatStyle) {
    return formatStyle + text + resetEscapeSequence;
}
exports.formatColorAndReset = formatColorAndReset;
function formatCodeSpan(file, start, length, indent, squiggleColor, host) {
    var _a = (0, ts_1.getLineAndCharacterOfPosition)(file, start), firstLine = _a.line, firstLineChar = _a.character;
    var _b = (0, ts_1.getLineAndCharacterOfPosition)(file, start + length), lastLine = _b.line, lastLineChar = _b.character;
    var lastLineInFile = (0, ts_1.getLineAndCharacterOfPosition)(file, file.text.length).line;
    var hasMoreThanFiveLines = (lastLine - firstLine) >= 4;
    var gutterWidth = (lastLine + 1 + "").length;
    if (hasMoreThanFiveLines) {
        gutterWidth = Math.max(ellipsis.length, gutterWidth);
    }
    var context = "";
    for (var i = firstLine; i <= lastLine; i++) {
        context += host.getNewLine();
        // If the error spans over 5 lines, we'll only show the first 2 and last 2 lines,
        // so we'll skip ahead to the second-to-last line.
        if (hasMoreThanFiveLines && firstLine + 1 < i && i < lastLine - 1) {
            context += indent + formatColorAndReset((0, ts_1.padLeft)(ellipsis, gutterWidth), gutterStyleSequence) + gutterSeparator + host.getNewLine();
            i = lastLine - 1;
        }
        var lineStart = (0, ts_1.getPositionOfLineAndCharacter)(file, i, 0);
        var lineEnd = i < lastLineInFile ? (0, ts_1.getPositionOfLineAndCharacter)(file, i + 1, 0) : file.text.length;
        var lineContent = file.text.slice(lineStart, lineEnd);
        lineContent = (0, ts_1.trimStringEnd)(lineContent); // trim from end
        lineContent = lineContent.replace(/\t/g, " "); // convert tabs to single spaces
        // Output the gutter and the actual contents of the line.
        context += indent + formatColorAndReset((0, ts_1.padLeft)(i + 1 + "", gutterWidth), gutterStyleSequence) + gutterSeparator;
        context += lineContent + host.getNewLine();
        // Output the gutter and the error span for the line using tildes.
        context += indent + formatColorAndReset((0, ts_1.padLeft)("", gutterWidth), gutterStyleSequence) + gutterSeparator;
        context += squiggleColor;
        if (i === firstLine) {
            // If we're on the last line, then limit it to the last character of the last line.
            // Otherwise, we'll just squiggle the rest of the line, giving 'slice' no end position.
            var lastCharForLine = i === lastLine ? lastLineChar : undefined;
            context += lineContent.slice(0, firstLineChar).replace(/\S/g, " ");
            context += lineContent.slice(firstLineChar, lastCharForLine).replace(/./g, "~");
        }
        else if (i === lastLine) {
            context += lineContent.slice(0, lastLineChar).replace(/./g, "~");
        }
        else {
            // Squiggle the entire line.
            context += lineContent.replace(/./g, "~");
        }
        context += resetEscapeSequence;
    }
    return context;
}
/** @internal */
function formatLocation(file, start, host, color) {
    if (color === void 0) { color = formatColorAndReset; }
    var _a = (0, ts_1.getLineAndCharacterOfPosition)(file, start), firstLine = _a.line, firstLineChar = _a.character; // TODO: GH#18217
    var relativeFileName = host ? (0, ts_1.convertToRelativePath)(file.fileName, host.getCurrentDirectory(), function (fileName) { return host.getCanonicalFileName(fileName); }) : file.fileName;
    var output = "";
    output += color(relativeFileName, ForegroundColorEscapeSequences.Cyan);
    output += ":";
    output += color("".concat(firstLine + 1), ForegroundColorEscapeSequences.Yellow);
    output += ":";
    output += color("".concat(firstLineChar + 1), ForegroundColorEscapeSequences.Yellow);
    return output;
}
exports.formatLocation = formatLocation;
function formatDiagnosticsWithColorAndContext(diagnostics, host) {
    var output = "";
    for (var _i = 0, diagnostics_2 = diagnostics; _i < diagnostics_2.length; _i++) {
        var diagnostic = diagnostics_2[_i];
        if (diagnostic.file) {
            var file = diagnostic.file, start = diagnostic.start;
            output += formatLocation(file, start, host); // TODO: GH#18217
            output += " - ";
        }
        output += formatColorAndReset((0, ts_1.diagnosticCategoryName)(diagnostic), getCategoryFormat(diagnostic.category));
        output += formatColorAndReset(" TS".concat(diagnostic.code, ": "), ForegroundColorEscapeSequences.Grey);
        output += flattenDiagnosticMessageText(diagnostic.messageText, host.getNewLine());
        if (diagnostic.file && diagnostic.code !== ts_1.Diagnostics.File_appears_to_be_binary.code) {
            output += host.getNewLine();
            output += formatCodeSpan(diagnostic.file, diagnostic.start, diagnostic.length, "", getCategoryFormat(diagnostic.category), host); // TODO: GH#18217
        }
        if (diagnostic.relatedInformation) {
            output += host.getNewLine();
            for (var _a = 0, _b = diagnostic.relatedInformation; _a < _b.length; _a++) {
                var _c = _b[_a], file = _c.file, start = _c.start, length_1 = _c.length, messageText = _c.messageText;
                if (file) {
                    output += host.getNewLine();
                    output += halfIndent + formatLocation(file, start, host); // TODO: GH#18217
                    output += formatCodeSpan(file, start, length_1, indent, ForegroundColorEscapeSequences.Cyan, host); // TODO: GH#18217
                }
                output += host.getNewLine();
                output += indent + flattenDiagnosticMessageText(messageText, host.getNewLine());
            }
        }
        output += host.getNewLine();
    }
    return output;
}
exports.formatDiagnosticsWithColorAndContext = formatDiagnosticsWithColorAndContext;
function flattenDiagnosticMessageText(diag, newLine, indent) {
    if (indent === void 0) { indent = 0; }
    if ((0, ts_1.isString)(diag)) {
        return diag;
    }
    else if (diag === undefined) {
        return "";
    }
    var result = "";
    if (indent) {
        result += newLine;
        for (var i = 0; i < indent; i++) {
            result += "  ";
        }
    }
    result += diag.messageText;
    indent++;
    if (diag.next) {
        for (var _i = 0, _a = diag.next; _i < _a.length; _i++) {
            var kid = _a[_i];
            result += flattenDiagnosticMessageText(kid, newLine, indent);
        }
    }
    return result;
}
exports.flattenDiagnosticMessageText = flattenDiagnosticMessageText;
/**
 * Calculates the resulting resolution mode for some reference in some file - this is generally the explicitly
 * provided resolution mode in the reference, unless one is not present, in which case it is the mode of the containing file.
 */
function getModeForFileReference(ref, containingFileMode) {
    return ((0, ts_1.isString)(ref) ? containingFileMode : ref.resolutionMode) || containingFileMode;
}
exports.getModeForFileReference = getModeForFileReference;
function getModeForResolutionAtIndex(file, index) {
    if (file.impliedNodeFormat === undefined)
        return undefined;
    // we ensure all elements of file.imports and file.moduleAugmentations have the relevant parent pointers set during program setup,
    // so it's safe to use them even pre-bind
    return getModeForUsageLocation(file, getModuleNameStringLiteralAt(file, index));
}
exports.getModeForResolutionAtIndex = getModeForResolutionAtIndex;
/** @internal */
function isExclusivelyTypeOnlyImportOrExport(decl) {
    var _a;
    if ((0, ts_1.isExportDeclaration)(decl)) {
        return decl.isTypeOnly;
    }
    if ((_a = decl.importClause) === null || _a === void 0 ? void 0 : _a.isTypeOnly) {
        return true;
    }
    return false;
}
exports.isExclusivelyTypeOnlyImportOrExport = isExclusivelyTypeOnlyImportOrExport;
/**
 * Calculates the final resolution mode for a given module reference node. This is generally the explicitly provided resolution mode, if
 * one exists, or the mode of the containing source file. (Excepting import=require, which is always commonjs, and dynamic import, which is always esm).
 * Notably, this function always returns `undefined` if the containing file has an `undefined` `impliedNodeFormat` - this field is only set when
 * `moduleResolution` is `node16`+.
 * @param file The file the import or import-like reference is contained within
 * @param usage The module reference string
 * @returns The final resolution mode of the import
 */
function getModeForUsageLocation(file, usage) {
    var _a, _b;
    if (file.impliedNodeFormat === undefined)
        return undefined;
    if (((0, ts_1.isImportDeclaration)(usage.parent) || (0, ts_1.isExportDeclaration)(usage.parent))) {
        var isTypeOnly = isExclusivelyTypeOnlyImportOrExport(usage.parent);
        if (isTypeOnly) {
            var override = getResolutionModeOverrideForClause(usage.parent.assertClause);
            if (override) {
                return override;
            }
        }
    }
    if (usage.parent.parent && (0, ts_1.isImportTypeNode)(usage.parent.parent)) {
        var override = getResolutionModeOverrideForClause((_a = usage.parent.parent.assertions) === null || _a === void 0 ? void 0 : _a.assertClause);
        if (override) {
            return override;
        }
    }
    if (file.impliedNodeFormat !== ts_1.ModuleKind.ESNext) {
        // in cjs files, import call expressions are esm format, otherwise everything is cjs
        return (0, ts_1.isImportCall)((0, ts_1.walkUpParenthesizedExpressions)(usage.parent)) ? ts_1.ModuleKind.ESNext : ts_1.ModuleKind.CommonJS;
    }
    // in esm files, import=require statements are cjs format, otherwise everything is esm
    // imports are only parent'd up to their containing declaration/expression, so access farther parents with care
    var exprParentParent = (_b = (0, ts_1.walkUpParenthesizedExpressions)(usage.parent)) === null || _b === void 0 ? void 0 : _b.parent;
    return exprParentParent && (0, ts_1.isImportEqualsDeclaration)(exprParentParent) ? ts_1.ModuleKind.CommonJS : ts_1.ModuleKind.ESNext;
}
exports.getModeForUsageLocation = getModeForUsageLocation;
/** @internal */
function getResolutionModeOverrideForClause(clause, grammarErrorOnNode) {
    if (!clause)
        return undefined;
    if ((0, ts_1.length)(clause.elements) !== 1) {
        grammarErrorOnNode === null || grammarErrorOnNode === void 0 ? void 0 : grammarErrorOnNode(clause, ts_1.Diagnostics.Type_import_assertions_should_have_exactly_one_key_resolution_mode_with_value_import_or_require);
        return undefined;
    }
    var elem = clause.elements[0];
    if (!(0, ts_1.isStringLiteralLike)(elem.name))
        return undefined;
    if (elem.name.text !== "resolution-mode") {
        grammarErrorOnNode === null || grammarErrorOnNode === void 0 ? void 0 : grammarErrorOnNode(elem.name, ts_1.Diagnostics.resolution_mode_is_the_only_valid_key_for_type_import_assertions);
        return undefined;
    }
    if (!(0, ts_1.isStringLiteralLike)(elem.value))
        return undefined;
    if (elem.value.text !== "import" && elem.value.text !== "require") {
        grammarErrorOnNode === null || grammarErrorOnNode === void 0 ? void 0 : grammarErrorOnNode(elem.value, ts_1.Diagnostics.resolution_mode_should_be_either_require_or_import);
        return undefined;
    }
    return elem.value.text === "import" ? ts_1.ModuleKind.ESNext : ts_1.ModuleKind.CommonJS;
}
exports.getResolutionModeOverrideForClause = getResolutionModeOverrideForClause;
var emptyResolution = {
    resolvedModule: undefined,
    resolvedTypeReferenceDirective: undefined,
};
function getModuleResolutionName(literal) {
    return literal.text;
}
/** @internal */
exports.moduleResolutionNameAndModeGetter = {
    getName: getModuleResolutionName,
    getMode: function (entry, file) { return getModeForUsageLocation(file, entry); },
};
/** @internal */
function createModuleResolutionLoader(containingFile, redirectedReference, options, host, cache) {
    return {
        nameAndMode: exports.moduleResolutionNameAndModeGetter,
        resolve: function (moduleName, resolutionMode) { return (0, ts_1.resolveModuleName)(moduleName, containingFile, options, host, cache, redirectedReference, resolutionMode); },
    };
}
exports.createModuleResolutionLoader = createModuleResolutionLoader;
function getTypeReferenceResolutionName(entry) {
    // We lower-case all type references because npm automatically lowercases all packages. See GH#9824.
    return !(0, ts_1.isString)(entry) ? (0, ts_1.toFileNameLowerCase)(entry.fileName) : entry;
}
/** @internal */
exports.typeReferenceResolutionNameAndModeGetter = {
    getName: getTypeReferenceResolutionName,
    getMode: function (entry, file) { return getModeForFileReference(entry, file === null || file === void 0 ? void 0 : file.impliedNodeFormat); },
};
/** @internal */
function createTypeReferenceResolutionLoader(containingFile, redirectedReference, options, host, cache) {
    return {
        nameAndMode: exports.typeReferenceResolutionNameAndModeGetter,
        resolve: function (typeRef, resoluionMode) { return (0, ts_1.resolveTypeReferenceDirective)(typeRef, containingFile, options, host, redirectedReference, cache, resoluionMode); },
    };
}
exports.createTypeReferenceResolutionLoader = createTypeReferenceResolutionLoader;
/** @internal */
function loadWithModeAwareCache(entries, containingFile, redirectedReference, options, containingSourceFile, host, resolutionCache, createLoader) {
    if (entries.length === 0)
        return ts_1.emptyArray;
    var resolutions = [];
    var cache = new Map();
    var loader = createLoader(containingFile, redirectedReference, options, host, resolutionCache);
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        var name_1 = loader.nameAndMode.getName(entry);
        var mode = loader.nameAndMode.getMode(entry, containingSourceFile);
        var key = (0, ts_1.createModeAwareCacheKey)(name_1, mode);
        var result = cache.get(key);
        if (!result) {
            cache.set(key, result = loader.resolve(name_1, mode));
        }
        resolutions.push(result);
    }
    return resolutions;
}
exports.loadWithModeAwareCache = loadWithModeAwareCache;
/** @internal */
function forEachResolvedProjectReference(resolvedProjectReferences, cb) {
    return forEachProjectReference(/*projectReferences*/ undefined, resolvedProjectReferences, function (resolvedRef, parent) { return resolvedRef && cb(resolvedRef, parent); });
}
exports.forEachResolvedProjectReference = forEachResolvedProjectReference;
function forEachProjectReference(projectReferences, resolvedProjectReferences, cbResolvedRef, cbRef) {
    var seenResolvedRefs;
    return worker(projectReferences, resolvedProjectReferences, /*parent*/ undefined);
    function worker(projectReferences, resolvedProjectReferences, parent) {
        // Visit project references first
        if (cbRef) {
            var result = cbRef(projectReferences, parent);
            if (result)
                return result;
        }
        return (0, ts_1.forEach)(resolvedProjectReferences, function (resolvedRef, index) {
            if (resolvedRef && (seenResolvedRefs === null || seenResolvedRefs === void 0 ? void 0 : seenResolvedRefs.has(resolvedRef.sourceFile.path))) {
                // ignore recursives
                return undefined;
            }
            var result = cbResolvedRef(resolvedRef, parent, index);
            if (result || !resolvedRef)
                return result;
            (seenResolvedRefs || (seenResolvedRefs = new Set())).add(resolvedRef.sourceFile.path);
            return worker(resolvedRef.commandLine.projectReferences, resolvedRef.references, resolvedRef);
        });
    }
}
/** @internal */
exports.inferredTypesContainingFile = "__inferred type names__.ts";
/** @internal */
function getInferredLibraryNameResolveFrom(options, currentDirectory, libFileName) {
    var containingDirectory = options.configFilePath ? (0, ts_1.getDirectoryPath)(options.configFilePath) : currentDirectory;
    return (0, ts_1.combinePaths)(containingDirectory, "__lib_node_modules_lookup_".concat(libFileName, "__.ts"));
}
exports.getInferredLibraryNameResolveFrom = getInferredLibraryNameResolveFrom;
function getLibraryNameFromLibFileName(libFileName) {
    // Support resolving to lib.dom.d.ts -> @typescript/lib-dom, and
    //                      lib.dom.iterable.d.ts -> @typescript/lib-dom/iterable
    //                      lib.es2015.symbol.wellknown.d.ts -> @typescript/lib-es2015/symbol-wellknown
    var components = libFileName.split(".");
    var path = components[1];
    var i = 2;
    while (components[i] && components[i] !== "d") {
        path += (i === 2 ? "/" : "-") + components[i];
        i++;
    }
    return "@typescript/lib-" + path;
}
function getLibFileNameFromLibReference(libReference) {
    var libName = (0, ts_1.toFileNameLowerCase)(libReference.fileName);
    var libFileName = ts_1.libMap.get(libName);
    return { libName: libName, libFileName: libFileName };
}
/** @internal */
function isReferencedFile(reason) {
    switch (reason === null || reason === void 0 ? void 0 : reason.kind) {
        case ts_1.FileIncludeKind.Import:
        case ts_1.FileIncludeKind.ReferenceFile:
        case ts_1.FileIncludeKind.TypeReferenceDirective:
        case ts_1.FileIncludeKind.LibReferenceDirective:
            return true;
        default:
            return false;
    }
}
exports.isReferencedFile = isReferencedFile;
/** @internal */
function isReferenceFileLocation(location) {
    return location.pos !== undefined;
}
exports.isReferenceFileLocation = isReferenceFileLocation;
/** @internal */
function getReferencedFileLocation(getSourceFileByPath, ref) {
    var _a, _b, _c;
    var _d, _e, _f, _g, _h, _j;
    var file = ts_1.Debug.checkDefined(getSourceFileByPath(ref.file));
    var kind = ref.kind, index = ref.index;
    var pos, end, packageId, resolutionMode;
    switch (kind) {
        case ts_1.FileIncludeKind.Import:
            var importLiteral = getModuleNameStringLiteralAt(file, index);
            packageId = (_f = (_e = (_d = file.resolvedModules) === null || _d === void 0 ? void 0 : _d.get(importLiteral.text, getModeForResolutionAtIndex(file, index))) === null || _e === void 0 ? void 0 : _e.resolvedModule) === null || _f === void 0 ? void 0 : _f.packageId;
            if (importLiteral.pos === -1)
                return { file: file, packageId: packageId, text: importLiteral.text };
            pos = (0, ts_1.skipTrivia)(file.text, importLiteral.pos);
            end = importLiteral.end;
            break;
        case ts_1.FileIncludeKind.ReferenceFile:
            (_a = file.referencedFiles[index], pos = _a.pos, end = _a.end);
            break;
        case ts_1.FileIncludeKind.TypeReferenceDirective:
            (_b = file.typeReferenceDirectives[index], pos = _b.pos, end = _b.end, resolutionMode = _b.resolutionMode);
            packageId = (_j = (_h = (_g = file.resolvedTypeReferenceDirectiveNames) === null || _g === void 0 ? void 0 : _g.get((0, ts_1.toFileNameLowerCase)(file.typeReferenceDirectives[index].fileName), resolutionMode || file.impliedNodeFormat)) === null || _h === void 0 ? void 0 : _h.resolvedTypeReferenceDirective) === null || _j === void 0 ? void 0 : _j.packageId;
            break;
        case ts_1.FileIncludeKind.LibReferenceDirective:
            (_c = file.libReferenceDirectives[index], pos = _c.pos, end = _c.end);
            break;
        default:
            return ts_1.Debug.assertNever(kind);
    }
    return { file: file, pos: pos, end: end, packageId: packageId };
}
exports.getReferencedFileLocation = getReferencedFileLocation;
/**
 * Determines if program structure is upto date or needs to be recreated
 *
 * @internal
 */
function isProgramUptoDate(program, rootFileNames, newOptions, getSourceVersion, fileExists, hasInvalidatedResolutions, hasInvalidatedLibResolutions, hasChangedAutomaticTypeDirectiveNames, getParsedCommandLine, projectReferences) {
    // If we haven't created a program yet or have changed automatic type directives, then it is not up-to-date
    if (!program || (hasChangedAutomaticTypeDirectiveNames === null || hasChangedAutomaticTypeDirectiveNames === void 0 ? void 0 : hasChangedAutomaticTypeDirectiveNames()))
        return false;
    // If root file names don't match
    if (!(0, ts_1.arrayIsEqualTo)(program.getRootFileNames(), rootFileNames))
        return false;
    var seenResolvedRefs;
    // If project references don't match
    if (!(0, ts_1.arrayIsEqualTo)(program.getProjectReferences(), projectReferences, projectReferenceUptoDate))
        return false;
    // If any file is not up-to-date, then the whole program is not up-to-date
    if (program.getSourceFiles().some(sourceFileNotUptoDate))
        return false;
    // If any of the missing file paths are now created
    if (program.getMissingFilePaths().some(fileExists))
        return false;
    var currentOptions = program.getCompilerOptions();
    // If the compilation settings do no match, then the program is not up-to-date
    if (!(0, ts_1.compareDataObjects)(currentOptions, newOptions))
        return false;
    // If library resolution is invalidated, then the program is not up-to-date
    if (program.resolvedLibReferences && (0, ts_1.forEachEntry)(program.resolvedLibReferences, function (_value, libFileName) { return hasInvalidatedLibResolutions(libFileName); }))
        return false;
    // If everything matches but the text of config file is changed,
    // error locations can change for program options, so update the program
    if (currentOptions.configFile && newOptions.configFile)
        return currentOptions.configFile.text === newOptions.configFile.text;
    return true;
    function sourceFileNotUptoDate(sourceFile) {
        return !sourceFileVersionUptoDate(sourceFile) ||
            hasInvalidatedResolutions(sourceFile.path);
    }
    function sourceFileVersionUptoDate(sourceFile) {
        return sourceFile.version === getSourceVersion(sourceFile.resolvedPath, sourceFile.fileName);
    }
    function projectReferenceUptoDate(oldRef, newRef, index) {
        return (0, ts_1.projectReferenceIsEqualTo)(oldRef, newRef) &&
            resolvedProjectReferenceUptoDate(program.getResolvedProjectReferences()[index], oldRef);
    }
    function resolvedProjectReferenceUptoDate(oldResolvedRef, oldRef) {
        if (oldResolvedRef) {
            // Assume true
            if ((0, ts_1.contains)(seenResolvedRefs, oldResolvedRef))
                return true;
            var refPath_1 = resolveProjectReferencePath(oldRef);
            var newParsedCommandLine = getParsedCommandLine(refPath_1);
            // Check if config file exists
            if (!newParsedCommandLine)
                return false;
            // If change in source file
            if (oldResolvedRef.commandLine.options.configFile !== newParsedCommandLine.options.configFile)
                return false;
            // check file names
            if (!(0, ts_1.arrayIsEqualTo)(oldResolvedRef.commandLine.fileNames, newParsedCommandLine.fileNames))
                return false;
            // Add to seen before checking the referenced paths of this config file
            (seenResolvedRefs || (seenResolvedRefs = [])).push(oldResolvedRef);
            // If child project references are upto date, this project reference is uptodate
            return !(0, ts_1.forEach)(oldResolvedRef.references, function (childResolvedRef, index) {
                return !resolvedProjectReferenceUptoDate(childResolvedRef, oldResolvedRef.commandLine.projectReferences[index]);
            });
        }
        // In old program, not able to resolve project reference path,
        // so if config file doesnt exist, it is uptodate.
        var refPath = resolveProjectReferencePath(oldRef);
        return !getParsedCommandLine(refPath);
    }
}
exports.isProgramUptoDate = isProgramUptoDate;
function getConfigFileParsingDiagnostics(configFileParseResult) {
    return configFileParseResult.options.configFile ? __spreadArray(__spreadArray([], configFileParseResult.options.configFile.parseDiagnostics, true), configFileParseResult.errors, true) :
        configFileParseResult.errors;
}
exports.getConfigFileParsingDiagnostics = getConfigFileParsingDiagnostics;
/**
 * A function for determining if a given file is esm or cjs format, assuming modern node module resolution rules, as configured by the
 * `options` parameter.
 *
 * @param fileName The normalized absolute path to check the format of (it need not exist on disk)
 * @param [packageJsonInfoCache] A cache for package file lookups - it's best to have a cache when this function is called often
 * @param host The ModuleResolutionHost which can perform the filesystem lookups for package json data
 * @param options The compiler options to perform the analysis under - relevant options are `moduleResolution` and `traceResolution`
 * @returns `undefined` if the path has no relevant implied format, `ModuleKind.ESNext` for esm format, and `ModuleKind.CommonJS` for cjs format
 */
function getImpliedNodeFormatForFile(fileName, packageJsonInfoCache, host, options) {
    var result = getImpliedNodeFormatForFileWorker(fileName, packageJsonInfoCache, host, options);
    return typeof result === "object" ? result.impliedNodeFormat : result;
}
exports.getImpliedNodeFormatForFile = getImpliedNodeFormatForFile;
/** @internal */
function getImpliedNodeFormatForFileWorker(fileName, packageJsonInfoCache, host, options) {
    switch ((0, ts_1.getEmitModuleResolutionKind)(options)) {
        case ts_1.ModuleResolutionKind.Node16:
        case ts_1.ModuleResolutionKind.NodeNext:
            return (0, ts_1.fileExtensionIsOneOf)(fileName, [".d.mts" /* Extension.Dmts */, ".mts" /* Extension.Mts */, ".mjs" /* Extension.Mjs */]) ? ts_1.ModuleKind.ESNext :
                (0, ts_1.fileExtensionIsOneOf)(fileName, [".d.cts" /* Extension.Dcts */, ".cts" /* Extension.Cts */, ".cjs" /* Extension.Cjs */]) ? ts_1.ModuleKind.CommonJS :
                    (0, ts_1.fileExtensionIsOneOf)(fileName, [".d.ts" /* Extension.Dts */, ".ts" /* Extension.Ts */, ".tsx" /* Extension.Tsx */, ".js" /* Extension.Js */, ".jsx" /* Extension.Jsx */]) ? lookupFromPackageJson() :
                        undefined; // other extensions, like `json` or `tsbuildinfo`, are set as `undefined` here but they should never be fed through the transformer pipeline
        default:
            return undefined;
    }
    function lookupFromPackageJson() {
        var state = (0, ts_1.getTemporaryModuleResolutionState)(packageJsonInfoCache, host, options);
        var packageJsonLocations = [];
        state.failedLookupLocations = packageJsonLocations;
        state.affectingLocations = packageJsonLocations;
        var packageJsonScope = (0, ts_1.getPackageScopeForPath)(fileName, state);
        var impliedNodeFormat = (packageJsonScope === null || packageJsonScope === void 0 ? void 0 : packageJsonScope.contents.packageJsonContent.type) === "module" ? ts_1.ModuleKind.ESNext : ts_1.ModuleKind.CommonJS;
        return { impliedNodeFormat: impliedNodeFormat, packageJsonLocations: packageJsonLocations, packageJsonScope: packageJsonScope };
    }
}
exports.getImpliedNodeFormatForFileWorker = getImpliedNodeFormatForFileWorker;
/** @internal */
exports.plainJSErrors = new Set([
    // binder errors
    ts_1.Diagnostics.Cannot_redeclare_block_scoped_variable_0.code,
    ts_1.Diagnostics.A_module_cannot_have_multiple_default_exports.code,
    ts_1.Diagnostics.Another_export_default_is_here.code,
    ts_1.Diagnostics.The_first_export_default_is_here.code,
    ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_at_the_top_level_of_a_module.code,
    ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode_Modules_are_automatically_in_strict_mode.code,
    ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_that_cannot_be_used_here.code,
    ts_1.Diagnostics.constructor_is_a_reserved_word.code,
    ts_1.Diagnostics.delete_cannot_be_called_on_an_identifier_in_strict_mode.code,
    ts_1.Diagnostics.Code_contained_in_a_class_is_evaluated_in_JavaScript_s_strict_mode_which_does_not_allow_this_use_of_0_For_more_information_see_https_Colon_Slash_Slashdeveloper_mozilla_org_Slashen_US_Slashdocs_SlashWeb_SlashJavaScript_SlashReference_SlashStrict_mode.code,
    ts_1.Diagnostics.Invalid_use_of_0_Modules_are_automatically_in_strict_mode.code,
    ts_1.Diagnostics.Invalid_use_of_0_in_strict_mode.code,
    ts_1.Diagnostics.A_label_is_not_allowed_here.code,
    ts_1.Diagnostics.with_statements_are_not_allowed_in_strict_mode.code,
    // grammar errors
    ts_1.Diagnostics.A_break_statement_can_only_be_used_within_an_enclosing_iteration_or_switch_statement.code,
    ts_1.Diagnostics.A_break_statement_can_only_jump_to_a_label_of_an_enclosing_statement.code,
    ts_1.Diagnostics.A_class_declaration_without_the_default_modifier_must_have_a_name.code,
    ts_1.Diagnostics.A_class_member_cannot_have_the_0_keyword.code,
    ts_1.Diagnostics.A_comma_expression_is_not_allowed_in_a_computed_property_name.code,
    ts_1.Diagnostics.A_continue_statement_can_only_be_used_within_an_enclosing_iteration_statement.code,
    ts_1.Diagnostics.A_continue_statement_can_only_jump_to_a_label_of_an_enclosing_iteration_statement.code,
    ts_1.Diagnostics.A_continue_statement_can_only_jump_to_a_label_of_an_enclosing_iteration_statement.code,
    ts_1.Diagnostics.A_default_clause_cannot_appear_more_than_once_in_a_switch_statement.code,
    ts_1.Diagnostics.A_default_export_must_be_at_the_top_level_of_a_file_or_module_declaration.code,
    ts_1.Diagnostics.A_definite_assignment_assertion_is_not_permitted_in_this_context.code,
    ts_1.Diagnostics.A_destructuring_declaration_must_have_an_initializer.code,
    ts_1.Diagnostics.A_get_accessor_cannot_have_parameters.code,
    ts_1.Diagnostics.A_rest_element_cannot_contain_a_binding_pattern.code,
    ts_1.Diagnostics.A_rest_element_cannot_have_a_property_name.code,
    ts_1.Diagnostics.A_rest_element_cannot_have_an_initializer.code,
    ts_1.Diagnostics.A_rest_element_must_be_last_in_a_destructuring_pattern.code,
    ts_1.Diagnostics.A_rest_parameter_cannot_have_an_initializer.code,
    ts_1.Diagnostics.A_rest_parameter_must_be_last_in_a_parameter_list.code,
    ts_1.Diagnostics.A_rest_parameter_or_binding_pattern_may_not_have_a_trailing_comma.code,
    ts_1.Diagnostics.A_return_statement_cannot_be_used_inside_a_class_static_block.code,
    ts_1.Diagnostics.A_set_accessor_cannot_have_rest_parameter.code,
    ts_1.Diagnostics.A_set_accessor_must_have_exactly_one_parameter.code,
    ts_1.Diagnostics.An_export_declaration_can_only_be_used_at_the_top_level_of_a_module.code,
    ts_1.Diagnostics.An_export_declaration_cannot_have_modifiers.code,
    ts_1.Diagnostics.An_import_declaration_can_only_be_used_at_the_top_level_of_a_module.code,
    ts_1.Diagnostics.An_import_declaration_cannot_have_modifiers.code,
    ts_1.Diagnostics.An_object_member_cannot_be_declared_optional.code,
    ts_1.Diagnostics.Argument_of_dynamic_import_cannot_be_spread_element.code,
    ts_1.Diagnostics.Cannot_assign_to_private_method_0_Private_methods_are_not_writable.code,
    ts_1.Diagnostics.Cannot_redeclare_identifier_0_in_catch_clause.code,
    ts_1.Diagnostics.Catch_clause_variable_cannot_have_an_initializer.code,
    ts_1.Diagnostics.Class_decorators_can_t_be_used_with_static_private_identifier_Consider_removing_the_experimental_decorator.code,
    ts_1.Diagnostics.Classes_can_only_extend_a_single_class.code,
    ts_1.Diagnostics.Classes_may_not_have_a_field_named_constructor.code,
    ts_1.Diagnostics.Did_you_mean_to_use_a_Colon_An_can_only_follow_a_property_name_when_the_containing_object_literal_is_part_of_a_destructuring_pattern.code,
    ts_1.Diagnostics.Duplicate_label_0.code,
    ts_1.Diagnostics.Dynamic_imports_can_only_accept_a_module_specifier_and_an_optional_assertion_as_arguments.code,
    ts_1.Diagnostics.For_await_loops_cannot_be_used_inside_a_class_static_block.code,
    ts_1.Diagnostics.JSX_attributes_must_only_be_assigned_a_non_empty_expression.code,
    ts_1.Diagnostics.JSX_elements_cannot_have_multiple_attributes_with_the_same_name.code,
    ts_1.Diagnostics.JSX_expressions_may_not_use_the_comma_operator_Did_you_mean_to_write_an_array.code,
    ts_1.Diagnostics.JSX_property_access_expressions_cannot_include_JSX_namespace_names.code,
    ts_1.Diagnostics.Jump_target_cannot_cross_function_boundary.code,
    ts_1.Diagnostics.Line_terminator_not_permitted_before_arrow.code,
    ts_1.Diagnostics.Modifiers_cannot_appear_here.code,
    ts_1.Diagnostics.Only_a_single_variable_declaration_is_allowed_in_a_for_in_statement.code,
    ts_1.Diagnostics.Only_a_single_variable_declaration_is_allowed_in_a_for_of_statement.code,
    ts_1.Diagnostics.Private_identifiers_are_not_allowed_outside_class_bodies.code,
    ts_1.Diagnostics.Private_identifiers_are_only_allowed_in_class_bodies_and_may_only_be_used_as_part_of_a_class_member_declaration_property_access_or_on_the_left_hand_side_of_an_in_expression.code,
    ts_1.Diagnostics.Property_0_is_not_accessible_outside_class_1_because_it_has_a_private_identifier.code,
    ts_1.Diagnostics.Tagged_template_expressions_are_not_permitted_in_an_optional_chain.code,
    ts_1.Diagnostics.The_left_hand_side_of_a_for_of_statement_may_not_be_async.code,
    ts_1.Diagnostics.The_variable_declaration_of_a_for_in_statement_cannot_have_an_initializer.code,
    ts_1.Diagnostics.The_variable_declaration_of_a_for_of_statement_cannot_have_an_initializer.code,
    ts_1.Diagnostics.Trailing_comma_not_allowed.code,
    ts_1.Diagnostics.Variable_declaration_list_cannot_be_empty.code,
    ts_1.Diagnostics._0_and_1_operations_cannot_be_mixed_without_parentheses.code,
    ts_1.Diagnostics._0_expected.code,
    ts_1.Diagnostics._0_is_not_a_valid_meta_property_for_keyword_1_Did_you_mean_2.code,
    ts_1.Diagnostics._0_list_cannot_be_empty.code,
    ts_1.Diagnostics._0_modifier_already_seen.code,
    ts_1.Diagnostics._0_modifier_cannot_appear_on_a_constructor_declaration.code,
    ts_1.Diagnostics._0_modifier_cannot_appear_on_a_module_or_namespace_element.code,
    ts_1.Diagnostics._0_modifier_cannot_appear_on_a_parameter.code,
    ts_1.Diagnostics._0_modifier_cannot_appear_on_class_elements_of_this_kind.code,
    ts_1.Diagnostics._0_modifier_cannot_be_used_here.code,
    ts_1.Diagnostics._0_modifier_must_precede_1_modifier.code,
    ts_1.Diagnostics.const_declarations_can_only_be_declared_inside_a_block.code,
    ts_1.Diagnostics.const_declarations_must_be_initialized.code,
    ts_1.Diagnostics.extends_clause_already_seen.code,
    ts_1.Diagnostics.let_declarations_can_only_be_declared_inside_a_block.code,
    ts_1.Diagnostics.let_is_not_allowed_to_be_used_as_a_name_in_let_or_const_declarations.code,
    ts_1.Diagnostics.Class_constructor_may_not_be_a_generator.code,
    ts_1.Diagnostics.Class_constructor_may_not_be_an_accessor.code,
    ts_1.Diagnostics.await_expressions_are_only_allowed_within_async_functions_and_at_the_top_levels_of_modules.code,
    // Type errors
    ts_1.Diagnostics.This_condition_will_always_return_0_since_JavaScript_compares_objects_by_reference_not_value.code,
]);
/**
 * Determine if source file needs to be re-created even if its text hasn't changed
 */
function shouldProgramCreateNewSourceFiles(program, newOptions) {
    if (!program)
        return false;
    // If any compiler options change, we can't reuse old source file even if version match
    // The change in options like these could result in change in syntax tree or `sourceFile.bindDiagnostics`.
    return (0, ts_1.optionsHaveChanges)(program.getCompilerOptions(), newOptions, ts_1.sourceFileAffectingCompilerOptions);
}
function createCreateProgramOptions(rootNames, options, host, oldProgram, configFileParsingDiagnostics, typeScriptVersion) {
    return {
        rootNames: rootNames,
        options: options,
        host: host,
        oldProgram: oldProgram,
        configFileParsingDiagnostics: configFileParsingDiagnostics,
        typeScriptVersion: typeScriptVersion,
    };
}
function createProgram(rootNamesOrOptions, _options, _host, _oldProgram, _configFileParsingDiagnostics) {
    var _a, _b, _c, _d, _e, _f;
    var createProgramOptions = (0, ts_1.isArray)(rootNamesOrOptions) ? createCreateProgramOptions(rootNamesOrOptions, _options, _host, _oldProgram, _configFileParsingDiagnostics) : rootNamesOrOptions; // TODO: GH#18217
    var rootNames = createProgramOptions.rootNames, options = createProgramOptions.options, configFileParsingDiagnostics = createProgramOptions.configFileParsingDiagnostics, projectReferences = createProgramOptions.projectReferences, typeScriptVersion = createProgramOptions.typeScriptVersion;
    var oldProgram = createProgramOptions.oldProgram;
    var reportInvalidIgnoreDeprecations = (0, ts_1.memoize)(function () { return createOptionValueDiagnostic("ignoreDeprecations", ts_1.Diagnostics.Invalid_value_for_ignoreDeprecations); });
    var processingDefaultLibFiles;
    var processingOtherFiles;
    var files;
    var symlinks;
    var commonSourceDirectory;
    var typeChecker;
    var classifiableNames;
    var ambientModuleNameToUnmodifiedFileName = new Map();
    var fileReasons = (0, ts_1.createMultiMap)();
    var cachedBindAndCheckDiagnosticsForFile = {};
    var cachedDeclarationDiagnosticsForFile = {};
    var resolvedTypeReferenceDirectives = (0, ts_1.createModeAwareCache)();
    var fileProcessingDiagnostics;
    var automaticTypeDirectiveNames;
    var automaticTypeDirectiveResolutions;
    var resolvedLibReferences;
    var resolvedLibProcessing;
    var packageMap;
    // The below settings are to track if a .js file should be add to the program if loaded via searching under node_modules.
    // This works as imported modules are discovered recursively in a depth first manner, specifically:
    // - For each root file, findSourceFile is called.
    // - This calls processImportedModules for each module imported in the source file.
    // - This calls resolveModuleNames, and then calls findSourceFile for each resolved module.
    // As all these operations happen - and are nested - within the createProgram call, they close over the below variables.
    // The current resolution depth is tracked by incrementing/decrementing as the depth first search progresses.
    var maxNodeModuleJsDepth = typeof options.maxNodeModuleJsDepth === "number" ? options.maxNodeModuleJsDepth : 0;
    var currentNodeModulesDepth = 0;
    // If a module has some of its imports skipped due to being at the depth limit under node_modules, then track
    // this, as it may be imported at a shallower depth later, and then it will need its skipped imports processed.
    var modulesWithElidedImports = new Map();
    // Track source files that are source files found by searching under node_modules, as these shouldn't be compiled.
    var sourceFilesFoundSearchingNodeModules = new Map();
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "createProgram", { configFilePath: options.configFilePath, rootDir: options.rootDir }, /*separateBeginAndEnd*/ true);
    performance.mark("beforeProgram");
    var host = createProgramOptions.host || createCompilerHost(options);
    var configParsingHost = parseConfigHostFromCompilerHostLike(host);
    var skipDefaultLib = options.noLib;
    var getDefaultLibraryFileName = (0, ts_1.memoize)(function () { return host.getDefaultLibFileName(options); });
    var defaultLibraryPath = host.getDefaultLibLocation ? host.getDefaultLibLocation() : (0, ts_1.getDirectoryPath)(getDefaultLibraryFileName());
    /**
     * Diagnostics for the program
     * Only add diagnostics directly if it always would be done irrespective of program structure reuse.
     * Otherwise fileProcessingDiagnostics is correct locations so that the diagnostics can be reported in all structure use scenarios
     */
    var programDiagnostics = (0, ts_1.createDiagnosticCollection)();
    var currentDirectory = host.getCurrentDirectory();
    var supportedExtensions = (0, ts_1.getSupportedExtensions)(options);
    var supportedExtensionsWithJsonIfResolveJsonModule = (0, ts_1.getSupportedExtensionsWithJsonIfResolveJsonModule)(options, supportedExtensions);
    // Map storing if there is emit blocking diagnostics for given input
    var hasEmitBlockingDiagnostics = new Map();
    var _compilerOptionsObjectLiteralSyntax;
    var moduleResolutionCache;
    var actualResolveModuleNamesWorker;
    var hasInvalidatedResolutions = host.hasInvalidatedResolutions || ts_1.returnFalse;
    if (host.resolveModuleNameLiterals) {
        actualResolveModuleNamesWorker = host.resolveModuleNameLiterals.bind(host);
        moduleResolutionCache = (_a = host.getModuleResolutionCache) === null || _a === void 0 ? void 0 : _a.call(host);
    }
    else if (host.resolveModuleNames) {
        actualResolveModuleNamesWorker = function (moduleNames, containingFile, redirectedReference, options, containingSourceFile, reusedNames) {
            return host.resolveModuleNames(moduleNames.map(getModuleResolutionName), containingFile, reusedNames === null || reusedNames === void 0 ? void 0 : reusedNames.map(getModuleResolutionName), redirectedReference, options, containingSourceFile).map(function (resolved) { return resolved ?
                (resolved.extension !== undefined) ?
                    { resolvedModule: resolved } :
                    // An older host may have omitted extension, in which case we should infer it from the file extension of resolvedFileName.
                    { resolvedModule: __assign(__assign({}, resolved), { extension: (0, ts_1.extensionFromPath)(resolved.resolvedFileName) }) } :
                emptyResolution; });
        };
        moduleResolutionCache = (_b = host.getModuleResolutionCache) === null || _b === void 0 ? void 0 : _b.call(host);
    }
    else {
        moduleResolutionCache = (0, ts_1.createModuleResolutionCache)(currentDirectory, getCanonicalFileName, options);
        actualResolveModuleNamesWorker = function (moduleNames, containingFile, redirectedReference, options, containingSourceFile) {
            return loadWithModeAwareCache(moduleNames, containingFile, redirectedReference, options, containingSourceFile, host, moduleResolutionCache, createModuleResolutionLoader);
        };
    }
    var actualResolveTypeReferenceDirectiveNamesWorker;
    if (host.resolveTypeReferenceDirectiveReferences) {
        actualResolveTypeReferenceDirectiveNamesWorker = host.resolveTypeReferenceDirectiveReferences.bind(host);
    }
    else if (host.resolveTypeReferenceDirectives) {
        actualResolveTypeReferenceDirectiveNamesWorker = function (typeDirectiveNames, containingFile, redirectedReference, options, containingSourceFile) {
            return host.resolveTypeReferenceDirectives(typeDirectiveNames.map(getTypeReferenceResolutionName), containingFile, redirectedReference, options, containingSourceFile === null || containingSourceFile === void 0 ? void 0 : containingSourceFile.impliedNodeFormat).map(function (resolvedTypeReferenceDirective) { return ({ resolvedTypeReferenceDirective: resolvedTypeReferenceDirective }); });
        };
    }
    else {
        var typeReferenceDirectiveResolutionCache_1 = (0, ts_1.createTypeReferenceDirectiveResolutionCache)(currentDirectory, getCanonicalFileName, /*options*/ undefined, moduleResolutionCache === null || moduleResolutionCache === void 0 ? void 0 : moduleResolutionCache.getPackageJsonInfoCache());
        actualResolveTypeReferenceDirectiveNamesWorker = function (typeDirectiveNames, containingFile, redirectedReference, options, containingSourceFile) {
            return loadWithModeAwareCache(typeDirectiveNames, containingFile, redirectedReference, options, containingSourceFile, host, typeReferenceDirectiveResolutionCache_1, createTypeReferenceResolutionLoader);
        };
    }
    var hasInvalidatedLibResolutions = host.hasInvalidatedLibResolutions || ts_1.returnFalse;
    var actualResolveLibrary;
    if (host.resolveLibrary) {
        actualResolveLibrary = host.resolveLibrary.bind(host);
    }
    else {
        var libraryResolutionCache_1 = (0, ts_1.createModuleResolutionCache)(currentDirectory, getCanonicalFileName, options, moduleResolutionCache === null || moduleResolutionCache === void 0 ? void 0 : moduleResolutionCache.getPackageJsonInfoCache());
        actualResolveLibrary = function (libraryName, resolveFrom, options) {
            return (0, ts_1.resolveLibrary)(libraryName, resolveFrom, options, host, libraryResolutionCache_1);
        };
    }
    // Map from a stringified PackageId to the source file with that id.
    // Only one source file may have a given packageId. Others become redirects (see createRedirectSourceFile).
    // `packageIdToSourceFile` is only used while building the program, while `sourceFileToPackageName` and `isSourceFileTargetOfRedirect` are kept around.
    var packageIdToSourceFile = new Map();
    // Maps from a SourceFile's `.path` to the name of the package it was imported with.
    var sourceFileToPackageName = new Map();
    // Key is a file name. Value is the (non-empty, or undefined) list of files that redirect to it.
    var redirectTargetsMap = (0, ts_1.createMultiMap)();
    var usesUriStyleNodeCoreModules = false;
    /**
     * map with
     * - SourceFile if present
     * - false if sourceFile missing for source of project reference redirect
     * - undefined otherwise
     */
    var filesByName = new Map();
    var missingFilePaths;
    // stores 'filename -> file association' ignoring case
    // used to track cases when two file names differ only in casing
    var filesByNameIgnoreCase = host.useCaseSensitiveFileNames() ? new Map() : undefined;
    // A parallel array to projectReferences storing the results of reading in the referenced tsconfig files
    var resolvedProjectReferences;
    var projectReferenceRedirects;
    var mapFromFileToProjectReferenceRedirects;
    var mapFromToProjectReferenceRedirectSource;
    var useSourceOfProjectReferenceRedirect = !!((_c = host.useSourceOfProjectReferenceRedirect) === null || _c === void 0 ? void 0 : _c.call(host)) &&
        !options.disableSourceOfProjectReferenceRedirect;
    var _g = updateHostForUseSourceOfProjectReferenceRedirect({
        compilerHost: host,
        getSymlinkCache: getSymlinkCache,
        useSourceOfProjectReferenceRedirect: useSourceOfProjectReferenceRedirect,
        toPath: toPath,
        getResolvedProjectReferences: getResolvedProjectReferences,
        getSourceOfProjectReferenceRedirect: getSourceOfProjectReferenceRedirect,
        forEachResolvedProjectReference: forEachResolvedProjectReference
    }), onProgramCreateComplete = _g.onProgramCreateComplete, fileExists = _g.fileExists, directoryExists = _g.directoryExists;
    var readFile = host.readFile.bind(host);
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "shouldProgramCreateNewSourceFiles", { hasOldProgram: !!oldProgram });
    var shouldCreateNewSourceFile = shouldProgramCreateNewSourceFiles(oldProgram, options);
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    // We set `structuralIsReused` to `undefined` because `tryReuseStructureFromOldProgram` calls `tryReuseStructureFromOldProgram` which checks
    // `structuralIsReused`, which would be a TDZ violation if it was not set in advance to `undefined`.
    var structureIsReused;
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "tryReuseStructureFromOldProgram", {});
    structureIsReused = tryReuseStructureFromOldProgram();
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    if (structureIsReused !== 2 /* StructureIsReused.Completely */) {
        processingDefaultLibFiles = [];
        processingOtherFiles = [];
        if (projectReferences) {
            if (!resolvedProjectReferences) {
                resolvedProjectReferences = projectReferences.map(parseProjectReferenceConfigFile);
            }
            if (rootNames.length) {
                resolvedProjectReferences === null || resolvedProjectReferences === void 0 ? void 0 : resolvedProjectReferences.forEach(function (parsedRef, index) {
                    if (!parsedRef)
                        return;
                    var out = (0, ts_1.outFile)(parsedRef.commandLine.options);
                    if (useSourceOfProjectReferenceRedirect) {
                        if (out || (0, ts_1.getEmitModuleKind)(parsedRef.commandLine.options) === ts_1.ModuleKind.None) {
                            for (var _i = 0, _a = parsedRef.commandLine.fileNames; _i < _a.length; _i++) {
                                var fileName = _a[_i];
                                processProjectReferenceFile(fileName, { kind: ts_1.FileIncludeKind.SourceFromProjectReference, index: index });
                            }
                        }
                    }
                    else {
                        if (out) {
                            processProjectReferenceFile((0, ts_1.changeExtension)(out, ".d.ts"), { kind: ts_1.FileIncludeKind.OutputFromProjectReference, index: index });
                        }
                        else if ((0, ts_1.getEmitModuleKind)(parsedRef.commandLine.options) === ts_1.ModuleKind.None) {
                            var getCommonSourceDirectory_1 = (0, ts_1.memoize)(function () { return (0, ts_1.getCommonSourceDirectoryOfConfig)(parsedRef.commandLine, !host.useCaseSensitiveFileNames()); });
                            for (var _b = 0, _c = parsedRef.commandLine.fileNames; _b < _c.length; _b++) {
                                var fileName = _c[_b];
                                if (!(0, ts_1.isDeclarationFileName)(fileName) && !(0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */)) {
                                    processProjectReferenceFile((0, ts_1.getOutputDeclarationFileName)(fileName, parsedRef.commandLine, !host.useCaseSensitiveFileNames(), getCommonSourceDirectory_1), { kind: ts_1.FileIncludeKind.OutputFromProjectReference, index: index });
                                }
                            }
                        }
                    }
                });
            }
        }
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "processRootFiles", { count: rootNames.length });
        (0, ts_1.forEach)(rootNames, function (name, index) { return processRootFile(name, /*isDefaultLib*/ false, /*ignoreNoDefaultLib*/ false, { kind: ts_1.FileIncludeKind.RootFile, index: index }); });
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        // load type declarations specified via 'types' argument or implicitly from types/ and node_modules/@types folders
        automaticTypeDirectiveNames !== null && automaticTypeDirectiveNames !== void 0 ? automaticTypeDirectiveNames : (automaticTypeDirectiveNames = rootNames.length ? (0, ts_1.getAutomaticTypeDirectiveNames)(options, host) : ts_1.emptyArray);
        automaticTypeDirectiveResolutions = (0, ts_1.createModeAwareCache)();
        if (automaticTypeDirectiveNames.length) {
            ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "processTypeReferences", { count: automaticTypeDirectiveNames.length });
            // This containingFilename needs to match with the one used in managed-side
            var containingDirectory = options.configFilePath ? (0, ts_1.getDirectoryPath)(options.configFilePath) : currentDirectory;
            var containingFilename = (0, ts_1.combinePaths)(containingDirectory, exports.inferredTypesContainingFile);
            var resolutions = resolveTypeReferenceDirectiveNamesReusingOldState(automaticTypeDirectiveNames, containingFilename);
            for (var i = 0; i < automaticTypeDirectiveNames.length; i++) {
                // under node16/nodenext module resolution, load `types`/ata include names as cjs resolution results by passing an `undefined` mode
                automaticTypeDirectiveResolutions.set(automaticTypeDirectiveNames[i], /*mode*/ undefined, resolutions[i]);
                processTypeReferenceDirective(automaticTypeDirectiveNames[i], 
                /*mode*/ undefined, resolutions[i], {
                    kind: ts_1.FileIncludeKind.AutomaticTypeDirectiveFile,
                    typeReference: automaticTypeDirectiveNames[i],
                    packageId: (_e = (_d = resolutions[i]) === null || _d === void 0 ? void 0 : _d.resolvedTypeReferenceDirective) === null || _e === void 0 ? void 0 : _e.packageId,
                });
            }
            ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        }
        // Do not process the default library if:
        //  - The '--noLib' flag is used.
        //  - A 'no-default-lib' reference comment is encountered in
        //      processing the root files.
        if (rootNames.length && !skipDefaultLib) {
            // If '--lib' is not specified, include default library file according to '--target'
            // otherwise, using options specified in '--lib' instead of '--target' default library file
            var defaultLibraryFileName = getDefaultLibraryFileName();
            if (!options.lib && defaultLibraryFileName) {
                processRootFile(defaultLibraryFileName, /*isDefaultLib*/ true, /*ignoreNoDefaultLib*/ false, { kind: ts_1.FileIncludeKind.LibFile });
            }
            else {
                (0, ts_1.forEach)(options.lib, function (libFileName, index) {
                    processRootFile(pathForLibFile(libFileName), /*isDefaultLib*/ true, /*ignoreNoDefaultLib*/ false, { kind: ts_1.FileIncludeKind.LibFile, index: index });
                });
            }
        }
        missingFilePaths = (0, ts_1.arrayFrom)((0, ts_1.mapDefinedIterator)(filesByName.entries(), function (_a) {
            var path = _a[0], file = _a[1];
            return file === undefined ? path : undefined;
        }));
        files = (0, ts_1.stableSort)(processingDefaultLibFiles, compareDefaultLibFiles).concat(processingOtherFiles);
        processingDefaultLibFiles = undefined;
        processingOtherFiles = undefined;
    }
    ts_1.Debug.assert(!!missingFilePaths);
    // Release any files we have acquired in the old program but are
    // not part of the new program.
    if (oldProgram && host.onReleaseOldSourceFile) {
        var oldSourceFiles = oldProgram.getSourceFiles();
        for (var _i = 0, oldSourceFiles_1 = oldSourceFiles; _i < oldSourceFiles_1.length; _i++) {
            var oldSourceFile = oldSourceFiles_1[_i];
            var newFile = getSourceFileByPath(oldSourceFile.resolvedPath);
            if (shouldCreateNewSourceFile || !newFile || newFile.impliedNodeFormat !== oldSourceFile.impliedNodeFormat ||
                // old file wasn't redirect but new file is
                (oldSourceFile.resolvedPath === oldSourceFile.path && newFile.resolvedPath !== oldSourceFile.path)) {
                host.onReleaseOldSourceFile(oldSourceFile, oldProgram.getCompilerOptions(), !!getSourceFileByPath(oldSourceFile.path));
            }
        }
        if (!host.getParsedCommandLine) {
            oldProgram.forEachResolvedProjectReference(function (resolvedProjectReference) {
                if (!getResolvedProjectReferenceByPath(resolvedProjectReference.sourceFile.path)) {
                    host.onReleaseOldSourceFile(resolvedProjectReference.sourceFile, oldProgram.getCompilerOptions(), /*hasSourceFileByPath*/ false);
                }
            });
        }
    }
    // Release commandlines that new program does not use
    if (oldProgram && host.onReleaseParsedCommandLine) {
        forEachProjectReference(oldProgram.getProjectReferences(), oldProgram.getResolvedProjectReferences(), function (oldResolvedRef, parent, index) {
            var oldReference = (parent === null || parent === void 0 ? void 0 : parent.commandLine.projectReferences[index]) || oldProgram.getProjectReferences()[index];
            var oldRefPath = resolveProjectReferencePath(oldReference);
            if (!(projectReferenceRedirects === null || projectReferenceRedirects === void 0 ? void 0 : projectReferenceRedirects.has(toPath(oldRefPath)))) {
                host.onReleaseParsedCommandLine(oldRefPath, oldResolvedRef, oldProgram.getCompilerOptions());
            }
        });
    }
    // unconditionally set oldProgram to undefined to prevent it from being captured in closure
    oldProgram = undefined;
    resolvedLibProcessing = undefined;
    var program = {
        getRootFileNames: function () { return rootNames; },
        getSourceFile: getSourceFile,
        getSourceFileByPath: getSourceFileByPath,
        getSourceFiles: function () { return files; },
        getMissingFilePaths: function () { return missingFilePaths; },
        getModuleResolutionCache: function () { return moduleResolutionCache; },
        getFilesByNameMap: function () { return filesByName; },
        getCompilerOptions: function () { return options; },
        getSyntacticDiagnostics: getSyntacticDiagnostics,
        getOptionsDiagnostics: getOptionsDiagnostics,
        getGlobalDiagnostics: getGlobalDiagnostics,
        getSemanticDiagnostics: getSemanticDiagnostics,
        getCachedSemanticDiagnostics: getCachedSemanticDiagnostics,
        getSuggestionDiagnostics: getSuggestionDiagnostics,
        getDeclarationDiagnostics: getDeclarationDiagnostics,
        getBindAndCheckDiagnostics: getBindAndCheckDiagnostics,
        getProgramDiagnostics: getProgramDiagnostics,
        getTypeChecker: getTypeChecker,
        getClassifiableNames: getClassifiableNames,
        getCommonSourceDirectory: getCommonSourceDirectory,
        emit: emit,
        getCurrentDirectory: function () { return currentDirectory; },
        getNodeCount: function () { return getTypeChecker().getNodeCount(); },
        getIdentifierCount: function () { return getTypeChecker().getIdentifierCount(); },
        getSymbolCount: function () { return getTypeChecker().getSymbolCount(); },
        getTypeCount: function () { return getTypeChecker().getTypeCount(); },
        getInstantiationCount: function () { return getTypeChecker().getInstantiationCount(); },
        getRelationCacheSizes: function () { return getTypeChecker().getRelationCacheSizes(); },
        getFileProcessingDiagnostics: function () { return fileProcessingDiagnostics; },
        getResolvedTypeReferenceDirectives: function () { return resolvedTypeReferenceDirectives; },
        getAutomaticTypeDirectiveNames: function () { return automaticTypeDirectiveNames; },
        getAutomaticTypeDirectiveResolutions: function () { return automaticTypeDirectiveResolutions; },
        isSourceFileFromExternalLibrary: isSourceFileFromExternalLibrary,
        isSourceFileDefaultLibrary: isSourceFileDefaultLibrary,
        getSourceFileFromReference: getSourceFileFromReference,
        getLibFileFromReference: getLibFileFromReference,
        sourceFileToPackageName: sourceFileToPackageName,
        redirectTargetsMap: redirectTargetsMap,
        usesUriStyleNodeCoreModules: usesUriStyleNodeCoreModules,
        resolvedLibReferences: resolvedLibReferences,
        getCurrentPackagesMap: function () { return packageMap; },
        typesPackageExists: typesPackageExists,
        packageBundlesTypes: packageBundlesTypes,
        isEmittedFile: isEmittedFile,
        getConfigFileParsingDiagnostics: getConfigFileParsingDiagnostics,
        getProjectReferences: getProjectReferences,
        getResolvedProjectReferences: getResolvedProjectReferences,
        getProjectReferenceRedirect: getProjectReferenceRedirect,
        getResolvedProjectReferenceToRedirect: getResolvedProjectReferenceToRedirect,
        getResolvedProjectReferenceByPath: getResolvedProjectReferenceByPath,
        forEachResolvedProjectReference: forEachResolvedProjectReference,
        isSourceOfProjectReferenceRedirect: isSourceOfProjectReferenceRedirect,
        emitBuildInfo: emitBuildInfo,
        fileExists: fileExists,
        readFile: readFile,
        directoryExists: directoryExists,
        getSymlinkCache: getSymlinkCache,
        realpath: (_f = host.realpath) === null || _f === void 0 ? void 0 : _f.bind(host),
        useCaseSensitiveFileNames: function () { return host.useCaseSensitiveFileNames(); },
        getCanonicalFileName: getCanonicalFileName,
        getFileIncludeReasons: function () { return fileReasons; },
        structureIsReused: structureIsReused,
        writeFile: writeFile,
    };
    onProgramCreateComplete();
    // Add file processingDiagnostics
    fileProcessingDiagnostics === null || fileProcessingDiagnostics === void 0 ? void 0 : fileProcessingDiagnostics.forEach(function (diagnostic) {
        switch (diagnostic.kind) {
            case 1 /* FilePreprocessingDiagnosticsKind.FilePreprocessingFileExplainingDiagnostic */:
                return programDiagnostics.add(createDiagnosticExplainingFile(diagnostic.file && getSourceFileByPath(diagnostic.file), diagnostic.fileProcessingReason, diagnostic.diagnostic, diagnostic.args || ts_1.emptyArray));
            case 0 /* FilePreprocessingDiagnosticsKind.FilePreprocessingReferencedDiagnostic */:
                var _a = getReferencedFileLocation(getSourceFileByPath, diagnostic.reason), file = _a.file, pos = _a.pos, end = _a.end;
                return programDiagnostics.add(ts_1.createFileDiagnostic.apply(void 0, __spreadArray([file, ts_1.Debug.checkDefined(pos), ts_1.Debug.checkDefined(end) - pos, diagnostic.diagnostic], diagnostic.args || ts_1.emptyArray, false)));
            case 2 /* FilePreprocessingDiagnosticsKind.ResolutionDiagnostics */:
                return diagnostic.diagnostics.forEach(function (d) { return programDiagnostics.add(d); });
            default:
                ts_1.Debug.assertNever(diagnostic);
        }
    });
    verifyCompilerOptions();
    performance.mark("afterProgram");
    performance.measure("Program", "beforeProgram", "afterProgram");
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    return program;
    function getPackagesMap() {
        if (packageMap)
            return packageMap;
        packageMap = new Map();
        // A package name maps to true when we detect it has .d.ts files.
        // This is useful as an approximation of whether a package bundles its own types.
        // Note: we only look at files already found by module resolution,
        // so there may be files we did not consider.
        files.forEach(function (sf) {
            if (!sf.resolvedModules)
                return;
            sf.resolvedModules.forEach(function (_a) {
                var resolvedModule = _a.resolvedModule;
                if (resolvedModule === null || resolvedModule === void 0 ? void 0 : resolvedModule.packageId)
                    packageMap.set(resolvedModule.packageId.name, resolvedModule.extension === ".d.ts" /* Extension.Dts */ || !!packageMap.get(resolvedModule.packageId.name));
            });
        });
        return packageMap;
    }
    function typesPackageExists(packageName) {
        return getPackagesMap().has((0, ts_1.getTypesPackageName)(packageName));
    }
    function packageBundlesTypes(packageName) {
        return !!getPackagesMap().get(packageName);
    }
    function addResolutionDiagnostics(resolution) {
        var _a;
        if (!((_a = resolution.resolutionDiagnostics) === null || _a === void 0 ? void 0 : _a.length))
            return;
        (fileProcessingDiagnostics !== null && fileProcessingDiagnostics !== void 0 ? fileProcessingDiagnostics : (fileProcessingDiagnostics = [])).push({
            kind: 2 /* FilePreprocessingDiagnosticsKind.ResolutionDiagnostics */,
            diagnostics: resolution.resolutionDiagnostics
        });
    }
    function addResolutionDiagnosticsFromResolutionOrCache(containingFile, name, resolution, mode) {
        // diagnostics directly from the resolution
        if (host.resolveModuleNameLiterals || !host.resolveModuleNames)
            return addResolutionDiagnostics(resolution);
        if (!moduleResolutionCache || (0, ts_1.isExternalModuleNameRelative)(name))
            return;
        var containingFileName = (0, ts_1.getNormalizedAbsolutePath)(containingFile.originalFileName, currentDirectory);
        var containingDir = (0, ts_1.getDirectoryPath)(containingFileName);
        var redirectedReference = getRedirectReferenceForResolution(containingFile);
        // only nonrelative names hit the cache, and, at least as of right now, only nonrelative names can issue diagnostics
        // (Since diagnostics are only issued via import or export map lookup)
        // This may totally change if/when the issue of output paths not mapping to input files is fixed in a broader context
        // When it is, how we extract diagnostics from the module name resolver will have the be refined - the current cache
        // APIs wrapping the underlying resolver make it almost impossible to smuggle the diagnostics out in a generalized way
        var fromCache = moduleResolutionCache.getFromNonRelativeNameCache(name, mode, containingDir, redirectedReference);
        if (fromCache)
            addResolutionDiagnostics(fromCache);
    }
    function resolveModuleNamesWorker(moduleNames, containingFile, reusedNames) {
        if (!moduleNames.length)
            return ts_1.emptyArray;
        var containingFileName = (0, ts_1.getNormalizedAbsolutePath)(containingFile.originalFileName, currentDirectory);
        var redirectedReference = getRedirectReferenceForResolution(containingFile);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "resolveModuleNamesWorker", { containingFileName: containingFileName });
        performance.mark("beforeResolveModule");
        var result = actualResolveModuleNamesWorker(moduleNames, containingFileName, redirectedReference, options, containingFile, reusedNames);
        performance.mark("afterResolveModule");
        performance.measure("ResolveModule", "beforeResolveModule", "afterResolveModule");
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        return result;
    }
    function resolveTypeReferenceDirectiveNamesWorker(typeDirectiveNames, containingFile, reusedNames) {
        if (!typeDirectiveNames.length)
            return [];
        var containingSourceFile = !(0, ts_1.isString)(containingFile) ? containingFile : undefined;
        var containingFileName = !(0, ts_1.isString)(containingFile) ? (0, ts_1.getNormalizedAbsolutePath)(containingFile.originalFileName, currentDirectory) : containingFile;
        var redirectedReference = containingSourceFile && getRedirectReferenceForResolution(containingSourceFile);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "resolveTypeReferenceDirectiveNamesWorker", { containingFileName: containingFileName });
        performance.mark("beforeResolveTypeReference");
        var result = actualResolveTypeReferenceDirectiveNamesWorker(typeDirectiveNames, containingFileName, redirectedReference, options, containingSourceFile, reusedNames);
        performance.mark("afterResolveTypeReference");
        performance.measure("ResolveTypeReference", "beforeResolveTypeReference", "afterResolveTypeReference");
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        return result;
    }
    function getRedirectReferenceForResolution(file) {
        var redirect = getResolvedProjectReferenceToRedirect(file.originalFileName);
        if (redirect || !(0, ts_1.isDeclarationFileName)(file.originalFileName))
            return redirect;
        // The originalFileName could not be actual source file name if file found was d.ts from referecned project
        // So in this case try to look up if this is output from referenced project, if it is use the redirected project in that case
        var resultFromDts = getRedirectReferenceForResolutionFromSourceOfProject(file.path);
        if (resultFromDts)
            return resultFromDts;
        // If preserveSymlinks is true, module resolution wont jump the symlink
        // but the resolved real path may be the .d.ts from project reference
        // Note:: Currently we try the real path only if the
        // file is from node_modules to avoid having to run real path on all file paths
        if (!host.realpath || !options.preserveSymlinks || !(0, ts_1.stringContains)(file.originalFileName, ts_1.nodeModulesPathPart))
            return undefined;
        var realDeclarationPath = toPath(host.realpath(file.originalFileName));
        return realDeclarationPath === file.path ? undefined : getRedirectReferenceForResolutionFromSourceOfProject(realDeclarationPath);
    }
    function getRedirectReferenceForResolutionFromSourceOfProject(filePath) {
        var source = getSourceOfProjectReferenceRedirect(filePath);
        if ((0, ts_1.isString)(source))
            return getResolvedProjectReferenceToRedirect(source);
        if (!source)
            return undefined;
        // Output of .d.ts file so return resolved ref that matches the out file name
        return forEachResolvedProjectReference(function (resolvedRef) {
            var out = (0, ts_1.outFile)(resolvedRef.commandLine.options);
            if (!out)
                return undefined;
            return toPath(out) === filePath ? resolvedRef : undefined;
        });
    }
    function compareDefaultLibFiles(a, b) {
        return (0, ts_1.compareValues)(getDefaultLibFilePriority(a), getDefaultLibFilePriority(b));
    }
    function getDefaultLibFilePriority(a) {
        if ((0, ts_1.containsPath)(defaultLibraryPath, a.fileName, /*ignoreCase*/ false)) {
            var basename = (0, ts_1.getBaseFileName)(a.fileName);
            if (basename === "lib.d.ts" || basename === "lib.es6.d.ts")
                return 0;
            var name_2 = (0, ts_1.removeSuffix)((0, ts_1.removePrefix)(basename, "lib."), ".d.ts");
            var index = ts_1.libs.indexOf(name_2);
            if (index !== -1)
                return index + 1;
        }
        return ts_1.libs.length + 2;
    }
    function toPath(fileName) {
        return (0, ts_1.toPath)(fileName, currentDirectory, getCanonicalFileName);
    }
    function getCommonSourceDirectory() {
        if (commonSourceDirectory === undefined) {
            var emittedFiles_1 = (0, ts_1.filter)(files, function (file) { return (0, ts_1.sourceFileMayBeEmitted)(file, program); });
            commonSourceDirectory = (0, ts_1.getCommonSourceDirectory)(options, function () { return (0, ts_1.mapDefined)(emittedFiles_1, function (file) { return file.isDeclarationFile ? undefined : file.fileName; }); }, currentDirectory, getCanonicalFileName, function (commonSourceDirectory) { return checkSourceFilesBelongToPath(emittedFiles_1, commonSourceDirectory); });
        }
        return commonSourceDirectory;
    }
    function getClassifiableNames() {
        var _a;
        if (!classifiableNames) {
            // Initialize a checker so that all our files are bound.
            getTypeChecker();
            classifiableNames = new Set();
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var sourceFile = files_1[_i];
                (_a = sourceFile.classifiableNames) === null || _a === void 0 ? void 0 : _a.forEach(function (value) { return classifiableNames.add(value); });
            }
        }
        return classifiableNames;
    }
    function resolveModuleNamesReusingOldState(moduleNames, file) {
        var _a;
        if (structureIsReused === 0 /* StructureIsReused.Not */ && !file.ambientModuleNames.length) {
            // If the old program state does not permit reusing resolutions and `file` does not contain locally defined ambient modules,
            // the best we can do is fallback to the default logic.
            return resolveModuleNamesWorker(moduleNames, file, /*reusedNames*/ undefined);
        }
        var oldSourceFile = oldProgram && oldProgram.getSourceFile(file.fileName);
        if (oldSourceFile !== file && file.resolvedModules) {
            // `file` was created for the new program.
            //
            // We only set `file.resolvedModules` via work from the current function,
            // so it is defined iff we already called the current function on `file`.
            // That call happened no later than the creation of the `file` object,
            // which per above occurred during the current program creation.
            // Since we assume the filesystem does not change during program creation,
            // it is safe to reuse resolutions from the earlier call.
            var result_1 = [];
            for (var _i = 0, moduleNames_1 = moduleNames; _i < moduleNames_1.length; _i++) {
                var moduleName = moduleNames_1[_i];
                var resolvedModule = file.resolvedModules.get(moduleName.text, getModeForUsageLocation(file, moduleName));
                result_1.push(resolvedModule);
            }
            return result_1;
        }
        // At this point, we know at least one of the following hold:
        // - file has local declarations for ambient modules
        // - old program state is available
        // With this information, we can infer some module resolutions without performing resolution.
        /** An ordered list of module names for which we cannot recover the resolution. */
        var unknownModuleNames;
        /**
         * The indexing of elements in this list matches that of `moduleNames`.
         *
         * Before combining results, result[i] is in one of the following states:
         * * undefined: needs to be recomputed,
         * * predictedToResolveToAmbientModuleMarker: known to be an ambient module.
         * Needs to be reset to undefined before returning,
         * * ResolvedModuleFull instance: can be reused.
         */
        var result;
        var reusedNames;
        /** A transient placeholder used to mark predicted resolution in the result list. */
        var predictedToResolveToAmbientModuleMarker = emptyResolution;
        for (var i = 0; i < moduleNames.length; i++) {
            var moduleName = moduleNames[i];
            // If the source file is unchanged and doesnt have invalidated resolution, reuse the module resolutions
            if (file === oldSourceFile && !hasInvalidatedResolutions(oldSourceFile.path)) {
                var mode = getModeForUsageLocation(file, moduleName);
                var oldResolution = (_a = oldSourceFile.resolvedModules) === null || _a === void 0 ? void 0 : _a.get(moduleName.text, mode);
                if (oldResolution === null || oldResolution === void 0 ? void 0 : oldResolution.resolvedModule) {
                    if ((0, ts_1.isTraceEnabled)(options, host)) {
                        (0, ts_1.trace)(host, oldResolution.resolvedModule.packageId ?
                            ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2_with_Package_ID_3 :
                            ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2, moduleName.text, (0, ts_1.getNormalizedAbsolutePath)(file.originalFileName, currentDirectory), oldResolution.resolvedModule.resolvedFileName, oldResolution.resolvedModule.packageId && (0, ts_1.packageIdToString)(oldResolution.resolvedModule.packageId));
                    }
                    (result !== null && result !== void 0 ? result : (result = new Array(moduleNames.length)))[i] = oldResolution;
                    (reusedNames !== null && reusedNames !== void 0 ? reusedNames : (reusedNames = [])).push(moduleName);
                    continue;
                }
            }
            // We know moduleName resolves to an ambient module provided that moduleName:
            // - is in the list of ambient modules locally declared in the current source file.
            // - resolved to an ambient module in the old program whose declaration is in an unmodified file
            //   (so the same module declaration will land in the new program)
            var resolvesToAmbientModuleInNonModifiedFile = false;
            if ((0, ts_1.contains)(file.ambientModuleNames, moduleName.text)) {
                resolvesToAmbientModuleInNonModifiedFile = true;
                if ((0, ts_1.isTraceEnabled)(options, host)) {
                    (0, ts_1.trace)(host, ts_1.Diagnostics.Module_0_was_resolved_as_locally_declared_ambient_module_in_file_1, moduleName.text, (0, ts_1.getNormalizedAbsolutePath)(file.originalFileName, currentDirectory));
                }
            }
            else {
                resolvesToAmbientModuleInNonModifiedFile = moduleNameResolvesToAmbientModuleInNonModifiedFile(moduleName);
            }
            if (resolvesToAmbientModuleInNonModifiedFile) {
                (result || (result = new Array(moduleNames.length)))[i] = predictedToResolveToAmbientModuleMarker;
            }
            else {
                // Resolution failed in the old program, or resolved to an ambient module for which we can't reuse the result.
                (unknownModuleNames !== null && unknownModuleNames !== void 0 ? unknownModuleNames : (unknownModuleNames = [])).push(moduleName);
            }
        }
        var resolutions = unknownModuleNames && unknownModuleNames.length
            ? resolveModuleNamesWorker(unknownModuleNames, file, reusedNames)
            : ts_1.emptyArray;
        // Combine results of resolutions and predicted results
        if (!result) {
            // There were no unresolved/ambient resolutions.
            ts_1.Debug.assert(resolutions.length === moduleNames.length);
            return resolutions;
        }
        var j = 0;
        for (var i = 0; i < result.length; i++) {
            if (!result[i]) {
                result[i] = resolutions[j];
                j++;
            }
        }
        ts_1.Debug.assert(j === resolutions.length);
        return result;
        // If we change our policy of rechecking failed lookups on each program create,
        // we should adjust the value returned here.
        function moduleNameResolvesToAmbientModuleInNonModifiedFile(moduleName) {
            var resolutionToFile = (0, ts_1.getResolvedModule)(oldSourceFile, moduleName.text, getModeForUsageLocation(file, moduleName));
            var resolvedFile = resolutionToFile && oldProgram.getSourceFile(resolutionToFile.resolvedFileName);
            if (resolutionToFile && resolvedFile) {
                // In the old program, we resolved to an ambient module that was in the same
                //   place as we expected to find an actual module file.
                // We actually need to return 'false' here even though this seems like a 'true' case
                //   because the normal module resolution algorithm will find this anyway.
                return false;
            }
            // at least one of declarations should come from non-modified source file
            var unmodifiedFile = ambientModuleNameToUnmodifiedFileName.get(moduleName.text);
            if (!unmodifiedFile) {
                return false;
            }
            if ((0, ts_1.isTraceEnabled)(options, host)) {
                (0, ts_1.trace)(host, ts_1.Diagnostics.Module_0_was_resolved_as_ambient_module_declared_in_1_since_this_file_was_not_modified, moduleName.text, unmodifiedFile);
            }
            return true;
        }
    }
    function resolveTypeReferenceDirectiveNamesReusingOldState(typeDirectiveNames, containingFile) {
        var _a;
        if (structureIsReused === 0 /* StructureIsReused.Not */) {
            // If the old program state does not permit reusing resolutions and `file` does not contain locally defined ambient modules,
            // the best we can do is fallback to the default logic.
            return resolveTypeReferenceDirectiveNamesWorker(typeDirectiveNames, containingFile, /*reusedNames*/ undefined);
        }
        var oldSourceFile = !(0, ts_1.isString)(containingFile) ? oldProgram && oldProgram.getSourceFile(containingFile.fileName) : undefined;
        if (!(0, ts_1.isString)(containingFile)) {
            if (oldSourceFile !== containingFile && containingFile.resolvedTypeReferenceDirectiveNames) {
                // `file` was created for the new program.
                //
                // We only set `file.resolvedTypeReferenceDirectiveNames` via work from the current function,
                // so it is defined iff we already called the current function on `file`.
                // That call happened no later than the creation of the `file` object,
                // which per above occurred during the current program creation.
                // Since we assume the filesystem does not change during program creation,
                // it is safe to reuse resolutions from the earlier call.
                var result_2 = [];
                for (var _i = 0, _b = typeDirectiveNames; _i < _b.length; _i++) {
                    var typeDirectiveName = _b[_i];
                    // We lower-case all type references because npm automatically lowercases all packages. See GH#9824.
                    var resolvedTypeReferenceDirective = containingFile.resolvedTypeReferenceDirectiveNames.get(getTypeReferenceResolutionName(typeDirectiveName), getModeForFileReference(typeDirectiveName, containingFile.impliedNodeFormat));
                    result_2.push(resolvedTypeReferenceDirective);
                }
                return result_2;
            }
        }
        /** An ordered list of module names for which we cannot recover the resolution. */
        var unknownTypeReferenceDirectiveNames;
        var result;
        var reusedNames;
        var containingSourceFile = !(0, ts_1.isString)(containingFile) ? containingFile : undefined;
        var canReuseResolutions = !(0, ts_1.isString)(containingFile) ?
            containingFile === oldSourceFile && !hasInvalidatedResolutions(oldSourceFile.path) :
            !hasInvalidatedResolutions(toPath(containingFile));
        for (var i = 0; i < typeDirectiveNames.length; i++) {
            var entry = typeDirectiveNames[i];
            if (canReuseResolutions) {
                var typeDirectiveName = getTypeReferenceResolutionName(entry);
                var mode = getModeForFileReference(entry, containingSourceFile === null || containingSourceFile === void 0 ? void 0 : containingSourceFile.impliedNodeFormat);
                var oldResolution = (_a = (!(0, ts_1.isString)(containingFile) ? oldSourceFile === null || oldSourceFile === void 0 ? void 0 : oldSourceFile.resolvedTypeReferenceDirectiveNames : oldProgram === null || oldProgram === void 0 ? void 0 : oldProgram.getAutomaticTypeDirectiveResolutions())) === null || _a === void 0 ? void 0 : _a.get(typeDirectiveName, mode);
                if (oldResolution === null || oldResolution === void 0 ? void 0 : oldResolution.resolvedTypeReferenceDirective) {
                    if ((0, ts_1.isTraceEnabled)(options, host)) {
                        (0, ts_1.trace)(host, oldResolution.resolvedTypeReferenceDirective.packageId ?
                            ts_1.Diagnostics.Reusing_resolution_of_type_reference_directive_0_from_1_of_old_program_it_was_successfully_resolved_to_2_with_Package_ID_3 :
                            ts_1.Diagnostics.Reusing_resolution_of_type_reference_directive_0_from_1_of_old_program_it_was_successfully_resolved_to_2, typeDirectiveName, !(0, ts_1.isString)(containingFile) ? (0, ts_1.getNormalizedAbsolutePath)(containingFile.originalFileName, currentDirectory) : containingFile, oldResolution.resolvedTypeReferenceDirective.resolvedFileName, oldResolution.resolvedTypeReferenceDirective.packageId && (0, ts_1.packageIdToString)(oldResolution.resolvedTypeReferenceDirective.packageId));
                    }
                    (result !== null && result !== void 0 ? result : (result = new Array(typeDirectiveNames.length)))[i] = oldResolution;
                    (reusedNames !== null && reusedNames !== void 0 ? reusedNames : (reusedNames = [])).push(entry);
                    continue;
                }
            }
            // Resolution failed in the old program, or resolved to an ambient module for which we can't reuse the result.
            (unknownTypeReferenceDirectiveNames !== null && unknownTypeReferenceDirectiveNames !== void 0 ? unknownTypeReferenceDirectiveNames : (unknownTypeReferenceDirectiveNames = [])).push(entry);
        }
        if (!unknownTypeReferenceDirectiveNames)
            return result || ts_1.emptyArray;
        var resolutions = resolveTypeReferenceDirectiveNamesWorker(unknownTypeReferenceDirectiveNames, containingFile, reusedNames);
        // Combine results of resolutions
        if (!result) {
            // There were no unresolved resolutions.
            ts_1.Debug.assert(resolutions.length === typeDirectiveNames.length);
            return resolutions;
        }
        var j = 0;
        for (var i = 0; i < result.length; i++) {
            if (!result[i]) {
                result[i] = resolutions[j];
                j++;
            }
        }
        ts_1.Debug.assert(j === resolutions.length);
        return result;
    }
    function canReuseProjectReferences() {
        return !forEachProjectReference(oldProgram.getProjectReferences(), oldProgram.getResolvedProjectReferences(), function (oldResolvedRef, parent, index) {
            var newRef = (parent ? parent.commandLine.projectReferences : projectReferences)[index];
            var newResolvedRef = parseProjectReferenceConfigFile(newRef);
            if (oldResolvedRef) {
                // Resolved project reference has gone missing or changed
                return !newResolvedRef ||
                    newResolvedRef.sourceFile !== oldResolvedRef.sourceFile ||
                    !(0, ts_1.arrayIsEqualTo)(oldResolvedRef.commandLine.fileNames, newResolvedRef.commandLine.fileNames);
            }
            else {
                // A previously-unresolved reference may be resolved now
                return newResolvedRef !== undefined;
            }
        }, function (oldProjectReferences, parent) {
            // If array of references is changed, we cant resue old program
            var newReferences = parent ? getResolvedProjectReferenceByPath(parent.sourceFile.path).commandLine.projectReferences : projectReferences;
            return !(0, ts_1.arrayIsEqualTo)(oldProjectReferences, newReferences, ts_1.projectReferenceIsEqualTo);
        });
    }
    function tryReuseStructureFromOldProgram() {
        var _a;
        if (!oldProgram) {
            return 0 /* StructureIsReused.Not */;
        }
        // check properties that can affect structure of the program or module resolution strategy
        // if any of these properties has changed - structure cannot be reused
        var oldOptions = oldProgram.getCompilerOptions();
        if ((0, ts_1.changesAffectModuleResolution)(oldOptions, options)) {
            return 0 /* StructureIsReused.Not */;
        }
        // there is an old program, check if we can reuse its structure
        var oldRootNames = oldProgram.getRootFileNames();
        if (!(0, ts_1.arrayIsEqualTo)(oldRootNames, rootNames)) {
            return 0 /* StructureIsReused.Not */;
        }
        // Check if any referenced project tsconfig files are different
        if (!canReuseProjectReferences()) {
            return 0 /* StructureIsReused.Not */;
        }
        if (projectReferences) {
            resolvedProjectReferences = projectReferences.map(parseProjectReferenceConfigFile);
        }
        // check if program source files has changed in the way that can affect structure of the program
        var newSourceFiles = [];
        var modifiedSourceFiles = [];
        structureIsReused = 2 /* StructureIsReused.Completely */;
        // If the missing file paths are now present, it can change the progam structure,
        // and hence cant reuse the structure.
        // This is same as how we dont reuse the structure if one of the file from old program is now missing
        if (oldProgram.getMissingFilePaths().some(function (missingFilePath) { return host.fileExists(missingFilePath); })) {
            return 0 /* StructureIsReused.Not */;
        }
        var oldSourceFiles = oldProgram.getSourceFiles();
        var seenPackageNames = new Map();
        for (var _i = 0, oldSourceFiles_2 = oldSourceFiles; _i < oldSourceFiles_2.length; _i++) {
            var oldSourceFile = oldSourceFiles_2[_i];
            var sourceFileOptions = getCreateSourceFileOptions(oldSourceFile.fileName, moduleResolutionCache, host, options);
            var newSourceFile = host.getSourceFileByPath
                ? host.getSourceFileByPath(oldSourceFile.fileName, oldSourceFile.resolvedPath, sourceFileOptions, /*onError*/ undefined, shouldCreateNewSourceFile)
                : host.getSourceFile(oldSourceFile.fileName, sourceFileOptions, /*onError*/ undefined, shouldCreateNewSourceFile); // TODO: GH#18217
            if (!newSourceFile) {
                return 0 /* StructureIsReused.Not */;
            }
            newSourceFile.packageJsonLocations = ((_a = sourceFileOptions.packageJsonLocations) === null || _a === void 0 ? void 0 : _a.length) ? sourceFileOptions.packageJsonLocations : undefined;
            newSourceFile.packageJsonScope = sourceFileOptions.packageJsonScope;
            ts_1.Debug.assert(!newSourceFile.redirectInfo, "Host should not return a redirect source file from `getSourceFile`");
            var fileChanged = void 0;
            if (oldSourceFile.redirectInfo) {
                // We got `newSourceFile` by path, so it is actually for the unredirected file.
                // This lets us know if the unredirected file has changed. If it has we should break the redirect.
                if (newSourceFile !== oldSourceFile.redirectInfo.unredirected) {
                    // Underlying file has changed. Might not redirect anymore. Must rebuild program.
                    return 0 /* StructureIsReused.Not */;
                }
                fileChanged = false;
                newSourceFile = oldSourceFile; // Use the redirect.
            }
            else if (oldProgram.redirectTargetsMap.has(oldSourceFile.path)) {
                // If a redirected-to source file changes, the redirect may be broken.
                if (newSourceFile !== oldSourceFile) {
                    return 0 /* StructureIsReused.Not */;
                }
                fileChanged = false;
            }
            else {
                fileChanged = newSourceFile !== oldSourceFile;
            }
            // Since the project references havent changed, its right to set originalFileName and resolvedPath here
            newSourceFile.path = oldSourceFile.path;
            newSourceFile.originalFileName = oldSourceFile.originalFileName;
            newSourceFile.resolvedPath = oldSourceFile.resolvedPath;
            newSourceFile.fileName = oldSourceFile.fileName;
            var packageName = oldProgram.sourceFileToPackageName.get(oldSourceFile.path);
            if (packageName !== undefined) {
                // If there are 2 different source files for the same package name and at least one of them changes,
                // they might become redirects. So we must rebuild the program.
                var prevKind = seenPackageNames.get(packageName);
                var newKind = fileChanged ? 1 /* SeenPackageName.Modified */ : 0 /* SeenPackageName.Exists */;
                if ((prevKind !== undefined && newKind === 1 /* SeenPackageName.Modified */) || prevKind === 1 /* SeenPackageName.Modified */) {
                    return 0 /* StructureIsReused.Not */;
                }
                seenPackageNames.set(packageName, newKind);
            }
            if (fileChanged) {
                if (oldSourceFile.impliedNodeFormat !== newSourceFile.impliedNodeFormat) {
                    structureIsReused = 1 /* StructureIsReused.SafeModules */;
                }
                // The `newSourceFile` object was created for the new program.
                else if (!(0, ts_1.arrayIsEqualTo)(oldSourceFile.libReferenceDirectives, newSourceFile.libReferenceDirectives, fileReferenceIsEqualTo)) {
                    // 'lib' references has changed. Matches behavior in changesAffectModuleResolution
                    structureIsReused = 1 /* StructureIsReused.SafeModules */;
                }
                else if (oldSourceFile.hasNoDefaultLib !== newSourceFile.hasNoDefaultLib) {
                    // value of no-default-lib has changed
                    // this will affect if default library is injected into the list of files
                    structureIsReused = 1 /* StructureIsReused.SafeModules */;
                }
                // check tripleslash references
                else if (!(0, ts_1.arrayIsEqualTo)(oldSourceFile.referencedFiles, newSourceFile.referencedFiles, fileReferenceIsEqualTo)) {
                    // tripleslash references has changed
                    structureIsReused = 1 /* StructureIsReused.SafeModules */;
                }
                else {
                    // check imports and module augmentations
                    collectExternalModuleReferences(newSourceFile);
                    if (!(0, ts_1.arrayIsEqualTo)(oldSourceFile.imports, newSourceFile.imports, moduleNameIsEqualTo)) {
                        // imports has changed
                        structureIsReused = 1 /* StructureIsReused.SafeModules */;
                    }
                    else if (!(0, ts_1.arrayIsEqualTo)(oldSourceFile.moduleAugmentations, newSourceFile.moduleAugmentations, moduleNameIsEqualTo)) {
                        // moduleAugmentations has changed
                        structureIsReused = 1 /* StructureIsReused.SafeModules */;
                    }
                    else if ((oldSourceFile.flags & 6291456 /* NodeFlags.PermanentlySetIncrementalFlags */) !== (newSourceFile.flags & 6291456 /* NodeFlags.PermanentlySetIncrementalFlags */)) {
                        // dynamicImport has changed
                        structureIsReused = 1 /* StructureIsReused.SafeModules */;
                    }
                    else if (!(0, ts_1.arrayIsEqualTo)(oldSourceFile.typeReferenceDirectives, newSourceFile.typeReferenceDirectives, fileReferenceIsEqualTo)) {
                        // 'types' references has changed
                        structureIsReused = 1 /* StructureIsReused.SafeModules */;
                    }
                }
                // tentatively approve the file
                modifiedSourceFiles.push({ oldFile: oldSourceFile, newFile: newSourceFile });
            }
            else if (hasInvalidatedResolutions(oldSourceFile.path)) {
                // 'module/types' references could have changed
                structureIsReused = 1 /* StructureIsReused.SafeModules */;
                // add file to the modified list so that we will resolve it later
                modifiedSourceFiles.push({ oldFile: oldSourceFile, newFile: newSourceFile });
            }
            // if file has passed all checks it should be safe to reuse it
            newSourceFiles.push(newSourceFile);
        }
        if (structureIsReused !== 2 /* StructureIsReused.Completely */) {
            return structureIsReused;
        }
        var modifiedFiles = modifiedSourceFiles.map(function (f) { return f.oldFile; });
        for (var _b = 0, oldSourceFiles_3 = oldSourceFiles; _b < oldSourceFiles_3.length; _b++) {
            var oldFile = oldSourceFiles_3[_b];
            if (!(0, ts_1.contains)(modifiedFiles, oldFile)) {
                for (var _c = 0, _d = oldFile.ambientModuleNames; _c < _d.length; _c++) {
                    var moduleName = _d[_c];
                    ambientModuleNameToUnmodifiedFileName.set(moduleName, oldFile.fileName);
                }
            }
        }
        // try to verify results of module resolution
        for (var _e = 0, modifiedSourceFiles_1 = modifiedSourceFiles; _e < modifiedSourceFiles_1.length; _e++) {
            var _f = modifiedSourceFiles_1[_e], oldSourceFile = _f.oldFile, newSourceFile = _f.newFile;
            var moduleNames = getModuleNames(newSourceFile);
            var resolutions = resolveModuleNamesReusingOldState(moduleNames, newSourceFile);
            // ensure that module resolution results are still correct
            var resolutionsChanged = (0, ts_1.hasChangesInResolutions)(moduleNames, newSourceFile, resolutions, oldSourceFile.resolvedModules, ts_1.moduleResolutionIsEqualTo, exports.moduleResolutionNameAndModeGetter);
            if (resolutionsChanged) {
                structureIsReused = 1 /* StructureIsReused.SafeModules */;
                newSourceFile.resolvedModules = (0, ts_1.zipToModeAwareCache)(newSourceFile, moduleNames, resolutions, exports.moduleResolutionNameAndModeGetter);
            }
            else {
                newSourceFile.resolvedModules = oldSourceFile.resolvedModules;
            }
            var typesReferenceDirectives = newSourceFile.typeReferenceDirectives;
            var typeReferenceResolutions = resolveTypeReferenceDirectiveNamesReusingOldState(typesReferenceDirectives, newSourceFile);
            // ensure that types resolutions are still correct
            var typeReferenceResolutionsChanged = (0, ts_1.hasChangesInResolutions)(typesReferenceDirectives, newSourceFile, typeReferenceResolutions, oldSourceFile.resolvedTypeReferenceDirectiveNames, ts_1.typeDirectiveIsEqualTo, exports.typeReferenceResolutionNameAndModeGetter);
            if (typeReferenceResolutionsChanged) {
                structureIsReused = 1 /* StructureIsReused.SafeModules */;
                newSourceFile.resolvedTypeReferenceDirectiveNames = (0, ts_1.zipToModeAwareCache)(newSourceFile, typesReferenceDirectives, typeReferenceResolutions, exports.typeReferenceResolutionNameAndModeGetter);
            }
            else {
                newSourceFile.resolvedTypeReferenceDirectiveNames = oldSourceFile.resolvedTypeReferenceDirectiveNames;
            }
        }
        if (structureIsReused !== 2 /* StructureIsReused.Completely */) {
            return structureIsReused;
        }
        if ((0, ts_1.changesAffectingProgramStructure)(oldOptions, options)) {
            return 1 /* StructureIsReused.SafeModules */;
        }
        if (oldProgram.resolvedLibReferences &&
            (0, ts_1.forEachEntry)(oldProgram.resolvedLibReferences, function (resolution, libFileName) { return pathForLibFileWorker(libFileName).actual !== resolution.actual; })) {
            return 1 /* StructureIsReused.SafeModules */;
        }
        if (host.hasChangedAutomaticTypeDirectiveNames) {
            if (host.hasChangedAutomaticTypeDirectiveNames())
                return 1 /* StructureIsReused.SafeModules */;
        }
        else {
            automaticTypeDirectiveNames = (0, ts_1.getAutomaticTypeDirectiveNames)(options, host);
            if (!(0, ts_1.arrayIsEqualTo)(oldProgram.getAutomaticTypeDirectiveNames(), automaticTypeDirectiveNames))
                return 1 /* StructureIsReused.SafeModules */;
        }
        missingFilePaths = oldProgram.getMissingFilePaths();
        // update fileName -> file mapping
        ts_1.Debug.assert(newSourceFiles.length === oldProgram.getSourceFiles().length);
        for (var _g = 0, newSourceFiles_1 = newSourceFiles; _g < newSourceFiles_1.length; _g++) {
            var newSourceFile = newSourceFiles_1[_g];
            filesByName.set(newSourceFile.path, newSourceFile);
        }
        var oldFilesByNameMap = oldProgram.getFilesByNameMap();
        oldFilesByNameMap.forEach(function (oldFile, path) {
            if (!oldFile) {
                filesByName.set(path, oldFile);
                return;
            }
            if (oldFile.path === path) {
                // Set the file as found during node modules search if it was found that way in old progra,
                if (oldProgram.isSourceFileFromExternalLibrary(oldFile)) {
                    sourceFilesFoundSearchingNodeModules.set(oldFile.path, true);
                }
                return;
            }
            filesByName.set(path, filesByName.get(oldFile.path));
        });
        files = newSourceFiles;
        fileReasons = oldProgram.getFileIncludeReasons();
        fileProcessingDiagnostics = oldProgram.getFileProcessingDiagnostics();
        resolvedTypeReferenceDirectives = oldProgram.getResolvedTypeReferenceDirectives();
        automaticTypeDirectiveNames = oldProgram.getAutomaticTypeDirectiveNames();
        automaticTypeDirectiveResolutions = oldProgram.getAutomaticTypeDirectiveResolutions();
        sourceFileToPackageName = oldProgram.sourceFileToPackageName;
        redirectTargetsMap = oldProgram.redirectTargetsMap;
        usesUriStyleNodeCoreModules = oldProgram.usesUriStyleNodeCoreModules;
        resolvedLibReferences = oldProgram.resolvedLibReferences;
        packageMap = oldProgram.getCurrentPackagesMap();
        return 2 /* StructureIsReused.Completely */;
    }
    function getEmitHost(writeFileCallback) {
        return {
            getPrependNodes: getPrependNodes,
            getCanonicalFileName: getCanonicalFileName,
            getCommonSourceDirectory: program.getCommonSourceDirectory,
            getCompilerOptions: program.getCompilerOptions,
            getCurrentDirectory: function () { return currentDirectory; },
            getSourceFile: program.getSourceFile,
            getSourceFileByPath: program.getSourceFileByPath,
            getSourceFiles: program.getSourceFiles,
            getLibFileFromReference: program.getLibFileFromReference,
            isSourceFileFromExternalLibrary: isSourceFileFromExternalLibrary,
            getResolvedProjectReferenceToRedirect: getResolvedProjectReferenceToRedirect,
            getProjectReferenceRedirect: getProjectReferenceRedirect,
            isSourceOfProjectReferenceRedirect: isSourceOfProjectReferenceRedirect,
            getSymlinkCache: getSymlinkCache,
            writeFile: writeFileCallback || writeFile,
            isEmitBlocked: isEmitBlocked,
            readFile: function (f) { return host.readFile(f); },
            fileExists: function (f) {
                // Use local caches
                var path = toPath(f);
                if (getSourceFileByPath(path))
                    return true;
                if ((0, ts_1.contains)(missingFilePaths, path))
                    return false;
                // Before falling back to the host
                return host.fileExists(f);
            },
            useCaseSensitiveFileNames: function () { return host.useCaseSensitiveFileNames(); },
            getBuildInfo: function (bundle) { var _a; return (_a = program.getBuildInfo) === null || _a === void 0 ? void 0 : _a.call(program, bundle); },
            getSourceFileFromReference: function (file, ref) { return program.getSourceFileFromReference(file, ref); },
            redirectTargetsMap: redirectTargetsMap,
            getFileIncludeReasons: program.getFileIncludeReasons,
            createHash: (0, ts_1.maybeBind)(host, host.createHash),
        };
    }
    function writeFile(fileName, text, writeByteOrderMark, onError, sourceFiles, data) {
        host.writeFile(fileName, text, writeByteOrderMark, onError, sourceFiles, data);
    }
    function emitBuildInfo(writeFileCallback) {
        ts_1.Debug.assert(!(0, ts_1.outFile)(options));
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "emitBuildInfo", {}, /*separateBeginAndEnd*/ true);
        performance.mark("beforeEmit");
        var emitResult = (0, ts_1.emitFiles)(ts_1.notImplementedResolver, getEmitHost(writeFileCallback), 
        /*targetSourceFile*/ undefined, 
        /*transformers*/ ts_1.noTransformers, 
        /*emitOnly*/ false, 
        /*onlyBuildInfo*/ true);
        performance.mark("afterEmit");
        performance.measure("Emit", "beforeEmit", "afterEmit");
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        return emitResult;
    }
    function getResolvedProjectReferences() {
        return resolvedProjectReferences;
    }
    function getProjectReferences() {
        return projectReferences;
    }
    function getPrependNodes() {
        return createPrependNodes(projectReferences, function (_ref, index) { var _a; return (_a = resolvedProjectReferences[index]) === null || _a === void 0 ? void 0 : _a.commandLine; }, function (fileName) {
            var path = toPath(fileName);
            var sourceFile = getSourceFileByPath(path);
            return sourceFile ? sourceFile.text : filesByName.has(path) ? undefined : host.readFile(path);
        }, host);
    }
    function isSourceFileFromExternalLibrary(file) {
        return !!sourceFilesFoundSearchingNodeModules.get(file.path);
    }
    function isSourceFileDefaultLibrary(file) {
        if (!file.isDeclarationFile) {
            return false;
        }
        if (file.hasNoDefaultLib) {
            return true;
        }
        if (!options.noLib) {
            return false;
        }
        // If '--lib' is not specified, include default library file according to '--target'
        // otherwise, using options specified in '--lib' instead of '--target' default library file
        var equalityComparer = host.useCaseSensitiveFileNames() ? ts_1.equateStringsCaseSensitive : ts_1.equateStringsCaseInsensitive;
        if (!options.lib) {
            return equalityComparer(file.fileName, getDefaultLibraryFileName());
        }
        else {
            return (0, ts_1.some)(options.lib, function (libFileName) { return equalityComparer(file.fileName, resolvedLibReferences.get(libFileName).actual); });
        }
    }
    function getTypeChecker() {
        return typeChecker || (typeChecker = (0, ts_1.createTypeChecker)(program));
    }
    function emit(sourceFile, writeFileCallback, cancellationToken, emitOnly, transformers, forceDtsEmit) {
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "emit", { path: sourceFile === null || sourceFile === void 0 ? void 0 : sourceFile.path }, /*separateBeginAndEnd*/ true);
        var result = runWithCancellationToken(function () { return emitWorker(program, sourceFile, writeFileCallback, cancellationToken, emitOnly, transformers, forceDtsEmit); });
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        return result;
    }
    function isEmitBlocked(emitFileName) {
        return hasEmitBlockingDiagnostics.has(toPath(emitFileName));
    }
    function emitWorker(program, sourceFile, writeFileCallback, cancellationToken, emitOnly, customTransformers, forceDtsEmit) {
        if (!forceDtsEmit) {
            var result = handleNoEmitOptions(program, sourceFile, writeFileCallback, cancellationToken);
            if (result)
                return result;
        }
        // Create the emit resolver outside of the "emitTime" tracking code below.  That way
        // any cost associated with it (like type checking) are appropriate associated with
        // the type-checking counter.
        //
        // If the -out option is specified, we should not pass the source file to getEmitResolver.
        // This is because in the -out scenario all files need to be emitted, and therefore all
        // files need to be type checked. And the way to specify that all files need to be type
        // checked is to not pass the file to getEmitResolver.
        var emitResolver = getTypeChecker().getEmitResolver((0, ts_1.outFile)(options) ? undefined : sourceFile, cancellationToken);
        performance.mark("beforeEmit");
        var emitResult = (0, ts_1.emitFiles)(emitResolver, getEmitHost(writeFileCallback), sourceFile, (0, ts_1.getTransformers)(options, customTransformers, emitOnly), emitOnly, 
        /*onlyBuildInfo*/ false, forceDtsEmit);
        performance.mark("afterEmit");
        performance.measure("Emit", "beforeEmit", "afterEmit");
        return emitResult;
    }
    function getSourceFile(fileName) {
        return getSourceFileByPath(toPath(fileName));
    }
    function getSourceFileByPath(path) {
        return filesByName.get(path) || undefined;
    }
    function getDiagnosticsHelper(sourceFile, getDiagnostics, cancellationToken) {
        if (sourceFile) {
            return (0, ts_1.sortAndDeduplicateDiagnostics)(getDiagnostics(sourceFile, cancellationToken));
        }
        return (0, ts_1.sortAndDeduplicateDiagnostics)((0, ts_1.flatMap)(program.getSourceFiles(), function (sourceFile) {
            if (cancellationToken) {
                cancellationToken.throwIfCancellationRequested();
            }
            return getDiagnostics(sourceFile, cancellationToken);
        }));
    }
    function getSyntacticDiagnostics(sourceFile, cancellationToken) {
        return getDiagnosticsHelper(sourceFile, getSyntacticDiagnosticsForFile, cancellationToken);
    }
    function getSemanticDiagnostics(sourceFile, cancellationToken) {
        return getDiagnosticsHelper(sourceFile, getSemanticDiagnosticsForFile, cancellationToken);
    }
    function getCachedSemanticDiagnostics(sourceFile) {
        var _a;
        return sourceFile
            ? (_a = cachedBindAndCheckDiagnosticsForFile.perFile) === null || _a === void 0 ? void 0 : _a.get(sourceFile.path)
            : cachedBindAndCheckDiagnosticsForFile.allDiagnostics;
    }
    function getBindAndCheckDiagnostics(sourceFile, cancellationToken) {
        return getBindAndCheckDiagnosticsForFile(sourceFile, cancellationToken);
    }
    function getProgramDiagnostics(sourceFile) {
        var _a;
        if ((0, ts_1.skipTypeChecking)(sourceFile, options, program)) {
            return ts_1.emptyArray;
        }
        var programDiagnosticsInFile = programDiagnostics.getDiagnostics(sourceFile.fileName);
        if (!((_a = sourceFile.commentDirectives) === null || _a === void 0 ? void 0 : _a.length)) {
            return programDiagnosticsInFile;
        }
        return getDiagnosticsWithPrecedingDirectives(sourceFile, sourceFile.commentDirectives, programDiagnosticsInFile).diagnostics;
    }
    function getDeclarationDiagnostics(sourceFile, cancellationToken) {
        var options = program.getCompilerOptions();
        // collect diagnostics from the program only once if either no source file was specified or out/outFile is set (bundled emit)
        if (!sourceFile || (0, ts_1.outFile)(options)) {
            return getDeclarationDiagnosticsWorker(sourceFile, cancellationToken);
        }
        else {
            return getDiagnosticsHelper(sourceFile, getDeclarationDiagnosticsForFile, cancellationToken);
        }
    }
    function getSyntacticDiagnosticsForFile(sourceFile) {
        // For JavaScript files, we report semantic errors for using TypeScript-only
        // constructs from within a JavaScript file as syntactic errors.
        if ((0, ts_1.isSourceFileJS)(sourceFile)) {
            if (!sourceFile.additionalSyntacticDiagnostics) {
                sourceFile.additionalSyntacticDiagnostics = getJSSyntacticDiagnosticsForFile(sourceFile);
            }
            return (0, ts_1.concatenate)(sourceFile.additionalSyntacticDiagnostics, sourceFile.parseDiagnostics);
        }
        return sourceFile.parseDiagnostics;
    }
    function runWithCancellationToken(func) {
        try {
            return func();
        }
        catch (e) {
            if (e instanceof ts_1.OperationCanceledException) {
                // We were canceled while performing the operation.  Because our type checker
                // might be a bad state, we need to throw it away.
                typeChecker = undefined;
            }
            throw e;
        }
    }
    function getSemanticDiagnosticsForFile(sourceFile, cancellationToken) {
        return (0, ts_1.concatenate)(filterSemanticDiagnostics(getBindAndCheckDiagnosticsForFile(sourceFile, cancellationToken), options), getProgramDiagnostics(sourceFile));
    }
    function getBindAndCheckDiagnosticsForFile(sourceFile, cancellationToken) {
        return getAndCacheDiagnostics(sourceFile, cancellationToken, cachedBindAndCheckDiagnosticsForFile, getBindAndCheckDiagnosticsForFileNoCache);
    }
    function getBindAndCheckDiagnosticsForFileNoCache(sourceFile, cancellationToken) {
        return runWithCancellationToken(function () {
            if ((0, ts_1.skipTypeChecking)(sourceFile, options, program)) {
                return ts_1.emptyArray;
            }
            var typeChecker = getTypeChecker();
            ts_1.Debug.assert(!!sourceFile.bindDiagnostics);
            var isJs = sourceFile.scriptKind === 1 /* ScriptKind.JS */ || sourceFile.scriptKind === 2 /* ScriptKind.JSX */;
            var isCheckJs = isJs && (0, ts_1.isCheckJsEnabledForFile)(sourceFile, options);
            var isPlainJs = (0, ts_1.isPlainJsFile)(sourceFile, options.checkJs);
            var isTsNoCheck = !!sourceFile.checkJsDirective && sourceFile.checkJsDirective.enabled === false;
            // By default, only type-check .ts, .tsx, Deferred, plain JS, checked JS and External
            // - plain JS: .js files with no // ts-check and checkJs: undefined
            // - check JS: .js files with either // ts-check or checkJs: true
            // - external: files that are added by plugins
            var includeBindAndCheckDiagnostics = !isTsNoCheck && (sourceFile.scriptKind === 3 /* ScriptKind.TS */ || sourceFile.scriptKind === 4 /* ScriptKind.TSX */
                || sourceFile.scriptKind === 5 /* ScriptKind.External */ || isPlainJs || isCheckJs || sourceFile.scriptKind === 7 /* ScriptKind.Deferred */);
            var bindDiagnostics = includeBindAndCheckDiagnostics ? sourceFile.bindDiagnostics : ts_1.emptyArray;
            var checkDiagnostics = includeBindAndCheckDiagnostics ? typeChecker.getDiagnostics(sourceFile, cancellationToken) : ts_1.emptyArray;
            if (isPlainJs) {
                bindDiagnostics = (0, ts_1.filter)(bindDiagnostics, function (d) { return exports.plainJSErrors.has(d.code); });
                checkDiagnostics = (0, ts_1.filter)(checkDiagnostics, function (d) { return exports.plainJSErrors.has(d.code); });
            }
            // skip ts-expect-error errors in plain JS files, and skip JSDoc errors except in checked JS
            return getMergedBindAndCheckDiagnostics(sourceFile, includeBindAndCheckDiagnostics && !isPlainJs, bindDiagnostics, checkDiagnostics, isCheckJs ? sourceFile.jsDocDiagnostics : undefined);
        });
    }
    function getMergedBindAndCheckDiagnostics(sourceFile, includeBindAndCheckDiagnostics) {
        var _a;
        var allDiagnostics = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            allDiagnostics[_i - 2] = arguments[_i];
        }
        var flatDiagnostics = (0, ts_1.flatten)(allDiagnostics);
        if (!includeBindAndCheckDiagnostics || !((_a = sourceFile.commentDirectives) === null || _a === void 0 ? void 0 : _a.length)) {
            return flatDiagnostics;
        }
        var _b = getDiagnosticsWithPrecedingDirectives(sourceFile, sourceFile.commentDirectives, flatDiagnostics), diagnostics = _b.diagnostics, directives = _b.directives;
        for (var _c = 0, _d = directives.getUnusedExpectations(); _c < _d.length; _c++) {
            var errorExpectation = _d[_c];
            diagnostics.push((0, ts_1.createDiagnosticForRange)(sourceFile, errorExpectation.range, ts_1.Diagnostics.Unused_ts_expect_error_directive));
        }
        return diagnostics;
    }
    /**
     * Creates a map of comment directives along with the diagnostics immediately preceded by one of them.
     * Comments that match to any of those diagnostics are marked as used.
     */
    function getDiagnosticsWithPrecedingDirectives(sourceFile, commentDirectives, flatDiagnostics) {
        // Diagnostics are only reported if there is no comment directive preceding them
        // This will modify the directives map by marking "used" ones with a corresponding diagnostic
        var directives = (0, ts_1.createCommentDirectivesMap)(sourceFile, commentDirectives);
        var diagnostics = flatDiagnostics.filter(function (diagnostic) { return markPrecedingCommentDirectiveLine(diagnostic, directives) === -1; });
        return { diagnostics: diagnostics, directives: directives };
    }
    function getSuggestionDiagnostics(sourceFile, cancellationToken) {
        return runWithCancellationToken(function () {
            return getTypeChecker().getSuggestionDiagnostics(sourceFile, cancellationToken);
        });
    }
    /**
     * @returns The line index marked as preceding the diagnostic, or -1 if none was.
     */
    function markPrecedingCommentDirectiveLine(diagnostic, directives) {
        var file = diagnostic.file, start = diagnostic.start;
        if (!file) {
            return -1;
        }
        // Start out with the line just before the text
        var lineStarts = (0, ts_1.getLineStarts)(file);
        var line = (0, ts_1.computeLineAndCharacterOfPosition)(lineStarts, start).line - 1; // TODO: GH#18217
        while (line >= 0) {
            // As soon as that line is known to have a comment directive, use that
            if (directives.markUsed(line)) {
                return line;
            }
            // Stop searching if the line is not empty and not a comment
            var lineText = file.text.slice(lineStarts[line], lineStarts[line + 1]).trim();
            if (lineText !== "" && !/^(\s*)\/\/(.*)$/.test(lineText)) {
                return -1;
            }
            line--;
        }
        return -1;
    }
    function getJSSyntacticDiagnosticsForFile(sourceFile) {
        return runWithCancellationToken(function () {
            var diagnostics = [];
            walk(sourceFile, sourceFile);
            (0, ts_1.forEachChildRecursively)(sourceFile, walk, walkArray);
            return diagnostics;
            function walk(node, parent) {
                // Return directly from the case if the given node doesnt want to visit each child
                // Otherwise break to visit each child
                switch (parent.kind) {
                    case 168 /* SyntaxKind.Parameter */:
                    case 171 /* SyntaxKind.PropertyDeclaration */:
                    case 173 /* SyntaxKind.MethodDeclaration */:
                        if (parent.questionToken === node) {
                            diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.The_0_modifier_can_only_be_used_in_TypeScript_files, "?"));
                            return "skip";
                        }
                    // falls through
                    case 172 /* SyntaxKind.MethodSignature */:
                    case 175 /* SyntaxKind.Constructor */:
                    case 176 /* SyntaxKind.GetAccessor */:
                    case 177 /* SyntaxKind.SetAccessor */:
                    case 217 /* SyntaxKind.FunctionExpression */:
                    case 261 /* SyntaxKind.FunctionDeclaration */:
                    case 218 /* SyntaxKind.ArrowFunction */:
                    case 259 /* SyntaxKind.VariableDeclaration */:
                        // type annotation
                        if (parent.type === node) {
                            diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Type_annotations_can_only_be_used_in_TypeScript_files));
                            return "skip";
                        }
                }
                switch (node.kind) {
                    case 272 /* SyntaxKind.ImportClause */:
                        if (node.isTypeOnly) {
                            diagnostics.push(createDiagnosticForNode(parent, ts_1.Diagnostics._0_declarations_can_only_be_used_in_TypeScript_files, "import type"));
                            return "skip";
                        }
                        break;
                    case 277 /* SyntaxKind.ExportDeclaration */:
                        if (node.isTypeOnly) {
                            diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics._0_declarations_can_only_be_used_in_TypeScript_files, "export type"));
                            return "skip";
                        }
                        break;
                    case 275 /* SyntaxKind.ImportSpecifier */:
                    case 280 /* SyntaxKind.ExportSpecifier */:
                        if (node.isTypeOnly) {
                            diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics._0_declarations_can_only_be_used_in_TypeScript_files, (0, ts_1.isImportSpecifier)(node) ? "import...type" : "export...type"));
                            return "skip";
                        }
                        break;
                    case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                        diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.import_can_only_be_used_in_TypeScript_files));
                        return "skip";
                    case 276 /* SyntaxKind.ExportAssignment */:
                        if (node.isExportEquals) {
                            diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.export_can_only_be_used_in_TypeScript_files));
                            return "skip";
                        }
                        break;
                    case 297 /* SyntaxKind.HeritageClause */:
                        var heritageClause = node;
                        if (heritageClause.token === 119 /* SyntaxKind.ImplementsKeyword */) {
                            diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.implements_clauses_can_only_be_used_in_TypeScript_files));
                            return "skip";
                        }
                        break;
                    case 263 /* SyntaxKind.InterfaceDeclaration */:
                        var interfaceKeyword = (0, ts_1.tokenToString)(120 /* SyntaxKind.InterfaceKeyword */);
                        ts_1.Debug.assertIsDefined(interfaceKeyword);
                        diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics._0_declarations_can_only_be_used_in_TypeScript_files, interfaceKeyword));
                        return "skip";
                    case 266 /* SyntaxKind.ModuleDeclaration */:
                        var moduleKeyword = node.flags & 16 /* NodeFlags.Namespace */ ? (0, ts_1.tokenToString)(145 /* SyntaxKind.NamespaceKeyword */) : (0, ts_1.tokenToString)(144 /* SyntaxKind.ModuleKeyword */);
                        ts_1.Debug.assertIsDefined(moduleKeyword);
                        diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics._0_declarations_can_only_be_used_in_TypeScript_files, moduleKeyword));
                        return "skip";
                    case 264 /* SyntaxKind.TypeAliasDeclaration */:
                        diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Type_aliases_can_only_be_used_in_TypeScript_files));
                        return "skip";
                    case 265 /* SyntaxKind.EnumDeclaration */:
                        var enumKeyword = ts_1.Debug.checkDefined((0, ts_1.tokenToString)(94 /* SyntaxKind.EnumKeyword */));
                        diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics._0_declarations_can_only_be_used_in_TypeScript_files, enumKeyword));
                        return "skip";
                    case 234 /* SyntaxKind.NonNullExpression */:
                        diagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Non_null_assertions_can_only_be_used_in_TypeScript_files));
                        return "skip";
                    case 233 /* SyntaxKind.AsExpression */:
                        diagnostics.push(createDiagnosticForNode(node.type, ts_1.Diagnostics.Type_assertion_expressions_can_only_be_used_in_TypeScript_files));
                        return "skip";
                    case 237 /* SyntaxKind.SatisfiesExpression */:
                        diagnostics.push(createDiagnosticForNode(node.type, ts_1.Diagnostics.Type_satisfaction_expressions_can_only_be_used_in_TypeScript_files));
                        return "skip";
                    case 215 /* SyntaxKind.TypeAssertionExpression */:
                        ts_1.Debug.fail(); // Won't parse these in a JS file anyway, as they are interpreted as JSX.
                }
            }
            function walkArray(nodes, parent) {
                if ((0, ts_1.canHaveIllegalDecorators)(parent)) {
                    var decorator = (0, ts_1.find)(parent.modifiers, ts_1.isDecorator);
                    if (decorator) {
                        // report illegal decorator
                        diagnostics.push(createDiagnosticForNode(decorator, ts_1.Diagnostics.Decorators_are_not_valid_here));
                    }
                }
                else if ((0, ts_1.canHaveDecorators)(parent) && parent.modifiers) {
                    var decoratorIndex = (0, ts_1.findIndex)(parent.modifiers, ts_1.isDecorator);
                    if (decoratorIndex >= 0) {
                        if ((0, ts_1.isParameter)(parent) && !options.experimentalDecorators) {
                            // report illegall decorator on parameter
                            diagnostics.push(createDiagnosticForNode(parent.modifiers[decoratorIndex], ts_1.Diagnostics.Decorators_are_not_valid_here));
                        }
                        else if ((0, ts_1.isClassDeclaration)(parent)) {
                            var exportIndex = (0, ts_1.findIndex)(parent.modifiers, ts_1.isExportModifier);
                            if (exportIndex >= 0) {
                                var defaultIndex = (0, ts_1.findIndex)(parent.modifiers, ts_1.isDefaultModifier);
                                if (decoratorIndex > exportIndex && defaultIndex >= 0 && decoratorIndex < defaultIndex) {
                                    // report illegal decorator between `export` and `default`
                                    diagnostics.push(createDiagnosticForNode(parent.modifiers[decoratorIndex], ts_1.Diagnostics.Decorators_are_not_valid_here));
                                }
                                else if (exportIndex >= 0 && decoratorIndex < exportIndex) {
                                    var trailingDecoratorIndex = (0, ts_1.findIndex)(parent.modifiers, ts_1.isDecorator, exportIndex);
                                    if (trailingDecoratorIndex >= 0) {
                                        diagnostics.push((0, ts_1.addRelatedInfo)(createDiagnosticForNode(parent.modifiers[trailingDecoratorIndex], ts_1.Diagnostics.Decorators_may_not_appear_after_export_or_export_default_if_they_also_appear_before_export), createDiagnosticForNode(parent.modifiers[decoratorIndex], ts_1.Diagnostics.Decorator_used_before_export_here)));
                                    }
                                }
                            }
                        }
                    }
                }
                switch (parent.kind) {
                    case 262 /* SyntaxKind.ClassDeclaration */:
                    case 230 /* SyntaxKind.ClassExpression */:
                    case 173 /* SyntaxKind.MethodDeclaration */:
                    case 175 /* SyntaxKind.Constructor */:
                    case 176 /* SyntaxKind.GetAccessor */:
                    case 177 /* SyntaxKind.SetAccessor */:
                    case 217 /* SyntaxKind.FunctionExpression */:
                    case 261 /* SyntaxKind.FunctionDeclaration */:
                    case 218 /* SyntaxKind.ArrowFunction */:
                        // Check type parameters
                        if (nodes === parent.typeParameters) {
                            diagnostics.push(createDiagnosticForNodeArray(nodes, ts_1.Diagnostics.Type_parameter_declarations_can_only_be_used_in_TypeScript_files));
                            return "skip";
                        }
                    // falls through
                    case 242 /* SyntaxKind.VariableStatement */:
                        // Check modifiers
                        if (nodes === parent.modifiers) {
                            checkModifiers(parent.modifiers, parent.kind === 242 /* SyntaxKind.VariableStatement */);
                            return "skip";
                        }
                        break;
                    case 171 /* SyntaxKind.PropertyDeclaration */:
                        // Check modifiers of property declaration
                        if (nodes === parent.modifiers) {
                            for (var _i = 0, _a = nodes; _i < _a.length; _i++) {
                                var modifier = _a[_i];
                                if ((0, ts_1.isModifier)(modifier)
                                    && modifier.kind !== 126 /* SyntaxKind.StaticKeyword */
                                    && modifier.kind !== 129 /* SyntaxKind.AccessorKeyword */) {
                                    diagnostics.push(createDiagnosticForNode(modifier, ts_1.Diagnostics.The_0_modifier_can_only_be_used_in_TypeScript_files, (0, ts_1.tokenToString)(modifier.kind)));
                                }
                            }
                            return "skip";
                        }
                        break;
                    case 168 /* SyntaxKind.Parameter */:
                        // Check modifiers of parameter declaration
                        if (nodes === parent.modifiers && (0, ts_1.some)(nodes, ts_1.isModifier)) {
                            diagnostics.push(createDiagnosticForNodeArray(nodes, ts_1.Diagnostics.Parameter_modifiers_can_only_be_used_in_TypeScript_files));
                            return "skip";
                        }
                        break;
                    case 212 /* SyntaxKind.CallExpression */:
                    case 213 /* SyntaxKind.NewExpression */:
                    case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                    case 284 /* SyntaxKind.JsxSelfClosingElement */:
                    case 285 /* SyntaxKind.JsxOpeningElement */:
                    case 214 /* SyntaxKind.TaggedTemplateExpression */:
                        // Check type arguments
                        if (nodes === parent.typeArguments) {
                            diagnostics.push(createDiagnosticForNodeArray(nodes, ts_1.Diagnostics.Type_arguments_can_only_be_used_in_TypeScript_files));
                            return "skip";
                        }
                        break;
                }
            }
            function checkModifiers(modifiers, isConstValid) {
                for (var _i = 0, modifiers_1 = modifiers; _i < modifiers_1.length; _i++) {
                    var modifier = modifiers_1[_i];
                    switch (modifier.kind) {
                        case 87 /* SyntaxKind.ConstKeyword */:
                            if (isConstValid) {
                                continue;
                            }
                        // to report error,
                        // falls through
                        case 125 /* SyntaxKind.PublicKeyword */:
                        case 123 /* SyntaxKind.PrivateKeyword */:
                        case 124 /* SyntaxKind.ProtectedKeyword */:
                        case 148 /* SyntaxKind.ReadonlyKeyword */:
                        case 138 /* SyntaxKind.DeclareKeyword */:
                        case 128 /* SyntaxKind.AbstractKeyword */:
                        case 163 /* SyntaxKind.OverrideKeyword */:
                        case 103 /* SyntaxKind.InKeyword */:
                        case 147 /* SyntaxKind.OutKeyword */:
                            diagnostics.push(createDiagnosticForNode(modifier, ts_1.Diagnostics.The_0_modifier_can_only_be_used_in_TypeScript_files, (0, ts_1.tokenToString)(modifier.kind)));
                            break;
                        // These are all legal modifiers.
                        case 126 /* SyntaxKind.StaticKeyword */:
                        case 95 /* SyntaxKind.ExportKeyword */:
                        case 90 /* SyntaxKind.DefaultKeyword */:
                        case 129 /* SyntaxKind.AccessorKeyword */:
                    }
                }
            }
            function createDiagnosticForNodeArray(nodes, message) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                var start = nodes.pos;
                return ts_1.createFileDiagnostic.apply(void 0, __spreadArray([sourceFile, start, nodes.end - start, message], args, false));
            }
            // Since these are syntactic diagnostics, parent might not have been set
            // this means the sourceFile cannot be infered from the node
            function createDiagnosticForNode(node, message) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                return ts_1.createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([sourceFile, node, message], args, false));
            }
        });
    }
    function getDeclarationDiagnosticsWorker(sourceFile, cancellationToken) {
        return getAndCacheDiagnostics(sourceFile, cancellationToken, cachedDeclarationDiagnosticsForFile, getDeclarationDiagnosticsForFileNoCache);
    }
    function getDeclarationDiagnosticsForFileNoCache(sourceFile, cancellationToken) {
        return runWithCancellationToken(function () {
            var resolver = getTypeChecker().getEmitResolver(sourceFile, cancellationToken);
            // Don't actually write any files since we're just getting diagnostics.
            return (0, ts_1.getDeclarationDiagnostics)(getEmitHost(ts_1.noop), resolver, sourceFile) || ts_1.emptyArray;
        });
    }
    function getAndCacheDiagnostics(sourceFile, cancellationToken, cache, getDiagnostics) {
        var _a;
        var cachedResult = sourceFile
            ? (_a = cache.perFile) === null || _a === void 0 ? void 0 : _a.get(sourceFile.path)
            : cache.allDiagnostics;
        if (cachedResult) {
            return cachedResult;
        }
        var result = getDiagnostics(sourceFile, cancellationToken);
        if (sourceFile) {
            (cache.perFile || (cache.perFile = new Map())).set(sourceFile.path, result);
        }
        else {
            cache.allDiagnostics = result;
        }
        return result;
    }
    function getDeclarationDiagnosticsForFile(sourceFile, cancellationToken) {
        return sourceFile.isDeclarationFile ? [] : getDeclarationDiagnosticsWorker(sourceFile, cancellationToken);
    }
    function getOptionsDiagnostics() {
        return (0, ts_1.sortAndDeduplicateDiagnostics)((0, ts_1.concatenate)(programDiagnostics.getGlobalDiagnostics(), getOptionsDiagnosticsOfConfigFile()));
    }
    function getOptionsDiagnosticsOfConfigFile() {
        if (!options.configFile)
            return ts_1.emptyArray;
        var diagnostics = programDiagnostics.getDiagnostics(options.configFile.fileName);
        forEachResolvedProjectReference(function (resolvedRef) {
            diagnostics = (0, ts_1.concatenate)(diagnostics, programDiagnostics.getDiagnostics(resolvedRef.sourceFile.fileName));
        });
        return diagnostics;
    }
    function getGlobalDiagnostics() {
        return rootNames.length ? (0, ts_1.sortAndDeduplicateDiagnostics)(getTypeChecker().getGlobalDiagnostics().slice()) : ts_1.emptyArray;
    }
    function getConfigFileParsingDiagnostics() {
        return configFileParsingDiagnostics || ts_1.emptyArray;
    }
    function processRootFile(fileName, isDefaultLib, ignoreNoDefaultLib, reason) {
        processSourceFile((0, ts_1.normalizePath)(fileName), isDefaultLib, ignoreNoDefaultLib, /*packageId*/ undefined, reason);
    }
    function fileReferenceIsEqualTo(a, b) {
        return a.fileName === b.fileName;
    }
    function moduleNameIsEqualTo(a, b) {
        return a.kind === 80 /* SyntaxKind.Identifier */
            ? b.kind === 80 /* SyntaxKind.Identifier */ && a.escapedText === b.escapedText
            : b.kind === 11 /* SyntaxKind.StringLiteral */ && a.text === b.text;
    }
    function createSyntheticImport(text, file) {
        var externalHelpersModuleReference = ts_1.factory.createStringLiteral(text);
        var importDecl = ts_1.factory.createImportDeclaration(/*modifiers*/ undefined, /*importClause*/ undefined, externalHelpersModuleReference, /*assertClause*/ undefined);
        (0, ts_1.addInternalEmitFlags)(importDecl, 2 /* InternalEmitFlags.NeverApplyImportHelper */);
        (0, ts_1.setParent)(externalHelpersModuleReference, importDecl);
        (0, ts_1.setParent)(importDecl, file);
        // explicitly unset the synthesized flag on these declarations so the checker API will answer questions about them
        // (which is required to build the dependency graph for incremental emit)
        externalHelpersModuleReference.flags &= ~8 /* NodeFlags.Synthesized */;
        importDecl.flags &= ~8 /* NodeFlags.Synthesized */;
        return externalHelpersModuleReference;
    }
    function collectExternalModuleReferences(file) {
        if (file.imports) {
            return;
        }
        var isJavaScriptFile = (0, ts_1.isSourceFileJS)(file);
        var isExternalModuleFile = (0, ts_1.isExternalModule)(file);
        // file.imports may not be undefined if there exists dynamic import
        var imports;
        var moduleAugmentations;
        var ambientModules;
        // If we are importing helpers, we need to add a synthetic reference to resolve the
        // helpers library.
        if (((0, ts_1.getIsolatedModules)(options) || isExternalModuleFile)
            && !file.isDeclarationFile) {
            if (options.importHelpers) {
                // synthesize 'import "tslib"' declaration
                imports = [createSyntheticImport(ts_1.externalHelpersModuleNameText, file)];
            }
            var jsxImport = (0, ts_1.getJSXRuntimeImport)((0, ts_1.getJSXImplicitImportBase)(options, file), options);
            if (jsxImport) {
                // synthesize `import "base/jsx-runtime"` declaration
                (imports || (imports = [])).push(createSyntheticImport(jsxImport, file));
            }
        }
        for (var _i = 0, _a = file.statements; _i < _a.length; _i++) {
            var node = _a[_i];
            collectModuleReferences(node, /*inAmbientModule*/ false);
        }
        var shouldProcessRequires = isJavaScriptFile && (0, ts_1.shouldResolveJsRequire)(options);
        if ((file.flags & 2097152 /* NodeFlags.PossiblyContainsDynamicImport */) || shouldProcessRequires) {
            collectDynamicImportOrRequireCalls(file);
        }
        file.imports = imports || ts_1.emptyArray;
        file.moduleAugmentations = moduleAugmentations || ts_1.emptyArray;
        file.ambientModuleNames = ambientModules || ts_1.emptyArray;
        return;
        function collectModuleReferences(node, inAmbientModule) {
            if ((0, ts_1.isAnyImportOrReExport)(node)) {
                var moduleNameExpr = (0, ts_1.getExternalModuleName)(node);
                // TypeScript 1.0 spec (April 2014): 12.1.6
                // An ExternalImportDeclaration in an AmbientExternalModuleDeclaration may reference other external modules
                // only through top - level external module names. Relative external module names are not permitted.
                if (moduleNameExpr && (0, ts_1.isStringLiteral)(moduleNameExpr) && moduleNameExpr.text && (!inAmbientModule || !(0, ts_1.isExternalModuleNameRelative)(moduleNameExpr.text))) {
                    (0, ts_1.setParentRecursive)(node, /*incremental*/ false); // we need parent data on imports before the program is fully bound, so we ensure it's set here
                    imports = (0, ts_1.append)(imports, moduleNameExpr);
                    if (!usesUriStyleNodeCoreModules && currentNodeModulesDepth === 0 && !file.isDeclarationFile) {
                        usesUriStyleNodeCoreModules = (0, ts_1.startsWith)(moduleNameExpr.text, "node:");
                    }
                }
            }
            else if ((0, ts_1.isModuleDeclaration)(node)) {
                if ((0, ts_1.isAmbientModule)(node) && (inAmbientModule || (0, ts_1.hasSyntacticModifier)(node, 2 /* ModifierFlags.Ambient */) || file.isDeclarationFile)) {
                    node.name.parent = node;
                    var nameText = (0, ts_1.getTextOfIdentifierOrLiteral)(node.name);
                    // Ambient module declarations can be interpreted as augmentations for some existing external modules.
                    // This will happen in two cases:
                    // - if current file is external module then module augmentation is a ambient module declaration defined in the top level scope
                    // - if current file is not external module then module augmentation is an ambient module declaration with non-relative module name
                    //   immediately nested in top level ambient module declaration .
                    if (isExternalModuleFile || (inAmbientModule && !(0, ts_1.isExternalModuleNameRelative)(nameText))) {
                        (moduleAugmentations || (moduleAugmentations = [])).push(node.name);
                    }
                    else if (!inAmbientModule) {
                        if (file.isDeclarationFile) {
                            // for global .d.ts files record name of ambient module
                            (ambientModules || (ambientModules = [])).push(nameText);
                        }
                        // An AmbientExternalModuleDeclaration declares an external module.
                        // This type of declaration is permitted only in the global module.
                        // The StringLiteral must specify a top - level external module name.
                        // Relative external module names are not permitted
                        // NOTE: body of ambient module is always a module block, if it exists
                        var body = node.body;
                        if (body) {
                            for (var _i = 0, _a = body.statements; _i < _a.length; _i++) {
                                var statement = _a[_i];
                                collectModuleReferences(statement, /*inAmbientModule*/ true);
                            }
                        }
                    }
                }
            }
        }
        function collectDynamicImportOrRequireCalls(file) {
            var r = /import|require/g;
            while (r.exec(file.text) !== null) { // eslint-disable-line no-null/no-null
                var node = getNodeAtPosition(file, r.lastIndex);
                if (shouldProcessRequires && (0, ts_1.isRequireCall)(node, /*requireStringLiteralLikeArgument*/ true)) {
                    (0, ts_1.setParentRecursive)(node, /*incremental*/ false); // we need parent data on imports before the program is fully bound, so we ensure it's set here
                    imports = (0, ts_1.append)(imports, node.arguments[0]);
                }
                // we have to check the argument list has length of at least 1. We will still have to process these even though we have parsing error.
                else if ((0, ts_1.isImportCall)(node) && node.arguments.length >= 1 && (0, ts_1.isStringLiteralLike)(node.arguments[0])) {
                    (0, ts_1.setParentRecursive)(node, /*incremental*/ false); // we need parent data on imports before the program is fully bound, so we ensure it's set here
                    imports = (0, ts_1.append)(imports, node.arguments[0]);
                }
                else if ((0, ts_1.isLiteralImportTypeNode)(node)) {
                    (0, ts_1.setParentRecursive)(node, /*incremental*/ false); // we need parent data on imports before the program is fully bound, so we ensure it's set here
                    imports = (0, ts_1.append)(imports, node.argument.literal);
                }
            }
        }
        /** Returns a token if position is in [start-of-leading-trivia, end), includes JSDoc only in JS files */
        function getNodeAtPosition(sourceFile, position) {
            var current = sourceFile;
            var getContainingChild = function (child) {
                if (child.pos <= position && (position < child.end || (position === child.end && (child.kind === 1 /* SyntaxKind.EndOfFileToken */)))) {
                    return child;
                }
            };
            while (true) {
                var child = isJavaScriptFile && (0, ts_1.hasJSDocNodes)(current) && (0, ts_1.forEach)(current.jsDoc, getContainingChild) || (0, ts_1.forEachChild)(current, getContainingChild);
                if (!child) {
                    return current;
                }
                current = child;
            }
        }
    }
    function getLibFileFromReference(ref) {
        var _a;
        var libFileName = getLibFileNameFromLibReference(ref).libFileName;
        var actualFileName = libFileName && ((_a = resolvedLibReferences === null || resolvedLibReferences === void 0 ? void 0 : resolvedLibReferences.get(libFileName)) === null || _a === void 0 ? void 0 : _a.actual);
        return actualFileName !== undefined ? getSourceFile(actualFileName) : undefined;
    }
    /** This should have similar behavior to 'processSourceFile' without diagnostics or mutation. */
    function getSourceFileFromReference(referencingFile, ref) {
        return getSourceFileFromReferenceWorker(resolveTripleslashReference(ref.fileName, referencingFile.fileName), getSourceFile);
    }
    function getSourceFileFromReferenceWorker(fileName, getSourceFile, fail, reason) {
        if ((0, ts_1.hasExtension)(fileName)) {
            var canonicalFileName_1 = host.getCanonicalFileName(fileName);
            if (!options.allowNonTsExtensions && !(0, ts_1.forEach)((0, ts_1.flatten)(supportedExtensionsWithJsonIfResolveJsonModule), function (extension) { return (0, ts_1.fileExtensionIs)(canonicalFileName_1, extension); })) {
                if (fail) {
                    if ((0, ts_1.hasJSFileExtension)(canonicalFileName_1)) {
                        fail(ts_1.Diagnostics.File_0_is_a_JavaScript_file_Did_you_mean_to_enable_the_allowJs_option, fileName);
                    }
                    else {
                        fail(ts_1.Diagnostics.File_0_has_an_unsupported_extension_The_only_supported_extensions_are_1, fileName, "'" + (0, ts_1.flatten)(supportedExtensions).join("', '") + "'");
                    }
                }
                return undefined;
            }
            var sourceFile = getSourceFile(fileName);
            if (fail) {
                if (!sourceFile) {
                    var redirect = getProjectReferenceRedirect(fileName);
                    if (redirect) {
                        fail(ts_1.Diagnostics.Output_file_0_has_not_been_built_from_source_file_1, redirect, fileName);
                    }
                    else {
                        fail(ts_1.Diagnostics.File_0_not_found, fileName);
                    }
                }
                else if (isReferencedFile(reason) && canonicalFileName_1 === host.getCanonicalFileName(getSourceFileByPath(reason.file).fileName)) {
                    fail(ts_1.Diagnostics.A_file_cannot_have_a_reference_to_itself);
                }
            }
            return sourceFile;
        }
        else {
            var sourceFileNoExtension = options.allowNonTsExtensions && getSourceFile(fileName);
            if (sourceFileNoExtension)
                return sourceFileNoExtension;
            if (fail && options.allowNonTsExtensions) {
                fail(ts_1.Diagnostics.File_0_not_found, fileName);
                return undefined;
            }
            // Only try adding extensions from the first supported group (which should be .ts/.tsx/.d.ts)
            var sourceFileWithAddedExtension = (0, ts_1.forEach)(supportedExtensions[0], function (extension) { return getSourceFile(fileName + extension); });
            if (fail && !sourceFileWithAddedExtension)
                fail(ts_1.Diagnostics.Could_not_resolve_the_path_0_with_the_extensions_Colon_1, fileName, "'" + (0, ts_1.flatten)(supportedExtensions).join("', '") + "'");
            return sourceFileWithAddedExtension;
        }
    }
    /** This has side effects through `findSourceFile`. */
    function processSourceFile(fileName, isDefaultLib, ignoreNoDefaultLib, packageId, reason) {
        getSourceFileFromReferenceWorker(fileName, function (fileName) { return findSourceFile(fileName, isDefaultLib, ignoreNoDefaultLib, reason, packageId); }, // TODO: GH#18217
        function (diagnostic) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return addFilePreprocessingFileExplainingDiagnostic(/*file*/ undefined, reason, diagnostic, args);
        }, reason);
    }
    function processProjectReferenceFile(fileName, reason) {
        return processSourceFile(fileName, /*isDefaultLib*/ false, /*ignoreNoDefaultLib*/ false, /*packageId*/ undefined, reason);
    }
    function reportFileNamesDifferOnlyInCasingError(fileName, existingFile, reason) {
        var hasExistingReasonToReportErrorOn = !isReferencedFile(reason) && (0, ts_1.some)(fileReasons.get(existingFile.path), isReferencedFile);
        if (hasExistingReasonToReportErrorOn) {
            addFilePreprocessingFileExplainingDiagnostic(existingFile, reason, ts_1.Diagnostics.Already_included_file_name_0_differs_from_file_name_1_only_in_casing, [existingFile.fileName, fileName]);
        }
        else {
            addFilePreprocessingFileExplainingDiagnostic(existingFile, reason, ts_1.Diagnostics.File_name_0_differs_from_already_included_file_name_1_only_in_casing, [fileName, existingFile.fileName]);
        }
    }
    function createRedirectedSourceFile(redirectTarget, unredirected, fileName, path, resolvedPath, originalFileName, sourceFileOptions) {
        var _a;
        var redirect = ts_1.parseNodeFactory.createRedirectedSourceFile({ redirectTarget: redirectTarget, unredirected: unredirected });
        redirect.fileName = fileName;
        redirect.path = path;
        redirect.resolvedPath = resolvedPath;
        redirect.originalFileName = originalFileName;
        redirect.packageJsonLocations = ((_a = sourceFileOptions.packageJsonLocations) === null || _a === void 0 ? void 0 : _a.length) ? sourceFileOptions.packageJsonLocations : undefined;
        redirect.packageJsonScope = sourceFileOptions.packageJsonScope;
        sourceFilesFoundSearchingNodeModules.set(path, currentNodeModulesDepth > 0);
        return redirect;
    }
    // Get source file from normalized fileName
    function findSourceFile(fileName, isDefaultLib, ignoreNoDefaultLib, reason, packageId) {
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "findSourceFile", {
            fileName: fileName,
            isDefaultLib: isDefaultLib || undefined,
            fileIncludeKind: ts_1.FileIncludeKind[reason.kind],
        });
        var result = findSourceFileWorker(fileName, isDefaultLib, ignoreNoDefaultLib, reason, packageId);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        return result;
    }
    function getCreateSourceFileOptions(fileName, moduleResolutionCache, host, options) {
        // It's a _little odd_ that we can't set `impliedNodeFormat` until the program step - but it's the first and only time we have a resolution cache
        // and a freshly made source file node on hand at the same time, and we need both to set the field. Persisting the resolution cache all the way
        // to the check and emit steps would be bad - so we much prefer detecting and storing the format information on the source file node upfront.
        var result = getImpliedNodeFormatForFileWorker((0, ts_1.getNormalizedAbsolutePath)(fileName, currentDirectory), moduleResolutionCache === null || moduleResolutionCache === void 0 ? void 0 : moduleResolutionCache.getPackageJsonInfoCache(), host, options);
        var languageVersion = (0, ts_1.getEmitScriptTarget)(options);
        var setExternalModuleIndicator = (0, ts_1.getSetExternalModuleIndicator)(options);
        return typeof result === "object" ? __assign(__assign({}, result), { languageVersion: languageVersion, setExternalModuleIndicator: setExternalModuleIndicator }) :
            { languageVersion: languageVersion, impliedNodeFormat: result, setExternalModuleIndicator: setExternalModuleIndicator };
    }
    function findSourceFileWorker(fileName, isDefaultLib, ignoreNoDefaultLib, reason, packageId) {
        var _a;
        var path = toPath(fileName);
        if (useSourceOfProjectReferenceRedirect) {
            var source = getSourceOfProjectReferenceRedirect(path);
            // If preserveSymlinks is true, module resolution wont jump the symlink
            // but the resolved real path may be the .d.ts from project reference
            // Note:: Currently we try the real path only if the
            // file is from node_modules to avoid having to run real path on all file paths
            if (!source &&
                host.realpath &&
                options.preserveSymlinks &&
                (0, ts_1.isDeclarationFileName)(fileName) &&
                (0, ts_1.stringContains)(fileName, ts_1.nodeModulesPathPart)) {
                var realPath = toPath(host.realpath(fileName));
                if (realPath !== path)
                    source = getSourceOfProjectReferenceRedirect(realPath);
            }
            if (source) {
                var file_1 = (0, ts_1.isString)(source) ?
                    findSourceFile(source, isDefaultLib, ignoreNoDefaultLib, reason, packageId) :
                    undefined;
                if (file_1)
                    addFileToFilesByName(file_1, path, /*redirectedPath*/ undefined);
                return file_1;
            }
        }
        var originalFileName = fileName;
        if (filesByName.has(path)) {
            var file_2 = filesByName.get(path);
            addFileIncludeReason(file_2 || undefined, reason);
            // try to check if we've already seen this file but with a different casing in path
            // NOTE: this only makes sense for case-insensitive file systems, and only on files which are not redirected
            if (file_2 && !(options.forceConsistentCasingInFileNames === false)) {
                var checkedName = file_2.fileName;
                var isRedirect = toPath(checkedName) !== toPath(fileName);
                if (isRedirect) {
                    fileName = getProjectReferenceRedirect(fileName) || fileName;
                }
                // Check if it differs only in drive letters its ok to ignore that error:
                var checkedAbsolutePath = (0, ts_1.getNormalizedAbsolutePathWithoutRoot)(checkedName, currentDirectory);
                var inputAbsolutePath = (0, ts_1.getNormalizedAbsolutePathWithoutRoot)(fileName, currentDirectory);
                if (checkedAbsolutePath !== inputAbsolutePath) {
                    reportFileNamesDifferOnlyInCasingError(fileName, file_2, reason);
                }
            }
            // If the file was previously found via a node_modules search, but is now being processed as a root file,
            // then everything it sucks in may also be marked incorrectly, and needs to be checked again.
            if (file_2 && sourceFilesFoundSearchingNodeModules.get(file_2.path) && currentNodeModulesDepth === 0) {
                sourceFilesFoundSearchingNodeModules.set(file_2.path, false);
                if (!options.noResolve) {
                    processReferencedFiles(file_2, isDefaultLib);
                    processTypeReferenceDirectives(file_2);
                }
                if (!options.noLib) {
                    processLibReferenceDirectives(file_2);
                }
                modulesWithElidedImports.set(file_2.path, false);
                processImportedModules(file_2);
            }
            // See if we need to reprocess the imports due to prior skipped imports
            else if (file_2 && modulesWithElidedImports.get(file_2.path)) {
                if (currentNodeModulesDepth < maxNodeModuleJsDepth) {
                    modulesWithElidedImports.set(file_2.path, false);
                    processImportedModules(file_2);
                }
            }
            return file_2 || undefined;
        }
        var redirectedPath;
        if (isReferencedFile(reason) && !useSourceOfProjectReferenceRedirect) {
            var redirectProject = getProjectReferenceRedirectProject(fileName);
            if (redirectProject) {
                if ((0, ts_1.outFile)(redirectProject.commandLine.options)) {
                    // Shouldnt create many to 1 mapping file in --out scenario
                    return undefined;
                }
                var redirect = getProjectReferenceOutputName(redirectProject, fileName);
                fileName = redirect;
                // Once we start redirecting to a file, we can potentially come back to it
                // via a back-reference from another file in the .d.ts folder. If that happens we'll
                // end up trying to add it to the program *again* because we were tracking it via its
                // original (un-redirected) name. So we have to map both the original path and the redirected path
                // to the source file we're about to find/create
                redirectedPath = toPath(redirect);
            }
        }
        // We haven't looked for this file, do so now and cache result
        var sourceFileOptions = getCreateSourceFileOptions(fileName, moduleResolutionCache, host, options);
        var file = host.getSourceFile(fileName, sourceFileOptions, function (hostErrorMessage) { return addFilePreprocessingFileExplainingDiagnostic(/*file*/ undefined, reason, ts_1.Diagnostics.Cannot_read_file_0_Colon_1, [fileName, hostErrorMessage]); }, shouldCreateNewSourceFile);
        if (packageId) {
            var packageIdKey = (0, ts_1.packageIdToString)(packageId);
            var fileFromPackageId = packageIdToSourceFile.get(packageIdKey);
            if (fileFromPackageId) {
                // Some other SourceFile already exists with this package name and version.
                // Instead of creating a duplicate, just redirect to the existing one.
                var dupFile = createRedirectedSourceFile(fileFromPackageId, file, fileName, path, toPath(fileName), originalFileName, sourceFileOptions);
                redirectTargetsMap.add(fileFromPackageId.path, fileName);
                addFileToFilesByName(dupFile, path, redirectedPath);
                addFileIncludeReason(dupFile, reason);
                sourceFileToPackageName.set(path, (0, ts_1.packageIdToPackageName)(packageId));
                processingOtherFiles.push(dupFile);
                return dupFile;
            }
            else if (file) {
                // This is the first source file to have this packageId.
                packageIdToSourceFile.set(packageIdKey, file);
                sourceFileToPackageName.set(path, (0, ts_1.packageIdToPackageName)(packageId));
            }
        }
        addFileToFilesByName(file, path, redirectedPath);
        if (file) {
            sourceFilesFoundSearchingNodeModules.set(path, currentNodeModulesDepth > 0);
            file.fileName = fileName; // Ensure that source file has same name as what we were looking for
            file.path = path;
            file.resolvedPath = toPath(fileName);
            file.originalFileName = originalFileName;
            file.packageJsonLocations = ((_a = sourceFileOptions.packageJsonLocations) === null || _a === void 0 ? void 0 : _a.length) ? sourceFileOptions.packageJsonLocations : undefined;
            file.packageJsonScope = sourceFileOptions.packageJsonScope;
            addFileIncludeReason(file, reason);
            if (host.useCaseSensitiveFileNames()) {
                var pathLowerCase = (0, ts_1.toFileNameLowerCase)(path);
                // for case-sensitive file systems check if we've already seen some file with similar filename ignoring case
                var existingFile = filesByNameIgnoreCase.get(pathLowerCase);
                if (existingFile) {
                    reportFileNamesDifferOnlyInCasingError(fileName, existingFile, reason);
                }
                else {
                    filesByNameIgnoreCase.set(pathLowerCase, file);
                }
            }
            skipDefaultLib = skipDefaultLib || (file.hasNoDefaultLib && !ignoreNoDefaultLib);
            if (!options.noResolve) {
                processReferencedFiles(file, isDefaultLib);
                processTypeReferenceDirectives(file);
            }
            if (!options.noLib) {
                processLibReferenceDirectives(file);
            }
            // always process imported modules to record module name resolutions
            processImportedModules(file);
            if (isDefaultLib) {
                processingDefaultLibFiles.push(file);
            }
            else {
                processingOtherFiles.push(file);
            }
        }
        return file;
    }
    function addFileIncludeReason(file, reason) {
        if (file)
            fileReasons.add(file.path, reason);
    }
    function addFileToFilesByName(file, path, redirectedPath) {
        if (redirectedPath) {
            filesByName.set(redirectedPath, file);
            filesByName.set(path, file || false);
        }
        else {
            filesByName.set(path, file);
        }
    }
    function getProjectReferenceRedirect(fileName) {
        var referencedProject = getProjectReferenceRedirectProject(fileName);
        return referencedProject && getProjectReferenceOutputName(referencedProject, fileName);
    }
    function getProjectReferenceRedirectProject(fileName) {
        // Ignore dts or any json files
        if (!resolvedProjectReferences || !resolvedProjectReferences.length || (0, ts_1.isDeclarationFileName)(fileName) || (0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */)) {
            return undefined;
        }
        // If this file is produced by a referenced project, we need to rewrite it to
        // look in the output folder of the referenced project rather than the input
        return getResolvedProjectReferenceToRedirect(fileName);
    }
    function getProjectReferenceOutputName(referencedProject, fileName) {
        var out = (0, ts_1.outFile)(referencedProject.commandLine.options);
        return out ?
            (0, ts_1.changeExtension)(out, ".d.ts" /* Extension.Dts */) :
            (0, ts_1.getOutputDeclarationFileName)(fileName, referencedProject.commandLine, !host.useCaseSensitiveFileNames());
    }
    /**
     * Get the referenced project if the file is input file from that reference project
     */
    function getResolvedProjectReferenceToRedirect(fileName) {
        if (mapFromFileToProjectReferenceRedirects === undefined) {
            mapFromFileToProjectReferenceRedirects = new Map();
            forEachResolvedProjectReference(function (referencedProject) {
                // not input file from the referenced project, ignore
                if (toPath(options.configFilePath) !== referencedProject.sourceFile.path) {
                    referencedProject.commandLine.fileNames.forEach(function (f) {
                        return mapFromFileToProjectReferenceRedirects.set(toPath(f), referencedProject.sourceFile.path);
                    });
                }
            });
        }
        var referencedProjectPath = mapFromFileToProjectReferenceRedirects.get(toPath(fileName));
        return referencedProjectPath && getResolvedProjectReferenceByPath(referencedProjectPath);
    }
    function forEachResolvedProjectReference(cb) {
        return (0, ts_1.forEachResolvedProjectReference)(resolvedProjectReferences, cb);
    }
    function getSourceOfProjectReferenceRedirect(path) {
        if (!(0, ts_1.isDeclarationFileName)(path))
            return undefined;
        if (mapFromToProjectReferenceRedirectSource === undefined) {
            mapFromToProjectReferenceRedirectSource = new Map();
            forEachResolvedProjectReference(function (resolvedRef) {
                var out = (0, ts_1.outFile)(resolvedRef.commandLine.options);
                if (out) {
                    // Dont know which source file it means so return true?
                    var outputDts = (0, ts_1.changeExtension)(out, ".d.ts" /* Extension.Dts */);
                    mapFromToProjectReferenceRedirectSource.set(toPath(outputDts), true);
                }
                else {
                    var getCommonSourceDirectory_2 = (0, ts_1.memoize)(function () { return (0, ts_1.getCommonSourceDirectoryOfConfig)(resolvedRef.commandLine, !host.useCaseSensitiveFileNames()); });
                    (0, ts_1.forEach)(resolvedRef.commandLine.fileNames, function (fileName) {
                        if (!(0, ts_1.isDeclarationFileName)(fileName) && !(0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */)) {
                            var outputDts = (0, ts_1.getOutputDeclarationFileName)(fileName, resolvedRef.commandLine, !host.useCaseSensitiveFileNames(), getCommonSourceDirectory_2);
                            mapFromToProjectReferenceRedirectSource.set(toPath(outputDts), fileName);
                        }
                    });
                }
            });
        }
        return mapFromToProjectReferenceRedirectSource.get(path);
    }
    function isSourceOfProjectReferenceRedirect(fileName) {
        return useSourceOfProjectReferenceRedirect && !!getResolvedProjectReferenceToRedirect(fileName);
    }
    function getResolvedProjectReferenceByPath(projectReferencePath) {
        if (!projectReferenceRedirects) {
            return undefined;
        }
        return projectReferenceRedirects.get(projectReferencePath) || undefined;
    }
    function processReferencedFiles(file, isDefaultLib) {
        (0, ts_1.forEach)(file.referencedFiles, function (ref, index) {
            processSourceFile(resolveTripleslashReference(ref.fileName, file.fileName), isDefaultLib, 
            /*ignoreNoDefaultLib*/ false, 
            /*packageId*/ undefined, { kind: ts_1.FileIncludeKind.ReferenceFile, file: file.path, index: index, });
        });
    }
    function processTypeReferenceDirectives(file) {
        var typeDirectives = file.typeReferenceDirectives;
        if (!typeDirectives.length) {
            file.resolvedTypeReferenceDirectiveNames = undefined;
            return;
        }
        var resolutions = resolveTypeReferenceDirectiveNamesReusingOldState(typeDirectives, file);
        for (var index = 0; index < typeDirectives.length; index++) {
            var ref = file.typeReferenceDirectives[index];
            var resolvedTypeReferenceDirective = resolutions[index];
            // store resolved type directive on the file
            var fileName = (0, ts_1.toFileNameLowerCase)(ref.fileName);
            (0, ts_1.setResolvedTypeReferenceDirective)(file, fileName, resolvedTypeReferenceDirective, getModeForFileReference(ref, file.impliedNodeFormat));
            var mode = ref.resolutionMode || file.impliedNodeFormat;
            if (mode && (0, ts_1.getEmitModuleResolutionKind)(options) !== ts_1.ModuleResolutionKind.Node16 && (0, ts_1.getEmitModuleResolutionKind)(options) !== ts_1.ModuleResolutionKind.NodeNext) {
                (fileProcessingDiagnostics !== null && fileProcessingDiagnostics !== void 0 ? fileProcessingDiagnostics : (fileProcessingDiagnostics = [])).push({
                    kind: 2 /* FilePreprocessingDiagnosticsKind.ResolutionDiagnostics */,
                    diagnostics: [
                        (0, ts_1.createDiagnosticForRange)(file, ref, ts_1.Diagnostics.resolution_mode_assertions_are_only_supported_when_moduleResolution_is_node16_or_nodenext)
                    ]
                });
            }
            processTypeReferenceDirective(fileName, mode, resolvedTypeReferenceDirective, { kind: ts_1.FileIncludeKind.TypeReferenceDirective, file: file.path, index: index, });
        }
    }
    function processTypeReferenceDirective(typeReferenceDirective, mode, resolution, reason) {
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "processTypeReferenceDirective", { directive: typeReferenceDirective, hasResolved: !!resolution.resolvedTypeReferenceDirective, refKind: reason.kind, refPath: isReferencedFile(reason) ? reason.file : undefined });
        processTypeReferenceDirectiveWorker(typeReferenceDirective, mode, resolution, reason);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    }
    function processTypeReferenceDirectiveWorker(typeReferenceDirective, mode, resolution, reason) {
        var _a;
        addResolutionDiagnostics(resolution);
        // If we already found this library as a primary reference - nothing to do
        var previousResolution = (_a = resolvedTypeReferenceDirectives.get(typeReferenceDirective, mode)) === null || _a === void 0 ? void 0 : _a.resolvedTypeReferenceDirective;
        if (previousResolution && previousResolution.primary) {
            return;
        }
        var saveResolution = true;
        var resolvedTypeReferenceDirective = resolution.resolvedTypeReferenceDirective;
        if (resolvedTypeReferenceDirective) {
            if (resolvedTypeReferenceDirective.isExternalLibraryImport)
                currentNodeModulesDepth++;
            if (resolvedTypeReferenceDirective.primary) {
                // resolved from the primary path
                processSourceFile(resolvedTypeReferenceDirective.resolvedFileName, /*isDefaultLib*/ false, /*ignoreNoDefaultLib*/ false, resolvedTypeReferenceDirective.packageId, reason); // TODO: GH#18217
            }
            else {
                // If we already resolved to this file, it must have been a secondary reference. Check file contents
                // for sameness and possibly issue an error
                if (previousResolution) {
                    // Don't bother reading the file again if it's the same file.
                    if (resolvedTypeReferenceDirective.resolvedFileName !== previousResolution.resolvedFileName) {
                        var otherFileText = host.readFile(resolvedTypeReferenceDirective.resolvedFileName);
                        var existingFile = getSourceFile(previousResolution.resolvedFileName);
                        if (otherFileText !== existingFile.text) {
                            addFilePreprocessingFileExplainingDiagnostic(existingFile, reason, ts_1.Diagnostics.Conflicting_definitions_for_0_found_at_1_and_2_Consider_installing_a_specific_version_of_this_library_to_resolve_the_conflict, [typeReferenceDirective, resolvedTypeReferenceDirective.resolvedFileName, previousResolution.resolvedFileName]);
                        }
                    }
                    // don't overwrite previous resolution result
                    saveResolution = false;
                }
                else {
                    // First resolution of this library
                    processSourceFile(resolvedTypeReferenceDirective.resolvedFileName, /*isDefaultLib*/ false, /*ignoreNoDefaultLib*/ false, resolvedTypeReferenceDirective.packageId, reason);
                }
            }
            if (resolvedTypeReferenceDirective.isExternalLibraryImport)
                currentNodeModulesDepth--;
        }
        else {
            addFilePreprocessingFileExplainingDiagnostic(/*file*/ undefined, reason, ts_1.Diagnostics.Cannot_find_type_definition_file_for_0, [typeReferenceDirective]);
        }
        if (saveResolution) {
            resolvedTypeReferenceDirectives.set(typeReferenceDirective, mode, resolution);
        }
    }
    function pathForLibFile(libFileName) {
        var existing = resolvedLibReferences === null || resolvedLibReferences === void 0 ? void 0 : resolvedLibReferences.get(libFileName);
        if (existing)
            return existing.actual;
        var result = pathForLibFileWorker(libFileName);
        (resolvedLibReferences !== null && resolvedLibReferences !== void 0 ? resolvedLibReferences : (resolvedLibReferences = new Map())).set(libFileName, result);
        return result.actual;
    }
    function pathForLibFileWorker(libFileName) {
        var _a, _b, _c;
        var existing = resolvedLibProcessing === null || resolvedLibProcessing === void 0 ? void 0 : resolvedLibProcessing.get(libFileName);
        if (existing)
            return existing;
        if (structureIsReused !== 0 /* StructureIsReused.Not */ && oldProgram && !hasInvalidatedLibResolutions(libFileName)) {
            var oldResolution = (_a = oldProgram.resolvedLibReferences) === null || _a === void 0 ? void 0 : _a.get(libFileName);
            if (oldResolution) {
                if (oldResolution.resolution && (0, ts_1.isTraceEnabled)(options, host)) {
                    var libraryName_1 = getLibraryNameFromLibFileName(libFileName);
                    var resolveFrom_1 = getInferredLibraryNameResolveFrom(options, currentDirectory, libFileName);
                    (0, ts_1.trace)(host, oldResolution.resolution.resolvedModule ?
                        oldResolution.resolution.resolvedModule.packageId ?
                            ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2_with_Package_ID_3 :
                            ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2 :
                        ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_not_resolved, libraryName_1, (0, ts_1.getNormalizedAbsolutePath)(resolveFrom_1, currentDirectory), (_b = oldResolution.resolution.resolvedModule) === null || _b === void 0 ? void 0 : _b.resolvedFileName, ((_c = oldResolution.resolution.resolvedModule) === null || _c === void 0 ? void 0 : _c.packageId) && (0, ts_1.packageIdToString)(oldResolution.resolution.resolvedModule.packageId));
                }
                (resolvedLibProcessing !== null && resolvedLibProcessing !== void 0 ? resolvedLibProcessing : (resolvedLibProcessing = new Map())).set(libFileName, oldResolution);
                return oldResolution;
            }
        }
        var libraryName = getLibraryNameFromLibFileName(libFileName);
        var resolveFrom = getInferredLibraryNameResolveFrom(options, currentDirectory, libFileName);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("program" /* tracing.Phase.Program */, "resolveLibrary", { resolveFrom: resolveFrom });
        performance.mark("beforeResolveLibrary");
        var resolution = actualResolveLibrary(libraryName, resolveFrom, options, libFileName);
        performance.mark("afterResolveLibrary");
        performance.measure("ResolveLibrary", "beforeResolveLibrary", "afterResolveLibrary");
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        var result = {
            resolution: resolution,
            actual: resolution.resolvedModule ?
                resolution.resolvedModule.resolvedFileName :
                (0, ts_1.combinePaths)(defaultLibraryPath, libFileName)
        };
        (resolvedLibProcessing !== null && resolvedLibProcessing !== void 0 ? resolvedLibProcessing : (resolvedLibProcessing = new Map())).set(libFileName, result);
        return result;
    }
    function processLibReferenceDirectives(file) {
        (0, ts_1.forEach)(file.libReferenceDirectives, function (libReference, index) {
            var _a = getLibFileNameFromLibReference(libReference), libName = _a.libName, libFileName = _a.libFileName;
            if (libFileName) {
                // we ignore any 'no-default-lib' reference set on this file.
                processRootFile(pathForLibFile(libFileName), /*isDefaultLib*/ true, /*ignoreNoDefaultLib*/ true, { kind: ts_1.FileIncludeKind.LibReferenceDirective, file: file.path, index: index, });
            }
            else {
                var unqualifiedLibName = (0, ts_1.removeSuffix)((0, ts_1.removePrefix)(libName, "lib."), ".d.ts");
                var suggestion = (0, ts_1.getSpellingSuggestion)(unqualifiedLibName, ts_1.libs, ts_1.identity);
                var diagnostic = suggestion ? ts_1.Diagnostics.Cannot_find_lib_definition_for_0_Did_you_mean_1 : ts_1.Diagnostics.Cannot_find_lib_definition_for_0;
                var args = suggestion ? [libName, suggestion] : [libName];
                (fileProcessingDiagnostics || (fileProcessingDiagnostics = [])).push({
                    kind: 0 /* FilePreprocessingDiagnosticsKind.FilePreprocessingReferencedDiagnostic */,
                    reason: { kind: ts_1.FileIncludeKind.LibReferenceDirective, file: file.path, index: index, },
                    diagnostic: diagnostic,
                    args: args,
                });
            }
        });
    }
    function getCanonicalFileName(fileName) {
        return host.getCanonicalFileName(fileName);
    }
    function processImportedModules(file) {
        var _a;
        collectExternalModuleReferences(file);
        if (file.imports.length || file.moduleAugmentations.length) {
            // Because global augmentation doesn't have string literal name, we can check for global augmentation as such.
            var moduleNames = getModuleNames(file);
            var resolutions = resolveModuleNamesReusingOldState(moduleNames, file);
            ts_1.Debug.assert(resolutions.length === moduleNames.length);
            var optionsForFile = (useSourceOfProjectReferenceRedirect ? (_a = getRedirectReferenceForResolution(file)) === null || _a === void 0 ? void 0 : _a.commandLine.options : undefined) || options;
            for (var index = 0; index < moduleNames.length; index++) {
                var resolution = resolutions[index].resolvedModule;
                var moduleName = moduleNames[index].text;
                var mode = getModeForUsageLocation(file, moduleNames[index]);
                (0, ts_1.setResolvedModule)(file, moduleName, resolutions[index], mode);
                addResolutionDiagnosticsFromResolutionOrCache(file, moduleName, resolutions[index], mode);
                if (!resolution) {
                    continue;
                }
                var isFromNodeModulesSearch = resolution.isExternalLibraryImport;
                var isJsFile = !(0, ts_1.resolutionExtensionIsTSOrJson)(resolution.extension);
                var isJsFileFromNodeModules = isFromNodeModulesSearch && isJsFile;
                var resolvedFileName = resolution.resolvedFileName;
                if (isFromNodeModulesSearch) {
                    currentNodeModulesDepth++;
                }
                // add file to program only if:
                // - resolution was successful
                // - noResolve is falsy
                // - module name comes from the list of imports
                // - it's not a top level JavaScript module that exceeded the search max
                var elideImport = isJsFileFromNodeModules && currentNodeModulesDepth > maxNodeModuleJsDepth;
                // Don't add the file if it has a bad extension (e.g. 'tsx' if we don't have '--allowJs')
                // This may still end up being an untyped module -- the file won't be included but imports will be allowed.
                var shouldAddFile = resolvedFileName
                    && !getResolutionDiagnostic(optionsForFile, resolution, file)
                    && !optionsForFile.noResolve
                    && index < file.imports.length
                    && !elideImport
                    && !(isJsFile && !(0, ts_1.getAllowJSCompilerOption)(optionsForFile))
                    && ((0, ts_1.isInJSFile)(file.imports[index]) || !(file.imports[index].flags & 8388608 /* NodeFlags.JSDoc */));
                if (elideImport) {
                    modulesWithElidedImports.set(file.path, true);
                }
                else if (shouldAddFile) {
                    findSourceFile(resolvedFileName, 
                    /*isDefaultLib*/ false, 
                    /*ignoreNoDefaultLib*/ false, { kind: ts_1.FileIncludeKind.Import, file: file.path, index: index, }, resolution.packageId);
                }
                if (isFromNodeModulesSearch) {
                    currentNodeModulesDepth--;
                }
            }
        }
        else {
            // no imports - drop cached module resolutions
            file.resolvedModules = undefined;
        }
    }
    function checkSourceFilesBelongToPath(sourceFiles, rootDirectory) {
        var allFilesBelongToPath = true;
        var absoluteRootDirectoryPath = host.getCanonicalFileName((0, ts_1.getNormalizedAbsolutePath)(rootDirectory, currentDirectory));
        for (var _i = 0, sourceFiles_1 = sourceFiles; _i < sourceFiles_1.length; _i++) {
            var sourceFile = sourceFiles_1[_i];
            if (!sourceFile.isDeclarationFile) {
                var absoluteSourceFilePath = host.getCanonicalFileName((0, ts_1.getNormalizedAbsolutePath)(sourceFile.fileName, currentDirectory));
                if (absoluteSourceFilePath.indexOf(absoluteRootDirectoryPath) !== 0) {
                    addProgramDiagnosticExplainingFile(sourceFile, ts_1.Diagnostics.File_0_is_not_under_rootDir_1_rootDir_is_expected_to_contain_all_source_files, [sourceFile.fileName, rootDirectory]);
                    allFilesBelongToPath = false;
                }
            }
        }
        return allFilesBelongToPath;
    }
    function parseProjectReferenceConfigFile(ref) {
        if (!projectReferenceRedirects) {
            projectReferenceRedirects = new Map();
        }
        // The actual filename (i.e. add "/tsconfig.json" if necessary)
        var refPath = resolveProjectReferencePath(ref);
        var sourceFilePath = toPath(refPath);
        var fromCache = projectReferenceRedirects.get(sourceFilePath);
        if (fromCache !== undefined) {
            return fromCache || undefined;
        }
        var commandLine;
        var sourceFile;
        if (host.getParsedCommandLine) {
            commandLine = host.getParsedCommandLine(refPath);
            if (!commandLine) {
                addFileToFilesByName(/*file*/ undefined, sourceFilePath, /*redirectedPath*/ undefined);
                projectReferenceRedirects.set(sourceFilePath, false);
                return undefined;
            }
            sourceFile = ts_1.Debug.checkDefined(commandLine.options.configFile);
            ts_1.Debug.assert(!sourceFile.path || sourceFile.path === sourceFilePath);
            addFileToFilesByName(sourceFile, sourceFilePath, /*redirectedPath*/ undefined);
        }
        else {
            // An absolute path pointing to the containing directory of the config file
            var basePath = (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getDirectoryPath)(refPath), currentDirectory);
            sourceFile = host.getSourceFile(refPath, 100 /* ScriptTarget.JSON */);
            addFileToFilesByName(sourceFile, sourceFilePath, /*redirectedPath*/ undefined);
            if (sourceFile === undefined) {
                projectReferenceRedirects.set(sourceFilePath, false);
                return undefined;
            }
            commandLine = (0, ts_1.parseJsonSourceFileConfigFileContent)(sourceFile, configParsingHost, basePath, /*existingOptions*/ undefined, refPath);
        }
        sourceFile.fileName = refPath;
        sourceFile.path = sourceFilePath;
        sourceFile.resolvedPath = sourceFilePath;
        sourceFile.originalFileName = refPath;
        var resolvedRef = { commandLine: commandLine, sourceFile: sourceFile };
        projectReferenceRedirects.set(sourceFilePath, resolvedRef);
        if (commandLine.projectReferences) {
            resolvedRef.references = commandLine.projectReferences.map(parseProjectReferenceConfigFile);
        }
        return resolvedRef;
    }
    function verifyCompilerOptions() {
        if (options.strictPropertyInitialization && !(0, ts_1.getStrictOptionValue)(options, "strictNullChecks")) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "strictPropertyInitialization", "strictNullChecks");
        }
        if (options.exactOptionalPropertyTypes && !(0, ts_1.getStrictOptionValue)(options, "strictNullChecks")) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "exactOptionalPropertyTypes", "strictNullChecks");
        }
        if (options.isolatedModules || options.verbatimModuleSyntax) {
            if (options.out) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "out", options.verbatimModuleSyntax ? "verbatimModuleSyntax" : "isolatedModules");
            }
            if (options.outFile) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "outFile", options.verbatimModuleSyntax ? "verbatimModuleSyntax" : "isolatedModules");
            }
        }
        if (options.inlineSourceMap) {
            if (options.sourceMap) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "sourceMap", "inlineSourceMap");
            }
            if (options.mapRoot) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "mapRoot", "inlineSourceMap");
            }
        }
        if (options.composite) {
            if (options.declaration === false) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Composite_projects_may_not_disable_declaration_emit, "declaration");
            }
            if (options.incremental === false) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Composite_projects_may_not_disable_incremental_compilation, "declaration");
            }
        }
        var outputFile = (0, ts_1.outFile)(options);
        if (options.tsBuildInfoFile) {
            if (!(0, ts_1.isIncrementalCompilation)(options)) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1_or_option_2, "tsBuildInfoFile", "incremental", "composite");
            }
        }
        else if (options.incremental && !outputFile && !options.configFilePath) {
            programDiagnostics.add((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Option_incremental_can_only_be_specified_using_tsconfig_emitting_to_single_file_or_when_option_tsBuildInfoFile_is_specified));
        }
        verifyDeprecatedCompilerOptions();
        verifyProjectReferences();
        // List of collected files is complete; validate exhautiveness if this is a project with a file list
        if (options.composite) {
            var rootPaths = new Set(rootNames.map(toPath));
            for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
                var file = files_2[_i];
                // Ignore file that is not emitted
                if ((0, ts_1.sourceFileMayBeEmitted)(file, program) && !rootPaths.has(file.path)) {
                    addProgramDiagnosticExplainingFile(file, ts_1.Diagnostics.File_0_is_not_listed_within_the_file_list_of_project_1_Projects_must_list_all_files_or_use_an_include_pattern, [file.fileName, options.configFilePath || ""]);
                }
            }
        }
        if (options.paths) {
            for (var key in options.paths) {
                if (!(0, ts_1.hasProperty)(options.paths, key)) {
                    continue;
                }
                if (!(0, ts_1.hasZeroOrOneAsteriskCharacter)(key)) {
                    createDiagnosticForOptionPaths(/*onKey*/ true, key, ts_1.Diagnostics.Pattern_0_can_have_at_most_one_Asterisk_character, key);
                }
                if ((0, ts_1.isArray)(options.paths[key])) {
                    var len = options.paths[key].length;
                    if (len === 0) {
                        createDiagnosticForOptionPaths(/*onKey*/ false, key, ts_1.Diagnostics.Substitutions_for_pattern_0_shouldn_t_be_an_empty_array, key);
                    }
                    for (var i = 0; i < len; i++) {
                        var subst = options.paths[key][i];
                        var typeOfSubst = typeof subst;
                        if (typeOfSubst === "string") {
                            if (!(0, ts_1.hasZeroOrOneAsteriskCharacter)(subst)) {
                                createDiagnosticForOptionPathKeyValue(key, i, ts_1.Diagnostics.Substitution_0_in_pattern_1_can_have_at_most_one_Asterisk_character, subst, key);
                            }
                            if (!options.baseUrl && !(0, ts_1.pathIsRelative)(subst) && !(0, ts_1.pathIsAbsolute)(subst)) {
                                createDiagnosticForOptionPathKeyValue(key, i, ts_1.Diagnostics.Non_relative_paths_are_not_allowed_when_baseUrl_is_not_set_Did_you_forget_a_leading_Slash);
                            }
                        }
                        else {
                            createDiagnosticForOptionPathKeyValue(key, i, ts_1.Diagnostics.Substitution_0_for_pattern_1_has_incorrect_type_expected_string_got_2, subst, key, typeOfSubst);
                        }
                    }
                }
                else {
                    createDiagnosticForOptionPaths(/*onKey*/ false, key, ts_1.Diagnostics.Substitutions_for_pattern_0_should_be_an_array, key);
                }
            }
        }
        if (!options.sourceMap && !options.inlineSourceMap) {
            if (options.inlineSources) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_can_only_be_used_when_either_option_inlineSourceMap_or_option_sourceMap_is_provided, "inlineSources");
            }
            if (options.sourceRoot) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_can_only_be_used_when_either_option_inlineSourceMap_or_option_sourceMap_is_provided, "sourceRoot");
            }
        }
        if (options.out && options.outFile) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "out", "outFile");
        }
        if (options.mapRoot && !(options.sourceMap || options.declarationMap)) {
            // Error to specify --mapRoot without --sourcemap
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1_or_option_2, "mapRoot", "sourceMap", "declarationMap");
        }
        if (options.declarationDir) {
            if (!(0, ts_1.getEmitDeclarations)(options)) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1_or_option_2, "declarationDir", "declaration", "composite");
            }
            if (outputFile) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "declarationDir", options.out ? "out" : "outFile");
            }
        }
        if (options.declarationMap && !(0, ts_1.getEmitDeclarations)(options)) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1_or_option_2, "declarationMap", "declaration", "composite");
        }
        if (options.lib && options.noLib) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "lib", "noLib");
        }
        if (options.noImplicitUseStrict && (0, ts_1.getStrictOptionValue)(options, "alwaysStrict")) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "noImplicitUseStrict", "alwaysStrict");
        }
        var languageVersion = (0, ts_1.getEmitScriptTarget)(options);
        var firstNonAmbientExternalModuleSourceFile = (0, ts_1.find)(files, function (f) { return (0, ts_1.isExternalModule)(f) && !f.isDeclarationFile; });
        if (options.isolatedModules || options.verbatimModuleSyntax) {
            if (options.module === ts_1.ModuleKind.None && languageVersion < 2 /* ScriptTarget.ES2015 */ && options.isolatedModules) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_isolatedModules_can_only_be_used_when_either_option_module_is_provided_or_option_target_is_ES2015_or_higher, "isolatedModules", "target");
            }
            if (options.preserveConstEnums === false) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_preserveConstEnums_cannot_be_disabled_when_0_is_enabled, options.verbatimModuleSyntax ? "verbatimModuleSyntax" : "isolatedModules", "preserveConstEnums");
            }
        }
        else if (firstNonAmbientExternalModuleSourceFile && languageVersion < 2 /* ScriptTarget.ES2015 */ && options.module === ts_1.ModuleKind.None) {
            // We cannot use createDiagnosticFromNode because nodes do not have parents yet
            var span = (0, ts_1.getErrorSpanForNode)(firstNonAmbientExternalModuleSourceFile, typeof firstNonAmbientExternalModuleSourceFile.externalModuleIndicator === "boolean" ? firstNonAmbientExternalModuleSourceFile : firstNonAmbientExternalModuleSourceFile.externalModuleIndicator);
            programDiagnostics.add((0, ts_1.createFileDiagnostic)(firstNonAmbientExternalModuleSourceFile, span.start, span.length, ts_1.Diagnostics.Cannot_use_imports_exports_or_module_augmentations_when_module_is_none));
        }
        // Cannot specify module gen that isn't amd or system with --out
        if (outputFile && !options.emitDeclarationOnly) {
            if (options.module && !(options.module === ts_1.ModuleKind.AMD || options.module === ts_1.ModuleKind.System)) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Only_amd_and_system_modules_are_supported_alongside_0, options.out ? "out" : "outFile", "module");
            }
            else if (options.module === undefined && firstNonAmbientExternalModuleSourceFile) {
                var span = (0, ts_1.getErrorSpanForNode)(firstNonAmbientExternalModuleSourceFile, typeof firstNonAmbientExternalModuleSourceFile.externalModuleIndicator === "boolean" ? firstNonAmbientExternalModuleSourceFile : firstNonAmbientExternalModuleSourceFile.externalModuleIndicator);
                programDiagnostics.add((0, ts_1.createFileDiagnostic)(firstNonAmbientExternalModuleSourceFile, span.start, span.length, ts_1.Diagnostics.Cannot_compile_modules_using_option_0_unless_the_module_flag_is_amd_or_system, options.out ? "out" : "outFile"));
            }
        }
        if ((0, ts_1.getResolveJsonModule)(options)) {
            if ((0, ts_1.getEmitModuleResolutionKind)(options) === ts_1.ModuleResolutionKind.Classic) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_resolveJsonModule_cannot_be_specified_when_moduleResolution_is_set_to_classic, "resolveJsonModule");
            }
            // Any emit other than common js, amd, es2015 or esnext is error
            else if (!(0, ts_1.hasJsonModuleEmitEnabled)(options)) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_resolveJsonModule_can_only_be_specified_when_module_code_generation_is_commonjs_amd_es2015_or_esNext, "resolveJsonModule", "module");
            }
        }
        // there has to be common source directory if user specified --outdir || --rootDir || --sourceRoot
        // if user specified --mapRoot, there needs to be common source directory if there would be multiple files being emitted
        if (options.outDir || // there is --outDir specified
            options.rootDir || // there is --rootDir specified
            options.sourceRoot || // there is --sourceRoot specified
            options.mapRoot) { // there is --mapRoot specified
            // Precalculate and cache the common source directory
            var dir = getCommonSourceDirectory();
            // If we failed to find a good common directory, but outDir is specified and at least one of our files is on a windows drive/URL/other resource, add a failure
            if (options.outDir && dir === "" && files.some(function (file) { return (0, ts_1.getRootLength)(file.fileName) > 1; })) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Cannot_find_the_common_subdirectory_path_for_the_input_files, "outDir");
            }
        }
        if (options.useDefineForClassFields && languageVersion === 0 /* ScriptTarget.ES3 */) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_when_option_target_is_ES3, "useDefineForClassFields");
        }
        if (options.checkJs && !(0, ts_1.getAllowJSCompilerOption)(options)) {
            programDiagnostics.add((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "checkJs", "allowJs"));
        }
        if (options.emitDeclarationOnly) {
            if (!(0, ts_1.getEmitDeclarations)(options)) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1_or_option_2, "emitDeclarationOnly", "declaration", "composite");
            }
            if (options.noEmit) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "emitDeclarationOnly", "noEmit");
            }
        }
        if (options.emitDecoratorMetadata &&
            !options.experimentalDecorators) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "emitDecoratorMetadata", "experimentalDecorators");
        }
        if (options.jsxFactory) {
            if (options.reactNamespace) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_with_option_1, "reactNamespace", "jsxFactory");
            }
            if (options.jsx === 4 /* JsxEmit.ReactJSX */ || options.jsx === 5 /* JsxEmit.ReactJSXDev */) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_when_option_jsx_is_1, "jsxFactory", ts_1.inverseJsxOptionMap.get("" + options.jsx));
            }
            if (!(0, ts_1.parseIsolatedEntityName)(options.jsxFactory, languageVersion)) {
                createOptionValueDiagnostic("jsxFactory", ts_1.Diagnostics.Invalid_value_for_jsxFactory_0_is_not_a_valid_identifier_or_qualified_name, options.jsxFactory);
            }
        }
        else if (options.reactNamespace && !(0, ts_1.isIdentifierText)(options.reactNamespace, languageVersion)) {
            createOptionValueDiagnostic("reactNamespace", ts_1.Diagnostics.Invalid_value_for_reactNamespace_0_is_not_a_valid_identifier, options.reactNamespace);
        }
        if (options.jsxFragmentFactory) {
            if (!options.jsxFactory) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "jsxFragmentFactory", "jsxFactory");
            }
            if (options.jsx === 4 /* JsxEmit.ReactJSX */ || options.jsx === 5 /* JsxEmit.ReactJSXDev */) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_when_option_jsx_is_1, "jsxFragmentFactory", ts_1.inverseJsxOptionMap.get("" + options.jsx));
            }
            if (!(0, ts_1.parseIsolatedEntityName)(options.jsxFragmentFactory, languageVersion)) {
                createOptionValueDiagnostic("jsxFragmentFactory", ts_1.Diagnostics.Invalid_value_for_jsxFragmentFactory_0_is_not_a_valid_identifier_or_qualified_name, options.jsxFragmentFactory);
            }
        }
        if (options.reactNamespace) {
            if (options.jsx === 4 /* JsxEmit.ReactJSX */ || options.jsx === 5 /* JsxEmit.ReactJSXDev */) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_when_option_jsx_is_1, "reactNamespace", ts_1.inverseJsxOptionMap.get("" + options.jsx));
            }
        }
        if (options.jsxImportSource) {
            if (options.jsx === 2 /* JsxEmit.React */) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_cannot_be_specified_when_option_jsx_is_1, "jsxImportSource", ts_1.inverseJsxOptionMap.get("" + options.jsx));
            }
        }
        if (options.preserveValueImports && (0, ts_1.getEmitModuleKind)(options) < ts_1.ModuleKind.ES2015) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_can_only_be_used_when_module_is_set_to_es2015_or_later, "preserveValueImports");
        }
        var moduleKind = (0, ts_1.getEmitModuleKind)(options);
        if (options.verbatimModuleSyntax) {
            if (moduleKind === ts_1.ModuleKind.AMD || moduleKind === ts_1.ModuleKind.UMD || moduleKind === ts_1.ModuleKind.System) {
                createDiagnosticForOptionName(ts_1.Diagnostics.Option_verbatimModuleSyntax_cannot_be_used_when_module_is_set_to_UMD_AMD_or_System, "verbatimModuleSyntax");
            }
            if (options.preserveValueImports) {
                createRedundantOptionDiagnostic("preserveValueImports", "verbatimModuleSyntax");
            }
            if (options.importsNotUsedAsValues) {
                createRedundantOptionDiagnostic("importsNotUsedAsValues", "verbatimModuleSyntax");
            }
        }
        if (options.allowImportingTsExtensions && !(options.noEmit || options.emitDeclarationOnly)) {
            createOptionValueDiagnostic("allowImportingTsExtensions", ts_1.Diagnostics.Option_allowImportingTsExtensions_can_only_be_used_when_either_noEmit_or_emitDeclarationOnly_is_set);
        }
        var moduleResolution = (0, ts_1.getEmitModuleResolutionKind)(options);
        if (options.resolvePackageJsonExports && !(0, ts_1.moduleResolutionSupportsPackageJsonExportsAndImports)(moduleResolution)) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_can_only_be_used_when_moduleResolution_is_set_to_node16_nodenext_or_bundler, "resolvePackageJsonExports");
        }
        if (options.resolvePackageJsonImports && !(0, ts_1.moduleResolutionSupportsPackageJsonExportsAndImports)(moduleResolution)) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_can_only_be_used_when_moduleResolution_is_set_to_node16_nodenext_or_bundler, "resolvePackageJsonImports");
        }
        if (options.customConditions && !(0, ts_1.moduleResolutionSupportsPackageJsonExportsAndImports)(moduleResolution)) {
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_can_only_be_used_when_moduleResolution_is_set_to_node16_nodenext_or_bundler, "customConditions");
        }
        if (moduleResolution === ts_1.ModuleResolutionKind.Bundler && !(0, ts_1.emitModuleKindIsNonNodeESM)(moduleKind)) {
            createOptionValueDiagnostic("moduleResolution", ts_1.Diagnostics.Option_0_can_only_be_used_when_module_is_set_to_es2015_or_later, "bundler");
        }
        // If the emit is enabled make sure that every output file is unique and not overwriting any of the input files
        if (!options.noEmit && !options.suppressOutputPathCheck) {
            var emitHost = getEmitHost();
            var emitFilesSeen_1 = new Set();
            (0, ts_1.forEachEmittedFile)(emitHost, function (emitFileNames) {
                if (!options.emitDeclarationOnly) {
                    verifyEmitFilePath(emitFileNames.jsFilePath, emitFilesSeen_1);
                }
                verifyEmitFilePath(emitFileNames.declarationFilePath, emitFilesSeen_1);
            });
        }
        // Verify that all the emit files are unique and don't overwrite input files
        function verifyEmitFilePath(emitFileName, emitFilesSeen) {
            if (emitFileName) {
                var emitFilePath = toPath(emitFileName);
                // Report error if the output overwrites input file
                if (filesByName.has(emitFilePath)) {
                    var chain = void 0;
                    if (!options.configFilePath) {
                        // The program is from either an inferred project or an external project
                        chain = (0, ts_1.chainDiagnosticMessages)(/*details*/ undefined, ts_1.Diagnostics.Adding_a_tsconfig_json_file_will_help_organize_projects_that_contain_both_TypeScript_and_JavaScript_files_Learn_more_at_https_Colon_Slash_Slashaka_ms_Slashtsconfig);
                    }
                    chain = (0, ts_1.chainDiagnosticMessages)(chain, ts_1.Diagnostics.Cannot_write_file_0_because_it_would_overwrite_input_file, emitFileName);
                    blockEmittingOfFile(emitFileName, (0, ts_1.createCompilerDiagnosticFromMessageChain)(chain));
                }
                var emitFileKey = !host.useCaseSensitiveFileNames() ? (0, ts_1.toFileNameLowerCase)(emitFilePath) : emitFilePath;
                // Report error if multiple files write into same file
                if (emitFilesSeen.has(emitFileKey)) {
                    // Already seen the same emit file - report error
                    blockEmittingOfFile(emitFileName, (0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Cannot_write_file_0_because_it_would_be_overwritten_by_multiple_input_files, emitFileName));
                }
                else {
                    emitFilesSeen.add(emitFileKey);
                }
            }
        }
    }
    function getIgnoreDeprecationsVersion() {
        var ignoreDeprecations = options.ignoreDeprecations;
        if (ignoreDeprecations) {
            // While we could do Version.tryParse here to support any version,
            // for now, only allow "5.0". We aren't planning on deprecating anything
            // until 6.0.
            if (ignoreDeprecations === "5.0") {
                return new ts_1.Version(ignoreDeprecations);
            }
            reportInvalidIgnoreDeprecations();
        }
        return ts_1.Version.zero;
    }
    function checkDeprecations(deprecatedIn, removedIn, createDiagnostic, fn) {
        var deprecatedInVersion = new ts_1.Version(deprecatedIn);
        var removedInVersion = new ts_1.Version(removedIn);
        var typescriptVersion = new ts_1.Version(typeScriptVersion || ts_1.versionMajorMinor);
        var ignoreDeprecationsVersion = getIgnoreDeprecationsVersion();
        var mustBeRemoved = !(removedInVersion.compareTo(typescriptVersion) === 1 /* Comparison.GreaterThan */);
        var canBeSilenced = !mustBeRemoved && ignoreDeprecationsVersion.compareTo(deprecatedInVersion) === -1 /* Comparison.LessThan */;
        if (mustBeRemoved || canBeSilenced) {
            fn(function (name, value, useInstead) {
                if (mustBeRemoved) {
                    if (value === undefined) {
                        createDiagnostic(name, value, useInstead, ts_1.Diagnostics.Option_0_has_been_removed_Please_remove_it_from_your_configuration, name);
                    }
                    else {
                        createDiagnostic(name, value, useInstead, ts_1.Diagnostics.Option_0_1_has_been_removed_Please_remove_it_from_your_configuration, name, value);
                    }
                }
                else {
                    if (value === undefined) {
                        createDiagnostic(name, value, useInstead, ts_1.Diagnostics.Option_0_is_deprecated_and_will_stop_functioning_in_TypeScript_1_Specify_compilerOption_ignoreDeprecations_Colon_2_to_silence_this_error, name, removedIn, deprecatedIn);
                    }
                    else {
                        createDiagnostic(name, value, useInstead, ts_1.Diagnostics.Option_0_1_is_deprecated_and_will_stop_functioning_in_TypeScript_2_Specify_compilerOption_ignoreDeprecations_Colon_3_to_silence_this_error, name, value, removedIn, deprecatedIn);
                    }
                }
            });
        }
    }
    function verifyDeprecatedCompilerOptions() {
        function createDiagnostic(name, value, useInstead, message) {
            var args = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                args[_i - 4] = arguments[_i];
            }
            if (useInstead) {
                var details = (0, ts_1.chainDiagnosticMessages)(/*details*/ undefined, ts_1.Diagnostics.Use_0_instead, useInstead);
                var chain = ts_1.chainDiagnosticMessages.apply(void 0, __spreadArray([details, message], args, false));
                createDiagnosticForOption(/*onKey*/ !value, name, /*option2*/ undefined, chain);
            }
            else {
                createDiagnosticForOption.apply(void 0, __spreadArray([/*onKey*/ !value, name, /*option2*/ undefined, message], args, false));
            }
        }
        checkDeprecations("5.0", "5.5", createDiagnostic, function (createDeprecatedDiagnostic) {
            if (options.target === 0 /* ScriptTarget.ES3 */) {
                createDeprecatedDiagnostic("target", "ES3");
            }
            if (options.noImplicitUseStrict) {
                createDeprecatedDiagnostic("noImplicitUseStrict");
            }
            if (options.keyofStringsOnly) {
                createDeprecatedDiagnostic("keyofStringsOnly");
            }
            if (options.suppressExcessPropertyErrors) {
                createDeprecatedDiagnostic("suppressExcessPropertyErrors");
            }
            if (options.suppressImplicitAnyIndexErrors) {
                createDeprecatedDiagnostic("suppressImplicitAnyIndexErrors");
            }
            if (options.noStrictGenericChecks) {
                createDeprecatedDiagnostic("noStrictGenericChecks");
            }
            if (options.charset) {
                createDeprecatedDiagnostic("charset");
            }
            if (options.out) {
                createDeprecatedDiagnostic("out", /*value*/ undefined, "outFile");
            }
            if (options.importsNotUsedAsValues) {
                createDeprecatedDiagnostic("importsNotUsedAsValues", /*value*/ undefined, "verbatimModuleSyntax");
            }
            if (options.preserveValueImports) {
                createDeprecatedDiagnostic("preserveValueImports", /*value*/ undefined, "verbatimModuleSyntax");
            }
        });
    }
    function verifyDeprecatedProjectReference(ref, parentFile, index) {
        function createDiagnostic(_name, _value, _useInstead, message) {
            var args = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                args[_i - 4] = arguments[_i];
            }
            createDiagnosticForReference.apply(void 0, __spreadArray([parentFile, index, message], args, false));
        }
        checkDeprecations("5.0", "5.5", createDiagnostic, function (createDeprecatedDiagnostic) {
            if (ref.prepend) {
                createDeprecatedDiagnostic("prepend");
            }
        });
    }
    function createDiagnosticExplainingFile(file, fileProcessingReason, diagnostic, args) {
        var _a;
        var fileIncludeReasons;
        var relatedInfo;
        var locationReason = isReferencedFile(fileProcessingReason) ? fileProcessingReason : undefined;
        if (file)
            (_a = fileReasons.get(file.path)) === null || _a === void 0 ? void 0 : _a.forEach(processReason);
        if (fileProcessingReason)
            processReason(fileProcessingReason);
        // If we have location and there is only one reason file is in which is the location, dont add details for file include
        if (locationReason && (fileIncludeReasons === null || fileIncludeReasons === void 0 ? void 0 : fileIncludeReasons.length) === 1)
            fileIncludeReasons = undefined;
        var location = locationReason && getReferencedFileLocation(getSourceFileByPath, locationReason);
        var fileIncludeReasonDetails = fileIncludeReasons && (0, ts_1.chainDiagnosticMessages)(fileIncludeReasons, ts_1.Diagnostics.The_file_is_in_the_program_because_Colon);
        var redirectInfo = file && (0, ts_1.explainIfFileIsRedirectAndImpliedFormat)(file);
        var chain = ts_1.chainDiagnosticMessages.apply(void 0, __spreadArray([redirectInfo ? fileIncludeReasonDetails ? __spreadArray([fileIncludeReasonDetails], redirectInfo, true) : redirectInfo : fileIncludeReasonDetails, diagnostic], args || ts_1.emptyArray, false));
        return location && isReferenceFileLocation(location) ?
            (0, ts_1.createFileDiagnosticFromMessageChain)(location.file, location.pos, location.end - location.pos, chain, relatedInfo) :
            (0, ts_1.createCompilerDiagnosticFromMessageChain)(chain, relatedInfo);
        function processReason(reason) {
            (fileIncludeReasons || (fileIncludeReasons = [])).push((0, ts_1.fileIncludeReasonToDiagnostics)(program, reason));
            if (!locationReason && isReferencedFile(reason)) {
                // Report error at first reference file or file currently in processing and dont report in related information
                locationReason = reason;
            }
            else if (locationReason !== reason) {
                relatedInfo = (0, ts_1.append)(relatedInfo, fileIncludeReasonToRelatedInformation(reason));
            }
            // Remove fileProcessingReason if its already included in fileReasons of the program
            if (reason === fileProcessingReason)
                fileProcessingReason = undefined;
        }
    }
    function addFilePreprocessingFileExplainingDiagnostic(file, fileProcessingReason, diagnostic, args) {
        (fileProcessingDiagnostics || (fileProcessingDiagnostics = [])).push({
            kind: 1 /* FilePreprocessingDiagnosticsKind.FilePreprocessingFileExplainingDiagnostic */,
            file: file && file.path,
            fileProcessingReason: fileProcessingReason,
            diagnostic: diagnostic,
            args: args
        });
    }
    function addProgramDiagnosticExplainingFile(file, diagnostic, args) {
        programDiagnostics.add(createDiagnosticExplainingFile(file, /*fileProcessingReason*/ undefined, diagnostic, args));
    }
    function fileIncludeReasonToRelatedInformation(reason) {
        if (isReferencedFile(reason)) {
            var referenceLocation = getReferencedFileLocation(getSourceFileByPath, reason);
            var message_1;
            switch (reason.kind) {
                case ts_1.FileIncludeKind.Import:
                    message_1 = ts_1.Diagnostics.File_is_included_via_import_here;
                    break;
                case ts_1.FileIncludeKind.ReferenceFile:
                    message_1 = ts_1.Diagnostics.File_is_included_via_reference_here;
                    break;
                case ts_1.FileIncludeKind.TypeReferenceDirective:
                    message_1 = ts_1.Diagnostics.File_is_included_via_type_library_reference_here;
                    break;
                case ts_1.FileIncludeKind.LibReferenceDirective:
                    message_1 = ts_1.Diagnostics.File_is_included_via_library_reference_here;
                    break;
                default:
                    ts_1.Debug.assertNever(reason);
            }
            return isReferenceFileLocation(referenceLocation) ? (0, ts_1.createFileDiagnostic)(referenceLocation.file, referenceLocation.pos, referenceLocation.end - referenceLocation.pos, message_1) : undefined;
        }
        if (!options.configFile)
            return undefined;
        var configFileNode;
        var message;
        switch (reason.kind) {
            case ts_1.FileIncludeKind.RootFile:
                if (!options.configFile.configFileSpecs)
                    return undefined;
                var fileName = (0, ts_1.getNormalizedAbsolutePath)(rootNames[reason.index], currentDirectory);
                var matchedByFiles = (0, ts_1.getMatchedFileSpec)(program, fileName);
                if (matchedByFiles) {
                    configFileNode = (0, ts_1.getTsConfigPropArrayElementValue)(options.configFile, "files", matchedByFiles);
                    message = ts_1.Diagnostics.File_is_matched_by_files_list_specified_here;
                    break;
                }
                var matchedByInclude = (0, ts_1.getMatchedIncludeSpec)(program, fileName);
                // Could be additional files specified as roots
                if (!matchedByInclude || !(0, ts_1.isString)(matchedByInclude))
                    return undefined;
                configFileNode = (0, ts_1.getTsConfigPropArrayElementValue)(options.configFile, "include", matchedByInclude);
                message = ts_1.Diagnostics.File_is_matched_by_include_pattern_specified_here;
                break;
            case ts_1.FileIncludeKind.SourceFromProjectReference:
            case ts_1.FileIncludeKind.OutputFromProjectReference:
                var referencedResolvedRef_1 = ts_1.Debug.checkDefined(resolvedProjectReferences === null || resolvedProjectReferences === void 0 ? void 0 : resolvedProjectReferences[reason.index]);
                var referenceInfo = forEachProjectReference(projectReferences, resolvedProjectReferences, function (resolvedRef, parent, index) {
                    return resolvedRef === referencedResolvedRef_1 ? { sourceFile: (parent === null || parent === void 0 ? void 0 : parent.sourceFile) || options.configFile, index: index } : undefined;
                });
                if (!referenceInfo)
                    return undefined;
                var sourceFile = referenceInfo.sourceFile, index = referenceInfo.index;
                var referencesSyntax = (0, ts_1.forEachTsConfigPropArray)(sourceFile, "references", function (property) { return (0, ts_1.isArrayLiteralExpression)(property.initializer) ? property.initializer : undefined; });
                return referencesSyntax && referencesSyntax.elements.length > index ?
                    (0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, referencesSyntax.elements[index], reason.kind === ts_1.FileIncludeKind.OutputFromProjectReference ?
                        ts_1.Diagnostics.File_is_output_from_referenced_project_specified_here :
                        ts_1.Diagnostics.File_is_source_from_referenced_project_specified_here) :
                    undefined;
            case ts_1.FileIncludeKind.AutomaticTypeDirectiveFile:
                if (!options.types)
                    return undefined;
                configFileNode = getOptionsSyntaxByArrayElementValue("types", reason.typeReference);
                message = ts_1.Diagnostics.File_is_entry_point_of_type_library_specified_here;
                break;
            case ts_1.FileIncludeKind.LibFile:
                if (reason.index !== undefined) {
                    configFileNode = getOptionsSyntaxByArrayElementValue("lib", options.lib[reason.index]);
                    message = ts_1.Diagnostics.File_is_library_specified_here;
                    break;
                }
                var target = (0, ts_1.forEachEntry)(ts_1.targetOptionDeclaration.type, function (value, key) { return value === (0, ts_1.getEmitScriptTarget)(options) ? key : undefined; });
                configFileNode = target ? getOptionsSyntaxByValue("target", target) : undefined;
                message = ts_1.Diagnostics.File_is_default_library_for_target_specified_here;
                break;
            default:
                ts_1.Debug.assertNever(reason);
        }
        return configFileNode && (0, ts_1.createDiagnosticForNodeInSourceFile)(options.configFile, configFileNode, message);
    }
    function verifyProjectReferences() {
        var buildInfoPath = !options.suppressOutputPathCheck ? (0, ts_1.getTsBuildInfoEmitOutputFilePath)(options) : undefined;
        forEachProjectReference(projectReferences, resolvedProjectReferences, function (resolvedRef, parent, index) {
            var ref = (parent ? parent.commandLine.projectReferences : projectReferences)[index];
            var parentFile = parent && parent.sourceFile;
            verifyDeprecatedProjectReference(ref, parentFile, index);
            if (!resolvedRef) {
                createDiagnosticForReference(parentFile, index, ts_1.Diagnostics.File_0_not_found, ref.path);
                return;
            }
            var options = resolvedRef.commandLine.options;
            if (!options.composite || options.noEmit) {
                // ok to not have composite if the current program is container only
                var inputs = parent ? parent.commandLine.fileNames : rootNames;
                if (inputs.length) {
                    if (!options.composite)
                        createDiagnosticForReference(parentFile, index, ts_1.Diagnostics.Referenced_project_0_must_have_setting_composite_Colon_true, ref.path);
                    if (options.noEmit)
                        createDiagnosticForReference(parentFile, index, ts_1.Diagnostics.Referenced_project_0_may_not_disable_emit, ref.path);
                }
            }
            if (ref.prepend) {
                var out = (0, ts_1.outFile)(options);
                if (out) {
                    if (!host.fileExists(out)) {
                        createDiagnosticForReference(parentFile, index, ts_1.Diagnostics.Output_file_0_from_project_1_does_not_exist, out, ref.path);
                    }
                }
                else {
                    createDiagnosticForReference(parentFile, index, ts_1.Diagnostics.Cannot_prepend_project_0_because_it_does_not_have_outFile_set, ref.path);
                }
            }
            if (!parent && buildInfoPath && buildInfoPath === (0, ts_1.getTsBuildInfoEmitOutputFilePath)(options)) {
                createDiagnosticForReference(parentFile, index, ts_1.Diagnostics.Cannot_write_file_0_because_it_will_overwrite_tsbuildinfo_file_generated_by_referenced_project_1, buildInfoPath, ref.path);
                hasEmitBlockingDiagnostics.set(toPath(buildInfoPath), true);
            }
        });
    }
    function createDiagnosticForOptionPathKeyValue(key, valueIndex, message) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var needCompilerDiagnostic = true;
        forEachOptionPathsSyntax(function (pathProp) {
            if ((0, ts_1.isObjectLiteralExpression)(pathProp.initializer)) {
                (0, ts_1.forEachPropertyAssignment)(pathProp.initializer, key, function (keyProps) {
                    var initializer = keyProps.initializer;
                    if ((0, ts_1.isArrayLiteralExpression)(initializer) && initializer.elements.length > valueIndex) {
                        programDiagnostics.add(ts_1.createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([options.configFile, initializer.elements[valueIndex], message], args, false)));
                        needCompilerDiagnostic = false;
                    }
                });
            }
        });
        if (needCompilerDiagnostic) {
            programDiagnostics.add(ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)));
        }
    }
    function createDiagnosticForOptionPaths(onKey, key, message) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var needCompilerDiagnostic = true;
        forEachOptionPathsSyntax(function (pathProp) {
            if ((0, ts_1.isObjectLiteralExpression)(pathProp.initializer) && createOptionDiagnosticInObjectLiteralSyntax.apply(void 0, __spreadArray([pathProp.initializer, onKey, key, /*key2*/ undefined,
                message], args, false))) {
                needCompilerDiagnostic = false;
            }
        });
        if (needCompilerDiagnostic) {
            programDiagnostics.add(ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)));
        }
    }
    function forEachOptionsSyntaxByName(name, callback) {
        return (0, ts_1.forEachPropertyAssignment)(getCompilerOptionsObjectLiteralSyntax(), name, callback);
    }
    function forEachOptionPathsSyntax(callback) {
        return forEachOptionsSyntaxByName("paths", callback);
    }
    function getOptionsSyntaxByValue(name, value) {
        return forEachOptionsSyntaxByName(name, function (property) { return (0, ts_1.isStringLiteral)(property.initializer) && property.initializer.text === value ? property.initializer : undefined; });
    }
    function getOptionsSyntaxByArrayElementValue(name, value) {
        var compilerOptionsObjectLiteralSyntax = getCompilerOptionsObjectLiteralSyntax();
        return compilerOptionsObjectLiteralSyntax && (0, ts_1.getPropertyArrayElementValue)(compilerOptionsObjectLiteralSyntax, name, value);
    }
    function createDiagnosticForOptionName(message, option1, option2, option3) {
        // TODO(jakebailey): this code makes assumptions about the format of the diagnostic messages.
        createDiagnosticForOption(/*onKey*/ true, option1, option2, message, option1, option2, option3);
    }
    function createOptionValueDiagnostic(option1, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        createDiagnosticForOption.apply(void 0, __spreadArray([/*onKey*/ false, option1, /*option2*/ undefined, message], args, false));
    }
    function createDiagnosticForReference(sourceFile, index, message) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var referencesSyntax = (0, ts_1.forEachTsConfigPropArray)(sourceFile || options.configFile, "references", function (property) { return (0, ts_1.isArrayLiteralExpression)(property.initializer) ? property.initializer : undefined; });
        if (referencesSyntax && referencesSyntax.elements.length > index) {
            programDiagnostics.add(ts_1.createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([sourceFile || options.configFile, referencesSyntax.elements[index], message], args, false)));
        }
        else {
            programDiagnostics.add(ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)));
        }
    }
    function createDiagnosticForOption(onKey, option1, option2, message) {
        var args = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            args[_i - 4] = arguments[_i];
        }
        var compilerOptionsObjectLiteralSyntax = getCompilerOptionsObjectLiteralSyntax();
        var needCompilerDiagnostic = !compilerOptionsObjectLiteralSyntax ||
            !createOptionDiagnosticInObjectLiteralSyntax.apply(void 0, __spreadArray([compilerOptionsObjectLiteralSyntax, onKey, option1, option2, message], args, false));
        if (needCompilerDiagnostic) {
            // eslint-disable-next-line local/no-in-operator
            if ("messageText" in message) {
                programDiagnostics.add((0, ts_1.createCompilerDiagnosticFromMessageChain)(message));
            }
            else {
                programDiagnostics.add(ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)));
            }
        }
    }
    function getCompilerOptionsObjectLiteralSyntax() {
        if (_compilerOptionsObjectLiteralSyntax === undefined) {
            _compilerOptionsObjectLiteralSyntax = (0, ts_1.forEachPropertyAssignment)((0, ts_1.getTsConfigObjectLiteralExpression)(options.configFile), "compilerOptions", function (prop) { return (0, ts_1.isObjectLiteralExpression)(prop.initializer) ? prop.initializer : undefined; }) || false;
        }
        return _compilerOptionsObjectLiteralSyntax || undefined;
    }
    function createOptionDiagnosticInObjectLiteralSyntax(objectLiteral, onKey, key1, key2, message) {
        var args = [];
        for (var _i = 5; _i < arguments.length; _i++) {
            args[_i - 5] = arguments[_i];
        }
        var needsCompilerDiagnostic = false;
        (0, ts_1.forEachPropertyAssignment)(objectLiteral, key1, function (prop) {
            // eslint-disable-next-line local/no-in-operator
            if ("messageText" in message) {
                programDiagnostics.add((0, ts_1.createDiagnosticForNodeFromMessageChain)(options.configFile, onKey ? prop.name : prop.initializer, message));
            }
            else {
                programDiagnostics.add(ts_1.createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([options.configFile, onKey ? prop.name : prop.initializer, message], args, false)));
            }
            needsCompilerDiagnostic = true;
        }, key2);
        return needsCompilerDiagnostic;
    }
    /**
     * Only creates a diagnostic on the option key specified by `errorOnOption`.
     * If both options are specified in the program in separate config files via `extends`,
     * a diagnostic is only created if `errorOnOption` is specified in the leaf config file.
     * Useful if `redundantWithOption` represents a superset of the functionality of `errorOnOption`:
     * if a user inherits `errorOnOption` from a base config file, it's still valid and useful to
     * override it in the leaf config file.
     */
    function createRedundantOptionDiagnostic(errorOnOption, redundantWithOption) {
        var compilerOptionsObjectLiteralSyntax = getCompilerOptionsObjectLiteralSyntax();
        if (compilerOptionsObjectLiteralSyntax) {
            // This is a no-op if `errorOnOption` isn't present in the leaf config file.
            createOptionDiagnosticInObjectLiteralSyntax(compilerOptionsObjectLiteralSyntax, /*onKey*/ true, errorOnOption, /*key2*/ undefined, ts_1.Diagnostics.Option_0_is_redundant_and_cannot_be_specified_with_option_1, errorOnOption, redundantWithOption);
        }
        else {
            // There was no config file, so both options were specified on the command line.
            createDiagnosticForOptionName(ts_1.Diagnostics.Option_0_is_redundant_and_cannot_be_specified_with_option_1, errorOnOption, redundantWithOption);
        }
    }
    function blockEmittingOfFile(emitFileName, diag) {
        hasEmitBlockingDiagnostics.set(toPath(emitFileName), true);
        programDiagnostics.add(diag);
    }
    function isEmittedFile(file) {
        if (options.noEmit) {
            return false;
        }
        // If this is source file, its not emitted file
        var filePath = toPath(file);
        if (getSourceFileByPath(filePath)) {
            return false;
        }
        // If options have --outFile or --out just check that
        var out = (0, ts_1.outFile)(options);
        if (out) {
            return isSameFile(filePath, out) || isSameFile(filePath, (0, ts_1.removeFileExtension)(out) + ".d.ts" /* Extension.Dts */);
        }
        // If declarationDir is specified, return if its a file in that directory
        if (options.declarationDir && (0, ts_1.containsPath)(options.declarationDir, filePath, currentDirectory, !host.useCaseSensitiveFileNames())) {
            return true;
        }
        // If --outDir, check if file is in that directory
        if (options.outDir) {
            return (0, ts_1.containsPath)(options.outDir, filePath, currentDirectory, !host.useCaseSensitiveFileNames());
        }
        if ((0, ts_1.fileExtensionIsOneOf)(filePath, ts_1.supportedJSExtensionsFlat) || (0, ts_1.isDeclarationFileName)(filePath)) {
            // Otherwise just check if sourceFile with the name exists
            var filePathWithoutExtension = (0, ts_1.removeFileExtension)(filePath);
            return !!getSourceFileByPath((filePathWithoutExtension + ".ts" /* Extension.Ts */)) ||
                !!getSourceFileByPath((filePathWithoutExtension + ".tsx" /* Extension.Tsx */));
        }
        return false;
    }
    function isSameFile(file1, file2) {
        return (0, ts_1.comparePaths)(file1, file2, currentDirectory, !host.useCaseSensitiveFileNames()) === 0 /* Comparison.EqualTo */;
    }
    function getSymlinkCache() {
        if (host.getSymlinkCache) {
            return host.getSymlinkCache();
        }
        if (!symlinks) {
            symlinks = (0, ts_1.createSymlinkCache)(currentDirectory, getCanonicalFileName);
        }
        if (files && automaticTypeDirectiveResolutions && !symlinks.hasProcessedResolutions()) {
            symlinks.setSymlinksFromResolutions(files, automaticTypeDirectiveResolutions);
        }
        return symlinks;
    }
}
exports.createProgram = createProgram;
function updateHostForUseSourceOfProjectReferenceRedirect(host) {
    var setOfDeclarationDirectories;
    var originalFileExists = host.compilerHost.fileExists;
    var originalDirectoryExists = host.compilerHost.directoryExists;
    var originalGetDirectories = host.compilerHost.getDirectories;
    var originalRealpath = host.compilerHost.realpath;
    if (!host.useSourceOfProjectReferenceRedirect)
        return { onProgramCreateComplete: ts_1.noop, fileExists: fileExists };
    host.compilerHost.fileExists = fileExists;
    var directoryExists;
    if (originalDirectoryExists) {
        // This implementation of directoryExists checks if the directory being requested is
        // directory of .d.ts file for the referenced Project.
        // If it is it returns true irrespective of whether that directory exists on host
        directoryExists = host.compilerHost.directoryExists = function (path) {
            if (originalDirectoryExists.call(host.compilerHost, path)) {
                handleDirectoryCouldBeSymlink(path);
                return true;
            }
            if (!host.getResolvedProjectReferences())
                return false;
            if (!setOfDeclarationDirectories) {
                setOfDeclarationDirectories = new Set();
                host.forEachResolvedProjectReference(function (ref) {
                    var out = (0, ts_1.outFile)(ref.commandLine.options);
                    if (out) {
                        setOfDeclarationDirectories.add((0, ts_1.getDirectoryPath)(host.toPath(out)));
                    }
                    else {
                        // Set declaration's in different locations only, if they are next to source the directory present doesnt change
                        var declarationDir = ref.commandLine.options.declarationDir || ref.commandLine.options.outDir;
                        if (declarationDir) {
                            setOfDeclarationDirectories.add(host.toPath(declarationDir));
                        }
                    }
                });
            }
            return fileOrDirectoryExistsUsingSource(path, /*isFile*/ false);
        };
    }
    if (originalGetDirectories) {
        // Call getDirectories only if directory actually present on the host
        // This is needed to ensure that we arent getting directories that we fake about presence for
        host.compilerHost.getDirectories = function (path) {
            return !host.getResolvedProjectReferences() || (originalDirectoryExists && originalDirectoryExists.call(host.compilerHost, path)) ?
                originalGetDirectories.call(host.compilerHost, path) :
                [];
        };
    }
    // This is something we keep for life time of the host
    if (originalRealpath) {
        host.compilerHost.realpath = function (s) {
            var _a;
            return ((_a = host.getSymlinkCache().getSymlinkedFiles()) === null || _a === void 0 ? void 0 : _a.get(host.toPath(s))) ||
                originalRealpath.call(host.compilerHost, s);
        };
    }
    return { onProgramCreateComplete: onProgramCreateComplete, fileExists: fileExists, directoryExists: directoryExists };
    function onProgramCreateComplete() {
        host.compilerHost.fileExists = originalFileExists;
        host.compilerHost.directoryExists = originalDirectoryExists;
        host.compilerHost.getDirectories = originalGetDirectories;
        // DO not revert realpath as it could be used later
    }
    // This implementation of fileExists checks if the file being requested is
    // .d.ts file for the referenced Project.
    // If it is it returns true irrespective of whether that file exists on host
    function fileExists(file) {
        if (originalFileExists.call(host.compilerHost, file))
            return true;
        if (!host.getResolvedProjectReferences())
            return false;
        if (!(0, ts_1.isDeclarationFileName)(file))
            return false;
        // Project references go to source file instead of .d.ts file
        return fileOrDirectoryExistsUsingSource(file, /*isFile*/ true);
    }
    function fileExistsIfProjectReferenceDts(file) {
        var source = host.getSourceOfProjectReferenceRedirect(host.toPath(file));
        return source !== undefined ?
            (0, ts_1.isString)(source) ? originalFileExists.call(host.compilerHost, source) : true :
            undefined;
    }
    function directoryExistsIfProjectReferenceDeclDir(dir) {
        var dirPath = host.toPath(dir);
        var dirPathWithTrailingDirectorySeparator = "".concat(dirPath).concat(ts_1.directorySeparator);
        return (0, ts_1.forEachKey)(setOfDeclarationDirectories, function (declDirPath) { return dirPath === declDirPath ||
            // Any parent directory of declaration dir
            (0, ts_1.startsWith)(declDirPath, dirPathWithTrailingDirectorySeparator) ||
            // Any directory inside declaration dir
            (0, ts_1.startsWith)(dirPath, "".concat(declDirPath, "/")); });
    }
    function handleDirectoryCouldBeSymlink(directory) {
        var _a;
        if (!host.getResolvedProjectReferences() || (0, ts_1.containsIgnoredPath)(directory))
            return;
        // Because we already watch node_modules, handle symlinks in there
        if (!originalRealpath || !(0, ts_1.stringContains)(directory, ts_1.nodeModulesPathPart))
            return;
        var symlinkCache = host.getSymlinkCache();
        var directoryPath = (0, ts_1.ensureTrailingDirectorySeparator)(host.toPath(directory));
        if ((_a = symlinkCache.getSymlinkedDirectories()) === null || _a === void 0 ? void 0 : _a.has(directoryPath))
            return;
        var real = (0, ts_1.normalizePath)(originalRealpath.call(host.compilerHost, directory));
        var realPath;
        if (real === directory ||
            (realPath = (0, ts_1.ensureTrailingDirectorySeparator)(host.toPath(real))) === directoryPath) {
            // not symlinked
            symlinkCache.setSymlinkedDirectory(directoryPath, false);
            return;
        }
        symlinkCache.setSymlinkedDirectory(directory, {
            real: (0, ts_1.ensureTrailingDirectorySeparator)(real),
            realPath: realPath
        });
    }
    function fileOrDirectoryExistsUsingSource(fileOrDirectory, isFile) {
        var _a;
        var fileOrDirectoryExistsUsingSource = isFile ?
            function (file) { return fileExistsIfProjectReferenceDts(file); } :
            function (dir) { return directoryExistsIfProjectReferenceDeclDir(dir); };
        // Check current directory or file
        var result = fileOrDirectoryExistsUsingSource(fileOrDirectory);
        if (result !== undefined)
            return result;
        var symlinkCache = host.getSymlinkCache();
        var symlinkedDirectories = symlinkCache.getSymlinkedDirectories();
        if (!symlinkedDirectories)
            return false;
        var fileOrDirectoryPath = host.toPath(fileOrDirectory);
        if (!(0, ts_1.stringContains)(fileOrDirectoryPath, ts_1.nodeModulesPathPart))
            return false;
        if (isFile && ((_a = symlinkCache.getSymlinkedFiles()) === null || _a === void 0 ? void 0 : _a.has(fileOrDirectoryPath)))
            return true;
        // If it contains node_modules check if its one of the symlinked path we know of
        return (0, ts_1.firstDefinedIterator)(symlinkedDirectories.entries(), function (_a) {
            var directoryPath = _a[0], symlinkedDirectory = _a[1];
            if (!symlinkedDirectory || !(0, ts_1.startsWith)(fileOrDirectoryPath, directoryPath))
                return undefined;
            var result = fileOrDirectoryExistsUsingSource(fileOrDirectoryPath.replace(directoryPath, symlinkedDirectory.realPath));
            if (isFile && result) {
                // Store the real path for the file'
                var absolutePath = (0, ts_1.getNormalizedAbsolutePath)(fileOrDirectory, host.compilerHost.getCurrentDirectory());
                symlinkCache.setSymlinkedFile(fileOrDirectoryPath, "".concat(symlinkedDirectory.real).concat(absolutePath.replace(new RegExp(directoryPath, "i"), "")));
            }
            return result;
        }) || false;
    }
}
/** @internal */
exports.emitSkippedWithNoDiagnostics = { diagnostics: ts_1.emptyArray, sourceMaps: undefined, emittedFiles: undefined, emitSkipped: true };
/** @internal */
function handleNoEmitOptions(program, sourceFile, writeFile, cancellationToken) {
    var options = program.getCompilerOptions();
    if (options.noEmit) {
        // Cache the semantic diagnostics
        program.getSemanticDiagnostics(sourceFile, cancellationToken);
        return sourceFile || (0, ts_1.outFile)(options) ?
            exports.emitSkippedWithNoDiagnostics :
            program.emitBuildInfo(writeFile, cancellationToken);
    }
    // If the noEmitOnError flag is set, then check if we have any errors so far.  If so,
    // immediately bail out.  Note that we pass 'undefined' for 'sourceFile' so that we
    // get any preEmit diagnostics, not just the ones
    if (!options.noEmitOnError)
        return undefined;
    var diagnostics = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], program.getOptionsDiagnostics(cancellationToken), true), program.getSyntacticDiagnostics(sourceFile, cancellationToken), true), program.getGlobalDiagnostics(cancellationToken), true), program.getSemanticDiagnostics(sourceFile, cancellationToken), true);
    if (diagnostics.length === 0 && (0, ts_1.getEmitDeclarations)(program.getCompilerOptions())) {
        diagnostics = program.getDeclarationDiagnostics(/*sourceFile*/ undefined, cancellationToken);
    }
    if (!diagnostics.length)
        return undefined;
    var emittedFiles;
    if (!sourceFile && !(0, ts_1.outFile)(options)) {
        var emitResult = program.emitBuildInfo(writeFile, cancellationToken);
        if (emitResult.diagnostics)
            diagnostics = __spreadArray(__spreadArray([], diagnostics, true), emitResult.diagnostics, true);
        emittedFiles = emitResult.emittedFiles;
    }
    return { diagnostics: diagnostics, sourceMaps: undefined, emittedFiles: emittedFiles, emitSkipped: true };
}
exports.handleNoEmitOptions = handleNoEmitOptions;
/** @internal */
function filterSemanticDiagnostics(diagnostic, option) {
    return (0, ts_1.filter)(diagnostic, function (d) { return !d.skippedOn || !option[d.skippedOn]; });
}
exports.filterSemanticDiagnostics = filterSemanticDiagnostics;
/** @internal */
function parseConfigHostFromCompilerHostLike(host, directoryStructureHost) {
    if (directoryStructureHost === void 0) { directoryStructureHost = host; }
    return {
        fileExists: function (f) { return directoryStructureHost.fileExists(f); },
        readDirectory: function (root, extensions, excludes, includes, depth) {
            ts_1.Debug.assertIsDefined(directoryStructureHost.readDirectory, "'CompilerHost.readDirectory' must be implemented to correctly process 'projectReferences'");
            return directoryStructureHost.readDirectory(root, extensions, excludes, includes, depth);
        },
        readFile: function (f) { return directoryStructureHost.readFile(f); },
        useCaseSensitiveFileNames: host.useCaseSensitiveFileNames(),
        getCurrentDirectory: function () { return host.getCurrentDirectory(); },
        onUnRecoverableConfigFileDiagnostic: host.onUnRecoverableConfigFileDiagnostic || ts_1.returnUndefined,
        trace: host.trace ? function (s) { return host.trace(s); } : undefined
    };
}
exports.parseConfigHostFromCompilerHostLike = parseConfigHostFromCompilerHostLike;
/** @deprecated @internal */
function createPrependNodes(projectReferences, getCommandLine, readFile, host) {
    if (!projectReferences)
        return ts_1.emptyArray;
    var nodes;
    for (var i = 0; i < projectReferences.length; i++) {
        var ref = projectReferences[i];
        var resolvedRefOpts = getCommandLine(ref, i);
        if (ref.prepend && resolvedRefOpts && resolvedRefOpts.options) {
            var out = (0, ts_1.outFile)(resolvedRefOpts.options);
            // Upstream project didn't have outFile set -- skip (error will have been issued earlier)
            if (!out)
                continue;
            var _a = (0, ts_1.getOutputPathsForBundle)(resolvedRefOpts.options, /*forceDtsPaths*/ true), jsFilePath = _a.jsFilePath, sourceMapFilePath = _a.sourceMapFilePath, declarationFilePath = _a.declarationFilePath, declarationMapPath = _a.declarationMapPath, buildInfoPath = _a.buildInfoPath;
            var node = (0, ts_1.createInputFilesWithFilePaths)(readFile, jsFilePath, sourceMapFilePath, declarationFilePath, declarationMapPath, buildInfoPath, host, resolvedRefOpts.options);
            (nodes || (nodes = [])).push(node);
        }
    }
    return nodes || ts_1.emptyArray;
}
exports.createPrependNodes = createPrependNodes;
/**
 * Returns the target config filename of a project reference.
 * Note: The file might not exist.
 */
function resolveProjectReferencePath(ref) {
    return (0, ts_1.resolveConfigFileProjectName)(ref.path);
}
exports.resolveProjectReferencePath = resolveProjectReferencePath;
/**
 * Returns a DiagnosticMessage if we won't include a resolved module due to its extension.
 * The DiagnosticMessage's parameters are the imported module name, and the filename it resolved to.
 * This returns a diagnostic even if the module will be an untyped module.
 *
 * @internal
 */
function getResolutionDiagnostic(options, _a, _b) {
    var extension = _a.extension;
    var isDeclarationFile = _b.isDeclarationFile;
    switch (extension) {
        case ".ts" /* Extension.Ts */:
        case ".d.ts" /* Extension.Dts */:
        case ".mts" /* Extension.Mts */:
        case ".d.mts" /* Extension.Dmts */:
        case ".cts" /* Extension.Cts */:
        case ".d.cts" /* Extension.Dcts */:
            // These are always allowed.
            return undefined;
        case ".tsx" /* Extension.Tsx */:
            return needJsx();
        case ".jsx" /* Extension.Jsx */:
            return needJsx() || needAllowJs();
        case ".js" /* Extension.Js */:
        case ".mjs" /* Extension.Mjs */:
        case ".cjs" /* Extension.Cjs */:
            return needAllowJs();
        case ".json" /* Extension.Json */:
            return needResolveJsonModule();
        default:
            return needAllowArbitraryExtensions();
    }
    function needJsx() {
        return options.jsx ? undefined : ts_1.Diagnostics.Module_0_was_resolved_to_1_but_jsx_is_not_set;
    }
    function needAllowJs() {
        return (0, ts_1.getAllowJSCompilerOption)(options) || !(0, ts_1.getStrictOptionValue)(options, "noImplicitAny") ? undefined : ts_1.Diagnostics.Could_not_find_a_declaration_file_for_module_0_1_implicitly_has_an_any_type;
    }
    function needResolveJsonModule() {
        return (0, ts_1.getResolveJsonModule)(options) ? undefined : ts_1.Diagnostics.Module_0_was_resolved_to_1_but_resolveJsonModule_is_not_used;
    }
    function needAllowArbitraryExtensions() {
        // But don't report the allowArbitraryExtensions error from declaration files (no reason to report it, since the import doesn't have a runtime component)
        return isDeclarationFile || options.allowArbitraryExtensions ? undefined : ts_1.Diagnostics.Module_0_was_resolved_to_1_but_allowArbitraryExtensions_is_not_set;
    }
}
exports.getResolutionDiagnostic = getResolutionDiagnostic;
function getModuleNames(_a) {
    var imports = _a.imports, moduleAugmentations = _a.moduleAugmentations;
    var res = imports.map(function (i) { return i; });
    for (var _i = 0, moduleAugmentations_1 = moduleAugmentations; _i < moduleAugmentations_1.length; _i++) {
        var aug = moduleAugmentations_1[_i];
        if (aug.kind === 11 /* SyntaxKind.StringLiteral */) {
            res.push(aug);
        }
        // Do nothing if it's an Identifier; we don't need to do module resolution for `declare global`.
    }
    return res;
}
/** @internal */
function getModuleNameStringLiteralAt(_a, index) {
    var imports = _a.imports, moduleAugmentations = _a.moduleAugmentations;
    if (index < imports.length)
        return imports[index];
    var augIndex = imports.length;
    for (var _i = 0, moduleAugmentations_2 = moduleAugmentations; _i < moduleAugmentations_2.length; _i++) {
        var aug = moduleAugmentations_2[_i];
        if (aug.kind === 11 /* SyntaxKind.StringLiteral */) {
            if (index === augIndex)
                return aug;
            augIndex++;
        }
        // Do nothing if it's an Identifier; we don't need to do module resolution for `declare global`.
    }
    ts_1.Debug.fail("should never ask for module name at index higher than possible module name");
}
exports.getModuleNameStringLiteralAt = getModuleNameStringLiteralAt;
