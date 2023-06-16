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
exports.performIncrementalCompilation = exports.createWatchCompilerHostOfFilesAndCompilerOptions = exports.createWatchCompilerHostOfConfigFile = exports.createProgramHost = exports.setGetSourceFileAsHashVersioned = exports.getSourceFileVersionAsHashFromText = exports.createCompilerHostFromProgramHost = exports.createWatchFactory = exports.WatchType = exports.createWatchHost = exports.returnNoopFileWatcher = exports.noopFileWatcher = exports.emitFilesAndReportErrorsAndGetExitStatus = exports.emitFilesAndReportErrors = exports.fileIncludeReasonToDiagnostics = exports.getMatchedIncludeSpec = exports.getMatchedFileSpec = exports.explainIfFileIsRedirectAndImpliedFormat = exports.explainFiles = exports.listFiles = exports.isBuilderProgram = exports.getErrorSummaryText = exports.getWatchErrorSummaryDiagnosticMessage = exports.getFilesInErrorForSummary = exports.getErrorCountForSummary = exports.parseConfigFileWithSystem = exports.createWatchStatusReporter = exports.getLocaleTimeString = exports.screenStartingMessageCodes = exports.createDiagnosticReporter = void 0;
var ts_1 = require("./_namespaces/ts");
var sysFormatDiagnosticsHost = ts_1.sys ? {
    getCurrentDirectory: function () { return ts_1.sys.getCurrentDirectory(); },
    getNewLine: function () { return ts_1.sys.newLine; },
    getCanonicalFileName: (0, ts_1.createGetCanonicalFileName)(ts_1.sys.useCaseSensitiveFileNames)
} : undefined;
/**
 * Create a function that reports error by writing to the system and handles the formatting of the diagnostic
 *
 * @internal
 */
function createDiagnosticReporter(system, pretty) {
    var host = system === ts_1.sys && sysFormatDiagnosticsHost ? sysFormatDiagnosticsHost : {
        getCurrentDirectory: function () { return system.getCurrentDirectory(); },
        getNewLine: function () { return system.newLine; },
        getCanonicalFileName: (0, ts_1.createGetCanonicalFileName)(system.useCaseSensitiveFileNames),
    };
    if (!pretty) {
        return function (diagnostic) { return system.write((0, ts_1.formatDiagnostic)(diagnostic, host)); };
    }
    var diagnostics = new Array(1);
    return function (diagnostic) {
        diagnostics[0] = diagnostic;
        system.write((0, ts_1.formatDiagnosticsWithColorAndContext)(diagnostics, host) + host.getNewLine());
        diagnostics[0] = undefined; // TODO: GH#18217
    };
}
exports.createDiagnosticReporter = createDiagnosticReporter;
/**
 * @returns Whether the screen was cleared.
 */
function clearScreenIfNotWatchingForFileChanges(system, diagnostic, options) {
    if (system.clearScreen &&
        !options.preserveWatchOutput &&
        !options.extendedDiagnostics &&
        !options.diagnostics &&
        (0, ts_1.contains)(exports.screenStartingMessageCodes, diagnostic.code)) {
        system.clearScreen();
        return true;
    }
    return false;
}
/** @internal */
exports.screenStartingMessageCodes = [
    ts_1.Diagnostics.Starting_compilation_in_watch_mode.code,
    ts_1.Diagnostics.File_change_detected_Starting_incremental_compilation.code,
];
function getPlainDiagnosticFollowingNewLines(diagnostic, newLine) {
    return (0, ts_1.contains)(exports.screenStartingMessageCodes, diagnostic.code)
        ? newLine + newLine
        : newLine;
}
/**
 * Get locale specific time based on whether we are in test mode
 *
 * @internal
 */
function getLocaleTimeString(system) {
    return !system.now ?
        new Date().toLocaleTimeString() :
        // On some systems / builds of Node, there's a non-breaking space between the time and AM/PM.
        // This branch is solely for testing, so just switch it to a normal space for baseline stability.
        // See:
        //     - https://github.com/nodejs/node/issues/45171
        //     - https://github.com/nodejs/node/issues/45753
        system.now().toLocaleTimeString("en-US", { timeZone: "UTC" }).replace("\u202f", " ");
}
exports.getLocaleTimeString = getLocaleTimeString;
/**
 * Create a function that reports watch status by writing to the system and handles the formatting of the diagnostic
 *
 * @internal
 */
function createWatchStatusReporter(system, pretty) {
    return pretty ?
        function (diagnostic, newLine, options) {
            clearScreenIfNotWatchingForFileChanges(system, diagnostic, options);
            var output = "[".concat((0, ts_1.formatColorAndReset)(getLocaleTimeString(system), ts_1.ForegroundColorEscapeSequences.Grey), "] ");
            output += "".concat((0, ts_1.flattenDiagnosticMessageText)(diagnostic.messageText, system.newLine)).concat(newLine + newLine);
            system.write(output);
        } :
        function (diagnostic, newLine, options) {
            var output = "";
            if (!clearScreenIfNotWatchingForFileChanges(system, diagnostic, options)) {
                output += newLine;
            }
            output += "".concat(getLocaleTimeString(system), " - ");
            output += "".concat((0, ts_1.flattenDiagnosticMessageText)(diagnostic.messageText, system.newLine)).concat(getPlainDiagnosticFollowingNewLines(diagnostic, newLine));
            system.write(output);
        };
}
exports.createWatchStatusReporter = createWatchStatusReporter;
/**
 * Parses config file using System interface
 *
 * @internal
 */
