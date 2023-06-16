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
exports.createPrinter = exports.createPrinterWithRemoveCommentsOmitTrailingSemicolon = exports.createPrinterWithRemoveCommentsNeverAsciiEscape = exports.createPrinterWithRemoveComments = exports.createPrinterWithDefaults = exports.emitUsingBuildInfo = exports.notImplementedResolver = exports.getBuildInfo = exports.getBuildInfoText = exports.createBuildInfo = exports.emitFiles = exports.getFirstProjectOutput = exports.getOutputFileNames = exports.getAllProjectOutputs = exports.getCommonSourceDirectoryOfConfig = exports.getCommonSourceDirectory = exports.getOutputDeclarationFileName = exports.getOutputExtension = exports.getOutputPathsFor = exports.getOutputPathsForBundle = exports.getTsBuildInfoEmitOutputFilePath = exports.forEachEmittedFile = exports.isBuildInfoFile = void 0;
var ts = require("./_namespaces/ts");
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
var brackets = createBracketsMap();
/** @internal */
function isBuildInfoFile(file) {
    return (0, ts_1.fileExtensionIs)(file, ".tsbuildinfo" /* Extension.TsBuildInfo */);
}
exports.isBuildInfoFile = isBuildInfoFile;
/**
 * Iterates over the source files that are expected to have an emit output.
 *
 * @param host An EmitHost.
 * @param action The action to execute.
 * @param sourceFilesOrTargetSourceFile
 *   If an array, the full list of source files to emit.
 *   Else, calls `getSourceFilesToEmit` with the (optional) target source file to determine the list of source files to emit.
 *
 * @internal
 */