function parseConfigFileWithSystem(configFileName, optionsToExtend, extendedConfigCache, watchOptionsToExtend, system, reportDiagnostic) {
    var host = system;
    host.onUnRecoverableConfigFileDiagnostic = function (diagnostic) { return reportUnrecoverableDiagnostic(system, reportDiagnostic, diagnostic); };
    var result = (0, ts_1.getParsedCommandLineOfConfigFile)(configFileName, optionsToExtend, host, extendedConfigCache, watchOptionsToExtend);
    host.onUnRecoverableConfigFileDiagnostic = undefined; // TODO: GH#18217
    return result;
}
exports.parseConfigFileWithSystem = parseConfigFileWithSystem;
/** @internal */
function getErrorCountForSummary(diagnostics) {
    return (0, ts_1.countWhere)(diagnostics, function (diagnostic) { return diagnostic.category === ts_1.DiagnosticCategory.Error; });
}
exports.getErrorCountForSummary = getErrorCountForSummary;
/** @internal */
function getFilesInErrorForSummary(diagnostics) {
    var filesInError = (0, ts_1.filter)(diagnostics, function (diagnostic) { return diagnostic.category === ts_1.DiagnosticCategory.Error; })
        .map(function (errorDiagnostic) {
        if (errorDiagnostic.file === undefined)
            return;
        return "".concat(errorDiagnostic.file.fileName);
    });
    return filesInError.map(function (fileName) {
        if (fileName === undefined) {
            return undefined;
        }
        var diagnosticForFileName = (0, ts_1.find)(diagnostics, function (diagnostic) {
            return diagnostic.file !== undefined && diagnostic.file.fileName === fileName;
        });
        if (diagnosticForFileName !== undefined) {
            var line = (0, ts_1.getLineAndCharacterOfPosition)(diagnosticForFileName.file, diagnosticForFileName.start).line;
            return {
                fileName: fileName,
                line: line + 1,
            };
        }
    });
}
exports.getFilesInErrorForSummary = getFilesInErrorForSummary;
/** @internal */
function getWatchErrorSummaryDiagnosticMessage(errorCount) {
    return errorCount === 1 ?
        ts_1.Diagnostics.Found_1_error_Watching_for_file_changes :
        ts_1.Diagnostics.Found_0_errors_Watching_for_file_changes;
}
exports.getWatchErrorSummaryDiagnosticMessage = getWatchErrorSummaryDiagnosticMessage;
function prettyPathForFileError(error, cwd) {
    var line = (0, ts_1.formatColorAndReset)(":" + error.line, ts_1.ForegroundColorEscapeSequences.Grey);
    if ((0, ts_1.pathIsAbsolute)(error.fileName) && (0, ts_1.pathIsAbsolute)(cwd)) {
        return (0, ts_1.getRelativePathFromDirectory)(cwd, error.fileName, /*ignoreCase*/ false) + line;
    }
    return error.fileName + line;
}
/** @internal */
function getErrorSummaryText(errorCount, filesInError, newLine, host) {
    if (errorCount === 0)
        return "";
    var nonNilFiles = filesInError.filter(function (fileInError) { return fileInError !== undefined; });
    var distinctFileNamesWithLines = nonNilFiles.map(function (fileInError) { return "".concat(fileInError.fileName, ":").concat(fileInError.line); })
        .filter(function (value, index, self) { return self.indexOf(value) === index; });
    var firstFileReference = nonNilFiles[0] && prettyPathForFileError(nonNilFiles[0], host.getCurrentDirectory());
    var messageAndArgs;
    if (errorCount === 1) {
        messageAndArgs = filesInError[0] !== undefined ? [ts_1.Diagnostics.Found_1_error_in_0, firstFileReference] : [ts_1.Diagnostics.Found_1_error];
    }
    else {
        messageAndArgs =
            distinctFileNamesWithLines.length === 0 ? [ts_1.Diagnostics.Found_0_errors, errorCount] :
                distinctFileNamesWithLines.length === 1 ? [ts_1.Diagnostics.Found_0_errors_in_the_same_file_starting_at_Colon_1, errorCount, firstFileReference] :
                    [ts_1.Diagnostics.Found_0_errors_in_1_files, errorCount, distinctFileNamesWithLines.length];
    }
    var d = ts_1.createCompilerDiagnostic.apply(void 0, messageAndArgs);
    var suffix = distinctFileNamesWithLines.length > 1 ? createTabularErrorsDisplay(nonNilFiles, host) : "";
    return "".concat(newLine).concat((0, ts_1.flattenDiagnosticMessageText)(d.messageText, newLine)).concat(newLine).concat(newLine).concat(suffix);
}
exports.getErrorSummaryText = getErrorSummaryText;
function createTabularErrorsDisplay(filesInError, host) {
    var distinctFiles = filesInError.filter(function (value, index, self) { return index === self.findIndex(function (file) { return (file === null || file === void 0 ? void 0 : file.fileName) === (value === null || value === void 0 ? void 0 : value.fileName); }); });
    if (distinctFiles.length === 0)
        return "";
    var numberLength = function (num) { return Math.log(num) * Math.LOG10E + 1; };
    var fileToErrorCount = distinctFiles.map(function (file) { return [file, (0, ts_1.countWhere)(filesInError, function (fileInError) { return fileInError.fileName === file.fileName; })]; });
    var maxErrors = fileToErrorCount.reduce(function (acc, value) { return Math.max(acc, value[1] || 0); }, 0);
    var headerRow = ts_1.Diagnostics.Errors_Files.message;
    var leftColumnHeadingLength = headerRow.split(" ")[0].length;
    var leftPaddingGoal = Math.max(leftColumnHeadingLength, numberLength(maxErrors));
    var headerPadding = Math.max(numberLength(maxErrors) - leftColumnHeadingLength, 0);
    var tabularData = "";
    tabularData += " ".repeat(headerPadding) + headerRow + "\n";
    fileToErrorCount.forEach(function (row) {
        var file = row[0], errorCount = row[1];
        var errorCountDigitsLength = Math.log(errorCount) * Math.LOG10E + 1 | 0;
        var leftPadding = errorCountDigitsLength < leftPaddingGoal ?
            " ".repeat(leftPaddingGoal - errorCountDigitsLength)
            : "";
        var fileRef = prettyPathForFileError(file, host.getCurrentDirectory());
        tabularData += "".concat(leftPadding).concat(errorCount, "  ").concat(fileRef, "\n");
    });
    return tabularData;
}
/** @internal */
function isBuilderProgram(program) {
    return !!program.getState;
}
exports.isBuilderProgram = isBuilderProgram;
/** @internal */
function listFiles(program, write) {
    var options = program.getCompilerOptions();
    if (options.explainFiles) {
        explainFiles(isBuilderProgram(program) ? program.getProgram() : program, write);
    }
    else if (options.listFiles || options.listFilesOnly) {
        (0, ts_1.forEach)(program.getSourceFiles(), function (file) {
            write(file.fileName);
        });
    }
}
exports.listFiles = listFiles;
/** @internal */
function explainFiles(program, write) {
    var _a, _b;
    var reasons = program.getFileIncludeReasons();
    var relativeFileName = function (fileName) { return (0, ts_1.convertToRelativePath)(fileName, program.getCurrentDirectory(), program.getCanonicalFileName); };
    for (var _i = 0, _c = program.getSourceFiles(); _i < _c.length; _i++) {
        var file = _c[_i];
        write("".concat(toFileName(file, relativeFileName)));
        (_a = reasons.get(file.path)) === null || _a === void 0 ? void 0 : _a.forEach(function (reason) { return write("  ".concat(fileIncludeReasonToDiagnostics(program, reason, relativeFileName).messageText)); });
        (_b = explainIfFileIsRedirectAndImpliedFormat(file, relativeFileName)) === null || _b === void 0 ? void 0 : _b.forEach(function (d) { return write("  ".concat(d.messageText)); });
    }
}
exports.explainFiles = explainFiles;
/** @internal */
function explainIfFileIsRedirectAndImpliedFormat(file, fileNameConvertor) {
    var _a;
    var result;
    if (file.path !== file.resolvedPath) {
        (result !== null && result !== void 0 ? result : (result = [])).push((0, ts_1.chainDiagnosticMessages)(
        /*details*/ undefined, ts_1.Diagnostics.File_is_output_of_project_reference_source_0, toFileName(file.originalFileName, fileNameConvertor)));
    }
    if (file.redirectInfo) {
        (result !== null && result !== void 0 ? result : (result = [])).push((0, ts_1.chainDiagnosticMessages)(
        /*details*/ undefined, ts_1.Diagnostics.File_redirects_to_file_0, toFileName(file.redirectInfo.redirectTarget, fileNameConvertor)));
    }
    if ((0, ts_1.isExternalOrCommonJsModule)(file)) {
        switch (file.impliedNodeFormat) {
            case ts_1.ModuleKind.ESNext:
                if (file.packageJsonScope) {
                    (result !== null && result !== void 0 ? result : (result = [])).push((0, ts_1.chainDiagnosticMessages)(
                    /*details*/ undefined, ts_1.Diagnostics.File_is_ECMAScript_module_because_0_has_field_type_with_value_module, toFileName((0, ts_1.last)(file.packageJsonLocations), fileNameConvertor)));
                }
                break;
            case ts_1.ModuleKind.CommonJS:
                if (file.packageJsonScope) {
                    (result !== null && result !== void 0 ? result : (result = [])).push((0, ts_1.chainDiagnosticMessages)(
                    /*details*/ undefined, file.packageJsonScope.contents.packageJsonContent.type ?
                        ts_1.Diagnostics.File_is_CommonJS_module_because_0_has_field_type_whose_value_is_not_module :
                        ts_1.Diagnostics.File_is_CommonJS_module_because_0_does_not_have_field_type, toFileName((0, ts_1.last)(file.packageJsonLocations), fileNameConvertor)));
                }
                else if ((_a = file.packageJsonLocations) === null || _a === void 0 ? void 0 : _a.length) {
                    (result !== null && result !== void 0 ? result : (result = [])).push((0, ts_1.chainDiagnosticMessages)(
                    /*details*/ undefined, ts_1.Diagnostics.File_is_CommonJS_module_because_package_json_was_not_found));
                }
                break;
        }
    }
    return result;
}
exports.explainIfFileIsRedirectAndImpliedFormat = explainIfFileIsRedirectAndImpliedFormat;
/** @internal */
function getMatchedFileSpec(program, fileName) {
    var _a;
    var configFile = program.getCompilerOptions().configFile;
    if (!((_a = configFile === null || configFile === void 0 ? void 0 : configFile.configFileSpecs) === null || _a === void 0 ? void 0 : _a.validatedFilesSpec))
        return undefined;
    var filePath = program.getCanonicalFileName(fileName);
    var basePath = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(configFile.fileName, program.getCurrentDirectory()));
    return (0, ts_1.find)(configFile.configFileSpecs.validatedFilesSpec, function (fileSpec) { return program.getCanonicalFileName((0, ts_1.getNormalizedAbsolutePath)(fileSpec, basePath)) === filePath; });
}
exports.getMatchedFileSpec = getMatchedFileSpec;
/** @internal */
function getMatchedIncludeSpec(program, fileName) {
    var _a, _b;
    var configFile = program.getCompilerOptions().configFile;
    if (!((_a = configFile === null || configFile === void 0 ? void 0 : configFile.configFileSpecs) === null || _a === void 0 ? void 0 : _a.validatedIncludeSpecs))
        return undefined;
    // Return true if its default include spec
    if (configFile.configFileSpecs.isDefaultIncludeSpec)
        return true;
    var isJsonFile = (0, ts_1.fileExtensionIs)(fileName, ".json" /* Extension.Json */);
    var basePath = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(configFile.fileName, program.getCurrentDirectory()));
    var useCaseSensitiveFileNames = program.useCaseSensitiveFileNames();
    return (0, ts_1.find)((_b = configFile === null || configFile === void 0 ? void 0 : configFile.configFileSpecs) === null || _b === void 0 ? void 0 : _b.validatedIncludeSpecs, function (includeSpec) {
        if (isJsonFile && !(0, ts_1.endsWith)(includeSpec, ".json" /* Extension.Json */))
            return false;
        var pattern = (0, ts_1.getPatternFromSpec)(includeSpec, basePath, "files");
        return !!pattern && (0, ts_1.getRegexFromPattern)("(".concat(pattern, ")$"), useCaseSensitiveFileNames).test(fileName);
    });
}
exports.getMatchedIncludeSpec = getMatchedIncludeSpec;
/** @internal */
function fileIncludeReasonToDiagnostics(program, reason, fileNameConvertor) {
    var _a, _b;
    var options = program.getCompilerOptions();
    if ((0, ts_1.isReferencedFile)(reason)) {
        var referenceLocation = (0, ts_1.getReferencedFileLocation)(function (path) { return program.getSourceFileByPath(path); }, reason);
        var referenceText = (0, ts_1.isReferenceFileLocation)(referenceLocation) ? referenceLocation.file.text.substring(referenceLocation.pos, referenceLocation.end) : "\"".concat(referenceLocation.text, "\"");
        var message = void 0;
        ts_1.Debug.assert((0, ts_1.isReferenceFileLocation)(referenceLocation) || reason.kind === ts_1.FileIncludeKind.Import, "Only synthetic references are imports");
        switch (reason.kind) {
            case ts_1.FileIncludeKind.Import:
                if ((0, ts_1.isReferenceFileLocation)(referenceLocation)) {
                    message = referenceLocation.packageId ?
                        ts_1.Diagnostics.Imported_via_0_from_file_1_with_packageId_2 :
                        ts_1.Diagnostics.Imported_via_0_from_file_1;
                }
                else if (referenceLocation.text === ts_1.externalHelpersModuleNameText) {
                    message = referenceLocation.packageId ?
                        ts_1.Diagnostics.Imported_via_0_from_file_1_with_packageId_2_to_import_importHelpers_as_specified_in_compilerOptions :
                        ts_1.Diagnostics.Imported_via_0_from_file_1_to_import_importHelpers_as_specified_in_compilerOptions;
                }
                else {
                    message = referenceLocation.packageId ?
                        ts_1.Diagnostics.Imported_via_0_from_file_1_with_packageId_2_to_import_jsx_and_jsxs_factory_functions :
                        ts_1.Diagnostics.Imported_via_0_from_file_1_to_import_jsx_and_jsxs_factory_functions;
                }
                break;
            case ts_1.FileIncludeKind.ReferenceFile:
                ts_1.Debug.assert(!referenceLocation.packageId);
                message = ts_1.Diagnostics.Referenced_via_0_from_file_1;
                break;
            case ts_1.FileIncludeKind.TypeReferenceDirective:
                message = referenceLocation.packageId ?
                    ts_1.Diagnostics.Type_library_referenced_via_0_from_file_1_with_packageId_2 :
                    ts_1.Diagnostics.Type_library_referenced_via_0_from_file_1;
                break;
            case ts_1.FileIncludeKind.LibReferenceDirective:
                ts_1.Debug.assert(!referenceLocation.packageId);
                message = ts_1.Diagnostics.Library_referenced_via_0_from_file_1;
                break;
            default:
                ts_1.Debug.assertNever(reason);
        }
        return (0, ts_1.chainDiagnosticMessages)(
        /*details*/ undefined, message, referenceText, toFileName(referenceLocation.file, fileNameConvertor), (referenceLocation.packageId && (0, ts_1.packageIdToString)(referenceLocation.packageId)));
    }
    switch (reason.kind) {
        case ts_1.FileIncludeKind.RootFile:
            if (!((_a = options.configFile) === null || _a === void 0 ? void 0 : _a.configFileSpecs))
                return (0, ts_1.chainDiagnosticMessages)(/*details*/ undefined, ts_1.Diagnostics.Root_file_specified_for_compilation);
            var fileName = (0, ts_1.getNormalizedAbsolutePath)(program.getRootFileNames()[reason.index], program.getCurrentDirectory());
            var matchedByFiles = getMatchedFileSpec(program, fileName);
            if (matchedByFiles)
                return (0, ts_1.chainDiagnosticMessages)(/*details*/ undefined, ts_1.Diagnostics.Part_of_files_list_in_tsconfig_json);
            var matchedByInclude = getMatchedIncludeSpec(program, fileName);
            return (0, ts_1.isString)(matchedByInclude) ?
                (0, ts_1.chainDiagnosticMessages)(
                /*details*/ undefined, ts_1.Diagnostics.Matched_by_include_pattern_0_in_1, matchedByInclude, toFileName(options.configFile, fileNameConvertor)) :
                // Could be additional files specified as roots or matched by default include
                (0, ts_1.chainDiagnosticMessages)(/*details*/ undefined, matchedByInclude ?
                    ts_1.Diagnostics.Matched_by_default_include_pattern_Asterisk_Asterisk_Slash_Asterisk :
                    ts_1.Diagnostics.Root_file_specified_for_compilation);
        case ts_1.FileIncludeKind.SourceFromProjectReference:
        case ts_1.FileIncludeKind.OutputFromProjectReference:
            var isOutput = reason.kind === ts_1.FileIncludeKind.OutputFromProjectReference;
            var referencedResolvedRef = ts_1.Debug.checkDefined((_b = program.getResolvedProjectReferences()) === null || _b === void 0 ? void 0 : _b[reason.index]);
            return (0, ts_1.chainDiagnosticMessages)(
            /*details*/ undefined, (0, ts_1.outFile)(options) ?
                isOutput ?
                    ts_1.Diagnostics.Output_from_referenced_project_0_included_because_1_specified :
                    ts_1.Diagnostics.Source_from_referenced_project_0_included_because_1_specified :
                isOutput ?
                    ts_1.Diagnostics.Output_from_referenced_project_0_included_because_module_is_specified_as_none :
                    ts_1.Diagnostics.Source_from_referenced_project_0_included_because_module_is_specified_as_none, toFileName(referencedResolvedRef.sourceFile.fileName, fileNameConvertor), options.outFile ? "--outFile" : "--out");
        case ts_1.FileIncludeKind.AutomaticTypeDirectiveFile: {
            var messageAndArgs = options.types ?
                reason.packageId ?
                    [ts_1.Diagnostics.Entry_point_of_type_library_0_specified_in_compilerOptions_with_packageId_1, reason.typeReference, (0, ts_1.packageIdToString)(reason.packageId)] :
                    [ts_1.Diagnostics.Entry_point_of_type_library_0_specified_in_compilerOptions, reason.typeReference] :
                reason.packageId ?
                    [ts_1.Diagnostics.Entry_point_for_implicit_type_library_0_with_packageId_1, reason.typeReference, (0, ts_1.packageIdToString)(reason.packageId)] :
                    [ts_1.Diagnostics.Entry_point_for_implicit_type_library_0, reason.typeReference];
            return ts_1.chainDiagnosticMessages.apply(void 0, __spreadArray([/*details*/ undefined], messageAndArgs, false));
        }
        case ts_1.FileIncludeKind.LibFile: {
            if (reason.index !== undefined)
                return (0, ts_1.chainDiagnosticMessages)(/*details*/ undefined, ts_1.Diagnostics.Library_0_specified_in_compilerOptions, options.lib[reason.index]);
            var target = (0, ts_1.forEachEntry)(ts_1.targetOptionDeclaration.type, function (value, key) { return value === (0, ts_1.getEmitScriptTarget)(options) ? key : undefined; });
            var messageAndArgs = target ? [ts_1.Diagnostics.Default_library_for_target_0, target] : [ts_1.Diagnostics.Default_library];
            return ts_1.chainDiagnosticMessages.apply(void 0, __spreadArray([/*details*/ undefined], messageAndArgs, false));
        }
        default:
            ts_1.Debug.assertNever(reason);
    }
}
exports.fileIncludeReasonToDiagnostics = fileIncludeReasonToDiagnostics;
function toFileName(file, fileNameConvertor) {
    var fileName = (0, ts_1.isString)(file) ? file : file.fileName;
    return fileNameConvertor ? fileNameConvertor(fileName) : fileName;
}
/**
 * Helper that emit files, report diagnostics and lists emitted and/or source files depending on compiler options
 *
 * @internal
 */
function emitFilesAndReportErrors(program, reportDiagnostic, write, reportSummary, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
    var isListFilesOnly = !!program.getCompilerOptions().listFilesOnly;
    // First get and report any syntactic errors.
    var allDiagnostics = program.getConfigFileParsingDiagnostics().slice();
    var configFileParsingDiagnosticsLength = allDiagnostics.length;
    (0, ts_1.addRange)(allDiagnostics, program.getSyntacticDiagnostics(/*sourceFile*/ undefined, cancellationToken));
    // If we didn't have any syntactic errors, then also try getting the global and
    // semantic errors.
    if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
        (0, ts_1.addRange)(allDiagnostics, program.getOptionsDiagnostics(cancellationToken));
        if (!isListFilesOnly) {
            (0, ts_1.addRange)(allDiagnostics, program.getGlobalDiagnostics(cancellationToken));
            if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
                (0, ts_1.addRange)(allDiagnostics, program.getSemanticDiagnostics(/*sourceFile*/ undefined, cancellationToken));
            }
        }
    }
    // Emit and report any errors we ran into.
    var emitResult = isListFilesOnly
        ? { emitSkipped: true, diagnostics: ts_1.emptyArray }
        : program.emit(/*targetSourceFile*/ undefined, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    var emittedFiles = emitResult.emittedFiles, emitDiagnostics = emitResult.diagnostics;
    (0, ts_1.addRange)(allDiagnostics, emitDiagnostics);
    var diagnostics = (0, ts_1.sortAndDeduplicateDiagnostics)(allDiagnostics);
    diagnostics.forEach(reportDiagnostic);
    if (write) {
        var currentDir_1 = program.getCurrentDirectory();
        (0, ts_1.forEach)(emittedFiles, function (file) {
            var filepath = (0, ts_1.getNormalizedAbsolutePath)(file, currentDir_1);
            write("TSFILE: ".concat(filepath));
        });
        listFiles(program, write);
    }
    if (reportSummary) {
        reportSummary(getErrorCountForSummary(diagnostics), getFilesInErrorForSummary(diagnostics));
    }
    return {
        emitResult: emitResult,
        diagnostics: diagnostics,
    };
}
exports.emitFilesAndReportErrors = emitFilesAndReportErrors;
/** @internal */
function emitFilesAndReportErrorsAndGetExitStatus(program, reportDiagnostic, write, reportSummary, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
    var _a = emitFilesAndReportErrors(program, reportDiagnostic, write, reportSummary, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers), emitResult = _a.emitResult, diagnostics = _a.diagnostics;
    if (emitResult.emitSkipped && diagnostics.length > 0) {
        // If the emitter didn't emit anything, then pass that value along.
        return ts_1.ExitStatus.DiagnosticsPresent_OutputsSkipped;
    }
    else if (diagnostics.length > 0) {
        // The emitter emitted something, inform the caller if that happened in the presence
        // of diagnostics or not.
        return ts_1.ExitStatus.DiagnosticsPresent_OutputsGenerated;
    }
    return ts_1.ExitStatus.Success;
}
exports.emitFilesAndReportErrorsAndGetExitStatus = emitFilesAndReportErrorsAndGetExitStatus;
/** @internal */
exports.noopFileWatcher = { close: ts_1.noop };
/** @internal */
var returnNoopFileWatcher = function () { return exports.noopFileWatcher; };
exports.returnNoopFileWatcher = returnNoopFileWatcher;
/** @internal */
function createWatchHost(system, reportWatchStatus) {
    if (system === void 0) { system = ts_1.sys; }
    var onWatchStatusChange = reportWatchStatus || createWatchStatusReporter(system);
    return {
        onWatchStatusChange: onWatchStatusChange,
        watchFile: (0, ts_1.maybeBind)(system, system.watchFile) || exports.returnNoopFileWatcher,
        watchDirectory: (0, ts_1.maybeBind)(system, system.watchDirectory) || exports.returnNoopFileWatcher,
        setTimeout: (0, ts_1.maybeBind)(system, system.setTimeout) || ts_1.noop,
        clearTimeout: (0, ts_1.maybeBind)(system, system.clearTimeout) || ts_1.noop
    };
}
exports.createWatchHost = createWatchHost;
/** @internal */
exports.WatchType = {
    ConfigFile: "Config file",
    ExtendedConfigFile: "Extended config file",
    SourceFile: "Source file",
    MissingFile: "Missing file",
    WildcardDirectory: "Wild card directory",
    FailedLookupLocations: "Failed Lookup Locations",
    AffectingFileLocation: "File location affecting resolution",
    TypeRoots: "Type roots",
    ConfigFileOfReferencedProject: "Config file of referened project",
    ExtendedConfigOfReferencedProject: "Extended config file of referenced project",
    WildcardDirectoryOfReferencedProject: "Wild card directory of referenced project",
    PackageJson: "package.json file",
    ClosedScriptInfo: "Closed Script info",
    ConfigFileForInferredRoot: "Config file for the inferred project root",
    NodeModules: "node_modules for closed script infos and package.jsons affecting module specifier cache",
    MissingSourceMapFile: "Missing source map file",
    NoopConfigFileForInferredRoot: "Noop Config file for the inferred project root",
    MissingGeneratedFile: "Missing generated file",
    NodeModulesForModuleSpecifierCache: "node_modules for module specifier cache invalidation",
    TypingInstallerLocationFile: "File location for typing installer",
    TypingInstallerLocationDirectory: "Directory location for typing installer",
};
/** @internal */
function createWatchFactory(host, options) {
    var watchLogLevel = host.trace ? options.extendedDiagnostics ? ts_1.WatchLogLevel.Verbose : options.diagnostics ? ts_1.WatchLogLevel.TriggerOnly : ts_1.WatchLogLevel.None : ts_1.WatchLogLevel.None;
    var writeLog = watchLogLevel !== ts_1.WatchLogLevel.None ? (function (s) { return host.trace(s); }) : ts_1.noop;
    var result = (0, ts_1.getWatchFactory)(host, watchLogLevel, writeLog);
    result.writeLog = writeLog;
    return result;
}
exports.createWatchFactory = createWatchFactory;
/** @internal */
function createCompilerHostFromProgramHost(host, getCompilerOptions, directoryStructureHost) {
    if (directoryStructureHost === void 0) { directoryStructureHost = host; }
    var useCaseSensitiveFileNames = host.useCaseSensitiveFileNames();
    var compilerHost = {
        getSourceFile: (0, ts_1.createGetSourceFile)(function (fileName, encoding) { return !encoding ? compilerHost.readFile(fileName) : host.readFile(fileName, encoding); }, getCompilerOptions, 
        /*setParentNodes*/ undefined),
        getDefaultLibLocation: (0, ts_1.maybeBind)(host, host.getDefaultLibLocation),
        getDefaultLibFileName: function (options) { return host.getDefaultLibFileName(options); },
        writeFile: (0, ts_1.createWriteFileMeasuringIO)(function (path, data, writeByteOrderMark) { return host.writeFile(path, data, writeByteOrderMark); }, function (path) { return host.createDirectory(path); }, function (path) { return host.directoryExists(path); }),
        getCurrentDirectory: (0, ts_1.memoize)(function () { return host.getCurrentDirectory(); }),
        useCaseSensitiveFileNames: function () { return useCaseSensitiveFileNames; },
        getCanonicalFileName: (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames),
        getNewLine: function () { return (0, ts_1.getNewLineCharacter)(getCompilerOptions()); },
        fileExists: function (f) { return host.fileExists(f); },
        readFile: function (f) { return host.readFile(f); },
        trace: (0, ts_1.maybeBind)(host, host.trace),
        directoryExists: (0, ts_1.maybeBind)(directoryStructureHost, directoryStructureHost.directoryExists),
        getDirectories: (0, ts_1.maybeBind)(directoryStructureHost, directoryStructureHost.getDirectories),
        realpath: (0, ts_1.maybeBind)(host, host.realpath),
        getEnvironmentVariable: (0, ts_1.maybeBind)(host, host.getEnvironmentVariable) || (function () { return ""; }),
        createHash: (0, ts_1.maybeBind)(host, host.createHash),
        readDirectory: (0, ts_1.maybeBind)(host, host.readDirectory),
        storeFilesChangingSignatureDuringEmit: host.storeFilesChangingSignatureDuringEmit,
    };
    return compilerHost;
}
exports.createCompilerHostFromProgramHost = createCompilerHostFromProgramHost;
/** @internal */
function getSourceFileVersionAsHashFromText(host, text) {
    // If text can contain the sourceMapUrl ignore sourceMapUrl for calcualting hash
    if (text.match(ts_1.sourceMapCommentRegExpDontCareLineStart)) {
        var lineEnd = text.length;
        var lineStart = lineEnd;
        for (var pos = lineEnd - 1; pos >= 0; pos--) {
            var ch = text.charCodeAt(pos);
            switch (ch) {
                case 10 /* CharacterCodes.lineFeed */:
                    if (pos && text.charCodeAt(pos - 1) === 13 /* CharacterCodes.carriageReturn */) {
                        pos--;
                    }
                // falls through
                case 13 /* CharacterCodes.carriageReturn */:
                    break;
                default:
                    if (ch < 127 /* CharacterCodes.maxAsciiCharacter */ || !(0, ts_1.isLineBreak)(ch)) {
                        lineStart = pos;
                        continue;
                    }
                    break;
            }
            // This is start of the line
            var line = text.substring(lineStart, lineEnd);
            if (line.match(ts_1.sourceMapCommentRegExp)) {
                text = text.substring(0, lineStart);
                break;
            }
            // If we see a non-whitespace/map comment-like line, break, to avoid scanning up the entire file
            else if (!line.match(ts_1.whitespaceOrMapCommentRegExp)) {
                break;
            }
            lineEnd = lineStart;
        }
    }
    return (host.createHash || ts_1.generateDjb2Hash)(text);
}
exports.getSourceFileVersionAsHashFromText = getSourceFileVersionAsHashFromText;
/** @internal */
function setGetSourceFileAsHashVersioned(compilerHost) {
    var originalGetSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result = originalGetSourceFile.call.apply(originalGetSourceFile, __spreadArray([compilerHost], args, false));
        if (result) {
            result.version = getSourceFileVersionAsHashFromText(compilerHost, result.text);
        }
        return result;
    };
}
exports.setGetSourceFileAsHashVersioned = setGetSourceFileAsHashVersioned;
/**
 * Creates the watch compiler host that can be extended with config file or root file names and options host
 *
 * @internal
 */