function forEachEmittedFile(host, action, sourceFilesOrTargetSourceFile, forceDtsEmit, onlyBuildInfo, includeBuildInfo) {
    if (forceDtsEmit === void 0) { forceDtsEmit = false; }
    var sourceFiles = (0, ts_1.isArray)(sourceFilesOrTargetSourceFile) ? sourceFilesOrTargetSourceFile : (0, ts_1.getSourceFilesToEmit)(host, sourceFilesOrTargetSourceFile, forceDtsEmit);
    var options = host.getCompilerOptions();
    if ((0, ts_1.outFile)(options)) {
        var prepends = host.getPrependNodes();
        if (sourceFiles.length || prepends.length) {
            var bundle = ts_1.factory.createBundle(sourceFiles, prepends);
            var result = action(getOutputPathsFor(bundle, host, forceDtsEmit), bundle);
            if (result) {
                return result;
            }
        }
    }
    else {
        if (!onlyBuildInfo) {
            for (var _a = 0, sourceFiles_1 = sourceFiles; _a < sourceFiles_1.length; _a++) {
                var sourceFile = sourceFiles_1[_a];
                var result = action(getOutputPathsFor(sourceFile, host, forceDtsEmit), sourceFile);
                if (result) {
                    return result;
                }
            }
        }
        if (includeBuildInfo) {
            var buildInfoPath = getTsBuildInfoEmitOutputFilePath(options);
            if (buildInfoPath)
                return action({ buildInfoPath: buildInfoPath }, /*sourceFileOrBundle*/ undefined);
        }
    }
}
exports.forEachEmittedFile = forEachEmittedFile;
function getTsBuildInfoEmitOutputFilePath(options) {
    var configFile = options.configFilePath;
    if (!(0, ts_1.isIncrementalCompilation)(options))
        return undefined;
    if (options.tsBuildInfoFile)
        return options.tsBuildInfoFile;
    var outPath = (0, ts_1.outFile)(options);
    var buildInfoExtensionLess;
    if (outPath) {
        buildInfoExtensionLess = (0, ts_1.removeFileExtension)(outPath);
    }
    else {
        if (!configFile)
            return undefined;
        var configFileExtensionLess = (0, ts_1.removeFileExtension)(configFile);
        buildInfoExtensionLess = options.outDir ?
            options.rootDir ?
                (0, ts_1.resolvePath)(options.outDir, (0, ts_1.getRelativePathFromDirectory)(options.rootDir, configFileExtensionLess, /*ignoreCase*/ true)) :
                (0, ts_1.combinePaths)(options.outDir, (0, ts_1.getBaseFileName)(configFileExtensionLess)) :
            configFileExtensionLess;
    }
    return buildInfoExtensionLess + ".tsbuildinfo" /* Extension.TsBuildInfo */;
}
exports.getTsBuildInfoEmitOutputFilePath = getTsBuildInfoEmitOutputFilePath;
/** @internal */
function getOutputPathsForBundle(options, forceDtsPaths) {
    var outPath = (0, ts_1.outFile)(options);
    var jsFilePath = options.emitDeclarationOnly ? undefined : outPath;
    var sourceMapFilePath = jsFilePath && getSourceMapFilePath(jsFilePath, options);
    var declarationFilePath = (forceDtsPaths || (0, ts_1.getEmitDeclarations)(options)) ? (0, ts_1.removeFileExtension)(outPath) + ".d.ts" /* Extension.Dts */ : undefined;
    var declarationMapPath = declarationFilePath && (0, ts_1.getAreDeclarationMapsEnabled)(options) ? declarationFilePath + ".map" : undefined;
    var buildInfoPath = getTsBuildInfoEmitOutputFilePath(options);
    return { jsFilePath: jsFilePath, sourceMapFilePath: sourceMapFilePath, declarationFilePath: declarationFilePath, declarationMapPath: declarationMapPath, buildInfoPath: buildInfoPath };
}
exports.getOutputPathsForBundle = getOutputPathsForBundle;
/** @internal */
function getOutputPathsFor(sourceFile, host, forceDtsPaths) {
    var options = host.getCompilerOptions();
    if (sourceFile.kind === 312 /* SyntaxKind.Bundle */) {
        return getOutputPathsForBundle(options, forceDtsPaths);
    }
    else {
        var ownOutputFilePath = (0, ts_1.getOwnEmitOutputFilePath)(sourceFile.fileName, host, getOutputExtension(sourceFile.fileName, options));
        var isJsonFile = (0, ts_1.isJsonSourceFile)(sourceFile);
        // If json file emits to the same location skip writing it, if emitDeclarationOnly skip writing it
        var isJsonEmittedToSameLocation = isJsonFile &&
            (0, ts_1.comparePaths)(sourceFile.fileName, ownOutputFilePath, host.getCurrentDirectory(), !host.useCaseSensitiveFileNames()) === 0 /* Comparison.EqualTo */;
        var jsFilePath = options.emitDeclarationOnly || isJsonEmittedToSameLocation ? undefined : ownOutputFilePath;
        var sourceMapFilePath = !jsFilePath || (0, ts_1.isJsonSourceFile)(sourceFile) ? undefined : getSourceMapFilePath(jsFilePath, options);
        var declarationFilePath = (forceDtsPaths || ((0, ts_1.getEmitDeclarations)(options) && !isJsonFile)) ? (0, ts_1.getDeclarationEmitOutputFilePath)(sourceFile.fileName, host) : undefined;
        var declarationMapPath = declarationFilePath && (0, ts_1.getAreDeclarationMapsEnabled)(options) ? declarationFilePath + ".map" : undefined;
        return { jsFilePath: jsFilePath, sourceMapFilePath: sourceMapFilePath, declarationFilePath: declarationFilePath, declarationMapPath: declarationMapPath, buildInfoPath: undefined };
    }
}
exports.getOutputPathsFor = getOutputPathsFor;
function getSourceMapFilePath(jsFilePath, options) {
    return (options.sourceMap && !options.inlineSourceMap) ? jsFilePath + ".map" : undefined;
}
/** @internal */
function getOutputExtension(fileName, options) {
    return (0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */) ? ".json" /* Extension.Json */ :
        options.jsx === 1 /* JsxEmit.Preserve */ && (0, ts_1.fileExtensionIsOneOf)(fileName, [".jsx" /* Extension.Jsx */, ".tsx" /* Extension.Tsx */]) ? ".jsx" /* Extension.Jsx */ :
            (0, ts_1.fileExtensionIsOneOf)(fileName, [".mts" /* Extension.Mts */, ".mjs" /* Extension.Mjs */]) ? ".mjs" /* Extension.Mjs */ :
                (0, ts_1.fileExtensionIsOneOf)(fileName, [".cts" /* Extension.Cts */, ".cjs" /* Extension.Cjs */]) ? ".cjs" /* Extension.Cjs */ :
                    ".js" /* Extension.Js */;
}
exports.getOutputExtension = getOutputExtension;
function getOutputPathWithoutChangingExt(inputFileName, configFile, ignoreCase, outputDir, getCommonSourceDirectory) {
    return outputDir ?
        (0, ts_1.resolvePath)(outputDir, (0, ts_1.getRelativePathFromDirectory)(getCommonSourceDirectory ? getCommonSourceDirectory() : getCommonSourceDirectoryOfConfig(configFile, ignoreCase), inputFileName, ignoreCase)) :
        inputFileName;
}
/** @internal */
function getOutputDeclarationFileName(inputFileName, configFile, ignoreCase, getCommonSourceDirectory) {
    return (0, ts_1.changeExtension)(getOutputPathWithoutChangingExt(inputFileName, configFile, ignoreCase, configFile.options.declarationDir || configFile.options.outDir, getCommonSourceDirectory), (0, ts_1.getDeclarationEmitExtensionForPath)(inputFileName));
}
exports.getOutputDeclarationFileName = getOutputDeclarationFileName;
function getOutputJSFileName(inputFileName, configFile, ignoreCase, getCommonSourceDirectory) {
    if (configFile.options.emitDeclarationOnly)
        return undefined;
    var isJsonFile = (0, ts_1.fileExtensionIs)(inputFileName, ".json" /* Extension.Json */);
    var outputFileName = (0, ts_1.changeExtension)(getOutputPathWithoutChangingExt(inputFileName, configFile, ignoreCase, configFile.options.outDir, getCommonSourceDirectory), getOutputExtension(inputFileName, configFile.options));
    return !isJsonFile || (0, ts_1.comparePaths)(inputFileName, outputFileName, ts_1.Debug.checkDefined(configFile.options.configFilePath), ignoreCase) !== 0 /* Comparison.EqualTo */ ?
        outputFileName :
        undefined;
}
function createAddOutput() {
    var outputs;
    return { addOutput: addOutput, getOutputs: getOutputs };
    function addOutput(path) {
        if (path) {
            (outputs || (outputs = [])).push(path);
        }
    }
    function getOutputs() {
        return outputs || ts_1.emptyArray;
    }
}
function getSingleOutputFileNames(configFile, addOutput) {
    var _a = getOutputPathsForBundle(configFile.options, /*forceDtsPaths*/ false), jsFilePath = _a.jsFilePath, sourceMapFilePath = _a.sourceMapFilePath, declarationFilePath = _a.declarationFilePath, declarationMapPath = _a.declarationMapPath, buildInfoPath = _a.buildInfoPath;
    addOutput(jsFilePath);
    addOutput(sourceMapFilePath);
    addOutput(declarationFilePath);
    addOutput(declarationMapPath);
    addOutput(buildInfoPath);
}
function getOwnOutputFileNames(configFile, inputFileName, ignoreCase, addOutput, getCommonSourceDirectory) {
    if ((0, ts_1.isDeclarationFileName)(inputFileName))
        return;
    var js = getOutputJSFileName(inputFileName, configFile, ignoreCase, getCommonSourceDirectory);
    addOutput(js);
    if ((0, ts_1.fileExtensionIs)(inputFileName, ".json" /* Extension.Json */))
        return;
    if (js && configFile.options.sourceMap) {
        addOutput("".concat(js, ".map"));
    }
    if ((0, ts_1.getEmitDeclarations)(configFile.options)) {
        var dts = getOutputDeclarationFileName(inputFileName, configFile, ignoreCase, getCommonSourceDirectory);
        addOutput(dts);
        if (configFile.options.declarationMap) {
            addOutput("".concat(dts, ".map"));
        }
    }
}
/** @internal */
function getCommonSourceDirectory(options, emittedFiles, currentDirectory, getCanonicalFileName, checkSourceFilesBelongToPath) {
    var commonSourceDirectory;
    if (options.rootDir) {
        // If a rootDir is specified use it as the commonSourceDirectory
        commonSourceDirectory = (0, ts_1.getNormalizedAbsolutePath)(options.rootDir, currentDirectory);
        checkSourceFilesBelongToPath === null || checkSourceFilesBelongToPath === void 0 ? void 0 : checkSourceFilesBelongToPath(options.rootDir);
    }
    else if (options.composite && options.configFilePath) {
        // Project compilations never infer their root from the input source paths
        commonSourceDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.normalizeSlashes)(options.configFilePath));
        checkSourceFilesBelongToPath === null || checkSourceFilesBelongToPath === void 0 ? void 0 : checkSourceFilesBelongToPath(commonSourceDirectory);
    }
    else {
        commonSourceDirectory = (0, ts_1.computeCommonSourceDirectoryOfFilenames)(emittedFiles(), currentDirectory, getCanonicalFileName);
    }
    if (commonSourceDirectory && commonSourceDirectory[commonSourceDirectory.length - 1] !== ts_1.directorySeparator) {
        // Make sure directory path ends with directory separator so this string can directly
        // used to replace with "" to get the relative path of the source file and the relative path doesn't
        // start with / making it rooted path
        commonSourceDirectory += ts_1.directorySeparator;
    }
    return commonSourceDirectory;
}
exports.getCommonSourceDirectory = getCommonSourceDirectory;
/** @internal */
function getCommonSourceDirectoryOfConfig(_a, ignoreCase) {
    var options = _a.options, fileNames = _a.fileNames;
    return getCommonSourceDirectory(options, function () { return (0, ts_1.filter)(fileNames, function (file) { return !(options.noEmitForJsFiles && (0, ts_1.fileExtensionIsOneOf)(file, ts_1.supportedJSExtensionsFlat)) && !(0, ts_1.isDeclarationFileName)(file); }); }, (0, ts_1.getDirectoryPath)((0, ts_1.normalizeSlashes)(ts_1.Debug.checkDefined(options.configFilePath))), (0, ts_1.createGetCanonicalFileName)(!ignoreCase));
}
exports.getCommonSourceDirectoryOfConfig = getCommonSourceDirectoryOfConfig;
/** @internal */
function getAllProjectOutputs(configFile, ignoreCase) {
    var _a = createAddOutput(), addOutput = _a.addOutput, getOutputs = _a.getOutputs;
    if ((0, ts_1.outFile)(configFile.options)) {
        getSingleOutputFileNames(configFile, addOutput);
    }
    else {
        var getCommonSourceDirectory_1 = (0, ts_1.memoize)(function () { return getCommonSourceDirectoryOfConfig(configFile, ignoreCase); });
        for (var _b = 0, _c = configFile.fileNames; _b < _c.length; _b++) {
            var inputFileName = _c[_b];
            getOwnOutputFileNames(configFile, inputFileName, ignoreCase, addOutput, getCommonSourceDirectory_1);
        }
        addOutput(getTsBuildInfoEmitOutputFilePath(configFile.options));
    }
    return getOutputs();
}
exports.getAllProjectOutputs = getAllProjectOutputs;
function getOutputFileNames(commandLine, inputFileName, ignoreCase) {
    inputFileName = (0, ts_1.normalizePath)(inputFileName);
    ts_1.Debug.assert((0, ts_1.contains)(commandLine.fileNames, inputFileName), "Expected fileName to be present in command line");
    var _a = createAddOutput(), addOutput = _a.addOutput, getOutputs = _a.getOutputs;
    if ((0, ts_1.outFile)(commandLine.options)) {
        getSingleOutputFileNames(commandLine, addOutput);
    }
    else {
        getOwnOutputFileNames(commandLine, inputFileName, ignoreCase, addOutput);
    }
    return getOutputs();
}
exports.getOutputFileNames = getOutputFileNames;
/** @internal */
function getFirstProjectOutput(configFile, ignoreCase) {
    if ((0, ts_1.outFile)(configFile.options)) {
        var _a = getOutputPathsForBundle(configFile.options, /*forceDtsPaths*/ false), jsFilePath = _a.jsFilePath, declarationFilePath = _a.declarationFilePath;
        return ts_1.Debug.checkDefined(jsFilePath || declarationFilePath, "project ".concat(configFile.options.configFilePath, " expected to have at least one output"));
    }
    var getCommonSourceDirectory = (0, ts_1.memoize)(function () { return getCommonSourceDirectoryOfConfig(configFile, ignoreCase); });
    for (var _b = 0, _c = configFile.fileNames; _b < _c.length; _b++) {
        var inputFileName = _c[_b];
        if ((0, ts_1.isDeclarationFileName)(inputFileName))
            continue;
        var jsFilePath = getOutputJSFileName(inputFileName, configFile, ignoreCase, getCommonSourceDirectory);
        if (jsFilePath)
            return jsFilePath;
        if ((0, ts_1.fileExtensionIs)(inputFileName, ".json" /* Extension.Json */))
            continue;
        if ((0, ts_1.getEmitDeclarations)(configFile.options)) {
            return getOutputDeclarationFileName(inputFileName, configFile, ignoreCase, getCommonSourceDirectory);
        }
    }
    var buildInfoPath = getTsBuildInfoEmitOutputFilePath(configFile.options);
    if (buildInfoPath)
        return buildInfoPath;
    return ts_1.Debug.fail("project ".concat(configFile.options.configFilePath, " expected to have at least one output"));
}
exports.getFirstProjectOutput = getFirstProjectOutput;
/** @internal */
// targetSourceFile is when users only want one file in entire project to be emitted. This is used in compileOnSave feature
function emitFiles(resolver, host, targetSourceFile, _a, emitOnly, onlyBuildInfo, forceDtsEmit) {
    var scriptTransformers = _a.scriptTransformers, declarationTransformers = _a.declarationTransformers;
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var compilerOptions = host.getCompilerOptions();
    var sourceMapDataList = (compilerOptions.sourceMap || compilerOptions.inlineSourceMap || (0, ts_1.getAreDeclarationMapsEnabled)(compilerOptions)) ? [] : undefined;
    var emittedFilesList = compilerOptions.listEmittedFiles ? [] : undefined;
    var emitterDiagnostics = (0, ts_1.createDiagnosticCollection)();
    var newLine = (0, ts_1.getNewLineCharacter)(compilerOptions);
    var writer = (0, ts_1.createTextWriter)(newLine);
    var _b = performance.createTimer("printTime", "beforePrint", "afterPrint"), enter = _b.enter, exit = _b.exit;
    var bundleBuildInfo;
    var emitSkipped = false;
    /* eslint-enable no-var */
    // Emit each output file
    enter();
    forEachEmittedFile(host, emitSourceFileOrBundle, (0, ts_1.getSourceFilesToEmit)(host, targetSourceFile, forceDtsEmit), forceDtsEmit, onlyBuildInfo, !targetSourceFile);
    exit();
    return {
        emitSkipped: emitSkipped,
        diagnostics: emitterDiagnostics.getDiagnostics(),
        emittedFiles: emittedFilesList,
        sourceMaps: sourceMapDataList,
    };
    function emitSourceFileOrBundle(_a, sourceFileOrBundle) {
        var jsFilePath = _a.jsFilePath, sourceMapFilePath = _a.sourceMapFilePath, declarationFilePath = _a.declarationFilePath, declarationMapPath = _a.declarationMapPath, buildInfoPath = _a.buildInfoPath;
        var buildInfoDirectory;
        if (buildInfoPath && sourceFileOrBundle && (0, ts_1.isBundle)(sourceFileOrBundle)) {
            buildInfoDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(buildInfoPath, host.getCurrentDirectory()));
            bundleBuildInfo = {
                commonSourceDirectory: relativeToBuildInfo(host.getCommonSourceDirectory()),
                sourceFiles: sourceFileOrBundle.sourceFiles.map(function (file) { return relativeToBuildInfo((0, ts_1.getNormalizedAbsolutePath)(file.fileName, host.getCurrentDirectory())); })
            };
        }
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "emitJsFileOrBundle", { jsFilePath: jsFilePath });
        emitJsFileOrBundle(sourceFileOrBundle, jsFilePath, sourceMapFilePath, relativeToBuildInfo);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "emitDeclarationFileOrBundle", { declarationFilePath: declarationFilePath });
        emitDeclarationFileOrBundle(sourceFileOrBundle, declarationFilePath, declarationMapPath, relativeToBuildInfo);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "emitBuildInfo", { buildInfoPath: buildInfoPath });
        emitBuildInfo(bundleBuildInfo, buildInfoPath);
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
        if (!emitSkipped && emittedFilesList) {
            if (!emitOnly) {
                if (jsFilePath) {
                    emittedFilesList.push(jsFilePath);
                }
                if (sourceMapFilePath) {
                    emittedFilesList.push(sourceMapFilePath);
                }
                if (buildInfoPath) {
                    emittedFilesList.push(buildInfoPath);
                }
            }
            if (emitOnly !== 0 /* EmitOnly.Js */) {
                if (declarationFilePath) {
                    emittedFilesList.push(declarationFilePath);
                }
                if (declarationMapPath) {
                    emittedFilesList.push(declarationMapPath);
                }
            }
        }
        function relativeToBuildInfo(path) {
            return (0, ts_1.ensurePathIsNonModuleName)((0, ts_1.getRelativePathFromDirectory)(buildInfoDirectory, path, host.getCanonicalFileName));
        }
    }
    function emitBuildInfo(bundle, buildInfoPath) {
        // Write build information if applicable
        if (!buildInfoPath || targetSourceFile || emitSkipped)
            return;
        if (host.isEmitBlocked(buildInfoPath)) {
            emitSkipped = true;
            return;
        }
        var buildInfo = host.getBuildInfo(bundle) || createBuildInfo(/*program*/ undefined, bundle);
        // Pass buildinfo as additional data to avoid having to reparse
        (0, ts_1.writeFile)(host, emitterDiagnostics, buildInfoPath, getBuildInfoText(buildInfo), /*writeByteOrderMark*/ false, /*sourceFiles*/ undefined, { buildInfo: buildInfo });
    }
    function emitJsFileOrBundle(sourceFileOrBundle, jsFilePath, sourceMapFilePath, relativeToBuildInfo) {
        if (!sourceFileOrBundle || emitOnly || !jsFilePath) {
            return;
        }
        // Make sure not to write js file and source map file if any of them cannot be written
        if (host.isEmitBlocked(jsFilePath) || compilerOptions.noEmit) {
            emitSkipped = true;
            return;
        }
        // Transform the source files
        var transform = (0, ts_1.transformNodes)(resolver, host, ts_1.factory, compilerOptions, [sourceFileOrBundle], scriptTransformers, /*allowDtsFiles*/ false);
        var printerOptions = {
            removeComments: compilerOptions.removeComments,
            newLine: compilerOptions.newLine,
            noEmitHelpers: compilerOptions.noEmitHelpers,
            module: compilerOptions.module,
            target: compilerOptions.target,
            sourceMap: compilerOptions.sourceMap,
            inlineSourceMap: compilerOptions.inlineSourceMap,
            inlineSources: compilerOptions.inlineSources,
            extendedDiagnostics: compilerOptions.extendedDiagnostics,
            writeBundleFileInfo: !!bundleBuildInfo,
            relativeToBuildInfo: relativeToBuildInfo
        };
        // Create a printer to print the nodes
        var printer = createPrinter(printerOptions, {
            // resolver hooks
            hasGlobalName: resolver.hasGlobalName,
            // transform hooks
            onEmitNode: transform.emitNodeWithNotification,
            isEmitNotificationEnabled: transform.isEmitNotificationEnabled,
            substituteNode: transform.substituteNode,
        });
        ts_1.Debug.assert(transform.transformed.length === 1, "Should only see one output from the transform");
        printSourceFileOrBundle(jsFilePath, sourceMapFilePath, transform, printer, compilerOptions);
        // Clean up emit nodes on parse tree
        transform.dispose();
        if (bundleBuildInfo)
            bundleBuildInfo.js = printer.bundleFileInfo;
    }
    function emitDeclarationFileOrBundle(sourceFileOrBundle, declarationFilePath, declarationMapPath, relativeToBuildInfo) {
        if (!sourceFileOrBundle || emitOnly === 0 /* EmitOnly.Js */)
            return;
        if (!declarationFilePath) {
            if (emitOnly || compilerOptions.emitDeclarationOnly)
                emitSkipped = true;
            return;
        }
        var sourceFiles = (0, ts_1.isSourceFile)(sourceFileOrBundle) ? [sourceFileOrBundle] : sourceFileOrBundle.sourceFiles;
        var filesForEmit = forceDtsEmit ? sourceFiles : (0, ts_1.filter)(sourceFiles, ts_1.isSourceFileNotJson);
        // Setup and perform the transformation to retrieve declarations from the input files
        var inputListOrBundle = (0, ts_1.outFile)(compilerOptions) ? [ts_1.factory.createBundle(filesForEmit, !(0, ts_1.isSourceFile)(sourceFileOrBundle) ? sourceFileOrBundle.prepends : undefined)] : filesForEmit;
        if (emitOnly && !(0, ts_1.getEmitDeclarations)(compilerOptions)) {
            // Checker wont collect the linked aliases since thats only done when declaration is enabled.
            // Do that here when emitting only dts files
            filesForEmit.forEach(collectLinkedAliases);
        }
        var declarationTransform = (0, ts_1.transformNodes)(resolver, host, ts_1.factory, compilerOptions, inputListOrBundle, declarationTransformers, /*allowDtsFiles*/ false);
        if ((0, ts_1.length)(declarationTransform.diagnostics)) {
            for (var _a = 0, _b = declarationTransform.diagnostics; _a < _b.length; _a++) {
                var diagnostic = _b[_a];
                emitterDiagnostics.add(diagnostic);
            }
        }
        var printerOptions = {
            removeComments: compilerOptions.removeComments,
            newLine: compilerOptions.newLine,
            noEmitHelpers: true,
            module: compilerOptions.module,
            target: compilerOptions.target,
            sourceMap: !forceDtsEmit && compilerOptions.declarationMap,
            inlineSourceMap: compilerOptions.inlineSourceMap,
            extendedDiagnostics: compilerOptions.extendedDiagnostics,
            onlyPrintJsDocStyle: true,
            writeBundleFileInfo: !!bundleBuildInfo,
            recordInternalSection: !!bundleBuildInfo,
            relativeToBuildInfo: relativeToBuildInfo
        };
        var declarationPrinter = createPrinter(printerOptions, {
            // resolver hooks
            hasGlobalName: resolver.hasGlobalName,
            // transform hooks
            onEmitNode: declarationTransform.emitNodeWithNotification,
            isEmitNotificationEnabled: declarationTransform.isEmitNotificationEnabled,
            substituteNode: declarationTransform.substituteNode,
        });
        var declBlocked = (!!declarationTransform.diagnostics && !!declarationTransform.diagnostics.length) || !!host.isEmitBlocked(declarationFilePath) || !!compilerOptions.noEmit;
        emitSkipped = emitSkipped || declBlocked;
        if (!declBlocked || forceDtsEmit) {
            ts_1.Debug.assert(declarationTransform.transformed.length === 1, "Should only see one output from the decl transform");
            printSourceFileOrBundle(declarationFilePath, declarationMapPath, declarationTransform, declarationPrinter, {
                sourceMap: printerOptions.sourceMap,
                sourceRoot: compilerOptions.sourceRoot,
                mapRoot: compilerOptions.mapRoot,
                extendedDiagnostics: compilerOptions.extendedDiagnostics,
                // Explicitly do not passthru either `inline` option
            });
        }
        declarationTransform.dispose();
        if (bundleBuildInfo)
            bundleBuildInfo.dts = declarationPrinter.bundleFileInfo;
    }
    function collectLinkedAliases(node) {
        if ((0, ts_1.isExportAssignment)(node)) {
            if (node.expression.kind === 80 /* SyntaxKind.Identifier */) {
                resolver.collectLinkedAliases(node.expression, /*setVisibility*/ true);
            }
            return;
        }
        else if ((0, ts_1.isExportSpecifier)(node)) {
            resolver.collectLinkedAliases(node.propertyName || node.name, /*setVisibility*/ true);
            return;
        }
        (0, ts_1.forEachChild)(node, collectLinkedAliases);
    }
    function printSourceFileOrBundle(jsFilePath, sourceMapFilePath, transform, printer, mapOptions) {
        var sourceFileOrBundle = transform.transformed[0];
        var bundle = sourceFileOrBundle.kind === 312 /* SyntaxKind.Bundle */ ? sourceFileOrBundle : undefined;
        var sourceFile = sourceFileOrBundle.kind === 311 /* SyntaxKind.SourceFile */ ? sourceFileOrBundle : undefined;
        var sourceFiles = bundle ? bundle.sourceFiles : [sourceFile];
        var sourceMapGenerator;
        if (shouldEmitSourceMaps(mapOptions, sourceFileOrBundle)) {
            sourceMapGenerator = (0, ts_1.createSourceMapGenerator)(host, (0, ts_1.getBaseFileName)((0, ts_1.normalizeSlashes)(jsFilePath)), getSourceRoot(mapOptions), getSourceMapDirectory(mapOptions, jsFilePath, sourceFile), mapOptions);
        }
        if (bundle) {
            printer.writeBundle(bundle, writer, sourceMapGenerator);
        }
        else {
            printer.writeFile(sourceFile, writer, sourceMapGenerator);
        }
        var sourceMapUrlPos;
        if (sourceMapGenerator) {
            if (sourceMapDataList) {
                sourceMapDataList.push({
                    inputSourceFileNames: sourceMapGenerator.getSources(),
                    sourceMap: sourceMapGenerator.toJSON()
                });
            }
            var sourceMappingURL = getSourceMappingURL(mapOptions, sourceMapGenerator, jsFilePath, sourceMapFilePath, sourceFile);
            if (sourceMappingURL) {
                if (!writer.isAtStartOfLine())
                    writer.rawWrite(newLine);
                sourceMapUrlPos = writer.getTextPos();
                writer.writeComment("//# ".concat("sourceMappingURL", "=").concat(sourceMappingURL)); // Tools can sometimes see this line as a source mapping url comment
            }
            // Write the source map
            if (sourceMapFilePath) {
                var sourceMap = sourceMapGenerator.toString();
                (0, ts_1.writeFile)(host, emitterDiagnostics, sourceMapFilePath, sourceMap, /*writeByteOrderMark*/ false, sourceFiles);
                if (printer.bundleFileInfo)
                    printer.bundleFileInfo.mapHash = (0, ts_1.computeSignature)(sourceMap, host);
            }
        }
        else {
            writer.writeLine();
        }
        // Write the output file
        var text = writer.getText();
        (0, ts_1.writeFile)(host, emitterDiagnostics, jsFilePath, text, !!compilerOptions.emitBOM, sourceFiles, { sourceMapUrlPos: sourceMapUrlPos, diagnostics: transform.diagnostics });
        // We store the hash of the text written in the buildinfo to ensure that text of the referenced d.ts file is same as whats in the buildinfo
        // This is needed because incremental can be toggled between two runs and we might use stale file text to do text manipulation in prepend mode
        if (printer.bundleFileInfo)
            printer.bundleFileInfo.hash = (0, ts_1.computeSignature)(text, host);
        // Reset state
        writer.clear();
    }
    function shouldEmitSourceMaps(mapOptions, sourceFileOrBundle) {
        return (mapOptions.sourceMap || mapOptions.inlineSourceMap)
            && (sourceFileOrBundle.kind !== 311 /* SyntaxKind.SourceFile */ || !(0, ts_1.fileExtensionIs)(sourceFileOrBundle.fileName, ".json" /* Extension.Json */));
    }
    function getSourceRoot(mapOptions) {
        // Normalize source root and make sure it has trailing "/" so that it can be used to combine paths with the
        // relative paths of the sources list in the sourcemap
        var sourceRoot = (0, ts_1.normalizeSlashes)(mapOptions.sourceRoot || "");
        return sourceRoot ? (0, ts_1.ensureTrailingDirectorySeparator)(sourceRoot) : sourceRoot;
    }
    function getSourceMapDirectory(mapOptions, filePath, sourceFile) {
        if (mapOptions.sourceRoot)
            return host.getCommonSourceDirectory();
        if (mapOptions.mapRoot) {
            var sourceMapDir = (0, ts_1.normalizeSlashes)(mapOptions.mapRoot);
            if (sourceFile) {
                // For modules or multiple emit files the mapRoot will have directory structure like the sources
                // So if src\a.ts and src\lib\b.ts are compiled together user would be moving the maps into mapRoot\a.js.map and mapRoot\lib\b.js.map
                sourceMapDir = (0, ts_1.getDirectoryPath)((0, ts_1.getSourceFilePathInNewDir)(sourceFile.fileName, host, sourceMapDir));
            }
            if ((0, ts_1.getRootLength)(sourceMapDir) === 0) {
                // The relative paths are relative to the common directory
                sourceMapDir = (0, ts_1.combinePaths)(host.getCommonSourceDirectory(), sourceMapDir);
            }
            return sourceMapDir;
        }
        return (0, ts_1.getDirectoryPath)((0, ts_1.normalizePath)(filePath));
    }
    function getSourceMappingURL(mapOptions, sourceMapGenerator, filePath, sourceMapFilePath, sourceFile) {
        if (mapOptions.inlineSourceMap) {
            // Encode the sourceMap into the sourceMap url
            var sourceMapText = sourceMapGenerator.toString();
            var base64SourceMapText = (0, ts_1.base64encode)(ts_1.sys, sourceMapText);
            return "data:application/json;base64,".concat(base64SourceMapText);
        }
        var sourceMapFile = (0, ts_1.getBaseFileName)((0, ts_1.normalizeSlashes)(ts_1.Debug.checkDefined(sourceMapFilePath)));
        if (mapOptions.mapRoot) {
            var sourceMapDir = (0, ts_1.normalizeSlashes)(mapOptions.mapRoot);
            if (sourceFile) {
                // For modules or multiple emit files the mapRoot will have directory structure like the sources
                // So if src\a.ts and src\lib\b.ts are compiled together user would be moving the maps into mapRoot\a.js.map and mapRoot\lib\b.js.map
                sourceMapDir = (0, ts_1.getDirectoryPath)((0, ts_1.getSourceFilePathInNewDir)(sourceFile.fileName, host, sourceMapDir));
            }
            if ((0, ts_1.getRootLength)(sourceMapDir) === 0) {
                // The relative paths are relative to the common directory
                sourceMapDir = (0, ts_1.combinePaths)(host.getCommonSourceDirectory(), sourceMapDir);
                return encodeURI((0, ts_1.getRelativePathToDirectoryOrUrl)((0, ts_1.getDirectoryPath)((0, ts_1.normalizePath)(filePath)), // get the relative sourceMapDir path based on jsFilePath
                (0, ts_1.combinePaths)(sourceMapDir, sourceMapFile), // this is where user expects to see sourceMap
                host.getCurrentDirectory(), host.getCanonicalFileName, 
                /*isAbsolutePathAnUrl*/ true));
            }
            else {
                return encodeURI((0, ts_1.combinePaths)(sourceMapDir, sourceMapFile));
            }
        }
        return encodeURI(sourceMapFile);
    }
}
exports.emitFiles = emitFiles;
/** @internal */
function createBuildInfo(program, bundle) {
    return { bundle: bundle, program: program, version: ts_1.version };
}
exports.createBuildInfo = createBuildInfo;
/** @internal */
function getBuildInfoText(buildInfo) {
    return JSON.stringify(buildInfo);
}
exports.getBuildInfoText = getBuildInfoText;
/** @internal */
function getBuildInfo(buildInfoFile, buildInfoText) {
    return (0, ts_1.readJsonOrUndefined)(buildInfoFile, buildInfoText);
}
exports.getBuildInfo = getBuildInfo;
/** @internal */
exports.notImplementedResolver = {
    hasGlobalName: ts_1.notImplemented,
    getReferencedExportContainer: ts_1.notImplemented,
    getReferencedImportDeclaration: ts_1.notImplemented,
    getReferencedDeclarationWithCollidingName: ts_1.notImplemented,
    isDeclarationWithCollidingName: ts_1.notImplemented,
    isValueAliasDeclaration: ts_1.notImplemented,
    isReferencedAliasDeclaration: ts_1.notImplemented,
    isTopLevelValueImportEqualsWithEntityName: ts_1.notImplemented,
    getNodeCheckFlags: ts_1.notImplemented,
    isDeclarationVisible: ts_1.notImplemented,
    isLateBound: function (_node) { return false; },
    collectLinkedAliases: ts_1.notImplemented,
    isImplementationOfOverload: ts_1.notImplemented,
    isRequiredInitializedParameter: ts_1.notImplemented,
    isOptionalUninitializedParameterProperty: ts_1.notImplemented,
    isExpandoFunctionDeclaration: ts_1.notImplemented,
    getPropertiesOfContainerFunction: ts_1.notImplemented,
    createTypeOfDeclaration: ts_1.notImplemented,
    createReturnTypeOfSignatureDeclaration: ts_1.notImplemented,
    createTypeOfExpression: ts_1.notImplemented,
    createLiteralConstValue: ts_1.notImplemented,
    isSymbolAccessible: ts_1.notImplemented,
    isEntityNameVisible: ts_1.notImplemented,
    // Returns the constant value this property access resolves to: notImplemented, or 'undefined' for a non-constant
    getConstantValue: ts_1.notImplemented,
    getReferencedValueDeclaration: ts_1.notImplemented,
    getReferencedValueDeclarations: ts_1.notImplemented,
    getTypeReferenceSerializationKind: ts_1.notImplemented,
    isOptionalParameter: ts_1.notImplemented,
    moduleExportsSomeValue: ts_1.notImplemented,
    isArgumentsLocalBinding: ts_1.notImplemented,
    getExternalModuleFileFromDeclaration: ts_1.notImplemented,
    getTypeReferenceDirectivesForEntityName: ts_1.notImplemented,
    getTypeReferenceDirectivesForSymbol: ts_1.notImplemented,
    isLiteralConstDeclaration: ts_1.notImplemented,
    getJsxFactoryEntity: ts_1.notImplemented,
    getJsxFragmentFactoryEntity: ts_1.notImplemented,
    getAllAccessorDeclarations: ts_1.notImplemented,
    getSymbolOfExternalModuleSpecifier: ts_1.notImplemented,
    isBindingCapturedByNode: ts_1.notImplemented,
    getDeclarationStatementsForSourceFile: ts_1.notImplemented,
    isImportRequiredByAugmentation: ts_1.notImplemented,
};
function createSourceFilesFromBundleBuildInfo(bundle, buildInfoDirectory, host) {
    var _a;
    var jsBundle = ts_1.Debug.checkDefined(bundle.js);
    var prologueMap = ((_a = jsBundle.sources) === null || _a === void 0 ? void 0 : _a.prologues) && (0, ts_1.arrayToMap)(jsBundle.sources.prologues, function (prologueInfo) { return prologueInfo.file; });
    return bundle.sourceFiles.map(function (fileName, index) {
        var _a, _b;
        var prologueInfo = prologueMap === null || prologueMap === void 0 ? void 0 : prologueMap.get(index);
        var statements = prologueInfo === null || prologueInfo === void 0 ? void 0 : prologueInfo.directives.map(function (directive) {
            var literal = (0, ts_1.setTextRange)(ts_1.factory.createStringLiteral(directive.expression.text), directive.expression);
            var statement = (0, ts_1.setTextRange)(ts_1.factory.createExpressionStatement(literal), directive);
            (0, ts_1.setParent)(literal, statement);
            return statement;
        });
        var eofToken = ts_1.factory.createToken(1 /* SyntaxKind.EndOfFileToken */);
        var sourceFile = ts_1.factory.createSourceFile(statements !== null && statements !== void 0 ? statements : [], eofToken, 0 /* NodeFlags.None */);
        sourceFile.fileName = (0, ts_1.getRelativePathFromDirectory)(host.getCurrentDirectory(), (0, ts_1.getNormalizedAbsolutePath)(fileName, buildInfoDirectory), !host.useCaseSensitiveFileNames());
        sourceFile.text = (_a = prologueInfo === null || prologueInfo === void 0 ? void 0 : prologueInfo.text) !== null && _a !== void 0 ? _a : "";
        (0, ts_1.setTextRangePosWidth)(sourceFile, 0, (_b = prologueInfo === null || prologueInfo === void 0 ? void 0 : prologueInfo.text.length) !== null && _b !== void 0 ? _b : 0);
        (0, ts_1.setEachParent)(sourceFile.statements, sourceFile);
        (0, ts_1.setTextRangePosWidth)(eofToken, sourceFile.end, 0);
        (0, ts_1.setParent)(eofToken, sourceFile);
        return sourceFile;
    });
}
/** @deprecated @internal */
function emitUsingBuildInfo(config, host, getCommandLine, customTransformers) {
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "emitUsingBuildInfo", {}, /*separateBeginAndEnd*/ true);
    performance.mark("beforeEmit");
    var result = emitUsingBuildInfoWorker(config, host, getCommandLine, customTransformers);
    performance.mark("afterEmit");
    performance.measure("Emit", "beforeEmit", "afterEmit");
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    return result;
}
exports.emitUsingBuildInfo = emitUsingBuildInfo;
function emitUsingBuildInfoWorker(config, host, getCommandLine, customTransformers) {
    var _a = getOutputPathsForBundle(config.options, /*forceDtsPaths*/ false), buildInfoPath = _a.buildInfoPath, jsFilePath = _a.jsFilePath, sourceMapFilePath = _a.sourceMapFilePath, declarationFilePath = _a.declarationFilePath, declarationMapPath = _a.declarationMapPath;
    // If host directly provides buildinfo we can get it directly. This allows host to cache the buildinfo
    var buildInfo = host.getBuildInfo(buildInfoPath, config.options.configFilePath);
    if (!buildInfo)
        return buildInfoPath;
    if (!buildInfo.bundle || !buildInfo.bundle.js || (declarationFilePath && !buildInfo.bundle.dts))
        return buildInfoPath;
    var jsFileText = host.readFile(ts_1.Debug.checkDefined(jsFilePath));
    if (!jsFileText)
        return jsFilePath;
    // If the jsFileText is not same has what it was created with, tsbuildinfo is stale so dont use it
    if ((0, ts_1.computeSignature)(jsFileText, host) !== buildInfo.bundle.js.hash)
        return jsFilePath;
    var sourceMapText = sourceMapFilePath && host.readFile(sourceMapFilePath);
    // error if no source map or for now if inline sourcemap
    if ((sourceMapFilePath && !sourceMapText) || config.options.inlineSourceMap)
        return sourceMapFilePath || "inline sourcemap decoding";
    if (sourceMapFilePath && (0, ts_1.computeSignature)(sourceMapText, host) !== buildInfo.bundle.js.mapHash)
        return sourceMapFilePath;
    // read declaration text
    var declarationText = declarationFilePath && host.readFile(declarationFilePath);
    if (declarationFilePath && !declarationText)
        return declarationFilePath;
    if (declarationFilePath && (0, ts_1.computeSignature)(declarationText, host) !== buildInfo.bundle.dts.hash)
        return declarationFilePath;
    var declarationMapText = declarationMapPath && host.readFile(declarationMapPath);
    // error if no source map or for now if inline sourcemap
    if ((declarationMapPath && !declarationMapText) || config.options.inlineSourceMap)
        return declarationMapPath || "inline sourcemap decoding";
    if (declarationMapPath && (0, ts_1.computeSignature)(declarationMapText, host) !== buildInfo.bundle.dts.mapHash)
        return declarationMapPath;
    var buildInfoDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(buildInfoPath, host.getCurrentDirectory()));
    var ownPrependInput = (0, ts_1.createInputFilesWithFileTexts)(jsFilePath, jsFileText, sourceMapFilePath, sourceMapText, declarationFilePath, declarationText, declarationMapPath, declarationMapText, buildInfoPath, buildInfo, 
    /*oldFileOfCurrentEmit*/ true);
    var outputFiles = [];
    var prependNodes = (0, ts_1.createPrependNodes)(config.projectReferences, getCommandLine, function (f) { return host.readFile(f); }, host);
    var sourceFilesForJsEmit = createSourceFilesFromBundleBuildInfo(buildInfo.bundle, buildInfoDirectory, host);
    var changedDtsText;
    var changedDtsData;
    var emitHost = {
        getPrependNodes: (0, ts_1.memoize)(function () { return __spreadArray(__spreadArray([], prependNodes, true), [ownPrependInput], false); }),
        getCanonicalFileName: host.getCanonicalFileName,
        getCommonSourceDirectory: function () { return (0, ts_1.getNormalizedAbsolutePath)(buildInfo.bundle.commonSourceDirectory, buildInfoDirectory); },
        getCompilerOptions: function () { return config.options; },
        getCurrentDirectory: function () { return host.getCurrentDirectory(); },
        getSourceFile: ts_1.returnUndefined,
        getSourceFileByPath: ts_1.returnUndefined,
        getSourceFiles: function () { return sourceFilesForJsEmit; },
        getLibFileFromReference: ts_1.notImplemented,
        isSourceFileFromExternalLibrary: ts_1.returnFalse,
        getResolvedProjectReferenceToRedirect: ts_1.returnUndefined,
        getProjectReferenceRedirect: ts_1.returnUndefined,
        isSourceOfProjectReferenceRedirect: ts_1.returnFalse,
        writeFile: function (name, text, writeByteOrderMark, _onError, _sourceFiles, data) {
            switch (name) {
                case jsFilePath:
                    if (jsFileText === text)
                        return;
                    break;
                case sourceMapFilePath:
                    if (sourceMapText === text)
                        return;
                    break;
                case buildInfoPath:
                    break;
                case declarationFilePath:
                    if (declarationText === text)
                        return;
                    changedDtsText = text;
                    changedDtsData = data;
                    break;
                case declarationMapPath:
                    if (declarationMapText === text)
                        return;
                    break;
                default:
                    ts_1.Debug.fail("Unexpected path: ".concat(name));
            }
            outputFiles.push({ name: name, text: text, writeByteOrderMark: writeByteOrderMark, data: data });
        },
        isEmitBlocked: ts_1.returnFalse,
        readFile: function (f) { return host.readFile(f); },
        fileExists: function (f) { return host.fileExists(f); },
        useCaseSensitiveFileNames: function () { return host.useCaseSensitiveFileNames(); },
        getBuildInfo: function (bundle) {
            var program = buildInfo.program;
            if (program && changedDtsText !== undefined && config.options.composite) {
                // Update the output signature
                program.outSignature = (0, ts_1.computeSignature)(changedDtsText, host, changedDtsData);
            }
            // Update sourceFileInfo
            var _a = buildInfo.bundle, js = _a.js, dts = _a.dts, sourceFiles = _a.sourceFiles;
            bundle.js.sources = js.sources;
            if (dts) {
                bundle.dts.sources = dts.sources;
            }
            bundle.sourceFiles = sourceFiles;
            return createBuildInfo(program, bundle);
        },
        getSourceFileFromReference: ts_1.returnUndefined,
        redirectTargetsMap: (0, ts_1.createMultiMap)(),
        getFileIncludeReasons: ts_1.notImplemented,
        createHash: (0, ts_1.maybeBind)(host, host.createHash),
    };
    emitFiles(exports.notImplementedResolver, emitHost, 
    /*targetSourceFile*/ undefined, (0, ts_1.getTransformers)(config.options, customTransformers));
    return outputFiles;
}
/** @internal */
exports.createPrinterWithDefaults = (0, ts_1.memoize)(function () { return createPrinter({}); });
/** @internal */
exports.createPrinterWithRemoveComments = (0, ts_1.memoize)(function () { return createPrinter({ removeComments: true }); });
/** @internal */
exports.createPrinterWithRemoveCommentsNeverAsciiEscape = (0, ts_1.memoize)(function () { return createPrinter({ removeComments: true, neverAsciiEscape: true }); });
/** @internal */
exports.createPrinterWithRemoveCommentsOmitTrailingSemicolon = (0, ts_1.memoize)(function () { return createPrinter({ removeComments: true, omitTrailingSemicolon: true }); });
function createPrinter(printerOptions, handlers) {
    if (printerOptions === void 0) { printerOptions = {}; }
    if (handlers === void 0) { handlers = {}; }
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var hasGlobalName = handlers.hasGlobalName, _a = handlers.onEmitNode, onEmitNode = _a === void 0 ? ts_1.noEmitNotification : _a, isEmitNotificationEnabled = handlers.isEmitNotificationEnabled, _b = handlers.substituteNode, substituteNode = _b === void 0 ? ts_1.noEmitSubstitution : _b, onBeforeEmitNode = handlers.onBeforeEmitNode, onAfterEmitNode = handlers.onAfterEmitNode, onBeforeEmitNodeArray = handlers.onBeforeEmitNodeArray, onAfterEmitNodeArray = handlers.onAfterEmitNodeArray, onBeforeEmitToken = handlers.onBeforeEmitToken, onAfterEmitToken = handlers.onAfterEmitToken;
    var extendedDiagnostics = !!printerOptions.extendedDiagnostics;
    var newLine = (0, ts_1.getNewLineCharacter)(printerOptions);
    var moduleKind = (0, ts_1.getEmitModuleKind)(printerOptions);
    var bundledHelpers = new Map();
    var currentSourceFile;
    var nodeIdToGeneratedName; // Map of generated names for specific nodes.
    var nodeIdToGeneratedPrivateName; // Map of generated names for specific nodes.
    var autoGeneratedIdToGeneratedName; // Map of generated names for temp and loop variables.
    var generatedNames; // Set of names generated by the NameGenerator.
    var formattedNameTempFlagsStack;
    var formattedNameTempFlags;
    var privateNameTempFlagsStack; // Stack of enclosing name generation scopes.
    var privateNameTempFlags; // TempFlags for the current name generation scope.
    var tempFlagsStack; // Stack of enclosing name generation scopes.
    var tempFlags; // TempFlags for the current name generation scope.
    var reservedNamesStack; // Stack of reserved names in enclosing name generation scopes.
    var reservedNames; // Names reserved in nested name generation scopes.
    var reservedPrivateNamesStack; // Stack of reserved member names in enclosing name generation scopes.
    var reservedPrivateNames; // Member names reserved in nested name generation scopes.
    var preserveSourceNewlines = printerOptions.preserveSourceNewlines; // Can be overridden inside nodes with the `IgnoreSourceNewlines` emit flag.
    var nextListElementPos; // See comment in `getLeadingLineTerminatorCount`.
    var writer;
    var ownWriter; // Reusable `EmitTextWriter` for basic printing.
    var write = writeBase;
    var isOwnFileEmit;
    var bundleFileInfo = printerOptions.writeBundleFileInfo ? { sections: [] } : undefined;
    var relativeToBuildInfo = bundleFileInfo ? ts_1.Debug.checkDefined(printerOptions.relativeToBuildInfo) : undefined;
    var recordInternalSection = printerOptions.recordInternalSection;
    var sourceFileTextPos = 0;
    var sourceFileTextKind = "text" /* BundleFileSectionKind.Text */;
    // Source Maps
    var sourceMapsDisabled = true;
    var sourceMapGenerator;
    var sourceMapSource;
    var sourceMapSourceIndex = -1;
    var mostRecentlyAddedSourceMapSource;
    var mostRecentlyAddedSourceMapSourceIndex = -1;
    // Comments
    var containerPos = -1;
    var containerEnd = -1;
    var declarationListContainerEnd = -1;
    var currentLineMap;
    var detachedCommentsInfo;
    var hasWrittenComment = false;
    var commentsDisabled = !!printerOptions.removeComments;
    var lastSubstitution;
    var currentParenthesizerRule;
    var _c = performance.createTimerIf(extendedDiagnostics, "commentTime", "beforeComment", "afterComment"), enterComment = _c.enter, exitComment = _c.exit;
    var parenthesizer = ts_1.factory.parenthesizer;
    var typeArgumentParenthesizerRuleSelector = {
        select: function (index) { return index === 0 ? parenthesizer.parenthesizeLeadingTypeArgument : undefined; }
    };
    var emitBinaryExpression = createEmitBinaryExpression();
    /* eslint-enable no-var */
    reset();
    return {
        // public API
        printNode: printNode,
        printList: printList,
        printFile: printFile,
        printBundle: printBundle,
        // internal API
        writeNode: writeNode,
        writeList: writeList,
        writeFile: writeFile,
        writeBundle: writeBundle,
        bundleFileInfo: bundleFileInfo
    };
    function printNode(hint, node, sourceFile) {
        switch (hint) {
            case 0 /* EmitHint.SourceFile */:
                ts_1.Debug.assert((0, ts_1.isSourceFile)(node), "Expected a SourceFile node.");
                break;
            case 2 /* EmitHint.IdentifierName */:
                ts_1.Debug.assert((0, ts_1.isIdentifier)(node), "Expected an Identifier node.");
                break;
            case 1 /* EmitHint.Expression */:
                ts_1.Debug.assert((0, ts_1.isExpression)(node), "Expected an Expression node.");
                break;
        }
        switch (node.kind) {
            case 311 /* SyntaxKind.SourceFile */: return printFile(node);
            case 312 /* SyntaxKind.Bundle */: return printBundle(node);
            case 313 /* SyntaxKind.UnparsedSource */: return printUnparsedSource(node);
        }
        writeNode(hint, node, sourceFile, beginPrint());
        return endPrint();
    }
    function printList(format, nodes, sourceFile) {
        writeList(format, nodes, sourceFile, beginPrint());
        return endPrint();
    }
    function printBundle(bundle) {
        writeBundle(bundle, beginPrint(), /*sourceMapGenerator*/ undefined);
        return endPrint();
    }
    function printFile(sourceFile) {
        writeFile(sourceFile, beginPrint(), /*sourceMapGenerator*/ undefined);
        return endPrint();
    }
    function printUnparsedSource(unparsed) {
        writeUnparsedSource(unparsed, beginPrint());
        return endPrint();
    }
    function writeNode(hint, node, sourceFile, output) {
        var previousWriter = writer;
        setWriter(output, /*_sourceMapGenerator*/ undefined);
        print(hint, node, sourceFile);
        reset();
        writer = previousWriter;
    }
    function writeList(format, nodes, sourceFile, output) {
        var previousWriter = writer;
        setWriter(output, /*_sourceMapGenerator*/ undefined);
        if (sourceFile) {
            setSourceFile(sourceFile);
        }
        emitList(/*parentNode*/ undefined, nodes, format);
        reset();
        writer = previousWriter;
    }
    function getTextPosWithWriteLine() {
        return writer.getTextPosWithWriteLine ? writer.getTextPosWithWriteLine() : writer.getTextPos();
    }
    function updateOrPushBundleFileTextLike(pos, end, kind) {
        var last = (0, ts_1.lastOrUndefined)(bundleFileInfo.sections);
        if (last && last.kind === kind) {
            last.end = end;
        }
        else {
            bundleFileInfo.sections.push({ pos: pos, end: end, kind: kind });
        }
    }
    function recordBundleFileInternalSectionStart(node) {
        if (recordInternalSection &&
            bundleFileInfo &&
            currentSourceFile &&
            ((0, ts_1.isDeclaration)(node) || (0, ts_1.isVariableStatement)(node)) &&
            (0, ts_1.isInternalDeclaration)(node, currentSourceFile) &&
            sourceFileTextKind !== "internal" /* BundleFileSectionKind.Internal */) {
            var prevSourceFileTextKind = sourceFileTextKind;
            recordBundleFileTextLikeSection(writer.getTextPos());
            sourceFileTextPos = getTextPosWithWriteLine();
            sourceFileTextKind = "internal" /* BundleFileSectionKind.Internal */;
            return prevSourceFileTextKind;
        }
        return undefined;
    }
    function recordBundleFileInternalSectionEnd(prevSourceFileTextKind) {
        if (prevSourceFileTextKind) {
            recordBundleFileTextLikeSection(writer.getTextPos());
            sourceFileTextPos = getTextPosWithWriteLine();
            sourceFileTextKind = prevSourceFileTextKind;
        }
    }
    function recordBundleFileTextLikeSection(end) {
        if (sourceFileTextPos < end) {
            updateOrPushBundleFileTextLike(sourceFileTextPos, end, sourceFileTextKind);
            return true;
        }
        return false;
    }
    function writeBundle(bundle, output, sourceMapGenerator) {
        var _a;
        isOwnFileEmit = false;
        var previousWriter = writer;
        setWriter(output, sourceMapGenerator);
        emitShebangIfNeeded(bundle);
        emitPrologueDirectivesIfNeeded(bundle);
        emitHelpers(bundle);
        emitSyntheticTripleSlashReferencesIfNeeded(bundle);
        for (var _b = 0, _c = bundle.prepends; _b < _c.length; _b++) {
            var prepend = _c[_b];
            writeLine();
            var pos = writer.getTextPos();
            var savedSections = bundleFileInfo && bundleFileInfo.sections;
            if (savedSections)
                bundleFileInfo.sections = [];
            print(4 /* EmitHint.Unspecified */, prepend, /*sourceFile*/ undefined);
            if (bundleFileInfo) {
                var newSections = bundleFileInfo.sections;
                bundleFileInfo.sections = savedSections;
                if (prepend.oldFileOfCurrentEmit)
                    (_a = bundleFileInfo.sections).push.apply(_a, newSections);
                else {
                    newSections.forEach(function (section) { return ts_1.Debug.assert((0, ts_1.isBundleFileTextLike)(section)); });
                    bundleFileInfo.sections.push({
                        pos: pos,
                        end: writer.getTextPos(),
                        kind: "prepend" /* BundleFileSectionKind.Prepend */,
                        data: relativeToBuildInfo(prepend.fileName),
                        texts: newSections
                    });
                }
            }
        }
        sourceFileTextPos = getTextPosWithWriteLine();
        for (var _d = 0, _e = bundle.sourceFiles; _d < _e.length; _d++) {
            var sourceFile = _e[_d];
            print(0 /* EmitHint.SourceFile */, sourceFile, sourceFile);
        }
        if (bundleFileInfo && bundle.sourceFiles.length) {
            var end = writer.getTextPos();
            if (recordBundleFileTextLikeSection(end)) {
                // Store prologues
                var prologues = getPrologueDirectivesFromBundledSourceFiles(bundle);
                if (prologues) {
                    if (!bundleFileInfo.sources)
                        bundleFileInfo.sources = {};
                    bundleFileInfo.sources.prologues = prologues;
                }
                // Store helpes
                var helpers = getHelpersFromBundledSourceFiles(bundle);
                if (helpers) {
                    if (!bundleFileInfo.sources)
                        bundleFileInfo.sources = {};
                    bundleFileInfo.sources.helpers = helpers;
                }
            }
        }
        reset();
        writer = previousWriter;
    }
    function writeUnparsedSource(unparsed, output) {
        var previousWriter = writer;
        setWriter(output, /*_sourceMapGenerator*/ undefined);
        print(4 /* EmitHint.Unspecified */, unparsed, /*sourceFile*/ undefined);
        reset();
        writer = previousWriter;
    }
    function writeFile(sourceFile, output, sourceMapGenerator) {
        isOwnFileEmit = true;
        var previousWriter = writer;
        setWriter(output, sourceMapGenerator);
        emitShebangIfNeeded(sourceFile);
        emitPrologueDirectivesIfNeeded(sourceFile);
        print(0 /* EmitHint.SourceFile */, sourceFile, sourceFile);
        reset();
        writer = previousWriter;
    }
    function beginPrint() {
        return ownWriter || (ownWriter = (0, ts_1.createTextWriter)(newLine));
    }
    function endPrint() {
        var text = ownWriter.getText();
        ownWriter.clear();
        return text;
    }
    function print(hint, node, sourceFile) {
        if (sourceFile) {
            setSourceFile(sourceFile);
        }
        pipelineEmit(hint, node, /*parenthesizerRule*/ undefined);
    }
    function setSourceFile(sourceFile) {
        currentSourceFile = sourceFile;
        currentLineMap = undefined;
        detachedCommentsInfo = undefined;
        if (sourceFile) {
            setSourceMapSource(sourceFile);
        }
    }
    function setWriter(_writer, _sourceMapGenerator) {
        if (_writer && printerOptions.omitTrailingSemicolon) {
            _writer = (0, ts_1.getTrailingSemicolonDeferringWriter)(_writer);
        }
        writer = _writer; // TODO: GH#18217
        sourceMapGenerator = _sourceMapGenerator;
        sourceMapsDisabled = !writer || !sourceMapGenerator;
    }
    function reset() {
        nodeIdToGeneratedName = [];
        nodeIdToGeneratedPrivateName = [];
        autoGeneratedIdToGeneratedName = [];
        generatedNames = new Set();
        formattedNameTempFlagsStack = [];
        formattedNameTempFlags = new Map();
        privateNameTempFlagsStack = [];
        privateNameTempFlags = 0 /* TempFlags.Auto */;
        tempFlagsStack = [];
        tempFlags = 0 /* TempFlags.Auto */;
        reservedNamesStack = [];
        reservedNames = undefined;
        reservedPrivateNamesStack = [];
        reservedPrivateNames = undefined;
        currentSourceFile = undefined;
        currentLineMap = undefined;
        detachedCommentsInfo = undefined;
        setWriter(/*output*/ undefined, /*_sourceMapGenerator*/ undefined);
    }
    function getCurrentLineMap() {
        return currentLineMap || (currentLineMap = (0, ts_1.getLineStarts)(ts_1.Debug.checkDefined(currentSourceFile)));
    }
    function emit(node, parenthesizerRule) {
        if (node === undefined)
            return;
        var prevSourceFileTextKind = recordBundleFileInternalSectionStart(node);
        pipelineEmit(4 /* EmitHint.Unspecified */, node, parenthesizerRule);
        recordBundleFileInternalSectionEnd(prevSourceFileTextKind);
    }
    function emitIdentifierName(node) {
        if (node === undefined)
            return;
        pipelineEmit(2 /* EmitHint.IdentifierName */, node, /*parenthesizerRule*/ undefined);
    }
    function emitExpression(node, parenthesizerRule) {
        if (node === undefined)
            return;
        pipelineEmit(1 /* EmitHint.Expression */, node, parenthesizerRule);
    }
    function emitJsxAttributeValue(node) {
        pipelineEmit((0, ts_1.isStringLiteral)(node) ? 6 /* EmitHint.JsxAttributeValue */ : 4 /* EmitHint.Unspecified */, node);
    }
    function beforeEmitNode(node) {
        if (preserveSourceNewlines && ((0, ts_1.getInternalEmitFlags)(node) & 4 /* InternalEmitFlags.IgnoreSourceNewlines */)) {
            preserveSourceNewlines = false;
        }
    }
    function afterEmitNode(savedPreserveSourceNewlines) {
        preserveSourceNewlines = savedPreserveSourceNewlines;
    }
    function pipelineEmit(emitHint, node, parenthesizerRule) {
        currentParenthesizerRule = parenthesizerRule;
        var pipelinePhase = getPipelinePhase(0 /* PipelinePhase.Notification */, emitHint, node);
        pipelinePhase(emitHint, node);
        currentParenthesizerRule = undefined;
    }
    function shouldEmitComments(node) {
        return !commentsDisabled && !(0, ts_1.isSourceFile)(node);
    }
    function shouldEmitSourceMaps(node) {
        return !sourceMapsDisabled &&
            !(0, ts_1.isSourceFile)(node) &&
            !(0, ts_1.isInJsonFile)(node) &&
            !(0, ts_1.isUnparsedSource)(node) &&
            !(0, ts_1.isUnparsedPrepend)(node);
    }
    function getPipelinePhase(phase, emitHint, node) {
        switch (phase) {
            case 0 /* PipelinePhase.Notification */:
                if (onEmitNode !== ts_1.noEmitNotification && (!isEmitNotificationEnabled || isEmitNotificationEnabled(node))) {
                    return pipelineEmitWithNotification;
                }
            // falls through
            case 1 /* PipelinePhase.Substitution */:
                if (substituteNode !== ts_1.noEmitSubstitution && (lastSubstitution = substituteNode(emitHint, node) || node) !== node) {
                    if (currentParenthesizerRule) {
                        lastSubstitution = currentParenthesizerRule(lastSubstitution);
                    }
                    return pipelineEmitWithSubstitution;
                }
            // falls through
            case 2 /* PipelinePhase.Comments */:
                if (shouldEmitComments(node)) {
                    return pipelineEmitWithComments;
                }
            // falls through
            case 3 /* PipelinePhase.SourceMaps */:
                if (shouldEmitSourceMaps(node)) {
                    return pipelineEmitWithSourceMaps;
                }
            // falls through
            case 4 /* PipelinePhase.Emit */:
                return pipelineEmitWithHint;
            default:
                return ts_1.Debug.assertNever(phase);
        }
    }
    function getNextPipelinePhase(currentPhase, emitHint, node) {
        return getPipelinePhase(currentPhase + 1, emitHint, node);
    }
    function pipelineEmitWithNotification(hint, node) {
        var pipelinePhase = getNextPipelinePhase(0 /* PipelinePhase.Notification */, hint, node);
        onEmitNode(hint, node, pipelinePhase);
    }
    function pipelineEmitWithHint(hint, node) {
        onBeforeEmitNode === null || onBeforeEmitNode === void 0 ? void 0 : onBeforeEmitNode(node);
        if (preserveSourceNewlines) {
            var savedPreserveSourceNewlines = preserveSourceNewlines;
            beforeEmitNode(node);
            pipelineEmitWithHintWorker(hint, node);
            afterEmitNode(savedPreserveSourceNewlines);
        }
        else {
            pipelineEmitWithHintWorker(hint, node);
        }
        onAfterEmitNode === null || onAfterEmitNode === void 0 ? void 0 : onAfterEmitNode(node);
        // clear the parenthesizer rule as we ascend
        currentParenthesizerRule = undefined;
    }
    function pipelineEmitWithHintWorker(hint, node, allowSnippets) {
        if (allowSnippets === void 0) { allowSnippets = true; }
        if (allowSnippets) {
            var snippet = (0, ts_1.getSnippetElement)(node);
            if (snippet) {
                return emitSnippetNode(hint, node, snippet);
            }
        }
        if (hint === 0 /* EmitHint.SourceFile */)
            return emitSourceFile((0, ts_1.cast)(node, ts_1.isSourceFile));
        if (hint === 2 /* EmitHint.IdentifierName */)
            return emitIdentifier((0, ts_1.cast)(node, ts_1.isIdentifier));
        if (hint === 6 /* EmitHint.JsxAttributeValue */)
            return emitLiteral((0, ts_1.cast)(node, ts_1.isStringLiteral), /*jsxAttributeEscape*/ true);
        if (hint === 3 /* EmitHint.MappedTypeParameter */)
            return emitMappedTypeParameter((0, ts_1.cast)(node, ts_1.isTypeParameterDeclaration));
        if (hint === 5 /* EmitHint.EmbeddedStatement */) {
            ts_1.Debug.assertNode(node, ts_1.isEmptyStatement);
            return emitEmptyStatement(/*isEmbeddedStatement*/ true);
        }
        if (hint === 4 /* EmitHint.Unspecified */) {
            switch (node.kind) {
                // Pseudo-literals
                case 16 /* SyntaxKind.TemplateHead */:
                case 17 /* SyntaxKind.TemplateMiddle */:
                case 18 /* SyntaxKind.TemplateTail */:
                    return emitLiteral(node, /*jsxAttributeEscape*/ false);
                // Identifiers
                case 80 /* SyntaxKind.Identifier */:
                    return emitIdentifier(node);
                // PrivateIdentifiers
                case 81 /* SyntaxKind.PrivateIdentifier */:
                    return emitPrivateIdentifier(node);
                // Parse tree nodes
                // Names
                case 165 /* SyntaxKind.QualifiedName */:
                    return emitQualifiedName(node);
                case 166 /* SyntaxKind.ComputedPropertyName */:
                    return emitComputedPropertyName(node);
                // Signature elements
                case 167 /* SyntaxKind.TypeParameter */:
                    return emitTypeParameter(node);
                case 168 /* SyntaxKind.Parameter */:
                    return emitParameter(node);
                case 169 /* SyntaxKind.Decorator */:
                    return emitDecorator(node);
                // Type members
                case 170 /* SyntaxKind.PropertySignature */:
                    return emitPropertySignature(node);
                case 171 /* SyntaxKind.PropertyDeclaration */:
                    return emitPropertyDeclaration(node);
                case 172 /* SyntaxKind.MethodSignature */:
                    return emitMethodSignature(node);
                case 173 /* SyntaxKind.MethodDeclaration */:
                    return emitMethodDeclaration(node);
                case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                    return emitClassStaticBlockDeclaration(node);
                case 175 /* SyntaxKind.Constructor */:
                    return emitConstructor(node);
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                    return emitAccessorDeclaration(node);
                case 178 /* SyntaxKind.CallSignature */:
                    return emitCallSignature(node);
                case 179 /* SyntaxKind.ConstructSignature */:
                    return emitConstructSignature(node);
                case 180 /* SyntaxKind.IndexSignature */:
                    return emitIndexSignature(node);
                // Types
                case 181 /* SyntaxKind.TypePredicate */:
                    return emitTypePredicate(node);
                case 182 /* SyntaxKind.TypeReference */:
                    return emitTypeReference(node);
                case 183 /* SyntaxKind.FunctionType */:
                    return emitFunctionType(node);
                case 184 /* SyntaxKind.ConstructorType */:
                    return emitConstructorType(node);
                case 185 /* SyntaxKind.TypeQuery */:
                    return emitTypeQuery(node);
                case 186 /* SyntaxKind.TypeLiteral */:
                    return emitTypeLiteral(node);
                case 187 /* SyntaxKind.ArrayType */:
                    return emitArrayType(node);
                case 188 /* SyntaxKind.TupleType */:
                    return emitTupleType(node);
                case 189 /* SyntaxKind.OptionalType */:
                    return emitOptionalType(node);
                // SyntaxKind.RestType is handled below
                case 191 /* SyntaxKind.UnionType */:
                    return emitUnionType(node);
                case 192 /* SyntaxKind.IntersectionType */:
                    return emitIntersectionType(node);
                case 193 /* SyntaxKind.ConditionalType */:
                    return emitConditionalType(node);
                case 194 /* SyntaxKind.InferType */:
                    return emitInferType(node);
                case 195 /* SyntaxKind.ParenthesizedType */:
                    return emitParenthesizedType(node);
                case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                    return emitExpressionWithTypeArguments(node);
                case 196 /* SyntaxKind.ThisType */:
                    return emitThisType();
                case 197 /* SyntaxKind.TypeOperator */:
                    return emitTypeOperator(node);
                case 198 /* SyntaxKind.IndexedAccessType */:
                    return emitIndexedAccessType(node);
                case 199 /* SyntaxKind.MappedType */:
                    return emitMappedType(node);
                case 200 /* SyntaxKind.LiteralType */:
                    return emitLiteralType(node);
                case 201 /* SyntaxKind.NamedTupleMember */:
                    return emitNamedTupleMember(node);
                case 202 /* SyntaxKind.TemplateLiteralType */:
                    return emitTemplateType(node);
                case 203 /* SyntaxKind.TemplateLiteralTypeSpan */:
                    return emitTemplateTypeSpan(node);
                case 204 /* SyntaxKind.ImportType */:
                    return emitImportTypeNode(node);
                // Binding patterns
                case 205 /* SyntaxKind.ObjectBindingPattern */:
                    return emitObjectBindingPattern(node);
                case 206 /* SyntaxKind.ArrayBindingPattern */:
                    return emitArrayBindingPattern(node);
                case 207 /* SyntaxKind.BindingElement */:
                    return emitBindingElement(node);
                // Misc
                case 238 /* SyntaxKind.TemplateSpan */:
                    return emitTemplateSpan(node);
                case 239 /* SyntaxKind.SemicolonClassElement */:
                    return emitSemicolonClassElement();
                // Statements
                case 240 /* SyntaxKind.Block */:
                    return emitBlock(node);
                case 242 /* SyntaxKind.VariableStatement */:
                    return emitVariableStatement(node);
                case 241 /* SyntaxKind.EmptyStatement */:
                    return emitEmptyStatement(/*isEmbeddedStatement*/ false);
                case 243 /* SyntaxKind.ExpressionStatement */:
                    return emitExpressionStatement(node);
                case 244 /* SyntaxKind.IfStatement */:
                    return emitIfStatement(node);
                case 245 /* SyntaxKind.DoStatement */:
                    return emitDoStatement(node);
                case 246 /* SyntaxKind.WhileStatement */:
                    return emitWhileStatement(node);
                case 247 /* SyntaxKind.ForStatement */:
                    return emitForStatement(node);
                case 248 /* SyntaxKind.ForInStatement */:
                    return emitForInStatement(node);
                case 249 /* SyntaxKind.ForOfStatement */:
                    return emitForOfStatement(node);
                case 250 /* SyntaxKind.ContinueStatement */:
                    return emitContinueStatement(node);
                case 251 /* SyntaxKind.BreakStatement */:
                    return emitBreakStatement(node);
                case 252 /* SyntaxKind.ReturnStatement */:
                    return emitReturnStatement(node);
                case 253 /* SyntaxKind.WithStatement */:
                    return emitWithStatement(node);
                case 254 /* SyntaxKind.SwitchStatement */:
                    return emitSwitchStatement(node);
                case 255 /* SyntaxKind.LabeledStatement */:
                    return emitLabeledStatement(node);
                case 256 /* SyntaxKind.ThrowStatement */:
                    return emitThrowStatement(node);
                case 257 /* SyntaxKind.TryStatement */:
                    return emitTryStatement(node);
                case 258 /* SyntaxKind.DebuggerStatement */:
                    return emitDebuggerStatement(node);
                // Declarations
                case 259 /* SyntaxKind.VariableDeclaration */:
                    return emitVariableDeclaration(node);
                case 260 /* SyntaxKind.VariableDeclarationList */:
                    return emitVariableDeclarationList(node);
                case 261 /* SyntaxKind.FunctionDeclaration */:
                    return emitFunctionDeclaration(node);
                case 262 /* SyntaxKind.ClassDeclaration */:
                    return emitClassDeclaration(node);
                case 263 /* SyntaxKind.InterfaceDeclaration */:
                    return emitInterfaceDeclaration(node);
                case 264 /* SyntaxKind.TypeAliasDeclaration */:
                    return emitTypeAliasDeclaration(node);
                case 265 /* SyntaxKind.EnumDeclaration */:
                    return emitEnumDeclaration(node);
                case 266 /* SyntaxKind.ModuleDeclaration */:
                    return emitModuleDeclaration(node);
                case 267 /* SyntaxKind.ModuleBlock */:
                    return emitModuleBlock(node);
                case 268 /* SyntaxKind.CaseBlock */:
                    return emitCaseBlock(node);
                case 269 /* SyntaxKind.NamespaceExportDeclaration */:
                    return emitNamespaceExportDeclaration(node);
                case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                    return emitImportEqualsDeclaration(node);
                case 271 /* SyntaxKind.ImportDeclaration */:
                    return emitImportDeclaration(node);
                case 272 /* SyntaxKind.ImportClause */:
                    return emitImportClause(node);
                case 273 /* SyntaxKind.NamespaceImport */:
                    return emitNamespaceImport(node);
                case 279 /* SyntaxKind.NamespaceExport */:
                    return emitNamespaceExport(node);
                case 274 /* SyntaxKind.NamedImports */:
                    return emitNamedImports(node);
                case 275 /* SyntaxKind.ImportSpecifier */:
                    return emitImportSpecifier(node);
                case 276 /* SyntaxKind.ExportAssignment */:
                    return emitExportAssignment(node);
                case 277 /* SyntaxKind.ExportDeclaration */:
                    return emitExportDeclaration(node);
                case 278 /* SyntaxKind.NamedExports */:
                    return emitNamedExports(node);
                case 280 /* SyntaxKind.ExportSpecifier */:
                    return emitExportSpecifier(node);
                case 299 /* SyntaxKind.AssertClause */:
                    return emitAssertClause(node);
                case 300 /* SyntaxKind.AssertEntry */:
                    return emitAssertEntry(node);
                case 281 /* SyntaxKind.MissingDeclaration */:
                    return;
                // Module references
                case 282 /* SyntaxKind.ExternalModuleReference */:
                    return emitExternalModuleReference(node);
                // JSX (non-expression)
                case 12 /* SyntaxKind.JsxText */:
                    return emitJsxText(node);
                case 285 /* SyntaxKind.JsxOpeningElement */:
                case 288 /* SyntaxKind.JsxOpeningFragment */:
                    return emitJsxOpeningElementOrFragment(node);
                case 286 /* SyntaxKind.JsxClosingElement */:
                case 289 /* SyntaxKind.JsxClosingFragment */:
                    return emitJsxClosingElementOrFragment(node);
                case 290 /* SyntaxKind.JsxAttribute */:
                    return emitJsxAttribute(node);
                case 291 /* SyntaxKind.JsxAttributes */:
                    return emitJsxAttributes(node);
                case 292 /* SyntaxKind.JsxSpreadAttribute */:
                    return emitJsxSpreadAttribute(node);
                case 293 /* SyntaxKind.JsxExpression */:
                    return emitJsxExpression(node);
                case 294 /* SyntaxKind.JsxNamespacedName */:
                    return emitJsxNamespacedName(node);
                // Clauses
                case 295 /* SyntaxKind.CaseClause */:
                    return emitCaseClause(node);
                case 296 /* SyntaxKind.DefaultClause */:
                    return emitDefaultClause(node);
                case 297 /* SyntaxKind.HeritageClause */:
                    return emitHeritageClause(node);
                case 298 /* SyntaxKind.CatchClause */:
                    return emitCatchClause(node);
                // Property assignments
                case 302 /* SyntaxKind.PropertyAssignment */:
                    return emitPropertyAssignment(node);
                case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                    return emitShorthandPropertyAssignment(node);
                case 304 /* SyntaxKind.SpreadAssignment */:
                    return emitSpreadAssignment(node);
                // Enum
                case 305 /* SyntaxKind.EnumMember */:
                    return emitEnumMember(node);
                // Unparsed
                case 306 /* SyntaxKind.UnparsedPrologue */:
                    return writeUnparsedNode(node);
                case 313 /* SyntaxKind.UnparsedSource */:
                case 307 /* SyntaxKind.UnparsedPrepend */:
                    return emitUnparsedSourceOrPrepend(node);
                case 308 /* SyntaxKind.UnparsedText */:
                case 309 /* SyntaxKind.UnparsedInternalText */:
                    return emitUnparsedTextLike(node);
                case 310 /* SyntaxKind.UnparsedSyntheticReference */:
                    return emitUnparsedSyntheticReference(node);
                // Top-level nodes
                case 311 /* SyntaxKind.SourceFile */:
                    return emitSourceFile(node);
                case 312 /* SyntaxKind.Bundle */:
                    return ts_1.Debug.fail("Bundles should be printed using printBundle");
                // SyntaxKind.UnparsedSource (handled above)
                case 314 /* SyntaxKind.InputFiles */:
                    return ts_1.Debug.fail("InputFiles should not be printed");
                // JSDoc nodes (only used in codefixes currently)
                case 315 /* SyntaxKind.JSDocTypeExpression */:
                    return emitJSDocTypeExpression(node);
                case 316 /* SyntaxKind.JSDocNameReference */:
                    return emitJSDocNameReference(node);
                case 318 /* SyntaxKind.JSDocAllType */:
                    return writePunctuation("*");
                case 319 /* SyntaxKind.JSDocUnknownType */:
                    return writePunctuation("?");
                case 320 /* SyntaxKind.JSDocNullableType */:
                    return emitJSDocNullableType(node);
                case 321 /* SyntaxKind.JSDocNonNullableType */:
                    return emitJSDocNonNullableType(node);
                case 322 /* SyntaxKind.JSDocOptionalType */:
                    return emitJSDocOptionalType(node);
                case 323 /* SyntaxKind.JSDocFunctionType */:
                    return emitJSDocFunctionType(node);
                case 190 /* SyntaxKind.RestType */:
                case 324 /* SyntaxKind.JSDocVariadicType */:
                    return emitRestOrJSDocVariadicType(node);
                case 325 /* SyntaxKind.JSDocNamepathType */:
                    return;
                case 326 /* SyntaxKind.JSDoc */:
                    return emitJSDoc(node);
                case 328 /* SyntaxKind.JSDocTypeLiteral */:
                    return emitJSDocTypeLiteral(node);
                case 329 /* SyntaxKind.JSDocSignature */:
                    return emitJSDocSignature(node);
                case 333 /* SyntaxKind.JSDocTag */:
                case 338 /* SyntaxKind.JSDocClassTag */:
                case 343 /* SyntaxKind.JSDocOverrideTag */:
                    return emitJSDocSimpleTag(node);
                case 334 /* SyntaxKind.JSDocAugmentsTag */:
                case 335 /* SyntaxKind.JSDocImplementsTag */:
                    return emitJSDocHeritageTag(node);
                case 336 /* SyntaxKind.JSDocAuthorTag */:
                case 337 /* SyntaxKind.JSDocDeprecatedTag */:
                    return;
                // SyntaxKind.JSDocClassTag (see JSDocTag, above)
                case 339 /* SyntaxKind.JSDocPublicTag */:
                case 340 /* SyntaxKind.JSDocPrivateTag */:
                case 341 /* SyntaxKind.JSDocProtectedTag */:
                case 342 /* SyntaxKind.JSDocReadonlyTag */:
                    return;
                case 344 /* SyntaxKind.JSDocCallbackTag */:
                    return emitJSDocCallbackTag(node);
                case 345 /* SyntaxKind.JSDocOverloadTag */:
                    return emitJSDocOverloadTag(node);
                // SyntaxKind.JSDocEnumTag (see below)
                case 347 /* SyntaxKind.JSDocParameterTag */:
                case 354 /* SyntaxKind.JSDocPropertyTag */:
                    return emitJSDocPropertyLikeTag(node);
                case 346 /* SyntaxKind.JSDocEnumTag */:
                case 348 /* SyntaxKind.JSDocReturnTag */:
                case 349 /* SyntaxKind.JSDocThisTag */:
                case 350 /* SyntaxKind.JSDocTypeTag */:
                case 355 /* SyntaxKind.JSDocThrowsTag */:
                case 356 /* SyntaxKind.JSDocSatisfiesTag */:
                    return emitJSDocSimpleTypedTag(node);
                case 351 /* SyntaxKind.JSDocTemplateTag */:
                    return emitJSDocTemplateTag(node);
                case 352 /* SyntaxKind.JSDocTypedefTag */:
                    return emitJSDocTypedefTag(node);
                case 353 /* SyntaxKind.JSDocSeeTag */:
                    return emitJSDocSeeTag(node);
                // SyntaxKind.JSDocPropertyTag (see JSDocParameterTag, above)
                // Transformation nodes
                case 358 /* SyntaxKind.NotEmittedStatement */:
                    return;
            }
            if ((0, ts_1.isExpression)(node)) {
                hint = 1 /* EmitHint.Expression */;
                if (substituteNode !== ts_1.noEmitSubstitution) {
                    var substitute = substituteNode(hint, node) || node;
                    if (substitute !== node) {
                        node = substitute;
                        if (currentParenthesizerRule) {
                            node = currentParenthesizerRule(node);
                        }
                    }
                }
            }
        }
        if (hint === 1 /* EmitHint.Expression */) {
            switch (node.kind) {
                // Literals
                case 9 /* SyntaxKind.NumericLiteral */:
                case 10 /* SyntaxKind.BigIntLiteral */:
                    return emitNumericOrBigIntLiteral(node);
                case 11 /* SyntaxKind.StringLiteral */:
                case 14 /* SyntaxKind.RegularExpressionLiteral */:
                case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
                    return emitLiteral(node, /*jsxAttributeEscape*/ false);
                // Identifiers
                case 80 /* SyntaxKind.Identifier */:
                    return emitIdentifier(node);
                case 81 /* SyntaxKind.PrivateIdentifier */:
                    return emitPrivateIdentifier(node);
                // Expressions
                case 208 /* SyntaxKind.ArrayLiteralExpression */:
                    return emitArrayLiteralExpression(node);
                case 209 /* SyntaxKind.ObjectLiteralExpression */:
                    return emitObjectLiteralExpression(node);
                case 210 /* SyntaxKind.PropertyAccessExpression */:
                    return emitPropertyAccessExpression(node);
                case 211 /* SyntaxKind.ElementAccessExpression */:
                    return emitElementAccessExpression(node);
                case 212 /* SyntaxKind.CallExpression */:
                    return emitCallExpression(node);
                case 213 /* SyntaxKind.NewExpression */:
                    return emitNewExpression(node);
                case 214 /* SyntaxKind.TaggedTemplateExpression */:
                    return emitTaggedTemplateExpression(node);
                case 215 /* SyntaxKind.TypeAssertionExpression */:
                    return emitTypeAssertionExpression(node);
                case 216 /* SyntaxKind.ParenthesizedExpression */:
                    return emitParenthesizedExpression(node);
                case 217 /* SyntaxKind.FunctionExpression */:
                    return emitFunctionExpression(node);
                case 218 /* SyntaxKind.ArrowFunction */:
                    return emitArrowFunction(node);
                case 219 /* SyntaxKind.DeleteExpression */:
                    return emitDeleteExpression(node);
                case 220 /* SyntaxKind.TypeOfExpression */:
                    return emitTypeOfExpression(node);
                case 221 /* SyntaxKind.VoidExpression */:
                    return emitVoidExpression(node);
                case 222 /* SyntaxKind.AwaitExpression */:
                    return emitAwaitExpression(node);
                case 223 /* SyntaxKind.PrefixUnaryExpression */:
                    return emitPrefixUnaryExpression(node);
                case 224 /* SyntaxKind.PostfixUnaryExpression */:
                    return emitPostfixUnaryExpression(node);
                case 225 /* SyntaxKind.BinaryExpression */:
                    return emitBinaryExpression(node);
                case 226 /* SyntaxKind.ConditionalExpression */:
                    return emitConditionalExpression(node);
                case 227 /* SyntaxKind.TemplateExpression */:
                    return emitTemplateExpression(node);
                case 228 /* SyntaxKind.YieldExpression */:
                    return emitYieldExpression(node);
                case 229 /* SyntaxKind.SpreadElement */:
                    return emitSpreadElement(node);
                case 230 /* SyntaxKind.ClassExpression */:
                    return emitClassExpression(node);
                case 231 /* SyntaxKind.OmittedExpression */:
                    return;
                case 233 /* SyntaxKind.AsExpression */:
                    return emitAsExpression(node);
                case 234 /* SyntaxKind.NonNullExpression */:
                    return emitNonNullExpression(node);
                case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                    return emitExpressionWithTypeArguments(node);
                case 237 /* SyntaxKind.SatisfiesExpression */:
                    return emitSatisfiesExpression(node);
                case 235 /* SyntaxKind.MetaProperty */:
                    return emitMetaProperty(node);
                case 236 /* SyntaxKind.SyntheticExpression */:
                    return ts_1.Debug.fail("SyntheticExpression should never be printed.");
                case 281 /* SyntaxKind.MissingDeclaration */:
                    return;
                // JSX
                case 283 /* SyntaxKind.JsxElement */:
                    return emitJsxElement(node);
                case 284 /* SyntaxKind.JsxSelfClosingElement */:
                    return emitJsxSelfClosingElement(node);
                case 287 /* SyntaxKind.JsxFragment */:
                    return emitJsxFragment(node);
                // Synthesized list
                case 357 /* SyntaxKind.SyntaxList */:
                    return ts_1.Debug.fail("SyntaxList should not be printed");
                // Transformation nodes
                case 358 /* SyntaxKind.NotEmittedStatement */:
                    return;
                case 359 /* SyntaxKind.PartiallyEmittedExpression */:
                    return emitPartiallyEmittedExpression(node);
                case 360 /* SyntaxKind.CommaListExpression */:
                    return emitCommaList(node);
                case 361 /* SyntaxKind.SyntheticReferenceExpression */:
                    return ts_1.Debug.fail("SyntheticReferenceExpression should not be printed");
            }
        }
        if ((0, ts_1.isKeyword)(node.kind))
            return writeTokenNode(node, writeKeyword);
        if ((0, ts_1.isTokenKind)(node.kind))
            return writeTokenNode(node, writePunctuation);
        ts_1.Debug.fail("Unhandled SyntaxKind: ".concat(ts_1.Debug.formatSyntaxKind(node.kind), "."));
    }
    function emitMappedTypeParameter(node) {
        emit(node.name);
        writeSpace();
        writeKeyword("in");
        writeSpace();
        emit(node.constraint);
    }
    function pipelineEmitWithSubstitution(hint, node) {
        var pipelinePhase = getNextPipelinePhase(1 /* PipelinePhase.Substitution */, hint, node);
        ts_1.Debug.assertIsDefined(lastSubstitution);
        node = lastSubstitution;
        lastSubstitution = undefined;
        pipelinePhase(hint, node);
    }
    function getHelpersFromBundledSourceFiles(bundle) {
        var result;
        if (moduleKind === ts_1.ModuleKind.None || printerOptions.noEmitHelpers) {
            return undefined;
        }
        var bundledHelpers = new Map();
        for (var _a = 0, _b = bundle.sourceFiles; _a < _b.length; _a++) {
            var sourceFile = _b[_a];
            var shouldSkip = (0, ts_1.getExternalHelpersModuleName)(sourceFile) !== undefined;
            var helpers = getSortedEmitHelpers(sourceFile);
            if (!helpers)
                continue;
            for (var _c = 0, helpers_1 = helpers; _c < helpers_1.length; _c++) {
                var helper = helpers_1[_c];
                if (!helper.scoped && !shouldSkip && !bundledHelpers.get(helper.name)) {
                    bundledHelpers.set(helper.name, true);
                    (result || (result = [])).push(helper.name);
                }
            }
        }
        return result;
    }
    function emitHelpers(node) {
        var helpersEmitted = false;
        var bundle = node.kind === 312 /* SyntaxKind.Bundle */ ? node : undefined;
        if (bundle && moduleKind === ts_1.ModuleKind.None) {
            return;
        }
        var numPrepends = bundle ? bundle.prepends.length : 0;
        var numNodes = bundle ? bundle.sourceFiles.length + numPrepends : 1;
        for (var i = 0; i < numNodes; i++) {
            var currentNode = bundle ? i < numPrepends ? bundle.prepends[i] : bundle.sourceFiles[i - numPrepends] : node;
            var sourceFile = (0, ts_1.isSourceFile)(currentNode) ? currentNode : (0, ts_1.isUnparsedSource)(currentNode) ? undefined : currentSourceFile;
            var shouldSkip = printerOptions.noEmitHelpers || (!!sourceFile && (0, ts_1.hasRecordedExternalHelpers)(sourceFile));
            var shouldBundle = ((0, ts_1.isSourceFile)(currentNode) || (0, ts_1.isUnparsedSource)(currentNode)) && !isOwnFileEmit;
            var helpers = (0, ts_1.isUnparsedSource)(currentNode) ? currentNode.helpers : getSortedEmitHelpers(currentNode);
            if (helpers) {
                for (var _a = 0, helpers_2 = helpers; _a < helpers_2.length; _a++) {
                    var helper = helpers_2[_a];
                    if (!helper.scoped) {
                        // Skip the helper if it can be skipped and the noEmitHelpers compiler
                        // option is set, or if it can be imported and the importHelpers compiler
                        // option is set.
                        if (shouldSkip)
                            continue;
                        // Skip the helper if it can be bundled but hasn't already been emitted and we
                        // are emitting a bundled module.
                        if (shouldBundle) {
                            if (bundledHelpers.get(helper.name)) {
                                continue;
                            }
                            bundledHelpers.set(helper.name, true);
                        }
                    }
                    else if (bundle) {
                        // Skip the helper if it is scoped and we are emitting bundled helpers
                        continue;
                    }
                    var pos = getTextPosWithWriteLine();
                    if (typeof helper.text === "string") {
                        writeLines(helper.text);
                    }
                    else {
                        writeLines(helper.text(makeFileLevelOptimisticUniqueName));
                    }
                    if (bundleFileInfo)
                        bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: "emitHelpers" /* BundleFileSectionKind.EmitHelpers */, data: helper.name });
                    helpersEmitted = true;
                }
            }
        }
        return helpersEmitted;
    }
    function getSortedEmitHelpers(node) {
        var helpers = (0, ts_1.getEmitHelpers)(node);
        return helpers && (0, ts_1.stableSort)(helpers, ts_1.compareEmitHelpers);
    }
    //
    // Literals/Pseudo-literals
    //
    // SyntaxKind.NumericLiteral
    // SyntaxKind.BigIntLiteral
    function emitNumericOrBigIntLiteral(node) {
        emitLiteral(node, /*jsxAttributeEscape*/ false);
    }
    // SyntaxKind.StringLiteral
    // SyntaxKind.RegularExpressionLiteral
    // SyntaxKind.NoSubstitutionTemplateLiteral
    // SyntaxKind.TemplateHead
    // SyntaxKind.TemplateMiddle
    // SyntaxKind.TemplateTail
    function emitLiteral(node, jsxAttributeEscape) {
        var text = getLiteralTextOfNode(node, printerOptions.neverAsciiEscape, jsxAttributeEscape);
        if ((printerOptions.sourceMap || printerOptions.inlineSourceMap)
            && (node.kind === 11 /* SyntaxKind.StringLiteral */ || (0, ts_1.isTemplateLiteralKind)(node.kind))) {
            writeLiteral(text);
        }
        else {
            // Quick info expects all literals to be called with writeStringLiteral, as there's no specific type for numberLiterals
            writeStringLiteral(text);
        }
    }
    // SyntaxKind.UnparsedSource
    // SyntaxKind.UnparsedPrepend
    function emitUnparsedSourceOrPrepend(unparsed) {
        for (var _a = 0, _b = unparsed.texts; _a < _b.length; _a++) {
            var text = _b[_a];
            writeLine();
            emit(text);
        }
    }
    // SyntaxKind.UnparsedPrologue
    // SyntaxKind.UnparsedText
    // SyntaxKind.UnparsedInternal
    // SyntaxKind.UnparsedSyntheticReference
    function writeUnparsedNode(unparsed) {
        writer.rawWrite(unparsed.parent.text.substring(unparsed.pos, unparsed.end));
    }
    // SyntaxKind.UnparsedText
    // SyntaxKind.UnparsedInternal
    function emitUnparsedTextLike(unparsed) {
        var pos = getTextPosWithWriteLine();
        writeUnparsedNode(unparsed);
        if (bundleFileInfo) {
            updateOrPushBundleFileTextLike(pos, writer.getTextPos(), unparsed.kind === 308 /* SyntaxKind.UnparsedText */ ?
                "text" /* BundleFileSectionKind.Text */ :
                "internal" /* BundleFileSectionKind.Internal */);
        }
    }
    // SyntaxKind.UnparsedSyntheticReference
    function emitUnparsedSyntheticReference(unparsed) {
        var pos = getTextPosWithWriteLine();
        writeUnparsedNode(unparsed);
        if (bundleFileInfo) {
            var section = (0, ts_1.clone)(unparsed.section);
            section.pos = pos;
            section.end = writer.getTextPos();
            bundleFileInfo.sections.push(section);
        }
    }
    //
    // Snippet Elements
    //
    function emitSnippetNode(hint, node, snippet) {
        switch (snippet.kind) {
            case 1 /* SnippetKind.Placeholder */:
                emitPlaceholder(hint, node, snippet);
                break;
            case 0 /* SnippetKind.TabStop */:
                emitTabStop(hint, node, snippet);
                break;
        }
    }
    function emitPlaceholder(hint, node, snippet) {
        nonEscapingWrite("${".concat(snippet.order, ":")); // `${2:`
        pipelineEmitWithHintWorker(hint, node, /*allowSnippets*/ false); // `...`
        nonEscapingWrite("}"); // `}`
        // `${2:...}`
    }
    function emitTabStop(hint, node, snippet) {
        // A tab stop should only be attached to an empty node, i.e. a node that doesn't emit any text.
        ts_1.Debug.assert(node.kind === 241 /* SyntaxKind.EmptyStatement */, "A tab stop cannot be attached to a node of kind ".concat(ts_1.Debug.formatSyntaxKind(node.kind), "."));
        ts_1.Debug.assert(hint !== 5 /* EmitHint.EmbeddedStatement */, "A tab stop cannot be attached to an embedded statement.");
        nonEscapingWrite("$".concat(snippet.order));
    }
    //
    // Identifiers
    //
    function emitIdentifier(node) {
        var writeText = node.symbol ? writeSymbol : write;
        writeText(getTextOfNode(node, /*includeTrivia*/ false), node.symbol);
        emitList(node, (0, ts_1.getIdentifierTypeArguments)(node), 53776 /* ListFormat.TypeParameters */); // Call emitList directly since it could be an array of TypeParameterDeclarations _or_ type arguments
    }
    //
    // Names
    //
    function emitPrivateIdentifier(node) {
        write(getTextOfNode(node, /*includeTrivia*/ false));
    }
    function emitQualifiedName(node) {
        emitEntityName(node.left);
        writePunctuation(".");
        emit(node.right);
    }
    function emitEntityName(node) {
        if (node.kind === 80 /* SyntaxKind.Identifier */) {
            emitExpression(node);
        }
        else {
            emit(node);
        }
    }
    function emitComputedPropertyName(node) {
        var savedPrivateNameTempFlags = privateNameTempFlags;
        var savedReservedMemberNames = reservedPrivateNames;
        popPrivateNameGenerationScope();
        writePunctuation("[");
        emitExpression(node.expression, parenthesizer.parenthesizeExpressionOfComputedPropertyName);
        writePunctuation("]");
        pushPrivateNameGenerationScope(savedPrivateNameTempFlags, savedReservedMemberNames);
    }
    //
    // Signature elements
    //
    function emitTypeParameter(node) {
        emitModifierList(node, node.modifiers);
        emit(node.name);
        if (node.constraint) {
            writeSpace();
            writeKeyword("extends");
            writeSpace();
            emit(node.constraint);
        }
        if (node.default) {
            writeSpace();
            writeOperator("=");
            writeSpace();
            emit(node.default);
        }
    }
    function emitParameter(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ true);
        emit(node.dotDotDotToken);
        emitNodeWithWriter(node.name, writeParameter);
        emit(node.questionToken);
        if (node.parent && node.parent.kind === 323 /* SyntaxKind.JSDocFunctionType */ && !node.name) {
            emit(node.type);
        }
        else {
            emitTypeAnnotation(node.type);
        }
        // The comment position has to fallback to any present node within the parameterdeclaration because as it turns out, the parser can make parameter declarations with _just_ an initializer.
        emitInitializer(node.initializer, node.type ? node.type.end : node.questionToken ? node.questionToken.end : node.name ? node.name.end : node.modifiers ? node.modifiers.end : node.pos, node, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitDecorator(decorator) {
        writePunctuation("@");
        emitExpression(decorator.expression, parenthesizer.parenthesizeLeftSideOfAccess);
    }
    //
    // Type members
    //
    function emitPropertySignature(node) {
        emitModifierList(node, node.modifiers);
        emitNodeWithWriter(node.name, writeProperty);
        emit(node.questionToken);
        emitTypeAnnotation(node.type);
        writeTrailingSemicolon();
    }
    function emitPropertyDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ true);
        emit(node.name);
        emit(node.questionToken);
        emit(node.exclamationToken);
        emitTypeAnnotation(node.type);
        emitInitializer(node.initializer, node.type ? node.type.end : node.questionToken ? node.questionToken.end : node.name.end, node);
        writeTrailingSemicolon();
    }
    function emitMethodSignature(node) {
        pushNameGenerationScope(node);
        emitModifierList(node, node.modifiers);
        emit(node.name);
        emit(node.questionToken);
        emitTypeParameters(node, node.typeParameters);
        emitParameters(node, node.parameters);
        emitTypeAnnotation(node.type);
        writeTrailingSemicolon();
        popNameGenerationScope(node);
    }
    function emitMethodDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ true);
        emit(node.asteriskToken);
        emit(node.name);
        emit(node.questionToken);
        emitSignatureAndBody(node, emitSignatureHead);
    }
    function emitClassStaticBlockDeclaration(node) {
        writeKeyword("static");
        emitBlockFunctionBody(node.body);
    }
    function emitConstructor(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        writeKeyword("constructor");
        emitSignatureAndBody(node, emitSignatureHead);
    }
    function emitAccessorDeclaration(node) {
        var pos = emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ true);
        var token = node.kind === 176 /* SyntaxKind.GetAccessor */ ? 139 /* SyntaxKind.GetKeyword */ : 153 /* SyntaxKind.SetKeyword */;
        emitTokenWithComment(token, pos, writeKeyword, node);
        writeSpace();
        emit(node.name);
        emitSignatureAndBody(node, emitSignatureHead);
    }
    function emitCallSignature(node) {
        pushNameGenerationScope(node);
        emitTypeParameters(node, node.typeParameters);
        emitParameters(node, node.parameters);
        emitTypeAnnotation(node.type);
        writeTrailingSemicolon();
        popNameGenerationScope(node);
    }
    function emitConstructSignature(node) {
        pushNameGenerationScope(node);
        writeKeyword("new");
        writeSpace();
        emitTypeParameters(node, node.typeParameters);
        emitParameters(node, node.parameters);
        emitTypeAnnotation(node.type);
        writeTrailingSemicolon();
        popNameGenerationScope(node);
    }
    function emitIndexSignature(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        emitParametersForIndexSignature(node, node.parameters);
        emitTypeAnnotation(node.type);
        writeTrailingSemicolon();
    }
    function emitTemplateTypeSpan(node) {
        emit(node.type);
        emit(node.literal);
    }
    function emitSemicolonClassElement() {
        writeTrailingSemicolon();
    }
    //
    // Types
    //
    function emitTypePredicate(node) {
        if (node.assertsModifier) {
            emit(node.assertsModifier);
            writeSpace();
        }
        emit(node.parameterName);
        if (node.type) {
            writeSpace();
            writeKeyword("is");
            writeSpace();
            emit(node.type);
        }
    }
    function emitTypeReference(node) {
        emit(node.typeName);
        emitTypeArguments(node, node.typeArguments);
    }
    function emitFunctionType(node) {
        pushNameGenerationScope(node);
        emitTypeParameters(node, node.typeParameters);
        emitParametersForArrow(node, node.parameters);
        writeSpace();
        writePunctuation("=>");
        writeSpace();
        emit(node.type);
        popNameGenerationScope(node);
    }
    function emitJSDocFunctionType(node) {
        writeKeyword("function");
        emitParameters(node, node.parameters);
        writePunctuation(":");
        emit(node.type);
    }
    function emitJSDocNullableType(node) {
        writePunctuation("?");
        emit(node.type);
    }
    function emitJSDocNonNullableType(node) {
        writePunctuation("!");
        emit(node.type);
    }
    function emitJSDocOptionalType(node) {
        emit(node.type);
        writePunctuation("=");
    }
    function emitConstructorType(node) {
        pushNameGenerationScope(node);
        emitModifierList(node, node.modifiers);
        writeKeyword("new");
        writeSpace();
        emitTypeParameters(node, node.typeParameters);
        emitParameters(node, node.parameters);
        writeSpace();
        writePunctuation("=>");
        writeSpace();
        emit(node.type);
        popNameGenerationScope(node);
    }
    function emitTypeQuery(node) {
        writeKeyword("typeof");
        writeSpace();
        emit(node.exprName);
        emitTypeArguments(node, node.typeArguments);
    }
    function emitTypeLiteral(node) {
        // Type literals don't have private names, but we need to push a new scope so that
        // we can step out of it when emitting a computed property.
        pushPrivateNameGenerationScope(0 /* TempFlags.Auto */, /*newReservedMemberNames*/ undefined);
        writePunctuation("{");
        var flags = (0, ts_1.getEmitFlags)(node) & 1 /* EmitFlags.SingleLine */ ? 768 /* ListFormat.SingleLineTypeLiteralMembers */ : 32897 /* ListFormat.MultiLineTypeLiteralMembers */;
        emitList(node, node.members, flags | 524288 /* ListFormat.NoSpaceIfEmpty */);
        writePunctuation("}");
        popPrivateNameGenerationScope();
    }
    function emitArrayType(node) {
        emit(node.elementType, parenthesizer.parenthesizeNonArrayTypeOfPostfixType);
        writePunctuation("[");
        writePunctuation("]");
    }
    function emitRestOrJSDocVariadicType(node) {
        writePunctuation("...");
        emit(node.type);
    }
    function emitTupleType(node) {
        emitTokenWithComment(23 /* SyntaxKind.OpenBracketToken */, node.pos, writePunctuation, node);
        var flags = (0, ts_1.getEmitFlags)(node) & 1 /* EmitFlags.SingleLine */ ? 528 /* ListFormat.SingleLineTupleTypeElements */ : 657 /* ListFormat.MultiLineTupleTypeElements */;
        emitList(node, node.elements, flags | 524288 /* ListFormat.NoSpaceIfEmpty */, parenthesizer.parenthesizeElementTypeOfTupleType);
        emitTokenWithComment(24 /* SyntaxKind.CloseBracketToken */, node.elements.end, writePunctuation, node);
    }
    function emitNamedTupleMember(node) {
        emit(node.dotDotDotToken);
        emit(node.name);
        emit(node.questionToken);
        emitTokenWithComment(59 /* SyntaxKind.ColonToken */, node.name.end, writePunctuation, node);
        writeSpace();
        emit(node.type);
    }
    function emitOptionalType(node) {
        emit(node.type, parenthesizer.parenthesizeTypeOfOptionalType);
        writePunctuation("?");
    }
    function emitUnionType(node) {
        emitList(node, node.types, 516 /* ListFormat.UnionTypeConstituents */, parenthesizer.parenthesizeConstituentTypeOfUnionType);
    }
    function emitIntersectionType(node) {
        emitList(node, node.types, 520 /* ListFormat.IntersectionTypeConstituents */, parenthesizer.parenthesizeConstituentTypeOfIntersectionType);
    }
    function emitConditionalType(node) {
        emit(node.checkType, parenthesizer.parenthesizeCheckTypeOfConditionalType);
        writeSpace();
        writeKeyword("extends");
        writeSpace();
        emit(node.extendsType, parenthesizer.parenthesizeExtendsTypeOfConditionalType);
        writeSpace();
        writePunctuation("?");
        writeSpace();
        emit(node.trueType);
        writeSpace();
        writePunctuation(":");
        writeSpace();
        emit(node.falseType);
    }
    function emitInferType(node) {
        writeKeyword("infer");
        writeSpace();
        emit(node.typeParameter);
    }
    function emitParenthesizedType(node) {
        writePunctuation("(");
        emit(node.type);
        writePunctuation(")");
    }
    function emitThisType() {
        writeKeyword("this");
    }
    function emitTypeOperator(node) {
        writeTokenText(node.operator, writeKeyword);
        writeSpace();
        var parenthesizerRule = node.operator === 148 /* SyntaxKind.ReadonlyKeyword */ ?
            parenthesizer.parenthesizeOperandOfReadonlyTypeOperator :
            parenthesizer.parenthesizeOperandOfTypeOperator;
        emit(node.type, parenthesizerRule);
    }
    function emitIndexedAccessType(node) {
        emit(node.objectType, parenthesizer.parenthesizeNonArrayTypeOfPostfixType);
        writePunctuation("[");
        emit(node.indexType);
        writePunctuation("]");
    }
    function emitMappedType(node) {
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        writePunctuation("{");
        if (emitFlags & 1 /* EmitFlags.SingleLine */) {
            writeSpace();
        }
        else {
            writeLine();
            increaseIndent();
        }
        if (node.readonlyToken) {
            emit(node.readonlyToken);
            if (node.readonlyToken.kind !== 148 /* SyntaxKind.ReadonlyKeyword */) {
                writeKeyword("readonly");
            }
            writeSpace();
        }
        writePunctuation("[");
        pipelineEmit(3 /* EmitHint.MappedTypeParameter */, node.typeParameter);
        if (node.nameType) {
            writeSpace();
            writeKeyword("as");
            writeSpace();
            emit(node.nameType);
        }
        writePunctuation("]");
        if (node.questionToken) {
            emit(node.questionToken);
            if (node.questionToken.kind !== 58 /* SyntaxKind.QuestionToken */) {
                writePunctuation("?");
            }
        }
        writePunctuation(":");
        writeSpace();
        emit(node.type);
        writeTrailingSemicolon();
        if (emitFlags & 1 /* EmitFlags.SingleLine */) {
            writeSpace();
        }
        else {
            writeLine();
            decreaseIndent();
        }
        emitList(node, node.members, 2 /* ListFormat.PreserveLines */);
        writePunctuation("}");
    }
    function emitLiteralType(node) {
        emitExpression(node.literal);
    }
    function emitTemplateType(node) {
        emit(node.head);
        emitList(node, node.templateSpans, 262144 /* ListFormat.TemplateExpressionSpans */);
    }
    function emitImportTypeNode(node) {
        if (node.isTypeOf) {
            writeKeyword("typeof");
            writeSpace();
        }
        writeKeyword("import");
        writePunctuation("(");
        emit(node.argument);
        if (node.assertions) {
            writePunctuation(",");
            writeSpace();
            writePunctuation("{");
            writeSpace();
            writeKeyword("assert");
            writePunctuation(":");
            writeSpace();
            var elements = node.assertions.assertClause.elements;
            emitList(node.assertions.assertClause, elements, 526226 /* ListFormat.ImportClauseEntries */);
            writeSpace();
            writePunctuation("}");
        }
        writePunctuation(")");
        if (node.qualifier) {
            writePunctuation(".");
            emit(node.qualifier);
        }
        emitTypeArguments(node, node.typeArguments);
    }
    //
    // Binding patterns
    //
    function emitObjectBindingPattern(node) {
        writePunctuation("{");
        emitList(node, node.elements, 525136 /* ListFormat.ObjectBindingPatternElements */);
        writePunctuation("}");
    }
    function emitArrayBindingPattern(node) {
        writePunctuation("[");
        emitList(node, node.elements, 524880 /* ListFormat.ArrayBindingPatternElements */);
        writePunctuation("]");
    }
    function emitBindingElement(node) {
        emit(node.dotDotDotToken);
        if (node.propertyName) {
            emit(node.propertyName);
            writePunctuation(":");
            writeSpace();
        }
        emit(node.name);
        emitInitializer(node.initializer, node.name.end, node, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    //
    // Expressions
    //
    function emitArrayLiteralExpression(node) {
        var elements = node.elements;
        var preferNewLine = node.multiLine ? 65536 /* ListFormat.PreferNewLine */ : 0 /* ListFormat.None */;
        emitExpressionList(node, elements, 8914 /* ListFormat.ArrayLiteralExpressionElements */ | preferNewLine, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitObjectLiteralExpression(node) {
        // Object literals don't have private names, but we need to push a new scope so that
        // we can step out of it when emitting a computed property.
        pushPrivateNameGenerationScope(0 /* TempFlags.Auto */, /*newReservedMemberNames*/ undefined);
        (0, ts_1.forEach)(node.properties, generateMemberNames);
        var indentedFlag = (0, ts_1.getEmitFlags)(node) & 131072 /* EmitFlags.Indented */;
        if (indentedFlag) {
            increaseIndent();
        }
        var preferNewLine = node.multiLine ? 65536 /* ListFormat.PreferNewLine */ : 0 /* ListFormat.None */;
        var allowTrailingComma = currentSourceFile && currentSourceFile.languageVersion >= 1 /* ScriptTarget.ES5 */ && !(0, ts_1.isJsonSourceFile)(currentSourceFile) ? 64 /* ListFormat.AllowTrailingComma */ : 0 /* ListFormat.None */;
        emitList(node, node.properties, 526226 /* ListFormat.ObjectLiteralExpressionProperties */ | allowTrailingComma | preferNewLine);
        if (indentedFlag) {
            decreaseIndent();
        }
        popPrivateNameGenerationScope();
    }
    function emitPropertyAccessExpression(node) {
        emitExpression(node.expression, parenthesizer.parenthesizeLeftSideOfAccess);
        var token = node.questionDotToken || (0, ts_1.setTextRangePosEnd)(ts_1.factory.createToken(25 /* SyntaxKind.DotToken */), node.expression.end, node.name.pos);
        var linesBeforeDot = getLinesBetweenNodes(node, node.expression, token);
        var linesAfterDot = getLinesBetweenNodes(node, token, node.name);
        writeLinesAndIndent(linesBeforeDot, /*writeSpaceIfNotIndenting*/ false);
        var shouldEmitDotDot = token.kind !== 29 /* SyntaxKind.QuestionDotToken */ &&
            mayNeedDotDotForPropertyAccess(node.expression) &&
            !writer.hasTrailingComment() &&
            !writer.hasTrailingWhitespace();
        if (shouldEmitDotDot) {
            writePunctuation(".");
        }
        if (node.questionDotToken) {
            emit(token);
        }
        else {
            emitTokenWithComment(token.kind, node.expression.end, writePunctuation, node);
        }
        writeLinesAndIndent(linesAfterDot, /*writeSpaceIfNotIndenting*/ false);
        emit(node.name);
        decreaseIndentIf(linesBeforeDot, linesAfterDot);
    }
    // 1..toString is a valid property access, emit a dot after the literal
    // Also emit a dot if expression is a integer const enum value - it will appear in generated code as numeric literal
    function mayNeedDotDotForPropertyAccess(expression) {
        expression = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
        if ((0, ts_1.isNumericLiteral)(expression)) {
            // check if numeric literal is a decimal literal that was originally written with a dot
            var text = getLiteralTextOfNode(expression, /*neverAsciiEscape*/ true, /*jsxAttributeEscape*/ false);
            // If the number will be printed verbatim and it doesn't already contain a dot or an exponent indicator, add one
            // if the expression doesn't have any comments that will be emitted.
            return !(expression.numericLiteralFlags & 448 /* TokenFlags.WithSpecifier */)
                && !(0, ts_1.stringContains)(text, (0, ts_1.tokenToString)(25 /* SyntaxKind.DotToken */))
                && !(0, ts_1.stringContains)(text, String.fromCharCode(69 /* CharacterCodes.E */))
                && !(0, ts_1.stringContains)(text, String.fromCharCode(101 /* CharacterCodes.e */));
        }
        else if ((0, ts_1.isAccessExpression)(expression)) {
            // check if constant enum value is integer
            var constantValue = (0, ts_1.getConstantValue)(expression);
            // isFinite handles cases when constantValue is undefined
            return typeof constantValue === "number" && isFinite(constantValue)
                && Math.floor(constantValue) === constantValue;
        }
    }
    function emitElementAccessExpression(node) {
        emitExpression(node.expression, parenthesizer.parenthesizeLeftSideOfAccess);
        emit(node.questionDotToken);
        emitTokenWithComment(23 /* SyntaxKind.OpenBracketToken */, node.expression.end, writePunctuation, node);
        emitExpression(node.argumentExpression);
        emitTokenWithComment(24 /* SyntaxKind.CloseBracketToken */, node.argumentExpression.end, writePunctuation, node);
    }
    function emitCallExpression(node) {
        var indirectCall = (0, ts_1.getInternalEmitFlags)(node) & 16 /* InternalEmitFlags.IndirectCall */;
        if (indirectCall) {
            writePunctuation("(");
            writeLiteral("0");
            writePunctuation(",");
            writeSpace();
        }
        emitExpression(node.expression, parenthesizer.parenthesizeLeftSideOfAccess);
        if (indirectCall) {
            writePunctuation(")");
        }
        emit(node.questionDotToken);
        emitTypeArguments(node, node.typeArguments);
        emitExpressionList(node, node.arguments, 2576 /* ListFormat.CallExpressionArguments */, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitNewExpression(node) {
        emitTokenWithComment(105 /* SyntaxKind.NewKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression, parenthesizer.parenthesizeExpressionOfNew);
        emitTypeArguments(node, node.typeArguments);
        emitExpressionList(node, node.arguments, 18960 /* ListFormat.NewExpressionArguments */, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitTaggedTemplateExpression(node) {
        var indirectCall = (0, ts_1.getInternalEmitFlags)(node) & 16 /* InternalEmitFlags.IndirectCall */;
        if (indirectCall) {
            writePunctuation("(");
            writeLiteral("0");
            writePunctuation(",");
            writeSpace();
        }
        emitExpression(node.tag, parenthesizer.parenthesizeLeftSideOfAccess);
        if (indirectCall) {
            writePunctuation(")");
        }
        emitTypeArguments(node, node.typeArguments);
        writeSpace();
        emitExpression(node.template);
    }
    function emitTypeAssertionExpression(node) {
        writePunctuation("<");
        emit(node.type);
        writePunctuation(">");
        emitExpression(node.expression, parenthesizer.parenthesizeOperandOfPrefixUnary);
    }
    function emitParenthesizedExpression(node) {
        var openParenPos = emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, node.pos, writePunctuation, node);
        var indented = writeLineSeparatorsAndIndentBefore(node.expression, node);
        emitExpression(node.expression, /*parenthesizerRule*/ undefined);
        writeLineSeparatorsAfter(node.expression, node);
        decreaseIndentIf(indented);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression ? node.expression.end : openParenPos, writePunctuation, node);
    }
    function emitFunctionExpression(node) {
        generateNameIfNeeded(node.name);
        emitFunctionDeclarationOrExpression(node);
    }
    function emitArrowFunction(node) {
        emitModifierList(node, node.modifiers);
        emitSignatureAndBody(node, emitArrowFunctionHead);
    }
    function emitArrowFunctionHead(node) {
        emitTypeParameters(node, node.typeParameters);
        emitParametersForArrow(node, node.parameters);
        emitTypeAnnotation(node.type);
        writeSpace();
        emit(node.equalsGreaterThanToken);
    }
    function emitDeleteExpression(node) {
        emitTokenWithComment(91 /* SyntaxKind.DeleteKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression, parenthesizer.parenthesizeOperandOfPrefixUnary);
    }
    function emitTypeOfExpression(node) {
        emitTokenWithComment(114 /* SyntaxKind.TypeOfKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression, parenthesizer.parenthesizeOperandOfPrefixUnary);
    }
    function emitVoidExpression(node) {
        emitTokenWithComment(116 /* SyntaxKind.VoidKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression, parenthesizer.parenthesizeOperandOfPrefixUnary);
    }
    function emitAwaitExpression(node) {
        emitTokenWithComment(135 /* SyntaxKind.AwaitKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression, parenthesizer.parenthesizeOperandOfPrefixUnary);
    }
    function emitPrefixUnaryExpression(node) {
        writeTokenText(node.operator, writeOperator);
        if (shouldEmitWhitespaceBeforeOperand(node)) {
            writeSpace();
        }
        emitExpression(node.operand, parenthesizer.parenthesizeOperandOfPrefixUnary);
    }
    function shouldEmitWhitespaceBeforeOperand(node) {
        // In some cases, we need to emit a space between the operator and the operand. One obvious case
        // is when the operator is an identifier, like delete or typeof. We also need to do this for plus
        // and minus expressions in certain cases. Specifically, consider the following two cases (parens
        // are just for clarity of exposition, and not part of the source code):
        //
        //  (+(+1))
        //  (+(++1))
        //
        // We need to emit a space in both cases. In the first case, the absence of a space will make
        // the resulting expression a prefix increment operation. And in the second, it will make the resulting
        // expression a prefix increment whose operand is a plus expression - (++(+x))
        // The same is true of minus of course.
        var operand = node.operand;
        return operand.kind === 223 /* SyntaxKind.PrefixUnaryExpression */
            && ((node.operator === 40 /* SyntaxKind.PlusToken */ && (operand.operator === 40 /* SyntaxKind.PlusToken */ || operand.operator === 46 /* SyntaxKind.PlusPlusToken */))
                || (node.operator === 41 /* SyntaxKind.MinusToken */ && (operand.operator === 41 /* SyntaxKind.MinusToken */ || operand.operator === 47 /* SyntaxKind.MinusMinusToken */)));
    }
    function emitPostfixUnaryExpression(node) {
        emitExpression(node.operand, parenthesizer.parenthesizeOperandOfPostfixUnary);
        writeTokenText(node.operator, writeOperator);
    }
    function createEmitBinaryExpression() {
        return (0, ts_1.createBinaryExpressionTrampoline)(onEnter, onLeft, onOperator, onRight, onExit, /*foldState*/ undefined);
        function onEnter(node, state) {
            if (state) {
                state.stackIndex++;
                state.preserveSourceNewlinesStack[state.stackIndex] = preserveSourceNewlines;
                state.containerPosStack[state.stackIndex] = containerPos;
                state.containerEndStack[state.stackIndex] = containerEnd;
                state.declarationListContainerEndStack[state.stackIndex] = declarationListContainerEnd;
                var emitComments = state.shouldEmitCommentsStack[state.stackIndex] = shouldEmitComments(node);
                var emitSourceMaps = state.shouldEmitSourceMapsStack[state.stackIndex] = shouldEmitSourceMaps(node);
                onBeforeEmitNode === null || onBeforeEmitNode === void 0 ? void 0 : onBeforeEmitNode(node);
                if (emitComments)
                    emitCommentsBeforeNode(node);
                if (emitSourceMaps)
                    emitSourceMapsBeforeNode(node);
                beforeEmitNode(node);
            }
            else {
                state = {
                    stackIndex: 0,
                    preserveSourceNewlinesStack: [undefined],
                    containerPosStack: [-1],
                    containerEndStack: [-1],
                    declarationListContainerEndStack: [-1],
                    shouldEmitCommentsStack: [false],
                    shouldEmitSourceMapsStack: [false],
                };
            }
            return state;
        }
        function onLeft(next, _workArea, parent) {
            return maybeEmitExpression(next, parent, "left");
        }
        function onOperator(operatorToken, _state, node) {
            var isCommaOperator = operatorToken.kind !== 28 /* SyntaxKind.CommaToken */;
            var linesBeforeOperator = getLinesBetweenNodes(node, node.left, operatorToken);
            var linesAfterOperator = getLinesBetweenNodes(node, operatorToken, node.right);
            writeLinesAndIndent(linesBeforeOperator, isCommaOperator);
            emitLeadingCommentsOfPosition(operatorToken.pos);
            writeTokenNode(operatorToken, operatorToken.kind === 103 /* SyntaxKind.InKeyword */ ? writeKeyword : writeOperator);
            emitTrailingCommentsOfPosition(operatorToken.end, /*prefixSpace*/ true); // Binary operators should have a space before the comment starts
            writeLinesAndIndent(linesAfterOperator, /*writeSpaceIfNotIndenting*/ true);
        }
        function onRight(next, _workArea, parent) {
            return maybeEmitExpression(next, parent, "right");
        }
        function onExit(node, state) {
            var linesBeforeOperator = getLinesBetweenNodes(node, node.left, node.operatorToken);
            var linesAfterOperator = getLinesBetweenNodes(node, node.operatorToken, node.right);
            decreaseIndentIf(linesBeforeOperator, linesAfterOperator);
            if (state.stackIndex > 0) {
                var savedPreserveSourceNewlines = state.preserveSourceNewlinesStack[state.stackIndex];
                var savedContainerPos = state.containerPosStack[state.stackIndex];
                var savedContainerEnd = state.containerEndStack[state.stackIndex];
                var savedDeclarationListContainerEnd = state.declarationListContainerEndStack[state.stackIndex];
                var shouldEmitComments_1 = state.shouldEmitCommentsStack[state.stackIndex];
                var shouldEmitSourceMaps_1 = state.shouldEmitSourceMapsStack[state.stackIndex];
                afterEmitNode(savedPreserveSourceNewlines);
                if (shouldEmitSourceMaps_1)
                    emitSourceMapsAfterNode(node);
                if (shouldEmitComments_1)
                    emitCommentsAfterNode(node, savedContainerPos, savedContainerEnd, savedDeclarationListContainerEnd);
                onAfterEmitNode === null || onAfterEmitNode === void 0 ? void 0 : onAfterEmitNode(node);
                state.stackIndex--;
            }
        }
        function maybeEmitExpression(next, parent, side) {
            var parenthesizerRule = side === "left" ?
                parenthesizer.getParenthesizeLeftSideOfBinaryForOperator(parent.operatorToken.kind) :
                parenthesizer.getParenthesizeRightSideOfBinaryForOperator(parent.operatorToken.kind);
            var pipelinePhase = getPipelinePhase(0 /* PipelinePhase.Notification */, 1 /* EmitHint.Expression */, next);
            if (pipelinePhase === pipelineEmitWithSubstitution) {
                ts_1.Debug.assertIsDefined(lastSubstitution);
                next = parenthesizerRule((0, ts_1.cast)(lastSubstitution, ts_1.isExpression));
                pipelinePhase = getNextPipelinePhase(1 /* PipelinePhase.Substitution */, 1 /* EmitHint.Expression */, next);
                lastSubstitution = undefined;
            }
            if (pipelinePhase === pipelineEmitWithComments ||
                pipelinePhase === pipelineEmitWithSourceMaps ||
                pipelinePhase === pipelineEmitWithHint) {
                if ((0, ts_1.isBinaryExpression)(next)) {
                    return next;
                }
            }
            currentParenthesizerRule = parenthesizerRule;
            pipelinePhase(1 /* EmitHint.Expression */, next);
        }
    }
    function emitConditionalExpression(node) {
        var linesBeforeQuestion = getLinesBetweenNodes(node, node.condition, node.questionToken);
        var linesAfterQuestion = getLinesBetweenNodes(node, node.questionToken, node.whenTrue);
        var linesBeforeColon = getLinesBetweenNodes(node, node.whenTrue, node.colonToken);
        var linesAfterColon = getLinesBetweenNodes(node, node.colonToken, node.whenFalse);
        emitExpression(node.condition, parenthesizer.parenthesizeConditionOfConditionalExpression);
        writeLinesAndIndent(linesBeforeQuestion, /*writeSpaceIfNotIndenting*/ true);
        emit(node.questionToken);
        writeLinesAndIndent(linesAfterQuestion, /*writeSpaceIfNotIndenting*/ true);
        emitExpression(node.whenTrue, parenthesizer.parenthesizeBranchOfConditionalExpression);
        decreaseIndentIf(linesBeforeQuestion, linesAfterQuestion);
        writeLinesAndIndent(linesBeforeColon, /*writeSpaceIfNotIndenting*/ true);
        emit(node.colonToken);
        writeLinesAndIndent(linesAfterColon, /*writeSpaceIfNotIndenting*/ true);
        emitExpression(node.whenFalse, parenthesizer.parenthesizeBranchOfConditionalExpression);
        decreaseIndentIf(linesBeforeColon, linesAfterColon);
    }
    function emitTemplateExpression(node) {
        emit(node.head);
        emitList(node, node.templateSpans, 262144 /* ListFormat.TemplateExpressionSpans */);
    }
    function emitYieldExpression(node) {
        emitTokenWithComment(127 /* SyntaxKind.YieldKeyword */, node.pos, writeKeyword, node);
        emit(node.asteriskToken);
        emitExpressionWithLeadingSpace(node.expression && parenthesizeExpressionForNoAsi(node.expression), parenthesizeExpressionForNoAsiAndDisallowedComma);
    }
    function emitSpreadElement(node) {
        emitTokenWithComment(26 /* SyntaxKind.DotDotDotToken */, node.pos, writePunctuation, node);
        emitExpression(node.expression, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitClassExpression(node) {
        generateNameIfNeeded(node.name);
        emitClassDeclarationOrExpression(node);
    }
    function emitExpressionWithTypeArguments(node) {
        emitExpression(node.expression, parenthesizer.parenthesizeLeftSideOfAccess);
        emitTypeArguments(node, node.typeArguments);
    }
    function emitAsExpression(node) {
        emitExpression(node.expression, /*parenthesizerRule*/ undefined);
        if (node.type) {
            writeSpace();
            writeKeyword("as");
            writeSpace();
            emit(node.type);
        }
    }
    function emitNonNullExpression(node) {
        emitExpression(node.expression, parenthesizer.parenthesizeLeftSideOfAccess);
        writeOperator("!");
    }
    function emitSatisfiesExpression(node) {
        emitExpression(node.expression, /*parenthesizerRule*/ undefined);
        if (node.type) {
            writeSpace();
            writeKeyword("satisfies");
            writeSpace();
            emit(node.type);
        }
    }
    function emitMetaProperty(node) {
        writeToken(node.keywordToken, node.pos, writePunctuation);
        writePunctuation(".");
        emit(node.name);
    }
    //
    // Misc
    //
    function emitTemplateSpan(node) {
        emitExpression(node.expression);
        emit(node.literal);
    }
    //
    // Statements
    //
    function emitBlock(node) {
        emitBlockStatements(node, /*forceSingleLine*/ !node.multiLine && isEmptyBlock(node));
    }
    function emitBlockStatements(node, forceSingleLine) {
        emitTokenWithComment(19 /* SyntaxKind.OpenBraceToken */, node.pos, writePunctuation, /*contextNode*/ node);
        var format = forceSingleLine || (0, ts_1.getEmitFlags)(node) & 1 /* EmitFlags.SingleLine */ ? 768 /* ListFormat.SingleLineBlockStatements */ : 129 /* ListFormat.MultiLineBlockStatements */;
        emitList(node, node.statements, format);
        emitTokenWithComment(20 /* SyntaxKind.CloseBraceToken */, node.statements.end, writePunctuation, /*contextNode*/ node, /*indentLeading*/ !!(format & 1 /* ListFormat.MultiLine */));
    }
    function emitVariableStatement(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        emit(node.declarationList);
        writeTrailingSemicolon();
    }
    function emitEmptyStatement(isEmbeddedStatement) {
        // While most trailing semicolons are possibly insignificant, an embedded "empty"
        // statement is significant and cannot be elided by a trailing-semicolon-omitting writer.
        if (isEmbeddedStatement) {
            writePunctuation(";");
        }
        else {
            writeTrailingSemicolon();
        }
    }
    function emitExpressionStatement(node) {
        emitExpression(node.expression, parenthesizer.parenthesizeExpressionOfExpressionStatement);
        // Emit semicolon in non json files
        // or if json file that created synthesized expression(eg.define expression statement when --out and amd code generation)
        if (!currentSourceFile || !(0, ts_1.isJsonSourceFile)(currentSourceFile) || (0, ts_1.nodeIsSynthesized)(node.expression)) {
            writeTrailingSemicolon();
        }
    }
    function emitIfStatement(node) {
        var openParenPos = emitTokenWithComment(101 /* SyntaxKind.IfKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
        emitExpression(node.expression);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression.end, writePunctuation, node);
        emitEmbeddedStatement(node, node.thenStatement);
        if (node.elseStatement) {
            writeLineOrSpace(node, node.thenStatement, node.elseStatement);
            emitTokenWithComment(93 /* SyntaxKind.ElseKeyword */, node.thenStatement.end, writeKeyword, node);
            if (node.elseStatement.kind === 244 /* SyntaxKind.IfStatement */) {
                writeSpace();
                emit(node.elseStatement);
            }
            else {
                emitEmbeddedStatement(node, node.elseStatement);
            }
        }
    }
    function emitWhileClause(node, startPos) {
        var openParenPos = emitTokenWithComment(117 /* SyntaxKind.WhileKeyword */, startPos, writeKeyword, node);
        writeSpace();
        emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
        emitExpression(node.expression);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression.end, writePunctuation, node);
    }
    function emitDoStatement(node) {
        emitTokenWithComment(92 /* SyntaxKind.DoKeyword */, node.pos, writeKeyword, node);
        emitEmbeddedStatement(node, node.statement);
        if ((0, ts_1.isBlock)(node.statement) && !preserveSourceNewlines) {
            writeSpace();
        }
        else {
            writeLineOrSpace(node, node.statement, node.expression);
        }
        emitWhileClause(node, node.statement.end);
        writeTrailingSemicolon();
    }
    function emitWhileStatement(node) {
        emitWhileClause(node, node.pos);
        emitEmbeddedStatement(node, node.statement);
    }
    function emitForStatement(node) {
        var openParenPos = emitTokenWithComment(99 /* SyntaxKind.ForKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        var pos = emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, /*contextNode*/ node);
        emitForBinding(node.initializer);
        pos = emitTokenWithComment(27 /* SyntaxKind.SemicolonToken */, node.initializer ? node.initializer.end : pos, writePunctuation, node);
        emitExpressionWithLeadingSpace(node.condition);
        pos = emitTokenWithComment(27 /* SyntaxKind.SemicolonToken */, node.condition ? node.condition.end : pos, writePunctuation, node);
        emitExpressionWithLeadingSpace(node.incrementor);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.incrementor ? node.incrementor.end : pos, writePunctuation, node);
        emitEmbeddedStatement(node, node.statement);
    }
    function emitForInStatement(node) {
        var openParenPos = emitTokenWithComment(99 /* SyntaxKind.ForKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
        emitForBinding(node.initializer);
        writeSpace();
        emitTokenWithComment(103 /* SyntaxKind.InKeyword */, node.initializer.end, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression.end, writePunctuation, node);
        emitEmbeddedStatement(node, node.statement);
    }
    function emitForOfStatement(node) {
        var openParenPos = emitTokenWithComment(99 /* SyntaxKind.ForKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitWithTrailingSpace(node.awaitModifier);
        emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
        emitForBinding(node.initializer);
        writeSpace();
        emitTokenWithComment(164 /* SyntaxKind.OfKeyword */, node.initializer.end, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression.end, writePunctuation, node);
        emitEmbeddedStatement(node, node.statement);
    }
    function emitForBinding(node) {
        if (node !== undefined) {
            if (node.kind === 260 /* SyntaxKind.VariableDeclarationList */) {
                emit(node);
            }
            else {
                emitExpression(node);
            }
        }
    }
    function emitContinueStatement(node) {
        emitTokenWithComment(88 /* SyntaxKind.ContinueKeyword */, node.pos, writeKeyword, node);
        emitWithLeadingSpace(node.label);
        writeTrailingSemicolon();
    }
    function emitBreakStatement(node) {
        emitTokenWithComment(83 /* SyntaxKind.BreakKeyword */, node.pos, writeKeyword, node);
        emitWithLeadingSpace(node.label);
        writeTrailingSemicolon();
    }
    function emitTokenWithComment(token, pos, writer, contextNode, indentLeading) {
        var node = (0, ts_1.getParseTreeNode)(contextNode);
        var isSimilarNode = node && node.kind === contextNode.kind;
        var startPos = pos;
        if (isSimilarNode && currentSourceFile) {
            pos = (0, ts_1.skipTrivia)(currentSourceFile.text, pos);
        }
        if (isSimilarNode && contextNode.pos !== startPos) {
            var needsIndent = indentLeading && currentSourceFile && !(0, ts_1.positionsAreOnSameLine)(startPos, pos, currentSourceFile);
            if (needsIndent) {
                increaseIndent();
            }
            emitLeadingCommentsOfPosition(startPos);
            if (needsIndent) {
                decreaseIndent();
            }
        }
        pos = writeTokenText(token, writer, pos);
        if (isSimilarNode && contextNode.end !== pos) {
            var isJsxExprContext = contextNode.kind === 293 /* SyntaxKind.JsxExpression */;
            emitTrailingCommentsOfPosition(pos, /*prefixSpace*/ !isJsxExprContext, /*forceNoNewline*/ isJsxExprContext);
        }
        return pos;
    }
    function commentWillEmitNewLine(node) {
        return node.kind === 2 /* SyntaxKind.SingleLineCommentTrivia */ || !!node.hasTrailingNewLine;
    }
    function willEmitLeadingNewLine(node) {
        if (!currentSourceFile)
            return false;
        if ((0, ts_1.some)((0, ts_1.getLeadingCommentRanges)(currentSourceFile.text, node.pos), commentWillEmitNewLine))
            return true;
        if ((0, ts_1.some)((0, ts_1.getSyntheticLeadingComments)(node), commentWillEmitNewLine))
            return true;
        if ((0, ts_1.isPartiallyEmittedExpression)(node)) {
            if (node.pos !== node.expression.pos) {
                if ((0, ts_1.some)((0, ts_1.getTrailingCommentRanges)(currentSourceFile.text, node.expression.pos), commentWillEmitNewLine))
                    return true;
            }
            return willEmitLeadingNewLine(node.expression);
        }
        return false;
    }
    /**
     * Wraps an expression in parens if we would emit a leading comment that would introduce a line separator
     * between the node and its parent.
     */
    function parenthesizeExpressionForNoAsi(node) {
        if (!commentsDisabled && (0, ts_1.isPartiallyEmittedExpression)(node) && willEmitLeadingNewLine(node)) {
            var parseNode = (0, ts_1.getParseTreeNode)(node);
            if (parseNode && (0, ts_1.isParenthesizedExpression)(parseNode)) {
                // If the original node was a parenthesized expression, restore it to preserve comment and source map emit
                var parens = ts_1.factory.createParenthesizedExpression(node.expression);
                (0, ts_1.setOriginalNode)(parens, node);
                (0, ts_1.setTextRange)(parens, parseNode);
                return parens;
            }
            return ts_1.factory.createParenthesizedExpression(node);
        }
        return node;
    }
    function parenthesizeExpressionForNoAsiAndDisallowedComma(node) {
        return parenthesizeExpressionForNoAsi(parenthesizer.parenthesizeExpressionForDisallowedComma(node));
    }
    function emitReturnStatement(node) {
        emitTokenWithComment(107 /* SyntaxKind.ReturnKeyword */, node.pos, writeKeyword, /*contextNode*/ node);
        emitExpressionWithLeadingSpace(node.expression && parenthesizeExpressionForNoAsi(node.expression), parenthesizeExpressionForNoAsi);
        writeTrailingSemicolon();
    }
    function emitWithStatement(node) {
        var openParenPos = emitTokenWithComment(118 /* SyntaxKind.WithKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
        emitExpression(node.expression);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression.end, writePunctuation, node);
        emitEmbeddedStatement(node, node.statement);
    }
    function emitSwitchStatement(node) {
        var openParenPos = emitTokenWithComment(109 /* SyntaxKind.SwitchKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
        emitExpression(node.expression);
        emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.expression.end, writePunctuation, node);
        writeSpace();
        emit(node.caseBlock);
    }
    function emitLabeledStatement(node) {
        emit(node.label);
        emitTokenWithComment(59 /* SyntaxKind.ColonToken */, node.label.end, writePunctuation, node);
        writeSpace();
        emit(node.statement);
    }
    function emitThrowStatement(node) {
        emitTokenWithComment(111 /* SyntaxKind.ThrowKeyword */, node.pos, writeKeyword, node);
        emitExpressionWithLeadingSpace(parenthesizeExpressionForNoAsi(node.expression), parenthesizeExpressionForNoAsi);
        writeTrailingSemicolon();
    }
    function emitTryStatement(node) {
        emitTokenWithComment(113 /* SyntaxKind.TryKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emit(node.tryBlock);
        if (node.catchClause) {
            writeLineOrSpace(node, node.tryBlock, node.catchClause);
            emit(node.catchClause);
        }
        if (node.finallyBlock) {
            writeLineOrSpace(node, node.catchClause || node.tryBlock, node.finallyBlock);
            emitTokenWithComment(98 /* SyntaxKind.FinallyKeyword */, (node.catchClause || node.tryBlock).end, writeKeyword, node);
            writeSpace();
            emit(node.finallyBlock);
        }
    }
    function emitDebuggerStatement(node) {
        writeToken(89 /* SyntaxKind.DebuggerKeyword */, node.pos, writeKeyword);
        writeTrailingSemicolon();
    }
    //
    // Declarations
    //
    function emitVariableDeclaration(node) {
        var _a, _b, _c, _d, _e;
        emit(node.name);
        emit(node.exclamationToken);
        emitTypeAnnotation(node.type);
        emitInitializer(node.initializer, (_e = (_b = (_a = node.type) === null || _a === void 0 ? void 0 : _a.end) !== null && _b !== void 0 ? _b : (_d = (_c = node.name.emitNode) === null || _c === void 0 ? void 0 : _c.typeNode) === null || _d === void 0 ? void 0 : _d.end) !== null && _e !== void 0 ? _e : node.name.end, node, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitVariableDeclarationList(node) {
        writeKeyword((0, ts_1.isLet)(node) ? "let" : (0, ts_1.isVarConst)(node) ? "const" : "var");
        writeSpace();
        emitList(node, node.declarations, 528 /* ListFormat.VariableDeclarationList */);
    }
    function emitFunctionDeclaration(node) {
        emitFunctionDeclarationOrExpression(node);
    }
    function emitFunctionDeclarationOrExpression(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        writeKeyword("function");
        emit(node.asteriskToken);
        writeSpace();
        emitIdentifierName(node.name);
        emitSignatureAndBody(node, emitSignatureHead);
    }
    function emitSignatureAndBody(node, emitSignatureHead) {
        var body = node.body;
        if (body) {
            if ((0, ts_1.isBlock)(body)) {
                var indentedFlag = (0, ts_1.getEmitFlags)(node) & 131072 /* EmitFlags.Indented */;
                if (indentedFlag) {
                    increaseIndent();
                }
                pushNameGenerationScope(node);
                (0, ts_1.forEach)(node.parameters, generateNames);
                generateNames(node.body);
                emitSignatureHead(node);
                emitBlockFunctionBody(body);
                popNameGenerationScope(node);
                if (indentedFlag) {
                    decreaseIndent();
                }
            }
            else {
                emitSignatureHead(node);
                writeSpace();
                emitExpression(body, parenthesizer.parenthesizeConciseBodyOfArrowFunction);
            }
        }
        else {
            emitSignatureHead(node);
            writeTrailingSemicolon();
        }
    }
    function emitSignatureHead(node) {
        emitTypeParameters(node, node.typeParameters);
        emitParameters(node, node.parameters);
        emitTypeAnnotation(node.type);
    }
    function shouldEmitBlockFunctionBodyOnSingleLine(body) {
        // We must emit a function body as a single-line body in the following case:
        // * The body has NodeEmitFlags.SingleLine specified.
        // We must emit a function body as a multi-line body in the following cases:
        // * The body is explicitly marked as multi-line.
        // * A non-synthesized body's start and end position are on different lines.
        // * Any statement in the body starts on a new line.
        if ((0, ts_1.getEmitFlags)(body) & 1 /* EmitFlags.SingleLine */) {
            return true;
        }
        if (body.multiLine) {
            return false;
        }
        if (!(0, ts_1.nodeIsSynthesized)(body) && currentSourceFile && !(0, ts_1.rangeIsOnSingleLine)(body, currentSourceFile)) {
            return false;
        }
        if (getLeadingLineTerminatorCount(body, (0, ts_1.firstOrUndefined)(body.statements), 2 /* ListFormat.PreserveLines */)
            || getClosingLineTerminatorCount(body, (0, ts_1.lastOrUndefined)(body.statements), 2 /* ListFormat.PreserveLines */, body.statements)) {
            return false;
        }
        var previousStatement;
        for (var _a = 0, _b = body.statements; _a < _b.length; _a++) {
            var statement = _b[_a];
            if (getSeparatingLineTerminatorCount(previousStatement, statement, 2 /* ListFormat.PreserveLines */) > 0) {
                return false;
            }
            previousStatement = statement;
        }
        return true;
    }
    function emitBlockFunctionBody(body) {
        onBeforeEmitNode === null || onBeforeEmitNode === void 0 ? void 0 : onBeforeEmitNode(body);
        writeSpace();
        writePunctuation("{");
        increaseIndent();
        var emitBlockFunctionBody = shouldEmitBlockFunctionBodyOnSingleLine(body)
            ? emitBlockFunctionBodyOnSingleLine
            : emitBlockFunctionBodyWorker;
        emitBodyWithDetachedComments(body, body.statements, emitBlockFunctionBody);
        decreaseIndent();
        writeToken(20 /* SyntaxKind.CloseBraceToken */, body.statements.end, writePunctuation, body);
        onAfterEmitNode === null || onAfterEmitNode === void 0 ? void 0 : onAfterEmitNode(body);
    }
    function emitBlockFunctionBodyOnSingleLine(body) {
        emitBlockFunctionBodyWorker(body, /*emitBlockFunctionBodyOnSingleLine*/ true);
    }
    function emitBlockFunctionBodyWorker(body, emitBlockFunctionBodyOnSingleLine) {
        // Emit all the prologue directives (like "use strict").
        var statementOffset = emitPrologueDirectives(body.statements);
        var pos = writer.getTextPos();
        emitHelpers(body);
        if (statementOffset === 0 && pos === writer.getTextPos() && emitBlockFunctionBodyOnSingleLine) {
            decreaseIndent();
            emitList(body, body.statements, 768 /* ListFormat.SingleLineFunctionBodyStatements */);
            increaseIndent();
        }
        else {
            emitList(body, body.statements, 1 /* ListFormat.MultiLineFunctionBodyStatements */, /*parenthesizerRule*/ undefined, statementOffset);
        }
    }
    function emitClassDeclaration(node) {
        emitClassDeclarationOrExpression(node);
    }
    function emitClassDeclarationOrExpression(node) {
        pushPrivateNameGenerationScope(0 /* TempFlags.Auto */, /*newReservedMemberNames*/ undefined);
        (0, ts_1.forEach)(node.members, generateMemberNames);
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ true);
        emitTokenWithComment(86 /* SyntaxKind.ClassKeyword */, (0, ts_1.moveRangePastModifiers)(node).pos, writeKeyword, node);
        if (node.name) {
            writeSpace();
            emitIdentifierName(node.name);
        }
        var indentedFlag = (0, ts_1.getEmitFlags)(node) & 131072 /* EmitFlags.Indented */;
        if (indentedFlag) {
            increaseIndent();
        }
        emitTypeParameters(node, node.typeParameters);
        emitList(node, node.heritageClauses, 0 /* ListFormat.ClassHeritageClauses */);
        writeSpace();
        writePunctuation("{");
        emitList(node, node.members, 129 /* ListFormat.ClassMembers */);
        writePunctuation("}");
        if (indentedFlag) {
            decreaseIndent();
        }
        popPrivateNameGenerationScope();
    }
    function emitInterfaceDeclaration(node) {
        // Interfaces don't have private names, but we need to push a new scope so that
        // we can step out of it when emitting a computed property.
        pushPrivateNameGenerationScope(0 /* TempFlags.Auto */, /*newReservedMemberNames*/ undefined);
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        writeKeyword("interface");
        writeSpace();
        emit(node.name);
        emitTypeParameters(node, node.typeParameters);
        emitList(node, node.heritageClauses, 512 /* ListFormat.HeritageClauses */);
        writeSpace();
        writePunctuation("{");
        emitList(node, node.members, 129 /* ListFormat.InterfaceMembers */);
        writePunctuation("}");
        popPrivateNameGenerationScope();
    }
    function emitTypeAliasDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        writeKeyword("type");
        writeSpace();
        emit(node.name);
        emitTypeParameters(node, node.typeParameters);
        writeSpace();
        writePunctuation("=");
        writeSpace();
        emit(node.type);
        writeTrailingSemicolon();
    }
    function emitEnumDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        writeKeyword("enum");
        writeSpace();
        emit(node.name);
        writeSpace();
        writePunctuation("{");
        emitList(node, node.members, 145 /* ListFormat.EnumMembers */);
        writePunctuation("}");
    }
    function emitModuleDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        if (~node.flags & 1024 /* NodeFlags.GlobalAugmentation */) {
            writeKeyword(node.flags & 16 /* NodeFlags.Namespace */ ? "namespace" : "module");
            writeSpace();
        }
        emit(node.name);
        var body = node.body;
        if (!body)
            return writeTrailingSemicolon();
        while (body && (0, ts_1.isModuleDeclaration)(body)) {
            writePunctuation(".");
            emit(body.name);
            body = body.body;
        }
        writeSpace();
        emit(body);
    }
    function emitModuleBlock(node) {
        pushNameGenerationScope(node);
        (0, ts_1.forEach)(node.statements, generateNames);
        emitBlockStatements(node, /*forceSingleLine*/ isEmptyBlock(node));
        popNameGenerationScope(node);
    }
    function emitCaseBlock(node) {
        emitTokenWithComment(19 /* SyntaxKind.OpenBraceToken */, node.pos, writePunctuation, node);
        emitList(node, node.clauses, 129 /* ListFormat.CaseBlockClauses */);
        emitTokenWithComment(20 /* SyntaxKind.CloseBraceToken */, node.clauses.end, writePunctuation, node, /*indentLeading*/ true);
    }
    function emitImportEqualsDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        emitTokenWithComment(102 /* SyntaxKind.ImportKeyword */, node.modifiers ? node.modifiers.end : node.pos, writeKeyword, node);
        writeSpace();
        if (node.isTypeOnly) {
            emitTokenWithComment(156 /* SyntaxKind.TypeKeyword */, node.pos, writeKeyword, node);
            writeSpace();
        }
        emit(node.name);
        writeSpace();
        emitTokenWithComment(64 /* SyntaxKind.EqualsToken */, node.name.end, writePunctuation, node);
        writeSpace();
        emitModuleReference(node.moduleReference);
        writeTrailingSemicolon();
    }
    function emitModuleReference(node) {
        if (node.kind === 80 /* SyntaxKind.Identifier */) {
            emitExpression(node);
        }
        else {
            emit(node);
        }
    }
    function emitImportDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        emitTokenWithComment(102 /* SyntaxKind.ImportKeyword */, node.modifiers ? node.modifiers.end : node.pos, writeKeyword, node);
        writeSpace();
        if (node.importClause) {
            emit(node.importClause);
            writeSpace();
            emitTokenWithComment(160 /* SyntaxKind.FromKeyword */, node.importClause.end, writeKeyword, node);
            writeSpace();
        }
        emitExpression(node.moduleSpecifier);
        if (node.assertClause) {
            emitWithLeadingSpace(node.assertClause);
        }
        writeTrailingSemicolon();
    }
    function emitImportClause(node) {
        if (node.isTypeOnly) {
            emitTokenWithComment(156 /* SyntaxKind.TypeKeyword */, node.pos, writeKeyword, node);
            writeSpace();
        }
        emit(node.name);
        if (node.name && node.namedBindings) {
            emitTokenWithComment(28 /* SyntaxKind.CommaToken */, node.name.end, writePunctuation, node);
            writeSpace();
        }
        emit(node.namedBindings);
    }
    function emitNamespaceImport(node) {
        var asPos = emitTokenWithComment(42 /* SyntaxKind.AsteriskToken */, node.pos, writePunctuation, node);
        writeSpace();
        emitTokenWithComment(130 /* SyntaxKind.AsKeyword */, asPos, writeKeyword, node);
        writeSpace();
        emit(node.name);
    }
    function emitNamedImports(node) {
        emitNamedImportsOrExports(node);
    }
    function emitImportSpecifier(node) {
        emitImportOrExportSpecifier(node);
    }
    function emitExportAssignment(node) {
        var nextPos = emitTokenWithComment(95 /* SyntaxKind.ExportKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        if (node.isExportEquals) {
            emitTokenWithComment(64 /* SyntaxKind.EqualsToken */, nextPos, writeOperator, node);
        }
        else {
            emitTokenWithComment(90 /* SyntaxKind.DefaultKeyword */, nextPos, writeKeyword, node);
        }
        writeSpace();
        emitExpression(node.expression, node.isExportEquals ?
            parenthesizer.getParenthesizeRightSideOfBinaryForOperator(64 /* SyntaxKind.EqualsToken */) :
            parenthesizer.parenthesizeExpressionOfExportDefault);
        writeTrailingSemicolon();
    }
    function emitExportDeclaration(node) {
        emitDecoratorsAndModifiers(node, node.modifiers, /*allowDecorators*/ false);
        var nextPos = emitTokenWithComment(95 /* SyntaxKind.ExportKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        if (node.isTypeOnly) {
            nextPos = emitTokenWithComment(156 /* SyntaxKind.TypeKeyword */, nextPos, writeKeyword, node);
            writeSpace();
        }
        if (node.exportClause) {
            emit(node.exportClause);
        }
        else {
            nextPos = emitTokenWithComment(42 /* SyntaxKind.AsteriskToken */, nextPos, writePunctuation, node);
        }
        if (node.moduleSpecifier) {
            writeSpace();
            var fromPos = node.exportClause ? node.exportClause.end : nextPos;
            emitTokenWithComment(160 /* SyntaxKind.FromKeyword */, fromPos, writeKeyword, node);
            writeSpace();
            emitExpression(node.moduleSpecifier);
        }
        if (node.assertClause) {
            emitWithLeadingSpace(node.assertClause);
        }
        writeTrailingSemicolon();
    }
    function emitAssertClause(node) {
        emitTokenWithComment(132 /* SyntaxKind.AssertKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        var elements = node.elements;
        emitList(node, elements, 526226 /* ListFormat.ImportClauseEntries */);
    }
    function emitAssertEntry(node) {
        emit(node.name);
        writePunctuation(":");
        writeSpace();
        var value = node.value;
        /** @see {emitPropertyAssignment} */
        if (((0, ts_1.getEmitFlags)(value) & 1024 /* EmitFlags.NoLeadingComments */) === 0) {
            var commentRange = (0, ts_1.getCommentRange)(value);
            emitTrailingCommentsOfPosition(commentRange.pos);
        }
        emit(value);
    }
    function emitNamespaceExportDeclaration(node) {
        var nextPos = emitTokenWithComment(95 /* SyntaxKind.ExportKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        nextPos = emitTokenWithComment(130 /* SyntaxKind.AsKeyword */, nextPos, writeKeyword, node);
        writeSpace();
        nextPos = emitTokenWithComment(145 /* SyntaxKind.NamespaceKeyword */, nextPos, writeKeyword, node);
        writeSpace();
        emit(node.name);
        writeTrailingSemicolon();
    }
    function emitNamespaceExport(node) {
        var asPos = emitTokenWithComment(42 /* SyntaxKind.AsteriskToken */, node.pos, writePunctuation, node);
        writeSpace();
        emitTokenWithComment(130 /* SyntaxKind.AsKeyword */, asPos, writeKeyword, node);
        writeSpace();
        emit(node.name);
    }
    function emitNamedExports(node) {
        emitNamedImportsOrExports(node);
    }
    function emitExportSpecifier(node) {
        emitImportOrExportSpecifier(node);
    }
    function emitNamedImportsOrExports(node) {
        writePunctuation("{");
        emitList(node, node.elements, 525136 /* ListFormat.NamedImportsOrExportsElements */);
        writePunctuation("}");
    }
    function emitImportOrExportSpecifier(node) {
        if (node.isTypeOnly) {
            writeKeyword("type");
            writeSpace();
        }
        if (node.propertyName) {
            emit(node.propertyName);
            writeSpace();
            emitTokenWithComment(130 /* SyntaxKind.AsKeyword */, node.propertyName.end, writeKeyword, node);
            writeSpace();
        }
        emit(node.name);
    }
    //
    // Module references
    //
    function emitExternalModuleReference(node) {
        writeKeyword("require");
        writePunctuation("(");
        emitExpression(node.expression);
        writePunctuation(")");
    }
    //
    // JSX
    //
    function emitJsxElement(node) {
        emit(node.openingElement);
        emitList(node, node.children, 262144 /* ListFormat.JsxElementOrFragmentChildren */);
        emit(node.closingElement);
    }
    function emitJsxSelfClosingElement(node) {
        writePunctuation("<");
        emitJsxTagName(node.tagName);
        emitTypeArguments(node, node.typeArguments);
        writeSpace();
        emit(node.attributes);
        writePunctuation("/>");
    }
    function emitJsxFragment(node) {
        emit(node.openingFragment);
        emitList(node, node.children, 262144 /* ListFormat.JsxElementOrFragmentChildren */);
        emit(node.closingFragment);
    }
    function emitJsxOpeningElementOrFragment(node) {
        writePunctuation("<");
        if ((0, ts_1.isJsxOpeningElement)(node)) {
            var indented = writeLineSeparatorsAndIndentBefore(node.tagName, node);
            emitJsxTagName(node.tagName);
            emitTypeArguments(node, node.typeArguments);
            if (node.attributes.properties && node.attributes.properties.length > 0) {
                writeSpace();
            }
            emit(node.attributes);
            writeLineSeparatorsAfter(node.attributes, node);
            decreaseIndentIf(indented);
        }
        writePunctuation(">");
    }
    function emitJsxText(node) {
        writer.writeLiteral(node.text);
    }
    function emitJsxClosingElementOrFragment(node) {
        writePunctuation("</");
        if ((0, ts_1.isJsxClosingElement)(node)) {
            emitJsxTagName(node.tagName);
        }
        writePunctuation(">");
    }
    function emitJsxAttributes(node) {
        emitList(node, node.properties, 262656 /* ListFormat.JsxElementAttributes */);
    }
    function emitJsxAttribute(node) {
        emit(node.name);
        emitNodeWithPrefix("=", writePunctuation, node.initializer, emitJsxAttributeValue);
    }
    function emitJsxSpreadAttribute(node) {
        writePunctuation("{...");
        emitExpression(node.expression);
        writePunctuation("}");
    }
    function hasTrailingCommentsAtPosition(pos) {
        var result = false;
        (0, ts_1.forEachTrailingCommentRange)((currentSourceFile === null || currentSourceFile === void 0 ? void 0 : currentSourceFile.text) || "", pos + 1, function () { return result = true; });
        return result;
    }
    function hasLeadingCommentsAtPosition(pos) {
        var result = false;
        (0, ts_1.forEachLeadingCommentRange)((currentSourceFile === null || currentSourceFile === void 0 ? void 0 : currentSourceFile.text) || "", pos + 1, function () { return result = true; });
        return result;
    }
    function hasCommentsAtPosition(pos) {
        return hasTrailingCommentsAtPosition(pos) || hasLeadingCommentsAtPosition(pos);
    }
    function emitJsxExpression(node) {
        var _a;
        if (node.expression || (!commentsDisabled && !(0, ts_1.nodeIsSynthesized)(node) && hasCommentsAtPosition(node.pos))) { // preserve empty expressions if they contain comments!
            var isMultiline = currentSourceFile && !(0, ts_1.nodeIsSynthesized)(node) && (0, ts_1.getLineAndCharacterOfPosition)(currentSourceFile, node.pos).line !== (0, ts_1.getLineAndCharacterOfPosition)(currentSourceFile, node.end).line;
            if (isMultiline) {
                writer.increaseIndent();
            }
            var end = emitTokenWithComment(19 /* SyntaxKind.OpenBraceToken */, node.pos, writePunctuation, node);
            emit(node.dotDotDotToken);
            emitExpression(node.expression);
            emitTokenWithComment(20 /* SyntaxKind.CloseBraceToken */, ((_a = node.expression) === null || _a === void 0 ? void 0 : _a.end) || end, writePunctuation, node);
            if (isMultiline) {
                writer.decreaseIndent();
            }
        }
    }
    function emitJsxNamespacedName(node) {
        emitIdentifierName(node.namespace);
        writePunctuation(":");
        emitIdentifierName(node.name);
    }
    function emitJsxTagName(node) {
        if (node.kind === 80 /* SyntaxKind.Identifier */) {
            emitExpression(node);
        }
        else {
            emit(node);
        }
    }
    //
    // Clauses
    //
    function emitCaseClause(node) {
        emitTokenWithComment(84 /* SyntaxKind.CaseKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        emitExpression(node.expression, parenthesizer.parenthesizeExpressionForDisallowedComma);
        emitCaseOrDefaultClauseRest(node, node.statements, node.expression.end);
    }
    function emitDefaultClause(node) {
        var pos = emitTokenWithComment(90 /* SyntaxKind.DefaultKeyword */, node.pos, writeKeyword, node);
        emitCaseOrDefaultClauseRest(node, node.statements, pos);
    }
    function emitCaseOrDefaultClauseRest(parentNode, statements, colonPos) {
        var emitAsSingleStatement = statements.length === 1 &&
            (
            // treat synthesized nodes as located on the same line for emit purposes
            !currentSourceFile ||
                (0, ts_1.nodeIsSynthesized)(parentNode) ||
                (0, ts_1.nodeIsSynthesized)(statements[0]) ||
                (0, ts_1.rangeStartPositionsAreOnSameLine)(parentNode, statements[0], currentSourceFile));
        var format = 163969 /* ListFormat.CaseOrDefaultClauseStatements */;
        if (emitAsSingleStatement) {
            writeToken(59 /* SyntaxKind.ColonToken */, colonPos, writePunctuation, parentNode);
            writeSpace();
            format &= ~(1 /* ListFormat.MultiLine */ | 128 /* ListFormat.Indented */);
        }
        else {
            emitTokenWithComment(59 /* SyntaxKind.ColonToken */, colonPos, writePunctuation, parentNode);
        }
        emitList(parentNode, statements, format);
    }
    function emitHeritageClause(node) {
        writeSpace();
        writeTokenText(node.token, writeKeyword);
        writeSpace();
        emitList(node, node.types, 528 /* ListFormat.HeritageClauseTypes */);
    }
    function emitCatchClause(node) {
        var openParenPos = emitTokenWithComment(85 /* SyntaxKind.CatchKeyword */, node.pos, writeKeyword, node);
        writeSpace();
        if (node.variableDeclaration) {
            emitTokenWithComment(21 /* SyntaxKind.OpenParenToken */, openParenPos, writePunctuation, node);
            emit(node.variableDeclaration);
            emitTokenWithComment(22 /* SyntaxKind.CloseParenToken */, node.variableDeclaration.end, writePunctuation, node);
            writeSpace();
        }
        emit(node.block);
    }
    //
    // Property assignments
    //
    function emitPropertyAssignment(node) {
        emit(node.name);
        writePunctuation(":");
        writeSpace();
        // This is to ensure that we emit comment in the following case:
        //      For example:
        //          obj = {
        //              id: /*comment1*/ ()=>void
        //          }
        // "comment1" is not considered to be leading comment for node.initializer
        // but rather a trailing comment on the previous node.
        var initializer = node.initializer;
        if (((0, ts_1.getEmitFlags)(initializer) & 1024 /* EmitFlags.NoLeadingComments */) === 0) {
            var commentRange = (0, ts_1.getCommentRange)(initializer);
            emitTrailingCommentsOfPosition(commentRange.pos);
        }
        emitExpression(initializer, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    function emitShorthandPropertyAssignment(node) {
        emit(node.name);
        if (node.objectAssignmentInitializer) {
            writeSpace();
            writePunctuation("=");
            writeSpace();
            emitExpression(node.objectAssignmentInitializer, parenthesizer.parenthesizeExpressionForDisallowedComma);
        }
    }
    function emitSpreadAssignment(node) {
        if (node.expression) {
            emitTokenWithComment(26 /* SyntaxKind.DotDotDotToken */, node.pos, writePunctuation, node);
            emitExpression(node.expression, parenthesizer.parenthesizeExpressionForDisallowedComma);
        }
    }
    //
    // Enum
    //
    function emitEnumMember(node) {
        emit(node.name);
        emitInitializer(node.initializer, node.name.end, node, parenthesizer.parenthesizeExpressionForDisallowedComma);
    }
    //
    // JSDoc
    //
    function emitJSDoc(node) {
        write("/**");
        if (node.comment) {
            var text = (0, ts_1.getTextOfJSDocComment)(node.comment);
            if (text) {
                var lines = text.split(/\r\n?|\n/g);
                for (var _a = 0, lines_1 = lines; _a < lines_1.length; _a++) {
                    var line = lines_1[_a];
                    writeLine();
                    writeSpace();
                    writePunctuation("*");
                    writeSpace();
                    write(line);
                }
            }
        }
        if (node.tags) {
            if (node.tags.length === 1 && node.tags[0].kind === 350 /* SyntaxKind.JSDocTypeTag */ && !node.comment) {
                writeSpace();
                emit(node.tags[0]);
            }
            else {
                emitList(node, node.tags, 33 /* ListFormat.JSDocComment */);
            }
        }
        writeSpace();
        write("*/");
    }
    function emitJSDocSimpleTypedTag(tag) {
        emitJSDocTagName(tag.tagName);
        emitJSDocTypeExpression(tag.typeExpression);
        emitJSDocComment(tag.comment);
    }
    function emitJSDocSeeTag(tag) {
        emitJSDocTagName(tag.tagName);
        emit(tag.name);
        emitJSDocComment(tag.comment);
    }
    function emitJSDocNameReference(node) {
        writeSpace();
        writePunctuation("{");
        emit(node.name);
        writePunctuation("}");
    }
    function emitJSDocHeritageTag(tag) {
        emitJSDocTagName(tag.tagName);
        writeSpace();
        writePunctuation("{");
        emit(tag.class);
        writePunctuation("}");
        emitJSDocComment(tag.comment);
    }
    function emitJSDocTemplateTag(tag) {
        emitJSDocTagName(tag.tagName);
        emitJSDocTypeExpression(tag.constraint);
        writeSpace();
        emitList(tag, tag.typeParameters, 528 /* ListFormat.CommaListElements */);
        emitJSDocComment(tag.comment);
    }
    function emitJSDocTypedefTag(tag) {
        emitJSDocTagName(tag.tagName);
        if (tag.typeExpression) {
            if (tag.typeExpression.kind === 315 /* SyntaxKind.JSDocTypeExpression */) {
                emitJSDocTypeExpression(tag.typeExpression);
            }
            else {
                writeSpace();
                writePunctuation("{");
                write("Object");
                if (tag.typeExpression.isArrayType) {
                    writePunctuation("[");
                    writePunctuation("]");
                }
                writePunctuation("}");
            }
        }
        if (tag.fullName) {
            writeSpace();
            emit(tag.fullName);
        }
        emitJSDocComment(tag.comment);
        if (tag.typeExpression && tag.typeExpression.kind === 328 /* SyntaxKind.JSDocTypeLiteral */) {
            emitJSDocTypeLiteral(tag.typeExpression);
        }
    }
    function emitJSDocCallbackTag(tag) {
        emitJSDocTagName(tag.tagName);
        if (tag.name) {
            writeSpace();
            emit(tag.name);
        }
        emitJSDocComment(tag.comment);
        emitJSDocSignature(tag.typeExpression);
    }
    function emitJSDocOverloadTag(tag) {
        emitJSDocComment(tag.comment);
        emitJSDocSignature(tag.typeExpression);
    }
    function emitJSDocSimpleTag(tag) {
        emitJSDocTagName(tag.tagName);
        emitJSDocComment(tag.comment);
    }
    function emitJSDocTypeLiteral(lit) {
        emitList(lit, ts_1.factory.createNodeArray(lit.jsDocPropertyTags), 33 /* ListFormat.JSDocComment */);
    }
    function emitJSDocSignature(sig) {
        if (sig.typeParameters) {
            emitList(sig, ts_1.factory.createNodeArray(sig.typeParameters), 33 /* ListFormat.JSDocComment */);
        }
        if (sig.parameters) {
            emitList(sig, ts_1.factory.createNodeArray(sig.parameters), 33 /* ListFormat.JSDocComment */);
        }
        if (sig.type) {
            writeLine();
            writeSpace();
            writePunctuation("*");
            writeSpace();
            emit(sig.type);
        }
    }
    function emitJSDocPropertyLikeTag(param) {
        emitJSDocTagName(param.tagName);
        emitJSDocTypeExpression(param.typeExpression);
        writeSpace();
        if (param.isBracketed) {
            writePunctuation("[");
        }
        emit(param.name);
        if (param.isBracketed) {
            writePunctuation("]");
        }
        emitJSDocComment(param.comment);
    }
    function emitJSDocTagName(tagName) {
        writePunctuation("@");
        emit(tagName);
    }
    function emitJSDocComment(comment) {
        var text = (0, ts_1.getTextOfJSDocComment)(comment);
        if (text) {
            writeSpace();
            write(text);
        }
    }
    function emitJSDocTypeExpression(typeExpression) {
        if (typeExpression) {
            writeSpace();
            writePunctuation("{");
            emit(typeExpression.type);
            writePunctuation("}");
        }
    }
    //
    // Top-level nodes
    //
    function emitSourceFile(node) {
        writeLine();
        var statements = node.statements;
        // Emit detached comment if there are no prologue directives or if the first node is synthesized.
        // The synthesized node will have no leading comment so some comments may be missed.
        var shouldEmitDetachedComment = statements.length === 0 ||
            !(0, ts_1.isPrologueDirective)(statements[0]) ||
            (0, ts_1.nodeIsSynthesized)(statements[0]);
        if (shouldEmitDetachedComment) {
            emitBodyWithDetachedComments(node, statements, emitSourceFileWorker);
            return;
        }
        emitSourceFileWorker(node);
    }
    function emitSyntheticTripleSlashReferencesIfNeeded(node) {
        emitTripleSlashDirectives(!!node.hasNoDefaultLib, node.syntheticFileReferences || [], node.syntheticTypeReferences || [], node.syntheticLibReferences || []);
        for (var _a = 0, _b = node.prepends; _a < _b.length; _a++) {
            var prepend = _b[_a];
            if ((0, ts_1.isUnparsedSource)(prepend) && prepend.syntheticReferences) {
                for (var _c = 0, _d = prepend.syntheticReferences; _c < _d.length; _c++) {
                    var ref = _d[_c];
                    emit(ref);
                    writeLine();
                }
            }
        }
    }
    function emitTripleSlashDirectivesIfNeeded(node) {
        if (node.isDeclarationFile)
            emitTripleSlashDirectives(node.hasNoDefaultLib, node.referencedFiles, node.typeReferenceDirectives, node.libReferenceDirectives);
    }
    function emitTripleSlashDirectives(hasNoDefaultLib, files, types, libs) {
        if (hasNoDefaultLib) {
            var pos = writer.getTextPos();
            writeComment("/// <reference no-default-lib=\"true\"/>");
            if (bundleFileInfo)
                bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: "no-default-lib" /* BundleFileSectionKind.NoDefaultLib */ });
            writeLine();
        }
        if (currentSourceFile && currentSourceFile.moduleName) {
            writeComment("/// <amd-module name=\"".concat(currentSourceFile.moduleName, "\" />"));
            writeLine();
        }
        if (currentSourceFile && currentSourceFile.amdDependencies) {
            for (var _a = 0, _b = currentSourceFile.amdDependencies; _a < _b.length; _a++) {
                var dep = _b[_a];
                if (dep.name) {
                    writeComment("/// <amd-dependency name=\"".concat(dep.name, "\" path=\"").concat(dep.path, "\" />"));
                }
                else {
                    writeComment("/// <amd-dependency path=\"".concat(dep.path, "\" />"));
                }
                writeLine();
            }
        }
        for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
            var directive = files_1[_c];
            var pos = writer.getTextPos();
            writeComment("/// <reference path=\"".concat(directive.fileName, "\" />"));
            if (bundleFileInfo)
                bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: "reference" /* BundleFileSectionKind.Reference */, data: directive.fileName });
            writeLine();
        }
        for (var _d = 0, types_1 = types; _d < types_1.length; _d++) {
            var directive = types_1[_d];
            var pos = writer.getTextPos();
            var resolutionMode = directive.resolutionMode && directive.resolutionMode !== (currentSourceFile === null || currentSourceFile === void 0 ? void 0 : currentSourceFile.impliedNodeFormat)
                ? "resolution-mode=\"".concat(directive.resolutionMode === ts_1.ModuleKind.ESNext ? "import" : "require", "\"")
                : "";
            writeComment("/// <reference types=\"".concat(directive.fileName, "\" ").concat(resolutionMode, "/>"));
            if (bundleFileInfo)
                bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: !directive.resolutionMode ? "type" /* BundleFileSectionKind.Type */ : directive.resolutionMode === ts_1.ModuleKind.ESNext ? "type-import" /* BundleFileSectionKind.TypeResolutionModeImport */ : "type-require" /* BundleFileSectionKind.TypeResolutionModeRequire */, data: directive.fileName });
            writeLine();
        }
        for (var _e = 0, libs_1 = libs; _e < libs_1.length; _e++) {
            var directive = libs_1[_e];
            var pos = writer.getTextPos();
            writeComment("/// <reference lib=\"".concat(directive.fileName, "\" />"));
            if (bundleFileInfo)
                bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: "lib" /* BundleFileSectionKind.Lib */, data: directive.fileName });
            writeLine();
        }
    }
    function emitSourceFileWorker(node) {
        var statements = node.statements;
        pushNameGenerationScope(node);
        (0, ts_1.forEach)(node.statements, generateNames);
        emitHelpers(node);
        var index = (0, ts_1.findIndex)(statements, function (statement) { return !(0, ts_1.isPrologueDirective)(statement); });
        emitTripleSlashDirectivesIfNeeded(node);
        emitList(node, statements, 1 /* ListFormat.MultiLine */, /*parenthesizerRule*/ undefined, index === -1 ? statements.length : index);
        popNameGenerationScope(node);
    }
    // Transformation nodes
    function emitPartiallyEmittedExpression(node) {
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        if (!(emitFlags & 1024 /* EmitFlags.NoLeadingComments */) && node.pos !== node.expression.pos) {
            emitTrailingCommentsOfPosition(node.expression.pos);
        }
        emitExpression(node.expression);
        if (!(emitFlags & 2048 /* EmitFlags.NoTrailingComments */) && node.end !== node.expression.end) {
            emitLeadingCommentsOfPosition(node.expression.end);
        }
    }
    function emitCommaList(node) {
        emitExpressionList(node, node.elements, 528 /* ListFormat.CommaListElements */, /*parenthesizerRule*/ undefined);
    }
    /**
     * Emits any prologue directives at the start of a Statement list, returning the
     * number of prologue directives written to the output.
     */
    function emitPrologueDirectives(statements, sourceFile, seenPrologueDirectives, recordBundleFileSection) {
        var needsToSetSourceFile = !!sourceFile;
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if ((0, ts_1.isPrologueDirective)(statement)) {
                var shouldEmitPrologueDirective = seenPrologueDirectives ? !seenPrologueDirectives.has(statement.expression.text) : true;
                if (shouldEmitPrologueDirective) {
                    if (needsToSetSourceFile) {
                        needsToSetSourceFile = false;
                        setSourceFile(sourceFile);
                    }
                    writeLine();
                    var pos = writer.getTextPos();
                    emit(statement);
                    if (recordBundleFileSection && bundleFileInfo)
                        bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: "prologue" /* BundleFileSectionKind.Prologue */, data: statement.expression.text });
                    if (seenPrologueDirectives) {
                        seenPrologueDirectives.add(statement.expression.text);
                    }
                }
            }
            else {
                // return index of the first non prologue directive
                return i;
            }
        }
        return statements.length;
    }
    function emitUnparsedPrologues(prologues, seenPrologueDirectives) {
        for (var _a = 0, prologues_1 = prologues; _a < prologues_1.length; _a++) {
            var prologue = prologues_1[_a];
            if (!seenPrologueDirectives.has(prologue.data)) {
                writeLine();
                var pos = writer.getTextPos();
                emit(prologue);
                if (bundleFileInfo)
                    bundleFileInfo.sections.push({ pos: pos, end: writer.getTextPos(), kind: "prologue" /* BundleFileSectionKind.Prologue */, data: prologue.data });
                if (seenPrologueDirectives) {
                    seenPrologueDirectives.add(prologue.data);
                }
            }
        }
    }
    function emitPrologueDirectivesIfNeeded(sourceFileOrBundle) {
        if ((0, ts_1.isSourceFile)(sourceFileOrBundle)) {
            emitPrologueDirectives(sourceFileOrBundle.statements, sourceFileOrBundle);
        }
        else {
            var seenPrologueDirectives = new Set();
            for (var _a = 0, _b = sourceFileOrBundle.prepends; _a < _b.length; _a++) {
                var prepend = _b[_a];
                emitUnparsedPrologues(prepend.prologues, seenPrologueDirectives);
            }
            for (var _c = 0, _d = sourceFileOrBundle.sourceFiles; _c < _d.length; _c++) {
                var sourceFile = _d[_c];
                emitPrologueDirectives(sourceFile.statements, sourceFile, seenPrologueDirectives, /*recordBundleFileSection*/ true);
            }
            setSourceFile(undefined);
        }
    }
    function getPrologueDirectivesFromBundledSourceFiles(bundle) {
        var seenPrologueDirectives = new Set();
        var prologues;
        for (var index = 0; index < bundle.sourceFiles.length; index++) {
            var sourceFile = bundle.sourceFiles[index];
            var directives = void 0;
            var end = 0;
            for (var _a = 0, _b = sourceFile.statements; _a < _b.length; _a++) {
                var statement = _b[_a];
                if (!(0, ts_1.isPrologueDirective)(statement))
                    break;
                if (seenPrologueDirectives.has(statement.expression.text))
                    continue;
                seenPrologueDirectives.add(statement.expression.text);
                (directives || (directives = [])).push({
                    pos: statement.pos,
                    end: statement.end,
                    expression: {
                        pos: statement.expression.pos,
                        end: statement.expression.end,
                        text: statement.expression.text
                    }
                });
                end = end < statement.end ? statement.end : end;
            }
            if (directives)
                (prologues || (prologues = [])).push({ file: index, text: sourceFile.text.substring(0, end), directives: directives });
        }
        return prologues;
    }
    function emitShebangIfNeeded(sourceFileOrBundle) {
        if ((0, ts_1.isSourceFile)(sourceFileOrBundle) || (0, ts_1.isUnparsedSource)(sourceFileOrBundle)) {
            var shebang = (0, ts_1.getShebang)(sourceFileOrBundle.text);
            if (shebang) {
                writeComment(shebang);
                writeLine();
                return true;
            }
        }
        else {
            for (var _a = 0, _b = sourceFileOrBundle.prepends; _a < _b.length; _a++) {
                var prepend = _b[_a];
                ts_1.Debug.assertNode(prepend, ts_1.isUnparsedSource);
                if (emitShebangIfNeeded(prepend)) {
                    return true;
                }
            }
            for (var _c = 0, _d = sourceFileOrBundle.sourceFiles; _c < _d.length; _c++) {
                var sourceFile = _d[_c];
                // Emit only the first encountered shebang
                if (emitShebangIfNeeded(sourceFile)) {
                    return true;
                }
            }
        }
    }
    //
    // Helpers
    //
    function emitNodeWithWriter(node, writer) {
        if (!node)
            return;
        var savedWrite = write;
        write = writer;
        emit(node);
        write = savedWrite;
    }
    function emitDecoratorsAndModifiers(node, modifiers, allowDecorators) {
        if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.length) {
            if ((0, ts_1.every)(modifiers, ts_1.isModifier)) {
                // if all modifier-likes are `Modifier`, simply emit the array as modifiers.
                return emitModifierList(node, modifiers);
            }
            if ((0, ts_1.every)(modifiers, ts_1.isDecorator)) {
                if (allowDecorators) {
                    // if all modifier-likes are `Decorator`, simply emit the array as decorators.
                    return emitDecoratorList(node, modifiers);
                }
                return node.pos;
            }
            onBeforeEmitNodeArray === null || onBeforeEmitNodeArray === void 0 ? void 0 : onBeforeEmitNodeArray(modifiers);
            // partition modifiers into contiguous chunks of `Modifier` or `Decorator`
            var lastMode = void 0;
            var mode = void 0;
            var start = 0;
            var pos = 0;
            var lastModifier = void 0;
            while (start < modifiers.length) {
                while (pos < modifiers.length) {
                    lastModifier = modifiers[pos];
                    mode = (0, ts_1.isDecorator)(lastModifier) ? "decorators" : "modifiers";
                    if (lastMode === undefined) {
                        lastMode = mode;
                    }
                    else if (mode !== lastMode) {
                        break;
                    }
                    pos++;
                }
                var textRange = { pos: -1, end: -1 };
                if (start === 0)
                    textRange.pos = modifiers.pos;
                if (pos === modifiers.length - 1)
                    textRange.end = modifiers.end;
                if (lastMode === "modifiers" || allowDecorators) {
                    emitNodeListItems(emit, node, modifiers, lastMode === "modifiers" ? 2359808 /* ListFormat.Modifiers */ : 2146305 /* ListFormat.Decorators */, 
                    /*parenthesizerRule*/ undefined, start, pos - start, 
                    /*hasTrailingComma*/ false, textRange);
                }
                start = pos;
                lastMode = mode;
                pos++;
            }
            onAfterEmitNodeArray === null || onAfterEmitNodeArray === void 0 ? void 0 : onAfterEmitNodeArray(modifiers);
            if (lastModifier && !(0, ts_1.positionIsSynthesized)(lastModifier.end)) {
                return lastModifier.end;
            }
        }
        return node.pos;
    }
    function emitModifierList(node, modifiers) {
        emitList(node, modifiers, 2359808 /* ListFormat.Modifiers */);
        var lastModifier = (0, ts_1.lastOrUndefined)(modifiers);
        return lastModifier && !(0, ts_1.positionIsSynthesized)(lastModifier.end) ? lastModifier.end : node.pos;
    }
    function emitTypeAnnotation(node) {
        if (node) {
            writePunctuation(":");
            writeSpace();
            emit(node);
        }
    }
    function emitInitializer(node, equalCommentStartPos, container, parenthesizerRule) {
        if (node) {
            writeSpace();
            emitTokenWithComment(64 /* SyntaxKind.EqualsToken */, equalCommentStartPos, writeOperator, container);
            writeSpace();
            emitExpression(node, parenthesizerRule);
        }
    }
    function emitNodeWithPrefix(prefix, prefixWriter, node, emit) {
        if (node) {
            prefixWriter(prefix);
            emit(node);
        }
    }
    function emitWithLeadingSpace(node) {
        if (node) {
            writeSpace();
            emit(node);
        }
    }
    function emitExpressionWithLeadingSpace(node, parenthesizerRule) {
        if (node) {
            writeSpace();
            emitExpression(node, parenthesizerRule);
        }
    }
    function emitWithTrailingSpace(node) {
        if (node) {
            emit(node);
            writeSpace();
        }
    }
    function emitEmbeddedStatement(parent, node) {
        if ((0, ts_1.isBlock)(node) ||
            (0, ts_1.getEmitFlags)(parent) & 1 /* EmitFlags.SingleLine */ ||
            preserveSourceNewlines && !getLeadingLineTerminatorCount(parent, node, 0 /* ListFormat.None */)) {
            writeSpace();
            emit(node);
        }
        else {
            writeLine();
            increaseIndent();
            if ((0, ts_1.isEmptyStatement)(node)) {
                pipelineEmit(5 /* EmitHint.EmbeddedStatement */, node);
            }
            else {
                emit(node);
            }
            decreaseIndent();
        }
    }
    function emitDecoratorList(parentNode, decorators) {
        emitList(parentNode, decorators, 2146305 /* ListFormat.Decorators */);
        var lastDecorator = (0, ts_1.lastOrUndefined)(decorators);
        return lastDecorator && !(0, ts_1.positionIsSynthesized)(lastDecorator.end) ? lastDecorator.end : parentNode.pos;
    }
    function emitTypeArguments(parentNode, typeArguments) {
        emitList(parentNode, typeArguments, 53776 /* ListFormat.TypeArguments */, typeArgumentParenthesizerRuleSelector);
    }
    function emitTypeParameters(parentNode, typeParameters) {
        if ((0, ts_1.isFunctionLike)(parentNode) && parentNode.typeArguments) { // Quick info uses type arguments in place of type parameters on instantiated signatures
            return emitTypeArguments(parentNode, parentNode.typeArguments);
        }
        emitList(parentNode, typeParameters, 53776 /* ListFormat.TypeParameters */);
    }
    function emitParameters(parentNode, parameters) {
        emitList(parentNode, parameters, 2576 /* ListFormat.Parameters */);
    }
    function canEmitSimpleArrowHead(parentNode, parameters) {
        var parameter = (0, ts_1.singleOrUndefined)(parameters);
        return parameter
            && parameter.pos === parentNode.pos // may not have parsed tokens between parent and parameter
            && (0, ts_1.isArrowFunction)(parentNode) // only arrow functions may have simple arrow head
            && !parentNode.type // arrow function may not have return type annotation
            && !(0, ts_1.some)(parentNode.modifiers) // parent may not have decorators or modifiers
            && !(0, ts_1.some)(parentNode.typeParameters) // parent may not have type parameters
            && !(0, ts_1.some)(parameter.modifiers) // parameter may not have decorators or modifiers
            && !parameter.dotDotDotToken // parameter may not be rest
            && !parameter.questionToken // parameter may not be optional
            && !parameter.type // parameter may not have a type annotation
            && !parameter.initializer // parameter may not have an initializer
            && (0, ts_1.isIdentifier)(parameter.name); // parameter name must be identifier
    }
    function emitParametersForArrow(parentNode, parameters) {
        if (canEmitSimpleArrowHead(parentNode, parameters)) {
            emitList(parentNode, parameters, 2576 /* ListFormat.Parameters */ & ~2048 /* ListFormat.Parenthesis */);
        }
        else {
            emitParameters(parentNode, parameters);
        }
    }
    function emitParametersForIndexSignature(parentNode, parameters) {
        emitList(parentNode, parameters, 8848 /* ListFormat.IndexSignatureParameters */);
    }
    function writeDelimiter(format) {
        switch (format & 60 /* ListFormat.DelimitersMask */) {
            case 0 /* ListFormat.None */:
                break;
            case 16 /* ListFormat.CommaDelimited */:
                writePunctuation(",");
                break;
            case 4 /* ListFormat.BarDelimited */:
                writeSpace();
                writePunctuation("|");
                break;
            case 32 /* ListFormat.AsteriskDelimited */:
                writeSpace();
                writePunctuation("*");
                writeSpace();
                break;
            case 8 /* ListFormat.AmpersandDelimited */:
                writeSpace();
                writePunctuation("&");
                break;
        }
    }
    function emitList(parentNode, children, format, parenthesizerRule, start, count) {
        emitNodeList(emit, parentNode, children, format | (parentNode && (0, ts_1.getEmitFlags)(parentNode) & 2 /* EmitFlags.MultiLine */ ? 65536 /* ListFormat.PreferNewLine */ : 0), parenthesizerRule, start, count);
    }
    function emitExpressionList(parentNode, children, format, parenthesizerRule, start, count) {
        emitNodeList(emitExpression, parentNode, children, format, parenthesizerRule, start, count);
    }
    function emitNodeList(emit, parentNode, children, format, parenthesizerRule, start, count) {
        if (start === void 0) { start = 0; }
        if (count === void 0) { count = children ? children.length - start : 0; }
        var isUndefined = children === undefined;
        if (isUndefined && format & 16384 /* ListFormat.OptionalIfUndefined */) {
            return;
        }
        var isEmpty = children === undefined || start >= children.length || count === 0;
        if (isEmpty && format & 32768 /* ListFormat.OptionalIfEmpty */) {
            onBeforeEmitNodeArray === null || onBeforeEmitNodeArray === void 0 ? void 0 : onBeforeEmitNodeArray(children);
            onAfterEmitNodeArray === null || onAfterEmitNodeArray === void 0 ? void 0 : onAfterEmitNodeArray(children);
            return;
        }
        if (format & 15360 /* ListFormat.BracketsMask */) {
            writePunctuation(getOpeningBracket(format));
            if (isEmpty && children) {
                emitTrailingCommentsOfPosition(children.pos, /*prefixSpace*/ true); // Emit comments within empty bracketed lists
            }
        }
        onBeforeEmitNodeArray === null || onBeforeEmitNodeArray === void 0 ? void 0 : onBeforeEmitNodeArray(children);
        if (isEmpty) {
            // Write a line terminator if the parent node was multi-line
            if (format & 1 /* ListFormat.MultiLine */ && !(preserveSourceNewlines && (!parentNode || currentSourceFile && (0, ts_1.rangeIsOnSingleLine)(parentNode, currentSourceFile)))) {
                writeLine();
            }
            else if (format & 256 /* ListFormat.SpaceBetweenBraces */ && !(format & 524288 /* ListFormat.NoSpaceIfEmpty */)) {
                writeSpace();
            }
        }
        else {
            emitNodeListItems(emit, parentNode, children, format, parenthesizerRule, start, count, children.hasTrailingComma, children);
        }
        onAfterEmitNodeArray === null || onAfterEmitNodeArray === void 0 ? void 0 : onAfterEmitNodeArray(children);
        if (format & 15360 /* ListFormat.BracketsMask */) {
            if (isEmpty && children) {
                emitLeadingCommentsOfPosition(children.end); // Emit leading comments within empty lists
            }
            writePunctuation(getClosingBracket(format));
        }
    }
    /**
     * Emits a list without brackets or raising events.
     *
     * NOTE: You probably don't want to call this directly and should be using `emitList` or `emitExpressionList` instead.
     */
    function emitNodeListItems(emit, parentNode, children, format, parenthesizerRule, start, count, hasTrailingComma, childrenTextRange) {
        // Write the opening line terminator or leading whitespace.
        var mayEmitInterveningComments = (format & 262144 /* ListFormat.NoInterveningComments */) === 0;
        var shouldEmitInterveningComments = mayEmitInterveningComments;
        var leadingLineTerminatorCount = getLeadingLineTerminatorCount(parentNode, children[start], format);
        if (leadingLineTerminatorCount) {
            writeLine(leadingLineTerminatorCount);
            shouldEmitInterveningComments = false;
        }
        else if (format & 256 /* ListFormat.SpaceBetweenBraces */) {
            writeSpace();
        }
        // Increase the indent, if requested.
        if (format & 128 /* ListFormat.Indented */) {
            increaseIndent();
        }
        var emitListItem = getEmitListItem(emit, parenthesizerRule);
        // Emit each child.
        var previousSibling;
        var previousSourceFileTextKind;
        var shouldDecreaseIndentAfterEmit = false;
        for (var i = 0; i < count; i++) {
            var child = children[start + i];
            // Write the delimiter if this is not the first node.
            if (format & 32 /* ListFormat.AsteriskDelimited */) {
                // always write JSDoc in the format "\n *"
                writeLine();
                writeDelimiter(format);
            }
            else if (previousSibling) {
                // i.e
                //      function commentedParameters(
                //          /* Parameter a */
                //          a
                //          /* End of parameter a */ -> this comment isn't considered to be trailing comment of parameter "a" due to newline
                //          ,
                if (format & 60 /* ListFormat.DelimitersMask */ && previousSibling.end !== (parentNode ? parentNode.end : -1)) {
                    var previousSiblingEmitFlags = (0, ts_1.getEmitFlags)(previousSibling);
                    if (!(previousSiblingEmitFlags & 2048 /* EmitFlags.NoTrailingComments */)) {
                        emitLeadingCommentsOfPosition(previousSibling.end);
                    }
                }
                writeDelimiter(format);
                recordBundleFileInternalSectionEnd(previousSourceFileTextKind);
                // Write either a line terminator or whitespace to separate the elements.
                var separatingLineTerminatorCount = getSeparatingLineTerminatorCount(previousSibling, child, format);
                if (separatingLineTerminatorCount > 0) {
                    // If a synthesized node in a single-line list starts on a new
                    // line, we should increase the indent.
                    if ((format & (3 /* ListFormat.LinesMask */ | 128 /* ListFormat.Indented */)) === 0 /* ListFormat.SingleLine */) {
                        increaseIndent();
                        shouldDecreaseIndentAfterEmit = true;
                    }
                    writeLine(separatingLineTerminatorCount);
                    shouldEmitInterveningComments = false;
                }
                else if (previousSibling && format & 512 /* ListFormat.SpaceBetweenSiblings */) {
                    writeSpace();
                }
            }
            // Emit this child.
            previousSourceFileTextKind = recordBundleFileInternalSectionStart(child);
            if (shouldEmitInterveningComments) {
                var commentRange = (0, ts_1.getCommentRange)(child);
                emitTrailingCommentsOfPosition(commentRange.pos);
            }
            else {
                shouldEmitInterveningComments = mayEmitInterveningComments;
            }
            nextListElementPos = child.pos;
            emitListItem(child, emit, parenthesizerRule, i);
            if (shouldDecreaseIndentAfterEmit) {
                decreaseIndent();
                shouldDecreaseIndentAfterEmit = false;
            }
            previousSibling = child;
        }
        // Write a trailing comma, if requested.
        var emitFlags = previousSibling ? (0, ts_1.getEmitFlags)(previousSibling) : 0;
        var skipTrailingComments = commentsDisabled || !!(emitFlags & 2048 /* EmitFlags.NoTrailingComments */);
        var emitTrailingComma = hasTrailingComma && (format & 64 /* ListFormat.AllowTrailingComma */) && (format & 16 /* ListFormat.CommaDelimited */);
        if (emitTrailingComma) {
            if (previousSibling && !skipTrailingComments) {
                emitTokenWithComment(28 /* SyntaxKind.CommaToken */, previousSibling.end, writePunctuation, previousSibling);
            }
            else {
                writePunctuation(",");
            }
        }
        // Emit any trailing comment of the last element in the list
        // i.e
        //       var array = [...
        //          2
        //          /* end of element 2 */
        //       ];
        if (previousSibling && (parentNode ? parentNode.end : -1) !== previousSibling.end && (format & 60 /* ListFormat.DelimitersMask */) && !skipTrailingComments) {
            emitLeadingCommentsOfPosition(emitTrailingComma && (childrenTextRange === null || childrenTextRange === void 0 ? void 0 : childrenTextRange.end) ? childrenTextRange.end : previousSibling.end);
        }
        // Decrease the indent, if requested.
        if (format & 128 /* ListFormat.Indented */) {
            decreaseIndent();
        }
        recordBundleFileInternalSectionEnd(previousSourceFileTextKind);
        // Write the closing line terminator or closing whitespace.
        var closingLineTerminatorCount = getClosingLineTerminatorCount(parentNode, children[start + count - 1], format, childrenTextRange);
        if (closingLineTerminatorCount) {
            writeLine(closingLineTerminatorCount);
        }
        else if (format & (2097152 /* ListFormat.SpaceAfterList */ | 256 /* ListFormat.SpaceBetweenBraces */)) {
            writeSpace();
        }
    }
    // Writers
    function writeLiteral(s) {
        writer.writeLiteral(s);
    }
    function writeStringLiteral(s) {
        writer.writeStringLiteral(s);
    }
    function writeBase(s) {
        writer.write(s);
    }
    function writeSymbol(s, sym) {
        writer.writeSymbol(s, sym);
    }
    function writePunctuation(s) {
        writer.writePunctuation(s);
    }
    function writeTrailingSemicolon() {
        writer.writeTrailingSemicolon(";");
    }
    function writeKeyword(s) {
        writer.writeKeyword(s);
    }
    function writeOperator(s) {
        writer.writeOperator(s);
    }
    function writeParameter(s) {
        writer.writeParameter(s);
    }
    function writeComment(s) {
        writer.writeComment(s);
    }
    function writeSpace() {
        writer.writeSpace(" ");
    }
    function writeProperty(s) {
        writer.writeProperty(s);
    }
    function nonEscapingWrite(s) {
        // This should be defined in a snippet-escaping text writer.
        if (writer.nonEscapingWrite) {
            writer.nonEscapingWrite(s);
        }
        else {
            writer.write(s);
        }
    }
    function writeLine(count) {
        if (count === void 0) { count = 1; }
        for (var i = 0; i < count; i++) {
            writer.writeLine(i > 0);
        }
    }
    function increaseIndent() {
        writer.increaseIndent();
    }
    function decreaseIndent() {
        writer.decreaseIndent();
    }
    function writeToken(token, pos, writer, contextNode) {
        return !sourceMapsDisabled
            ? emitTokenWithSourceMap(contextNode, token, writer, pos, writeTokenText)
            : writeTokenText(token, writer, pos);
    }
    function writeTokenNode(node, writer) {
        if (onBeforeEmitToken) {
            onBeforeEmitToken(node);
        }
        writer((0, ts_1.tokenToString)(node.kind));
        if (onAfterEmitToken) {
            onAfterEmitToken(node);
        }
    }
    function writeTokenText(token, writer, pos) {
        var tokenString = (0, ts_1.tokenToString)(token);
        writer(tokenString);
        return pos < 0 ? pos : pos + tokenString.length;
    }
    function writeLineOrSpace(parentNode, prevChildNode, nextChildNode) {
        if ((0, ts_1.getEmitFlags)(parentNode) & 1 /* EmitFlags.SingleLine */) {
            writeSpace();
        }
        else if (preserveSourceNewlines) {
            var lines = getLinesBetweenNodes(parentNode, prevChildNode, nextChildNode);
            if (lines) {
                writeLine(lines);
            }
            else {
                writeSpace();
            }
        }
        else {
            writeLine();
        }
    }
    function writeLines(text) {
        var lines = text.split(/\r\n?|\n/g);
        var indentation = (0, ts_1.guessIndentation)(lines);
        for (var _a = 0, lines_2 = lines; _a < lines_2.length; _a++) {
            var lineText = lines_2[_a];
            var line = indentation ? lineText.slice(indentation) : lineText;
            if (line.length) {
                writeLine();
                write(line);
            }
        }
    }
    function writeLinesAndIndent(lineCount, writeSpaceIfNotIndenting) {
        if (lineCount) {
            increaseIndent();
            writeLine(lineCount);
        }
        else if (writeSpaceIfNotIndenting) {
            writeSpace();
        }
    }
    // Helper function to decrease the indent if we previously indented.  Allows multiple
    // previous indent values to be considered at a time.  This also allows caller to just
    // call this once, passing in all their appropriate indent values, instead of needing
    // to call this helper function multiple times.
    function decreaseIndentIf(value1, value2) {
        if (value1) {
            decreaseIndent();
        }
        if (value2) {
            decreaseIndent();
        }
    }
    function getLeadingLineTerminatorCount(parentNode, firstChild, format) {
        if (format & 2 /* ListFormat.PreserveLines */ || preserveSourceNewlines) {
            if (format & 65536 /* ListFormat.PreferNewLine */) {
                return 1;
            }
            if (firstChild === undefined) {
                return !parentNode || currentSourceFile && (0, ts_1.rangeIsOnSingleLine)(parentNode, currentSourceFile) ? 0 : 1;
            }
            if (firstChild.pos === nextListElementPos) {
                // If this child starts at the beginning of a list item in a parent list, its leading
                // line terminators have already been written as the separating line terminators of the
                // parent list. Example:
                //
                // class Foo {
                //   constructor() {}
                //   public foo() {}
                // }
                //
                // The outer list is the list of class members, with one line terminator between the
                // constructor and the method. The constructor is written, the separating line terminator
                // is written, and then we start emitting the method. Its modifiers ([public]) constitute an inner
                // list, so we look for its leading line terminators. If we didn't know that we had already
                // written a newline as part of the parent list, it would appear that we need to write a
                // leading newline to start the modifiers.
                return 0;
            }
            if (firstChild.kind === 12 /* SyntaxKind.JsxText */) {
                // JsxText will be written with its leading whitespace, so don't add more manually.
                return 0;
            }
            if (currentSourceFile && parentNode &&
                !(0, ts_1.positionIsSynthesized)(parentNode.pos) &&
                !(0, ts_1.nodeIsSynthesized)(firstChild) &&
                (!firstChild.parent || (0, ts_1.getOriginalNode)(firstChild.parent) === (0, ts_1.getOriginalNode)(parentNode))) {
                if (preserveSourceNewlines) {
                    return getEffectiveLines(function (includeComments) { return (0, ts_1.getLinesBetweenPositionAndPrecedingNonWhitespaceCharacter)(firstChild.pos, parentNode.pos, currentSourceFile, includeComments); });
                }
                return (0, ts_1.rangeStartPositionsAreOnSameLine)(parentNode, firstChild, currentSourceFile) ? 0 : 1;
            }
            if (synthesizedNodeStartsOnNewLine(firstChild, format)) {
                return 1;
            }
        }
        return format & 1 /* ListFormat.MultiLine */ ? 1 : 0;
    }
    function getSeparatingLineTerminatorCount(previousNode, nextNode, format) {
        if (format & 2 /* ListFormat.PreserveLines */ || preserveSourceNewlines) {
            if (previousNode === undefined || nextNode === undefined) {
                return 0;
            }
            if (nextNode.kind === 12 /* SyntaxKind.JsxText */) {
                // JsxText will be written with its leading whitespace, so don't add more manually.
                return 0;
            }
            else if (currentSourceFile && !(0, ts_1.nodeIsSynthesized)(previousNode) && !(0, ts_1.nodeIsSynthesized)(nextNode)) {
                if (preserveSourceNewlines && siblingNodePositionsAreComparable(previousNode, nextNode)) {
                    return getEffectiveLines(function (includeComments) { return (0, ts_1.getLinesBetweenRangeEndAndRangeStart)(previousNode, nextNode, currentSourceFile, includeComments); });
                }
                // If `preserveSourceNewlines` is `false` we do not intend to preserve the effective lines between the
                // previous and next node. Instead we naively check whether nodes are on separate lines within the
                // same node parent. If so, we intend to preserve a single line terminator. This is less precise and
                // expensive than checking with `preserveSourceNewlines` as above, but the goal is not to preserve the
                // effective source lines between two sibling nodes.
                else if (!preserveSourceNewlines && originalNodesHaveSameParent(previousNode, nextNode)) {
                    return (0, ts_1.rangeEndIsOnSameLineAsRangeStart)(previousNode, nextNode, currentSourceFile) ? 0 : 1;
                }
                // If the two nodes are not comparable, add a line terminator based on the format that can indicate
                // whether new lines are preferred or not.
                return format & 65536 /* ListFormat.PreferNewLine */ ? 1 : 0;
            }
            else if (synthesizedNodeStartsOnNewLine(previousNode, format) || synthesizedNodeStartsOnNewLine(nextNode, format)) {
                return 1;
            }
        }
        else if ((0, ts_1.getStartsOnNewLine)(nextNode)) {
            return 1;
        }
        return format & 1 /* ListFormat.MultiLine */ ? 1 : 0;
    }
    function getClosingLineTerminatorCount(parentNode, lastChild, format, childrenTextRange) {
        if (format & 2 /* ListFormat.PreserveLines */ || preserveSourceNewlines) {
            if (format & 65536 /* ListFormat.PreferNewLine */) {
                return 1;
            }
            if (lastChild === undefined) {
                return !parentNode || currentSourceFile && (0, ts_1.rangeIsOnSingleLine)(parentNode, currentSourceFile) ? 0 : 1;
            }
            if (currentSourceFile && parentNode && !(0, ts_1.positionIsSynthesized)(parentNode.pos) && !(0, ts_1.nodeIsSynthesized)(lastChild) && (!lastChild.parent || lastChild.parent === parentNode)) {
                if (preserveSourceNewlines) {
                    var end_1 = childrenTextRange && !(0, ts_1.positionIsSynthesized)(childrenTextRange.end) ? childrenTextRange.end : lastChild.end;
                    return getEffectiveLines(function (includeComments) { return (0, ts_1.getLinesBetweenPositionAndNextNonWhitespaceCharacter)(end_1, parentNode.end, currentSourceFile, includeComments); });
                }
                return (0, ts_1.rangeEndPositionsAreOnSameLine)(parentNode, lastChild, currentSourceFile) ? 0 : 1;
            }
            if (synthesizedNodeStartsOnNewLine(lastChild, format)) {
                return 1;
            }
        }
        if (format & 1 /* ListFormat.MultiLine */ && !(format & 131072 /* ListFormat.NoTrailingNewLine */)) {
            return 1;
        }
        return 0;
    }
    function getEffectiveLines(getLineDifference) {
        // If 'preserveSourceNewlines' is disabled, we should never call this function
        // because it could be more expensive than alternative approximations.
        ts_1.Debug.assert(!!preserveSourceNewlines);
        // We start by measuring the line difference from a position to its adjacent comments,
        // so that this is counted as a one-line difference, not two:
        //
        //   node1;
        //   // NODE2 COMMENT
        //   node2;
        var lines = getLineDifference(/*includeComments*/ true);
        if (lines === 0) {
            // However, if the line difference considering comments was 0, we might have this:
            //
            //   node1; // NODE2 COMMENT
            //   node2;
            //
            // in which case we should be ignoring node2's comment, so this too is counted as
            // a one-line difference, not zero.
            return getLineDifference(/*includeComments*/ false);
        }
        return lines;
    }
    function writeLineSeparatorsAndIndentBefore(node, parent) {
        var leadingNewlines = preserveSourceNewlines && getLeadingLineTerminatorCount(parent, node, 0 /* ListFormat.None */);
        if (leadingNewlines) {
            writeLinesAndIndent(leadingNewlines, /*writeSpaceIfNotIndenting*/ false);
        }
        return !!leadingNewlines;
    }
    function writeLineSeparatorsAfter(node, parent) {
        var trailingNewlines = preserveSourceNewlines && getClosingLineTerminatorCount(parent, node, 0 /* ListFormat.None */, /*childrenTextRange*/ undefined);
        if (trailingNewlines) {
            writeLine(trailingNewlines);
        }
    }
    function synthesizedNodeStartsOnNewLine(node, format) {
        if ((0, ts_1.nodeIsSynthesized)(node)) {
            var startsOnNewLine = (0, ts_1.getStartsOnNewLine)(node);
            if (startsOnNewLine === undefined) {
                return (format & 65536 /* ListFormat.PreferNewLine */) !== 0;
            }
            return startsOnNewLine;
        }
        return (format & 65536 /* ListFormat.PreferNewLine */) !== 0;
    }
    function getLinesBetweenNodes(parent, node1, node2) {
        if ((0, ts_1.getEmitFlags)(parent) & 262144 /* EmitFlags.NoIndentation */) {
            return 0;
        }
        parent = skipSynthesizedParentheses(parent);
        node1 = skipSynthesizedParentheses(node1);
        node2 = skipSynthesizedParentheses(node2);
        // Always use a newline for synthesized code if the synthesizer desires it.
        if ((0, ts_1.getStartsOnNewLine)(node2)) {
            return 1;
        }
        if (currentSourceFile && !(0, ts_1.nodeIsSynthesized)(parent) && !(0, ts_1.nodeIsSynthesized)(node1) && !(0, ts_1.nodeIsSynthesized)(node2)) {
            if (preserveSourceNewlines) {
                return getEffectiveLines(function (includeComments) { return (0, ts_1.getLinesBetweenRangeEndAndRangeStart)(node1, node2, currentSourceFile, includeComments); });
            }
            return (0, ts_1.rangeEndIsOnSameLineAsRangeStart)(node1, node2, currentSourceFile) ? 0 : 1;
        }
        return 0;
    }
    function isEmptyBlock(block) {
        return block.statements.length === 0
            && (!currentSourceFile || (0, ts_1.rangeEndIsOnSameLineAsRangeStart)(block, block, currentSourceFile));
    }
    function skipSynthesizedParentheses(node) {
        while (node.kind === 216 /* SyntaxKind.ParenthesizedExpression */ && (0, ts_1.nodeIsSynthesized)(node)) {
            node = node.expression;
        }
        return node;
    }
    function getTextOfNode(node, includeTrivia) {
        if ((0, ts_1.isGeneratedIdentifier)(node) || (0, ts_1.isGeneratedPrivateIdentifier)(node)) {
            return generateName(node);
        }
        if ((0, ts_1.isStringLiteral)(node) && node.textSourceNode) {
            return getTextOfNode(node.textSourceNode, includeTrivia);
        }
        var sourceFile = currentSourceFile; // const needed for control flow
        var canUseSourceFile = !!sourceFile && !!node.parent && !(0, ts_1.nodeIsSynthesized)(node);
        if ((0, ts_1.isMemberName)(node)) {
            if (!canUseSourceFile || (0, ts_1.getSourceFileOfNode)(node) !== (0, ts_1.getOriginalNode)(sourceFile)) {
                return (0, ts_1.idText)(node);
            }
        }
        else if ((0, ts_1.isJsxNamespacedName)(node)) {
            if (!canUseSourceFile || (0, ts_1.getSourceFileOfNode)(node) !== (0, ts_1.getOriginalNode)(sourceFile)) {
                return (0, ts_1.getTextOfJsxNamespacedName)(node);
            }
        }
        else {
            ts_1.Debug.assertNode(node, ts_1.isLiteralExpression); // not strictly necessary
            if (!canUseSourceFile) {
                return node.text;
            }
        }
        return (0, ts_1.getSourceTextOfNodeFromSourceFile)(sourceFile, node, includeTrivia);
    }
    function getLiteralTextOfNode(node, neverAsciiEscape, jsxAttributeEscape) {
        if (node.kind === 11 /* SyntaxKind.StringLiteral */ && node.textSourceNode) {
            var textSourceNode = node.textSourceNode;
            if ((0, ts_1.isIdentifier)(textSourceNode) || (0, ts_1.isPrivateIdentifier)(textSourceNode) || (0, ts_1.isNumericLiteral)(textSourceNode) || (0, ts_1.isJsxNamespacedName)(textSourceNode)) {
                var text = (0, ts_1.isNumericLiteral)(textSourceNode) ? textSourceNode.text : getTextOfNode(textSourceNode);
                return jsxAttributeEscape ? "\"".concat((0, ts_1.escapeJsxAttributeString)(text), "\"") :
                    neverAsciiEscape || ((0, ts_1.getEmitFlags)(node) & 16777216 /* EmitFlags.NoAsciiEscaping */) ? "\"".concat((0, ts_1.escapeString)(text), "\"") :
                        "\"".concat((0, ts_1.escapeNonAsciiString)(text), "\"");
            }
            else {
                return getLiteralTextOfNode(textSourceNode, neverAsciiEscape, jsxAttributeEscape);
            }
        }
        var flags = (neverAsciiEscape ? 1 /* GetLiteralTextFlags.NeverAsciiEscape */ : 0)
            | (jsxAttributeEscape ? 2 /* GetLiteralTextFlags.JsxAttributeEscape */ : 0)
            | (printerOptions.terminateUnterminatedLiterals ? 4 /* GetLiteralTextFlags.TerminateUnterminatedLiterals */ : 0)
            | (printerOptions.target && printerOptions.target === 99 /* ScriptTarget.ESNext */ ? 8 /* GetLiteralTextFlags.AllowNumericSeparator */ : 0);
        return (0, ts_1.getLiteralText)(node, currentSourceFile, flags);
    }
    /**
     * Push a new name generation scope.
     */
    function pushNameGenerationScope(node) {
        if (node && (0, ts_1.getEmitFlags)(node) & 1048576 /* EmitFlags.ReuseTempVariableScope */) {
            return;
        }
        tempFlagsStack.push(tempFlags);
        tempFlags = 0 /* TempFlags.Auto */;
        formattedNameTempFlagsStack.push(formattedNameTempFlags);
        formattedNameTempFlags = undefined;
        reservedNamesStack.push(reservedNames);
    }
    /**
     * Pop the current name generation scope.
     */
    function popNameGenerationScope(node) {
        if (node && (0, ts_1.getEmitFlags)(node) & 1048576 /* EmitFlags.ReuseTempVariableScope */) {
            return;
        }
        tempFlags = tempFlagsStack.pop();
        formattedNameTempFlags = formattedNameTempFlagsStack.pop();
        reservedNames = reservedNamesStack.pop();
    }
    function reserveNameInNestedScopes(name) {
        if (!reservedNames || reservedNames === (0, ts_1.lastOrUndefined)(reservedNamesStack)) {
            reservedNames = new Set();
        }
        reservedNames.add(name);
    }
    /**
     * Push a new member name generation scope.
     */
    function pushPrivateNameGenerationScope(newPrivateNameTempFlags, newReservedMemberNames) {
        privateNameTempFlagsStack.push(privateNameTempFlags);
        privateNameTempFlags = newPrivateNameTempFlags;
        reservedPrivateNamesStack.push(reservedNames);
        reservedPrivateNames = newReservedMemberNames;
    }
    /**
     * Pop the current member name generation scope.
     */
    function popPrivateNameGenerationScope() {
        privateNameTempFlags = privateNameTempFlagsStack.pop();
        reservedPrivateNames = reservedPrivateNamesStack.pop();
    }
    function reservePrivateNameInNestedScopes(name) {
        if (!reservedPrivateNames || reservedPrivateNames === (0, ts_1.lastOrUndefined)(reservedPrivateNamesStack)) {
            reservedPrivateNames = new Set();
        }
        reservedPrivateNames.add(name);
    }
    function generateNames(node) {
        if (!node)
            return;
        switch (node.kind) {
            case 240 /* SyntaxKind.Block */:
                (0, ts_1.forEach)(node.statements, generateNames);
                break;
            case 255 /* SyntaxKind.LabeledStatement */:
            case 253 /* SyntaxKind.WithStatement */:
            case 245 /* SyntaxKind.DoStatement */:
            case 246 /* SyntaxKind.WhileStatement */:
                generateNames(node.statement);
                break;
            case 244 /* SyntaxKind.IfStatement */:
                generateNames(node.thenStatement);
                generateNames(node.elseStatement);
                break;
            case 247 /* SyntaxKind.ForStatement */:
            case 249 /* SyntaxKind.ForOfStatement */:
            case 248 /* SyntaxKind.ForInStatement */:
                generateNames(node.initializer);
                generateNames(node.statement);
                break;
            case 254 /* SyntaxKind.SwitchStatement */:
                generateNames(node.caseBlock);
                break;
            case 268 /* SyntaxKind.CaseBlock */:
                (0, ts_1.forEach)(node.clauses, generateNames);
                break;
            case 295 /* SyntaxKind.CaseClause */:
            case 296 /* SyntaxKind.DefaultClause */:
                (0, ts_1.forEach)(node.statements, generateNames);
                break;
            case 257 /* SyntaxKind.TryStatement */:
                generateNames(node.tryBlock);
                generateNames(node.catchClause);
                generateNames(node.finallyBlock);
                break;
            case 298 /* SyntaxKind.CatchClause */:
                generateNames(node.variableDeclaration);
                generateNames(node.block);
                break;
            case 242 /* SyntaxKind.VariableStatement */:
                generateNames(node.declarationList);
                break;
            case 260 /* SyntaxKind.VariableDeclarationList */:
                (0, ts_1.forEach)(node.declarations, generateNames);
                break;
            case 259 /* SyntaxKind.VariableDeclaration */:
            case 168 /* SyntaxKind.Parameter */:
            case 207 /* SyntaxKind.BindingElement */:
            case 262 /* SyntaxKind.ClassDeclaration */:
                generateNameIfNeeded(node.name);
                break;
            case 261 /* SyntaxKind.FunctionDeclaration */:
                generateNameIfNeeded(node.name);
                if ((0, ts_1.getEmitFlags)(node) & 1048576 /* EmitFlags.ReuseTempVariableScope */) {
                    (0, ts_1.forEach)(node.parameters, generateNames);
                    generateNames(node.body);
                }
                break;
            case 205 /* SyntaxKind.ObjectBindingPattern */:
            case 206 /* SyntaxKind.ArrayBindingPattern */:
                (0, ts_1.forEach)(node.elements, generateNames);
                break;
            case 271 /* SyntaxKind.ImportDeclaration */:
                generateNames(node.importClause);
                break;
            case 272 /* SyntaxKind.ImportClause */:
                generateNameIfNeeded(node.name);
                generateNames(node.namedBindings);
                break;
            case 273 /* SyntaxKind.NamespaceImport */:
                generateNameIfNeeded(node.name);
                break;
            case 279 /* SyntaxKind.NamespaceExport */:
                generateNameIfNeeded(node.name);
                break;
            case 274 /* SyntaxKind.NamedImports */:
                (0, ts_1.forEach)(node.elements, generateNames);
                break;
            case 275 /* SyntaxKind.ImportSpecifier */:
                generateNameIfNeeded(node.propertyName || node.name);
                break;
        }
    }
    function generateMemberNames(node) {
        if (!node)
            return;
        switch (node.kind) {
            case 302 /* SyntaxKind.PropertyAssignment */:
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
                generateNameIfNeeded(node.name);
                break;
        }
    }
    function generateNameIfNeeded(name) {
        if (name) {
            if ((0, ts_1.isGeneratedIdentifier)(name) || (0, ts_1.isGeneratedPrivateIdentifier)(name)) {
                generateName(name);
            }
            else if ((0, ts_1.isBindingPattern)(name)) {
                generateNames(name);
            }
        }
    }
    /**
     * Generate the text for a generated identifier.
     */
    function generateName(name) {
        var autoGenerate = name.emitNode.autoGenerate;
        if ((autoGenerate.flags & 7 /* GeneratedIdentifierFlags.KindMask */) === 4 /* GeneratedIdentifierFlags.Node */) {
            // Node names generate unique names based on their original node
            // and are cached based on that node's id.
            return generateNameCached((0, ts_1.getNodeForGeneratedName)(name), (0, ts_1.isPrivateIdentifier)(name), autoGenerate.flags, autoGenerate.prefix, autoGenerate.suffix);
        }
        else {
            // Auto, Loop, and Unique names are cached based on their unique
            // autoGenerateId.
            var autoGenerateId = autoGenerate.id;
            return autoGeneratedIdToGeneratedName[autoGenerateId] || (autoGeneratedIdToGeneratedName[autoGenerateId] = makeName(name));
        }
    }
    function generateNameCached(node, privateName, flags, prefix, suffix) {
        var nodeId = (0, ts_1.getNodeId)(node);
        var cache = privateName ? nodeIdToGeneratedPrivateName : nodeIdToGeneratedName;
        return cache[nodeId] || (cache[nodeId] = generateNameForNode(node, privateName, flags !== null && flags !== void 0 ? flags : 0 /* GeneratedIdentifierFlags.None */, (0, ts_1.formatGeneratedNamePart)(prefix, generateName), (0, ts_1.formatGeneratedNamePart)(suffix)));
    }
    /**
     * Returns a value indicating whether a name is unique globally, within the current file,
     * or within the NameGenerator.
     */
    function isUniqueName(name, privateName) {
        return isFileLevelUniqueNameInCurrentFile(name, privateName)
            && !isReservedName(name, privateName)
            && !generatedNames.has(name);
    }
    function isReservedName(name, privateName) {
        return privateName ? !!(reservedPrivateNames === null || reservedPrivateNames === void 0 ? void 0 : reservedPrivateNames.has(name)) : !!(reservedNames === null || reservedNames === void 0 ? void 0 : reservedNames.has(name));
    }
    /**
     * Returns a value indicating whether a name is unique globally or within the current file.
     *
     * @param _isPrivate (unused) this parameter exists to avoid an unnecessary adaptor frame in v8
     * when `isfileLevelUniqueName` is passed as a callback to `makeUniqueName`.
     */
    function isFileLevelUniqueNameInCurrentFile(name, _isPrivate) {
        return currentSourceFile ? (0, ts_1.isFileLevelUniqueName)(currentSourceFile, name, hasGlobalName) : true;
    }
    /**
     * Returns a value indicating whether a name is unique within a container.
     */
    function isUniqueLocalName(name, container) {
        for (var node = container; node && (0, ts_1.isNodeDescendantOf)(node, container); node = node.nextContainer) {
            if ((0, ts_1.canHaveLocals)(node) && node.locals) {
                var local = node.locals.get((0, ts_1.escapeLeadingUnderscores)(name));
                // We conservatively include alias symbols to cover cases where they're emitted as locals
                if (local && local.flags & (111551 /* SymbolFlags.Value */ | 1048576 /* SymbolFlags.ExportValue */ | 2097152 /* SymbolFlags.Alias */)) {
                    return false;
                }
            }
        }
        return true;
    }
    function getTempFlags(formattedNameKey) {
        var _a;
        switch (formattedNameKey) {
            case "":
                return tempFlags;
            case "#":
                return privateNameTempFlags;
            default:
                return (_a = formattedNameTempFlags === null || formattedNameTempFlags === void 0 ? void 0 : formattedNameTempFlags.get(formattedNameKey)) !== null && _a !== void 0 ? _a : 0 /* TempFlags.Auto */;
        }
    }
    function setTempFlags(formattedNameKey, flags) {
        switch (formattedNameKey) {
            case "":
                tempFlags = flags;
                break;
            case "#":
                privateNameTempFlags = flags;
                break;
            default:
                formattedNameTempFlags !== null && formattedNameTempFlags !== void 0 ? formattedNameTempFlags : (formattedNameTempFlags = new Map());
                formattedNameTempFlags.set(formattedNameKey, flags);
                break;
        }
    }
    /**
     * Return the next available name in the pattern _a ... _z, _0, _1, ...
     * TempFlags._i or TempFlags._n may be used to express a preference for that dedicated name.
     * Note that names generated by makeTempVariableName and makeUniqueName will never conflict.
     */
    function makeTempVariableName(flags, reservedInNestedScopes, privateName, prefix, suffix) {
        if (prefix.length > 0 && prefix.charCodeAt(0) === 35 /* CharacterCodes.hash */) {
            prefix = prefix.slice(1);
        }
        // Generate a key to use to acquire a TempFlags counter based on the fixed portions of the generated name.
        var key = (0, ts_1.formatGeneratedName)(privateName, prefix, "", suffix);
        var tempFlags = getTempFlags(key);
        if (flags && !(tempFlags & flags)) {
            var name_1 = flags === 268435456 /* TempFlags._i */ ? "_i" : "_n";
            var fullName = (0, ts_1.formatGeneratedName)(privateName, prefix, name_1, suffix);
            if (isUniqueName(fullName, privateName)) {
                tempFlags |= flags;
                if (privateName) {
                    reservePrivateNameInNestedScopes(fullName);
                }
                else if (reservedInNestedScopes) {
                    reserveNameInNestedScopes(fullName);
                }
                setTempFlags(key, tempFlags);
                return fullName;
            }
        }
        while (true) {
            var count = tempFlags & 268435455 /* TempFlags.CountMask */;
            tempFlags++;
            // Skip over 'i' and 'n'
            if (count !== 8 && count !== 13) {
                var name_2 = count < 26
                    ? "_" + String.fromCharCode(97 /* CharacterCodes.a */ + count)
                    : "_" + (count - 26);
                var fullName = (0, ts_1.formatGeneratedName)(privateName, prefix, name_2, suffix);
                if (isUniqueName(fullName, privateName)) {
                    if (privateName) {
                        reservePrivateNameInNestedScopes(fullName);
                    }
                    else if (reservedInNestedScopes) {
                        reserveNameInNestedScopes(fullName);
                    }
                    setTempFlags(key, tempFlags);
                    return fullName;
                }
            }
        }
    }
    /**
     * Generate a name that is unique within the current file and doesn't conflict with any names
     * in global scope. The name is formed by adding an '_n' suffix to the specified base name,
     * where n is a positive integer. Note that names generated by makeTempVariableName and
     * makeUniqueName are guaranteed to never conflict.
     * If `optimistic` is set, the first instance will use 'baseName' verbatim instead of 'baseName_1'
     */
    function makeUniqueName(baseName, checkFn, optimistic, scoped, privateName, prefix, suffix) {
        if (checkFn === void 0) { checkFn = isUniqueName; }
        if (baseName.length > 0 && baseName.charCodeAt(0) === 35 /* CharacterCodes.hash */) {
            baseName = baseName.slice(1);
        }
        if (prefix.length > 0 && prefix.charCodeAt(0) === 35 /* CharacterCodes.hash */) {
            prefix = prefix.slice(1);
        }
        if (optimistic) {
            var fullName = (0, ts_1.formatGeneratedName)(privateName, prefix, baseName, suffix);
            if (checkFn(fullName, privateName)) {
                if (privateName) {
                    reservePrivateNameInNestedScopes(fullName);
                }
                else if (scoped) {
                    reserveNameInNestedScopes(fullName);
                }
                else {
                    generatedNames.add(fullName);
                }
                return fullName;
            }
        }
        // Find the first unique 'name_n', where n is a positive number
        if (baseName.charCodeAt(baseName.length - 1) !== 95 /* CharacterCodes._ */) {
            baseName += "_";
        }
        var i = 1;
        while (true) {
            var fullName = (0, ts_1.formatGeneratedName)(privateName, prefix, baseName + i, suffix);
            if (checkFn(fullName, privateName)) {
                if (privateName) {
                    reservePrivateNameInNestedScopes(fullName);
                }
                else if (scoped) {
                    reserveNameInNestedScopes(fullName);
                }
                else {
                    generatedNames.add(fullName);
                }
                return fullName;
            }
            i++;
        }
    }
    function makeFileLevelOptimisticUniqueName(name) {
        return makeUniqueName(name, isFileLevelUniqueNameInCurrentFile, /*optimistic*/ true, /*scoped*/ false, /*privateName*/ false, /*prefix*/ "", /*suffix*/ "");
    }
    /**
     * Generates a unique name for a ModuleDeclaration or EnumDeclaration.
     */
    function generateNameForModuleOrEnum(node) {
        var name = getTextOfNode(node.name);
        // Use module/enum name itself if it is unique, otherwise make a unique variation
        return isUniqueLocalName(name, (0, ts_1.tryCast)(node, ts_1.canHaveLocals)) ? name : makeUniqueName(name, isUniqueName, /*optimistic*/ false, /*scoped*/ false, /*privateName*/ false, /*prefix*/ "", /*suffix*/ "");
    }
    /**
     * Generates a unique name for an ImportDeclaration or ExportDeclaration.
     */
    function generateNameForImportOrExportDeclaration(node) {
        var expr = (0, ts_1.getExternalModuleName)(node); // TODO: GH#18217
        var baseName = (0, ts_1.isStringLiteral)(expr) ?
            (0, ts_1.makeIdentifierFromModuleName)(expr.text) : "module";
        return makeUniqueName(baseName, isUniqueName, /*optimistic*/ false, /*scoped*/ false, /*privateName*/ false, /*prefix*/ "", /*suffix*/ "");
    }
    /**
     * Generates a unique name for a default export.
     */
    function generateNameForExportDefault() {
        return makeUniqueName("default", isUniqueName, /*optimistic*/ false, /*scoped*/ false, /*privateName*/ false, /*prefix*/ "", /*suffix*/ "");
    }
    /**
     * Generates a unique name for a class expression.
     */
    function generateNameForClassExpression() {
        return makeUniqueName("class", isUniqueName, /*optimistic*/ false, /*scoped*/ false, /*privateName*/ false, /*prefix*/ "", /*suffix*/ "");
    }
    function generateNameForMethodOrAccessor(node, privateName, prefix, suffix) {
        if ((0, ts_1.isIdentifier)(node.name)) {
            return generateNameCached(node.name, privateName);
        }
        return makeTempVariableName(0 /* TempFlags.Auto */, /*reservedInNestedScopes*/ false, privateName, prefix, suffix);
    }
    /**
     * Generates a unique name from a node.
     */
    function generateNameForNode(node, privateName, flags, prefix, suffix) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
            case 81 /* SyntaxKind.PrivateIdentifier */:
                return makeUniqueName(getTextOfNode(node), isUniqueName, !!(flags & 16 /* GeneratedIdentifierFlags.Optimistic */), !!(flags & 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */), privateName, prefix, suffix);
            case 266 /* SyntaxKind.ModuleDeclaration */:
            case 265 /* SyntaxKind.EnumDeclaration */:
                ts_1.Debug.assert(!prefix && !suffix && !privateName);
                return generateNameForModuleOrEnum(node);
            case 271 /* SyntaxKind.ImportDeclaration */:
            case 277 /* SyntaxKind.ExportDeclaration */:
                ts_1.Debug.assert(!prefix && !suffix && !privateName);
                return generateNameForImportOrExportDeclaration(node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 262 /* SyntaxKind.ClassDeclaration */: {
                ts_1.Debug.assert(!prefix && !suffix && !privateName);
                var name_3 = node.name;
                if (name_3 && !(0, ts_1.isGeneratedIdentifier)(name_3)) {
                    return generateNameForNode(name_3, /*privateName*/ false, flags, prefix, suffix);
                }
                return generateNameForExportDefault();
            }
            case 276 /* SyntaxKind.ExportAssignment */:
                ts_1.Debug.assert(!prefix && !suffix && !privateName);
                return generateNameForExportDefault();
            case 230 /* SyntaxKind.ClassExpression */:
                ts_1.Debug.assert(!prefix && !suffix && !privateName);
                return generateNameForClassExpression();
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
                return generateNameForMethodOrAccessor(node, privateName, prefix, suffix);
            case 166 /* SyntaxKind.ComputedPropertyName */:
                return makeTempVariableName(0 /* TempFlags.Auto */, /*reservedInNestedScopes*/ true, privateName, prefix, suffix);
            default:
                return makeTempVariableName(0 /* TempFlags.Auto */, /*reservedInNestedScopes*/ false, privateName, prefix, suffix);
        }
    }
    /**
     * Generates a unique identifier for a node.
     */
    function makeName(name) {
        var autoGenerate = name.emitNode.autoGenerate;
        var prefix = (0, ts_1.formatGeneratedNamePart)(autoGenerate.prefix, generateName);
        var suffix = (0, ts_1.formatGeneratedNamePart)(autoGenerate.suffix);
        switch (autoGenerate.flags & 7 /* GeneratedIdentifierFlags.KindMask */) {
            case 1 /* GeneratedIdentifierFlags.Auto */:
                return makeTempVariableName(0 /* TempFlags.Auto */, !!(autoGenerate.flags & 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */), (0, ts_1.isPrivateIdentifier)(name), prefix, suffix);
            case 2 /* GeneratedIdentifierFlags.Loop */:
                ts_1.Debug.assertNode(name, ts_1.isIdentifier);
                return makeTempVariableName(268435456 /* TempFlags._i */, !!(autoGenerate.flags & 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */), /*privateName*/ false, prefix, suffix);
            case 3 /* GeneratedIdentifierFlags.Unique */:
                return makeUniqueName((0, ts_1.idText)(name), (autoGenerate.flags & 32 /* GeneratedIdentifierFlags.FileLevel */) ? isFileLevelUniqueNameInCurrentFile : isUniqueName, !!(autoGenerate.flags & 16 /* GeneratedIdentifierFlags.Optimistic */), !!(autoGenerate.flags & 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */), (0, ts_1.isPrivateIdentifier)(name), prefix, suffix);
        }
        return ts_1.Debug.fail("Unsupported GeneratedIdentifierKind: ".concat(ts_1.Debug.formatEnum(autoGenerate.flags & 7 /* GeneratedIdentifierFlags.KindMask */, ts.GeneratedIdentifierFlags, /*isFlags*/ true), "."));
    }
    // Comments
    function pipelineEmitWithComments(hint, node) {
        var pipelinePhase = getNextPipelinePhase(2 /* PipelinePhase.Comments */, hint, node);
        var savedContainerPos = containerPos;
        var savedContainerEnd = containerEnd;
        var savedDeclarationListContainerEnd = declarationListContainerEnd;
        emitCommentsBeforeNode(node);
        pipelinePhase(hint, node);
        emitCommentsAfterNode(node, savedContainerPos, savedContainerEnd, savedDeclarationListContainerEnd);
    }
    function emitCommentsBeforeNode(node) {
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        var commentRange = (0, ts_1.getCommentRange)(node);
        // Emit leading comments
        emitLeadingCommentsOfNode(node, emitFlags, commentRange.pos, commentRange.end);
        if (emitFlags & 4096 /* EmitFlags.NoNestedComments */) {
            commentsDisabled = true;
        }
    }
    function emitCommentsAfterNode(node, savedContainerPos, savedContainerEnd, savedDeclarationListContainerEnd) {
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        var commentRange = (0, ts_1.getCommentRange)(node);
        // Emit trailing comments
        if (emitFlags & 4096 /* EmitFlags.NoNestedComments */) {
            commentsDisabled = false;
        }
        emitTrailingCommentsOfNode(node, emitFlags, commentRange.pos, commentRange.end, savedContainerPos, savedContainerEnd, savedDeclarationListContainerEnd);
        var typeNode = (0, ts_1.getTypeNode)(node);
        if (typeNode) {
            emitTrailingCommentsOfNode(node, emitFlags, typeNode.pos, typeNode.end, savedContainerPos, savedContainerEnd, savedDeclarationListContainerEnd);
        }
    }
    function emitLeadingCommentsOfNode(node, emitFlags, pos, end) {
        enterComment();
        hasWrittenComment = false;
        // We have to explicitly check that the node is JsxText because if the compilerOptions.jsx is "preserve" we will not do any transformation.
        // It is expensive to walk entire tree just to set one kind of node to have no comments.
        var skipLeadingComments = pos < 0 || (emitFlags & 1024 /* EmitFlags.NoLeadingComments */) !== 0 || node.kind === 12 /* SyntaxKind.JsxText */;
        var skipTrailingComments = end < 0 || (emitFlags & 2048 /* EmitFlags.NoTrailingComments */) !== 0 || node.kind === 12 /* SyntaxKind.JsxText */;
        // Save current container state on the stack.
        if ((pos > 0 || end > 0) && pos !== end) {
            // Emit leading comments if the position is not synthesized and the node
            // has not opted out from emitting leading comments.
            if (!skipLeadingComments) {
                emitLeadingComments(pos, /*isEmittedNode*/ node.kind !== 358 /* SyntaxKind.NotEmittedStatement */);
            }
            if (!skipLeadingComments || (pos >= 0 && (emitFlags & 1024 /* EmitFlags.NoLeadingComments */) !== 0)) {
                // Advance the container position if comments get emitted or if they've been disabled explicitly using NoLeadingComments.
                containerPos = pos;
            }
            if (!skipTrailingComments || (end >= 0 && (emitFlags & 2048 /* EmitFlags.NoTrailingComments */) !== 0)) {
                // As above.
                containerEnd = end;
                // To avoid invalid comment emit in a down-level binding pattern, we
                // keep track of the last declaration list container's end
                if (node.kind === 260 /* SyntaxKind.VariableDeclarationList */) {
                    declarationListContainerEnd = end;
                }
            }
        }
        (0, ts_1.forEach)((0, ts_1.getSyntheticLeadingComments)(node), emitLeadingSynthesizedComment);
        exitComment();
    }
    function emitTrailingCommentsOfNode(node, emitFlags, pos, end, savedContainerPos, savedContainerEnd, savedDeclarationListContainerEnd) {
        enterComment();
        var skipTrailingComments = end < 0 || (emitFlags & 2048 /* EmitFlags.NoTrailingComments */) !== 0 || node.kind === 12 /* SyntaxKind.JsxText */;
        (0, ts_1.forEach)((0, ts_1.getSyntheticTrailingComments)(node), emitTrailingSynthesizedComment);
        if ((pos > 0 || end > 0) && pos !== end) {
            // Restore previous container state.
            containerPos = savedContainerPos;
            containerEnd = savedContainerEnd;
            declarationListContainerEnd = savedDeclarationListContainerEnd;
            // Emit trailing comments if the position is not synthesized and the node
            // has not opted out from emitting leading comments and is an emitted node.
            if (!skipTrailingComments && node.kind !== 358 /* SyntaxKind.NotEmittedStatement */) {
                emitTrailingComments(end);
            }
        }
        exitComment();
    }
    function emitLeadingSynthesizedComment(comment) {
        if (comment.hasLeadingNewline || comment.kind === 2 /* SyntaxKind.SingleLineCommentTrivia */) {
            writer.writeLine();
        }
        writeSynthesizedComment(comment);
        if (comment.hasTrailingNewLine || comment.kind === 2 /* SyntaxKind.SingleLineCommentTrivia */) {
            writer.writeLine();
        }
        else {
            writer.writeSpace(" ");
        }
    }
    function emitTrailingSynthesizedComment(comment) {
        if (!writer.isAtStartOfLine()) {
            writer.writeSpace(" ");
        }
        writeSynthesizedComment(comment);
        if (comment.hasTrailingNewLine) {
            writer.writeLine();
        }
    }
    function writeSynthesizedComment(comment) {
        var text = formatSynthesizedComment(comment);
        var lineMap = comment.kind === 3 /* SyntaxKind.MultiLineCommentTrivia */ ? (0, ts_1.computeLineStarts)(text) : undefined;
        (0, ts_1.writeCommentRange)(text, lineMap, writer, 0, text.length, newLine);
    }
    function formatSynthesizedComment(comment) {
        return comment.kind === 3 /* SyntaxKind.MultiLineCommentTrivia */
            ? "/*".concat(comment.text, "*/")
            : "//".concat(comment.text);
    }
    function emitBodyWithDetachedComments(node, detachedRange, emitCallback) {
        enterComment();
        var pos = detachedRange.pos, end = detachedRange.end;
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        var skipLeadingComments = pos < 0 || (emitFlags & 1024 /* EmitFlags.NoLeadingComments */) !== 0;
        var skipTrailingComments = commentsDisabled || end < 0 || (emitFlags & 2048 /* EmitFlags.NoTrailingComments */) !== 0;
        if (!skipLeadingComments) {
            emitDetachedCommentsAndUpdateCommentsInfo(detachedRange);
        }
        exitComment();
        if (emitFlags & 4096 /* EmitFlags.NoNestedComments */ && !commentsDisabled) {
            commentsDisabled = true;
            emitCallback(node);
            commentsDisabled = false;
        }
        else {
            emitCallback(node);
        }
        enterComment();
        if (!skipTrailingComments) {
            emitLeadingComments(detachedRange.end, /*isEmittedNode*/ true);
            if (hasWrittenComment && !writer.isAtStartOfLine()) {
                writer.writeLine();
            }
        }
        exitComment();
    }
    function originalNodesHaveSameParent(nodeA, nodeB) {
        nodeA = (0, ts_1.getOriginalNode)(nodeA);
        // For performance, do not call `getOriginalNode` for `nodeB` if `nodeA` doesn't even
        // have a parent node.
        return nodeA.parent && nodeA.parent === (0, ts_1.getOriginalNode)(nodeB).parent;
    }
    function siblingNodePositionsAreComparable(previousNode, nextNode) {
        if (nextNode.pos < previousNode.end) {
            return false;
        }
        previousNode = (0, ts_1.getOriginalNode)(previousNode);
        nextNode = (0, ts_1.getOriginalNode)(nextNode);
        var parent = previousNode.parent;
        if (!parent || parent !== nextNode.parent) {
            return false;
        }
        var parentNodeArray = (0, ts_1.getContainingNodeArray)(previousNode);
        var prevNodeIndex = parentNodeArray === null || parentNodeArray === void 0 ? void 0 : parentNodeArray.indexOf(previousNode);
        return prevNodeIndex !== undefined && prevNodeIndex > -1 && parentNodeArray.indexOf(nextNode) === prevNodeIndex + 1;
    }
    function emitLeadingComments(pos, isEmittedNode) {
        hasWrittenComment = false;
        if (isEmittedNode) {
            if (pos === 0 && (currentSourceFile === null || currentSourceFile === void 0 ? void 0 : currentSourceFile.isDeclarationFile)) {
                forEachLeadingCommentToEmit(pos, emitNonTripleSlashLeadingComment);
            }
            else {
                forEachLeadingCommentToEmit(pos, emitLeadingComment);
            }
        }
        else if (pos === 0) {
            // If the node will not be emitted in JS, remove all the comments(normal, pinned and ///) associated with the node,
            // unless it is a triple slash comment at the top of the file.
            // For Example:
            //      /// <reference-path ...>
            //      declare var x;
            //      /// <reference-path ...>
            //      interface F {}
            //  The first /// will NOT be removed while the second one will be removed even though both node will not be emitted
            forEachLeadingCommentToEmit(pos, emitTripleSlashLeadingComment);
        }
    }
    function emitTripleSlashLeadingComment(commentPos, commentEnd, kind, hasTrailingNewLine, rangePos) {
        if (isTripleSlashComment(commentPos, commentEnd)) {
            emitLeadingComment(commentPos, commentEnd, kind, hasTrailingNewLine, rangePos);
        }
    }
    function emitNonTripleSlashLeadingComment(commentPos, commentEnd, kind, hasTrailingNewLine, rangePos) {
        if (!isTripleSlashComment(commentPos, commentEnd)) {
            emitLeadingComment(commentPos, commentEnd, kind, hasTrailingNewLine, rangePos);
        }
    }
    function shouldWriteComment(text, pos) {
        if (printerOptions.onlyPrintJsDocStyle) {
            return ((0, ts_1.isJSDocLikeText)(text, pos) || (0, ts_1.isPinnedComment)(text, pos));
        }
        return true;
    }
    function emitLeadingComment(commentPos, commentEnd, kind, hasTrailingNewLine, rangePos) {
        if (!currentSourceFile || !shouldWriteComment(currentSourceFile.text, commentPos))
            return;
        if (!hasWrittenComment) {
            (0, ts_1.emitNewLineBeforeLeadingCommentOfPosition)(getCurrentLineMap(), writer, rangePos, commentPos);
            hasWrittenComment = true;
        }
        // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
        emitPos(commentPos);
        (0, ts_1.writeCommentRange)(currentSourceFile.text, getCurrentLineMap(), writer, commentPos, commentEnd, newLine);
        emitPos(commentEnd);
        if (hasTrailingNewLine) {
            writer.writeLine();
        }
        else if (kind === 3 /* SyntaxKind.MultiLineCommentTrivia */) {
            writer.writeSpace(" ");
        }
    }
    function emitLeadingCommentsOfPosition(pos) {
        if (commentsDisabled || pos === -1) {
            return;
        }
        emitLeadingComments(pos, /*isEmittedNode*/ true);
    }
    function emitTrailingComments(pos) {
        forEachTrailingCommentToEmit(pos, emitTrailingComment);
    }
    function emitTrailingComment(commentPos, commentEnd, _kind, hasTrailingNewLine) {
        if (!currentSourceFile || !shouldWriteComment(currentSourceFile.text, commentPos))
            return;
        // trailing comments are emitted at space/*trailing comment1 */space/*trailing comment2*/
        if (!writer.isAtStartOfLine()) {
            writer.writeSpace(" ");
        }
        emitPos(commentPos);
        (0, ts_1.writeCommentRange)(currentSourceFile.text, getCurrentLineMap(), writer, commentPos, commentEnd, newLine);
        emitPos(commentEnd);
        if (hasTrailingNewLine) {
            writer.writeLine();
        }
    }
    function emitTrailingCommentsOfPosition(pos, prefixSpace, forceNoNewline) {
        if (commentsDisabled) {
            return;
        }
        enterComment();
        forEachTrailingCommentToEmit(pos, prefixSpace ? emitTrailingComment : forceNoNewline ? emitTrailingCommentOfPositionNoNewline : emitTrailingCommentOfPosition);
        exitComment();
    }
    function emitTrailingCommentOfPositionNoNewline(commentPos, commentEnd, kind) {
        if (!currentSourceFile)
            return;
        // trailing comments of a position are emitted at /*trailing comment1 */space/*trailing comment*/space
        emitPos(commentPos);
        (0, ts_1.writeCommentRange)(currentSourceFile.text, getCurrentLineMap(), writer, commentPos, commentEnd, newLine);
        emitPos(commentEnd);
        if (kind === 2 /* SyntaxKind.SingleLineCommentTrivia */) {
            writer.writeLine(); // still write a newline for single-line comments, so closing tokens aren't written on the same line
        }
    }
    function emitTrailingCommentOfPosition(commentPos, commentEnd, _kind, hasTrailingNewLine) {
        if (!currentSourceFile)
            return;
        // trailing comments of a position are emitted at /*trailing comment1 */space/*trailing comment*/space
        emitPos(commentPos);
        (0, ts_1.writeCommentRange)(currentSourceFile.text, getCurrentLineMap(), writer, commentPos, commentEnd, newLine);
        emitPos(commentEnd);
        if (hasTrailingNewLine) {
            writer.writeLine();
        }
        else {
            writer.writeSpace(" ");
        }
    }
    function forEachLeadingCommentToEmit(pos, cb) {
        // Emit the leading comments only if the container's pos doesn't match because the container should take care of emitting these comments
        if (currentSourceFile && (containerPos === -1 || pos !== containerPos)) {
            if (hasDetachedComments(pos)) {
                forEachLeadingCommentWithoutDetachedComments(cb);
            }
            else {
                (0, ts_1.forEachLeadingCommentRange)(currentSourceFile.text, pos, cb, /*state*/ pos);
            }
        }
    }
    function forEachTrailingCommentToEmit(end, cb) {
        // Emit the trailing comments only if the container's end doesn't match because the container should take care of emitting these comments
        if (currentSourceFile && (containerEnd === -1 || (end !== containerEnd && end !== declarationListContainerEnd))) {
            (0, ts_1.forEachTrailingCommentRange)(currentSourceFile.text, end, cb);
        }
    }
    function hasDetachedComments(pos) {
        return detachedCommentsInfo !== undefined && (0, ts_1.last)(detachedCommentsInfo).nodePos === pos;
    }
    function forEachLeadingCommentWithoutDetachedComments(cb) {
        if (!currentSourceFile)
            return;
        // get the leading comments from detachedPos
        var pos = (0, ts_1.last)(detachedCommentsInfo).detachedCommentEndPos;
        if (detachedCommentsInfo.length - 1) {
            detachedCommentsInfo.pop();
        }
        else {
            detachedCommentsInfo = undefined;
        }
        (0, ts_1.forEachLeadingCommentRange)(currentSourceFile.text, pos, cb, /*state*/ pos);
    }
    function emitDetachedCommentsAndUpdateCommentsInfo(range) {
        var currentDetachedCommentInfo = currentSourceFile && (0, ts_1.emitDetachedComments)(currentSourceFile.text, getCurrentLineMap(), writer, emitComment, range, newLine, commentsDisabled);
        if (currentDetachedCommentInfo) {
            if (detachedCommentsInfo) {
                detachedCommentsInfo.push(currentDetachedCommentInfo);
            }
            else {
                detachedCommentsInfo = [currentDetachedCommentInfo];
            }
        }
    }
    function emitComment(text, lineMap, writer, commentPos, commentEnd, newLine) {
        if (!currentSourceFile || !shouldWriteComment(currentSourceFile.text, commentPos))
            return;
        emitPos(commentPos);
        (0, ts_1.writeCommentRange)(text, lineMap, writer, commentPos, commentEnd, newLine);
        emitPos(commentEnd);
    }
    /**
     * Determine if the given comment is a triple-slash
     *
     * @return true if the comment is a triple-slash comment else false
     */
    function isTripleSlashComment(commentPos, commentEnd) {
        return !!currentSourceFile && (0, ts_1.isRecognizedTripleSlashComment)(currentSourceFile.text, commentPos, commentEnd);
    }
    // Source Maps
    function getParsedSourceMap(node) {
        if (node.parsedSourceMap === undefined && node.sourceMapText !== undefined) {
            node.parsedSourceMap = (0, ts_1.tryParseRawSourceMap)(node.sourceMapText) || false;
        }
        return node.parsedSourceMap || undefined;
    }
    function pipelineEmitWithSourceMaps(hint, node) {
        var pipelinePhase = getNextPipelinePhase(3 /* PipelinePhase.SourceMaps */, hint, node);
        emitSourceMapsBeforeNode(node);
        pipelinePhase(hint, node);
        emitSourceMapsAfterNode(node);
    }
    function emitSourceMapsBeforeNode(node) {
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        var sourceMapRange = (0, ts_1.getSourceMapRange)(node);
        // Emit leading sourcemap
        if ((0, ts_1.isUnparsedNode)(node)) {
            ts_1.Debug.assertIsDefined(node.parent, "UnparsedNodes must have parent pointers");
            var parsed = getParsedSourceMap(node.parent);
            if (parsed && sourceMapGenerator) {
                sourceMapGenerator.appendSourceMap(writer.getLine(), writer.getColumn(), parsed, node.parent.sourceMapPath, node.parent.getLineAndCharacterOfPosition(node.pos), node.parent.getLineAndCharacterOfPosition(node.end));
            }
        }
        else {
            var source = sourceMapRange.source || sourceMapSource;
            if (node.kind !== 358 /* SyntaxKind.NotEmittedStatement */
                && (emitFlags & 32 /* EmitFlags.NoLeadingSourceMap */) === 0
                && sourceMapRange.pos >= 0) {
                emitSourcePos(sourceMapRange.source || sourceMapSource, skipSourceTrivia(source, sourceMapRange.pos));
            }
            if (emitFlags & 128 /* EmitFlags.NoNestedSourceMaps */) {
                sourceMapsDisabled = true;
            }
        }
    }
    function emitSourceMapsAfterNode(node) {
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        var sourceMapRange = (0, ts_1.getSourceMapRange)(node);
        // Emit trailing sourcemap
        if (!(0, ts_1.isUnparsedNode)(node)) {
            if (emitFlags & 128 /* EmitFlags.NoNestedSourceMaps */) {
                sourceMapsDisabled = false;
            }
            if (node.kind !== 358 /* SyntaxKind.NotEmittedStatement */
                && (emitFlags & 64 /* EmitFlags.NoTrailingSourceMap */) === 0
                && sourceMapRange.end >= 0) {
                emitSourcePos(sourceMapRange.source || sourceMapSource, sourceMapRange.end);
            }
        }
    }
    /**
     * Skips trivia such as comments and white-space that can be optionally overridden by the source-map source
     */
    function skipSourceTrivia(source, pos) {
        return source.skipTrivia ? source.skipTrivia(pos) : (0, ts_1.skipTrivia)(source.text, pos);
    }
    /**
     * Emits a mapping.
     *
     * If the position is synthetic (undefined or a negative value), no mapping will be
     * created.
     *
     * @param pos The position.
     */
    function emitPos(pos) {
        if (sourceMapsDisabled || (0, ts_1.positionIsSynthesized)(pos) || isJsonSourceMapSource(sourceMapSource)) {
            return;
        }
        var _a = (0, ts_1.getLineAndCharacterOfPosition)(sourceMapSource, pos), sourceLine = _a.line, sourceCharacter = _a.character;
        sourceMapGenerator.addMapping(writer.getLine(), writer.getColumn(), sourceMapSourceIndex, sourceLine, sourceCharacter, 
        /*nameIndex*/ undefined);
    }
    function emitSourcePos(source, pos) {
        if (source !== sourceMapSource) {
            var savedSourceMapSource = sourceMapSource;
            var savedSourceMapSourceIndex = sourceMapSourceIndex;
            setSourceMapSource(source);
            emitPos(pos);
            resetSourceMapSource(savedSourceMapSource, savedSourceMapSourceIndex);
        }
        else {
            emitPos(pos);
        }
    }
    /**
     * Emits a token of a node with possible leading and trailing source maps.
     *
     * @param node The node containing the token.
     * @param token The token to emit.
     * @param tokenStartPos The start pos of the token.
     * @param emitCallback The callback used to emit the token.
     */
    function emitTokenWithSourceMap(node, token, writer, tokenPos, emitCallback) {
        if (sourceMapsDisabled || node && (0, ts_1.isInJsonFile)(node)) {
            return emitCallback(token, writer, tokenPos);
        }
        var emitNode = node && node.emitNode;
        var emitFlags = emitNode && emitNode.flags || 0 /* EmitFlags.None */;
        var range = emitNode && emitNode.tokenSourceMapRanges && emitNode.tokenSourceMapRanges[token];
        var source = range && range.source || sourceMapSource;
        tokenPos = skipSourceTrivia(source, range ? range.pos : tokenPos);
        if ((emitFlags & 256 /* EmitFlags.NoTokenLeadingSourceMaps */) === 0 && tokenPos >= 0) {
            emitSourcePos(source, tokenPos);
        }
        tokenPos = emitCallback(token, writer, tokenPos);
        if (range)
            tokenPos = range.end;
        if ((emitFlags & 512 /* EmitFlags.NoTokenTrailingSourceMaps */) === 0 && tokenPos >= 0) {
            emitSourcePos(source, tokenPos);
        }
        return tokenPos;
    }
    function setSourceMapSource(source) {
        if (sourceMapsDisabled) {
            return;
        }
        sourceMapSource = source;
        if (source === mostRecentlyAddedSourceMapSource) {
            // Fast path for when the new source map is the most recently added, in which case
            // we use its captured index without going through the source map generator.
            sourceMapSourceIndex = mostRecentlyAddedSourceMapSourceIndex;
            return;
        }
        if (isJsonSourceMapSource(source)) {
            return;
        }
        sourceMapSourceIndex = sourceMapGenerator.addSource(source.fileName);
        if (printerOptions.inlineSources) {
            sourceMapGenerator.setSourceContent(sourceMapSourceIndex, source.text);
        }
        mostRecentlyAddedSourceMapSource = source;
        mostRecentlyAddedSourceMapSourceIndex = sourceMapSourceIndex;
    }
    function resetSourceMapSource(source, sourceIndex) {
        sourceMapSource = source;
        sourceMapSourceIndex = sourceIndex;
    }
    function isJsonSourceMapSource(sourceFile) {
        return (0, ts_1.fileExtensionIs)(sourceFile.fileName, ".json" /* Extension.Json */);
    }
}
exports.createPrinter = createPrinter;
function createBracketsMap() {
    var brackets = [];
    brackets[1024 /* ListFormat.Braces */] = ["{", "}"];
    brackets[2048 /* ListFormat.Parenthesis */] = ["(", ")"];
    brackets[4096 /* ListFormat.AngleBrackets */] = ["<", ">"];
    brackets[8192 /* ListFormat.SquareBrackets */] = ["[", "]"];
    return brackets;
}
function getOpeningBracket(format) {
    return brackets[format & 15360 /* ListFormat.BracketsMask */][0];
}
function getClosingBracket(format) {
    return brackets[format & 15360 /* ListFormat.BracketsMask */][1];
}
function emitListItemNoParenthesizer(node, emit, _parenthesizerRule, _index) {
    emit(node);
}
function emitListItemWithParenthesizerRuleSelector(node, emit, parenthesizerRuleSelector, index) {
    emit(node, parenthesizerRuleSelector.select(index));
}
function emitListItemWithParenthesizerRule(node, emit, parenthesizerRule, _index) {
    emit(node, parenthesizerRule);
}
function getEmitListItem(emit, parenthesizerRule) {
    return emit.length === 1 ? emitListItemNoParenthesizer :
        typeof parenthesizerRule === "object" ? emitListItemWithParenthesizerRuleSelector :
            emitListItemWithParenthesizerRule;
}