function createProgramHost(system, createProgram) {
    var getDefaultLibLocation = (0, ts_1.memoize)(function () { return (0, ts_1.getDirectoryPath)((0, ts_1.normalizePath)(system.getExecutingFilePath())); });
    return {
        useCaseSensitiveFileNames: function () { return system.useCaseSensitiveFileNames; },
        getNewLine: function () { return system.newLine; },
        getCurrentDirectory: (0, ts_1.memoize)(function () { return system.getCurrentDirectory(); }),
        getDefaultLibLocation: getDefaultLibLocation,
        getDefaultLibFileName: function (options) { return (0, ts_1.combinePaths)(getDefaultLibLocation(), (0, ts_1.getDefaultLibFileName)(options)); },
        fileExists: function (path) { return system.fileExists(path); },
        readFile: function (path, encoding) { return system.readFile(path, encoding); },
        directoryExists: function (path) { return system.directoryExists(path); },
        getDirectories: function (path) { return system.getDirectories(path); },
        readDirectory: function (path, extensions, exclude, include, depth) { return system.readDirectory(path, extensions, exclude, include, depth); },
        realpath: (0, ts_1.maybeBind)(system, system.realpath),
        getEnvironmentVariable: (0, ts_1.maybeBind)(system, system.getEnvironmentVariable),
        trace: function (s) { return system.write(s + system.newLine); },
        createDirectory: function (path) { return system.createDirectory(path); },
        writeFile: function (path, data, writeByteOrderMark) { return system.writeFile(path, data, writeByteOrderMark); },
        createHash: (0, ts_1.maybeBind)(system, system.createHash),
        createProgram: createProgram || ts_1.createEmitAndSemanticDiagnosticsBuilderProgram,
        storeFilesChangingSignatureDuringEmit: system.storeFilesChangingSignatureDuringEmit,
        now: (0, ts_1.maybeBind)(system, system.now),
    };
}
exports.createProgramHost = createProgramHost;
/**
 * Creates the watch compiler host that can be extended with config file or root file names and options host
 */
function createWatchCompilerHost(system, createProgram, reportDiagnostic, reportWatchStatus) {
    if (system === void 0) { system = ts_1.sys; }
    var write = function (s) { return system.write(s + system.newLine); };
    var result = createProgramHost(system, createProgram);
    (0, ts_1.copyProperties)(result, createWatchHost(system, reportWatchStatus));
    result.afterProgramCreate = function (builderProgram) {
        var compilerOptions = builderProgram.getCompilerOptions();
        var newLine = (0, ts_1.getNewLineCharacter)(compilerOptions);
        emitFilesAndReportErrors(builderProgram, reportDiagnostic, write, function (errorCount) { return result.onWatchStatusChange((0, ts_1.createCompilerDiagnostic)(getWatchErrorSummaryDiagnosticMessage(errorCount), errorCount), newLine, compilerOptions, errorCount); });
    };
    return result;
}
/**
 * Report error and exit
 */
function reportUnrecoverableDiagnostic(system, reportDiagnostic, diagnostic) {
    reportDiagnostic(diagnostic);
    system.exit(ts_1.ExitStatus.DiagnosticsPresent_OutputsSkipped);
}
/**
 * Creates the watch compiler host from system for config file in watch mode
 *
 * @internal
 */
function createWatchCompilerHostOfConfigFile(_a) {
    var configFileName = _a.configFileName, optionsToExtend = _a.optionsToExtend, watchOptionsToExtend = _a.watchOptionsToExtend, extraFileExtensions = _a.extraFileExtensions, system = _a.system, createProgram = _a.createProgram, reportDiagnostic = _a.reportDiagnostic, reportWatchStatus = _a.reportWatchStatus;
    var diagnosticReporter = reportDiagnostic || createDiagnosticReporter(system);
    var host = createWatchCompilerHost(system, createProgram, diagnosticReporter, reportWatchStatus);
    host.onUnRecoverableConfigFileDiagnostic = function (diagnostic) { return reportUnrecoverableDiagnostic(system, diagnosticReporter, diagnostic); };
    host.configFileName = configFileName;
    host.optionsToExtend = optionsToExtend;
    host.watchOptionsToExtend = watchOptionsToExtend;
    host.extraFileExtensions = extraFileExtensions;
    return host;
}
exports.createWatchCompilerHostOfConfigFile = createWatchCompilerHostOfConfigFile;
/**
 * Creates the watch compiler host from system for compiling root files and options in watch mode
 *
 * @internal
 */
function createWatchCompilerHostOfFilesAndCompilerOptions(_a) {
    var rootFiles = _a.rootFiles, options = _a.options, watchOptions = _a.watchOptions, projectReferences = _a.projectReferences, system = _a.system, createProgram = _a.createProgram, reportDiagnostic = _a.reportDiagnostic, reportWatchStatus = _a.reportWatchStatus;
    var host = createWatchCompilerHost(system, createProgram, reportDiagnostic || createDiagnosticReporter(system), reportWatchStatus);
    host.rootFiles = rootFiles;
    host.options = options;
    host.watchOptions = watchOptions;
    host.projectReferences = projectReferences;
    return host;
}
exports.createWatchCompilerHostOfFilesAndCompilerOptions = createWatchCompilerHostOfFilesAndCompilerOptions;
/** @internal */
function performIncrementalCompilation(input) {
    var system = input.system || ts_1.sys;
    var host = input.host || (input.host = (0, ts_1.createIncrementalCompilerHost)(input.options, system));
    var builderProgram = (0, ts_1.createIncrementalProgram)(input);
    var exitStatus = emitFilesAndReportErrorsAndGetExitStatus(builderProgram, input.reportDiagnostic || createDiagnosticReporter(system), function (s) { return host.trace && host.trace(s); }, input.reportErrorSummary || input.options.pretty ? function (errorCount, filesInError) { return system.write(getErrorSummaryText(errorCount, filesInError, system.newLine, host)); } : undefined);
    if (input.afterProgramEmitAndDiagnostics)
        input.afterProgramEmitAndDiagnostics(builderProgram);
    return exitStatus;
}
exports.performIncrementalCompilation = performIncrementalCompilation;
