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
exports.createRedirectedBuilderProgram = exports.getBuildInfoFileVersionMap = exports.createBuilderProgramUsingProgramBuildInfo = exports.toProgramEmitPending = exports.toBuilderFileEmit = exports.toBuilderStateFileInfoForMultiEmit = exports.createBuilderProgram = exports.computeSignature = exports.computeSignatureWithDiagnostics = exports.getBuilderCreationParameters = exports.BuilderProgramKind = exports.isProgramBundleEmitBuildInfo = exports.getPendingEmitKind = exports.getBuilderFileEmit = void 0;
var ts_1 = require("./_namespaces/ts");
/**
 * Get flags determining what all needs to be emitted
 *
 * @internal
 */
function getBuilderFileEmit(options) {
    var result = 1 /* BuilderFileEmit.Js */;
    if (options.sourceMap)
        result = result | 2 /* BuilderFileEmit.JsMap */;
    if (options.inlineSourceMap)
        result = result | 4 /* BuilderFileEmit.JsInlineMap */;
    if ((0, ts_1.getEmitDeclarations)(options))
        result = result | 8 /* BuilderFileEmit.Dts */;
    if (options.declarationMap)
        result = result | 16 /* BuilderFileEmit.DtsMap */;
    if (options.emitDeclarationOnly)
        result = result & 24 /* BuilderFileEmit.AllDts */;
    return result;
}
exports.getBuilderFileEmit = getBuilderFileEmit;
/**
 * Determing what all is pending to be emitted based on previous options or previous file emit flags
 *
 * @internal
 */
function getPendingEmitKind(optionsOrEmitKind, oldOptionsOrEmitKind) {
    var oldEmitKind = oldOptionsOrEmitKind && ((0, ts_1.isNumber)(oldOptionsOrEmitKind) ? oldOptionsOrEmitKind : getBuilderFileEmit(oldOptionsOrEmitKind));
    var emitKind = (0, ts_1.isNumber)(optionsOrEmitKind) ? optionsOrEmitKind : getBuilderFileEmit(optionsOrEmitKind);
    if (oldEmitKind === emitKind)
        return 0 /* BuilderFileEmit.None */;
    if (!oldEmitKind || !emitKind)
        return emitKind;
    var diff = oldEmitKind ^ emitKind;
    var result = 0 /* BuilderFileEmit.None */;
    // If there is diff in Js emit, pending emit is js emit flags
    if (diff & 7 /* BuilderFileEmit.AllJs */)
        result = emitKind & 7 /* BuilderFileEmit.AllJs */;
    // If there is diff in Dts emit, pending emit is dts emit flags
    if (diff & 24 /* BuilderFileEmit.AllDts */)
        result = result | (emitKind & 24 /* BuilderFileEmit.AllDts */);
    return result;
}
exports.getPendingEmitKind = getPendingEmitKind;
function hasSameKeys(map1, map2) {
    // Has same size and every key is present in both maps
    return map1 === map2 || map1 !== undefined && map2 !== undefined && map1.size === map2.size && !(0, ts_1.forEachKey)(map1, function (key) { return !map2.has(key); });
}
/**
 * Create the state so that we can iterate on changedFiles/affected files
 */
function createBuilderProgramState(newProgram, oldState) {
    var _a, _b;
    var state = ts_1.BuilderState.create(newProgram, oldState, /*disableUseFileVersionAsSignature*/ false);
    state.program = newProgram;
    var compilerOptions = newProgram.getCompilerOptions();
    state.compilerOptions = compilerOptions;
    var outFilePath = (0, ts_1.outFile)(compilerOptions);
    // With --out or --outFile, any change affects all semantic diagnostics so no need to cache them
    if (!outFilePath) {
        state.semanticDiagnosticsPerFile = new Map();
    }
    else if (compilerOptions.composite && (oldState === null || oldState === void 0 ? void 0 : oldState.outSignature) && outFilePath === (0, ts_1.outFile)(oldState === null || oldState === void 0 ? void 0 : oldState.compilerOptions)) {
        state.outSignature = oldState.outSignature && getEmitSignatureFromOldSignature(compilerOptions, oldState.compilerOptions, oldState.outSignature);
    }
    state.changedFilesSet = new Set();
    state.latestChangedDtsFile = compilerOptions.composite ? oldState === null || oldState === void 0 ? void 0 : oldState.latestChangedDtsFile : undefined;
    var useOldState = ts_1.BuilderState.canReuseOldState(state.referencedMap, oldState);
    var oldCompilerOptions = useOldState ? oldState.compilerOptions : undefined;
    var canCopySemanticDiagnostics = useOldState && oldState.semanticDiagnosticsPerFile && !!state.semanticDiagnosticsPerFile &&
        !(0, ts_1.compilerOptionsAffectSemanticDiagnostics)(compilerOptions, oldCompilerOptions);
    // We can only reuse emit signatures (i.e. .d.ts signatures) if the .d.ts file is unchanged,
    // which will eg be depedent on change in options like declarationDir and outDir options are unchanged.
    // We need to look in oldState.compilerOptions, rather than oldCompilerOptions (i.e.we need to disregard useOldState) because
    // oldCompilerOptions can be undefined if there was change in say module from None to some other option
    // which would make useOldState as false since we can now use reference maps that are needed to track what to emit, what to check etc
    // but that option change does not affect d.ts file name so emitSignatures should still be reused.
    var canCopyEmitSignatures = compilerOptions.composite &&
        (oldState === null || oldState === void 0 ? void 0 : oldState.emitSignatures) &&
        !outFilePath &&
        !(0, ts_1.compilerOptionsAffectDeclarationPath)(compilerOptions, oldState.compilerOptions);
    if (useOldState) {
        // Copy old state's changed files set
        (_a = oldState.changedFilesSet) === null || _a === void 0 ? void 0 : _a.forEach(function (value) { return state.changedFilesSet.add(value); });
        if (!outFilePath && ((_b = oldState.affectedFilesPendingEmit) === null || _b === void 0 ? void 0 : _b.size)) {
            state.affectedFilesPendingEmit = new Map(oldState.affectedFilesPendingEmit);
            state.seenAffectedFiles = new Set();
        }
        state.programEmitPending = oldState.programEmitPending;
    }
    else {
        // We arent using old state, so atleast emit buildInfo with current information
        state.buildInfoEmitPending = true;
    }
    // Update changed files and copy semantic diagnostics if we can
    var referencedMap = state.referencedMap;
    var oldReferencedMap = useOldState ? oldState.referencedMap : undefined;
    var copyDeclarationFileDiagnostics = canCopySemanticDiagnostics && !compilerOptions.skipLibCheck === !oldCompilerOptions.skipLibCheck;
    var copyLibFileDiagnostics = copyDeclarationFileDiagnostics && !compilerOptions.skipDefaultLibCheck === !oldCompilerOptions.skipDefaultLibCheck;
    state.fileInfos.forEach(function (info, sourceFilePath) {
        var _a;
        var oldInfo;
        var newReferences;
        // if not using old state, every file is changed
        if (!useOldState ||
            // File wasn't present in old state
            !(oldInfo = oldState.fileInfos.get(sourceFilePath)) ||
            // versions dont match
            oldInfo.version !== info.version ||
            // Implied formats dont match
            oldInfo.impliedFormat !== info.impliedFormat ||
            // Referenced files changed
            !hasSameKeys(newReferences = referencedMap && referencedMap.getValues(sourceFilePath), oldReferencedMap && oldReferencedMap.getValues(sourceFilePath)) ||
            // Referenced file was deleted in the new program
            newReferences && (0, ts_1.forEachKey)(newReferences, function (path) { return !state.fileInfos.has(path) && oldState.fileInfos.has(path); })) {
            // Register file as changed file and do not copy semantic diagnostics, since all changed files need to be re-evaluated
            addFileToChangeSet(state, sourceFilePath);
        }
        else if (canCopySemanticDiagnostics) {
            var sourceFile = newProgram.getSourceFileByPath(sourceFilePath);
            if (sourceFile.isDeclarationFile && !copyDeclarationFileDiagnostics)
                return;
            if (sourceFile.hasNoDefaultLib && !copyLibFileDiagnostics)
                return;
            // Unchanged file copy diagnostics
            var diagnostics = oldState.semanticDiagnosticsPerFile.get(sourceFilePath);
            if (diagnostics) {
                state.semanticDiagnosticsPerFile.set(sourceFilePath, oldState.hasReusableDiagnostic ?
                    convertToDiagnostics(diagnostics, newProgram) :
                    repopulateDiagnostics(diagnostics, newProgram));
                if (!state.semanticDiagnosticsFromOldState) {
                    state.semanticDiagnosticsFromOldState = new Set();
                }
                state.semanticDiagnosticsFromOldState.add(sourceFilePath);
            }
        }
        if (canCopyEmitSignatures) {
            var oldEmitSignature = oldState.emitSignatures.get(sourceFilePath);
            if (oldEmitSignature) {
                ((_a = state.emitSignatures) !== null && _a !== void 0 ? _a : (state.emitSignatures = new Map())).set(sourceFilePath, getEmitSignatureFromOldSignature(compilerOptions, oldState.compilerOptions, oldEmitSignature));
            }
        }
    });
    // If the global file is removed, add all files as changed
    if (useOldState && (0, ts_1.forEachEntry)(oldState.fileInfos, function (info, sourceFilePath) {
        if (state.fileInfos.has(sourceFilePath))
            return false;
        if (outFilePath || info.affectsGlobalScope)
            return true;
        // if file is deleted we need to write buildInfo again
        state.buildInfoEmitPending = true;
        return false;
    })) {
        ts_1.BuilderState.getAllFilesExcludingDefaultLibraryFile(state, newProgram, /*firstSourceFile*/ undefined)
            .forEach(function (file) { return addFileToChangeSet(state, file.resolvedPath); });
    }
    else if (oldCompilerOptions) {
        // If options affect emit, then we need to do complete emit per compiler options
        // otherwise only the js or dts that needs to emitted because its different from previously emitted options
        var pendingEmitKind_1 = (0, ts_1.compilerOptionsAffectEmit)(compilerOptions, oldCompilerOptions) ?
            getBuilderFileEmit(compilerOptions) :
            getPendingEmitKind(compilerOptions, oldCompilerOptions);
        if (pendingEmitKind_1 !== 0 /* BuilderFileEmit.None */) {
            if (!outFilePath) {
                // Add all files to affectedFilesPendingEmit since emit changed
                newProgram.getSourceFiles().forEach(function (f) {
                    // Add to affectedFilesPending emit only if not changed since any changed file will do full emit
                    if (!state.changedFilesSet.has(f.resolvedPath)) {
                        addToAffectedFilesPendingEmit(state, f.resolvedPath, pendingEmitKind_1);
                    }
                });
                ts_1.Debug.assert(!state.seenAffectedFiles || !state.seenAffectedFiles.size);
                state.seenAffectedFiles = state.seenAffectedFiles || new Set();
                state.buildInfoEmitPending = true;
            }
            else {
                state.programEmitPending = state.programEmitPending ?
                    state.programEmitPending | pendingEmitKind_1 :
                    pendingEmitKind_1;
            }
        }
    }
    if (outFilePath && !state.changedFilesSet.size) {
        // Copy the bundle information from old state so we can patch it later if we are doing partial emit
        if (useOldState)
            state.bundle = oldState.bundle;
        // If this program has prepend references, always emit since we wont know if files on disk are correct unless we check file hash for correctness
        if ((0, ts_1.some)(newProgram.getProjectReferences(), function (ref) { return !!ref.prepend; }))
            state.programEmitPending = getBuilderFileEmit(compilerOptions);
    }
    return state;
}
function addFileToChangeSet(state, path) {
    state.changedFilesSet.add(path);
    state.buildInfoEmitPending = true;
    // Setting this to undefined as changed files means full emit so no need to track emit explicitly
    state.programEmitPending = undefined;
}
/**
 * Covert to Emit signature based on oldOptions and EmitSignature format
 * If d.ts map options differ then swap the format, otherwise use as is
 */
function getEmitSignatureFromOldSignature(options, oldOptions, oldEmitSignature) {
    return !!options.declarationMap === !!oldOptions.declarationMap ?
        // Use same format of signature
        oldEmitSignature :
        // Convert to different format
        (0, ts_1.isString)(oldEmitSignature) ? [oldEmitSignature] : oldEmitSignature[0];
}
function repopulateDiagnostics(diagnostics, newProgram) {
    if (!diagnostics.length)
        return diagnostics;
    return (0, ts_1.sameMap)(diagnostics, function (diag) {
        if ((0, ts_1.isString)(diag.messageText))
            return diag;
        var repopulatedChain = convertOrRepopulateDiagnosticMessageChain(diag.messageText, diag.file, newProgram, function (chain) { var _a; return (_a = chain.repopulateInfo) === null || _a === void 0 ? void 0 : _a.call(chain); });
        return repopulatedChain === diag.messageText ?
            diag : __assign(__assign({}, diag), { messageText: repopulatedChain });
    });
}
function convertOrRepopulateDiagnosticMessageChain(chain, sourceFile, newProgram, repopulateInfo) {
    var info = repopulateInfo(chain);
    if (info) {
        return __assign(__assign({}, (0, ts_1.createModuleNotFoundChain)(sourceFile, newProgram, info.moduleReference, info.mode, info.packageName || info.moduleReference)), { next: convertOrRepopulateDiagnosticMessageChainArray(chain.next, sourceFile, newProgram, repopulateInfo) });
    }
    var next = convertOrRepopulateDiagnosticMessageChainArray(chain.next, sourceFile, newProgram, repopulateInfo);
    return next === chain.next ? chain : __assign(__assign({}, chain), { next: next });
}
function convertOrRepopulateDiagnosticMessageChainArray(array, sourceFile, newProgram, repopulateInfo) {
    return (0, ts_1.sameMap)(array, function (chain) { return convertOrRepopulateDiagnosticMessageChain(chain, sourceFile, newProgram, repopulateInfo); });
}
function convertToDiagnostics(diagnostics, newProgram) {
    if (!diagnostics.length)
        return ts_1.emptyArray;
    var buildInfoDirectory;
    return diagnostics.map(function (diagnostic) {
        var result = convertToDiagnosticRelatedInformation(diagnostic, newProgram, toPathInBuildInfoDirectory);
        result.reportsUnnecessary = diagnostic.reportsUnnecessary;
        result.reportsDeprecated = diagnostic.reportDeprecated;
        result.source = diagnostic.source;
        result.skippedOn = diagnostic.skippedOn;
        var relatedInformation = diagnostic.relatedInformation;
        result.relatedInformation = relatedInformation ?
            relatedInformation.length ?
                relatedInformation.map(function (r) { return convertToDiagnosticRelatedInformation(r, newProgram, toPathInBuildInfoDirectory); }) :
                [] :
            undefined;
        return result;
    });
    function toPathInBuildInfoDirectory(path) {
        buildInfoDirectory !== null && buildInfoDirectory !== void 0 ? buildInfoDirectory : (buildInfoDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getTsBuildInfoEmitOutputFilePath)(newProgram.getCompilerOptions()), newProgram.getCurrentDirectory())));
        return (0, ts_1.toPath)(path, buildInfoDirectory, newProgram.getCanonicalFileName);
    }
}
function convertToDiagnosticRelatedInformation(diagnostic, newProgram, toPath) {
    var file = diagnostic.file;
    var sourceFile = file ? newProgram.getSourceFileByPath(toPath(file)) : undefined;
    return __assign(__assign({}, diagnostic), { file: sourceFile, messageText: (0, ts_1.isString)(diagnostic.messageText) ?
            diagnostic.messageText :
            convertOrRepopulateDiagnosticMessageChain(diagnostic.messageText, sourceFile, newProgram, function (chain) { return chain.info; }) });
}
/**
 * Releases program and other related not needed properties
 */
function releaseCache(state) {
    ts_1.BuilderState.releaseCache(state);
    state.program = undefined;
}
function backupBuilderProgramEmitState(state) {
    var outFilePath = (0, ts_1.outFile)(state.compilerOptions);
    // Only in --out changeFileSet is kept around till emit
    ts_1.Debug.assert(!state.changedFilesSet.size || outFilePath);
    return {
        affectedFilesPendingEmit: state.affectedFilesPendingEmit && new Map(state.affectedFilesPendingEmit),
        seenEmittedFiles: state.seenEmittedFiles && new Map(state.seenEmittedFiles),
        programEmitPending: state.programEmitPending,
        emitSignatures: state.emitSignatures && new Map(state.emitSignatures),
        outSignature: state.outSignature,
        latestChangedDtsFile: state.latestChangedDtsFile,
        hasChangedEmitSignature: state.hasChangedEmitSignature,
        changedFilesSet: outFilePath ? new Set(state.changedFilesSet) : undefined,
    };
}
function restoreBuilderProgramEmitState(state, savedEmitState) {
    state.affectedFilesPendingEmit = savedEmitState.affectedFilesPendingEmit;
    state.seenEmittedFiles = savedEmitState.seenEmittedFiles;
    state.programEmitPending = savedEmitState.programEmitPending;
    state.emitSignatures = savedEmitState.emitSignatures;
    state.outSignature = savedEmitState.outSignature;
    state.latestChangedDtsFile = savedEmitState.latestChangedDtsFile;
    state.hasChangedEmitSignature = savedEmitState.hasChangedEmitSignature;
    if (savedEmitState.changedFilesSet)
        state.changedFilesSet = savedEmitState.changedFilesSet;
}
/**
 * Verifies that source file is ok to be used in calls that arent handled by next
 */
function assertSourceFileOkWithoutNextAffectedCall(state, sourceFile) {
    ts_1.Debug.assert(!sourceFile || !state.affectedFiles || state.affectedFiles[state.affectedFilesIndex - 1] !== sourceFile || !state.semanticDiagnosticsPerFile.has(sourceFile.resolvedPath));
}
/**
 * This function returns the next affected file to be processed.
 * Note that until doneAffected is called it would keep reporting same result
 * This is to allow the callers to be able to actually remove affected file only when the operation is complete
 * eg. if during diagnostics check cancellation token ends up cancelling the request, the affected file should be retained
 */
function getNextAffectedFile(state, cancellationToken, host) {
    var _a, _b;
    while (true) {
        var affectedFiles = state.affectedFiles;
        if (affectedFiles) {
            var seenAffectedFiles = state.seenAffectedFiles;
            var affectedFilesIndex = state.affectedFilesIndex; // TODO: GH#18217
            while (affectedFilesIndex < affectedFiles.length) {
                var affectedFile = affectedFiles[affectedFilesIndex];
                if (!seenAffectedFiles.has(affectedFile.resolvedPath)) {
                    // Set the next affected file as seen and remove the cached semantic diagnostics
                    state.affectedFilesIndex = affectedFilesIndex;
                    addToAffectedFilesPendingEmit(state, affectedFile.resolvedPath, getBuilderFileEmit(state.compilerOptions));
                    handleDtsMayChangeOfAffectedFile(state, affectedFile, cancellationToken, host);
                    return affectedFile;
                }
                affectedFilesIndex++;
            }
            // Remove the changed file from the change set
            state.changedFilesSet.delete(state.currentChangedFilePath);
            state.currentChangedFilePath = undefined;
            // Commit the changes in file signature
            (_a = state.oldSignatures) === null || _a === void 0 ? void 0 : _a.clear();
            (_b = state.oldExportedModulesMap) === null || _b === void 0 ? void 0 : _b.clear();
            state.affectedFiles = undefined;
        }
        // Get next changed file
        var nextKey = state.changedFilesSet.keys().next();
        if (nextKey.done) {
            // Done
            return undefined;
        }
        // With --out or --outFile all outputs go into single file
        // so operations are performed directly on program, return program
        var program = ts_1.Debug.checkDefined(state.program);
        var compilerOptions = program.getCompilerOptions();
        if ((0, ts_1.outFile)(compilerOptions)) {
            ts_1.Debug.assert(!state.semanticDiagnosticsPerFile);
            return program;
        }
        // Get next batch of affected files
        state.affectedFiles = ts_1.BuilderState.getFilesAffectedByWithOldState(state, program, nextKey.value, cancellationToken, host);
        state.currentChangedFilePath = nextKey.value;
        state.affectedFilesIndex = 0;
        if (!state.seenAffectedFiles)
            state.seenAffectedFiles = new Set();
    }
}
function clearAffectedFilesPendingEmit(state, emitOnlyDtsFiles) {
    var _a;
    if (!((_a = state.affectedFilesPendingEmit) === null || _a === void 0 ? void 0 : _a.size))
        return;
    if (!emitOnlyDtsFiles)
        return state.affectedFilesPendingEmit = undefined;
    state.affectedFilesPendingEmit.forEach(function (emitKind, path) {
        // Mark the files as pending only if they are pending on js files, remove the dts emit pending flag
        var pending = emitKind & 7 /* BuilderFileEmit.AllJs */;
        if (!pending)
            state.affectedFilesPendingEmit.delete(path);
        else
            state.affectedFilesPendingEmit.set(path, pending);
    });
}
/**
 * Returns next file to be emitted from files that retrieved semantic diagnostics but did not emit yet
 */
function getNextAffectedFilePendingEmit(state, emitOnlyDtsFiles) {
    var _a;
    if (!((_a = state.affectedFilesPendingEmit) === null || _a === void 0 ? void 0 : _a.size))
        return undefined;
    return (0, ts_1.forEachEntry)(state.affectedFilesPendingEmit, function (emitKind, path) {
        var _a;
        var affectedFile = state.program.getSourceFileByPath(path);
        if (!affectedFile || !(0, ts_1.sourceFileMayBeEmitted)(affectedFile, state.program)) {
            state.affectedFilesPendingEmit.delete(path);
            return undefined;
        }
        var seenKind = (_a = state.seenEmittedFiles) === null || _a === void 0 ? void 0 : _a.get(affectedFile.resolvedPath);
        var pendingKind = getPendingEmitKind(emitKind, seenKind);
        if (emitOnlyDtsFiles)
            pendingKind = pendingKind & 24 /* BuilderFileEmit.AllDts */;
        if (pendingKind)
            return { affectedFile: affectedFile, emitKind: pendingKind };
    });
}
function removeDiagnosticsOfLibraryFiles(state) {
    if (!state.cleanedDiagnosticsOfLibFiles) {
        state.cleanedDiagnosticsOfLibFiles = true;
        var program_1 = ts_1.Debug.checkDefined(state.program);
        var options_1 = program_1.getCompilerOptions();
        (0, ts_1.forEach)(program_1.getSourceFiles(), function (f) {
            return program_1.isSourceFileDefaultLibrary(f) &&
                !(0, ts_1.skipTypeChecking)(f, options_1, program_1) &&
                removeSemanticDiagnosticsOf(state, f.resolvedPath);
        });
    }
}
/**
 *  Handles semantic diagnostics and dts emit for affectedFile and files, that are referencing modules that export entities from affected file
 *  This is because even though js emit doesnt change, dts emit / type used can change resulting in need for dts emit and js change
 */
function handleDtsMayChangeOfAffectedFile(state, affectedFile, cancellationToken, host) {
    removeSemanticDiagnosticsOf(state, affectedFile.resolvedPath);
    // If affected files is everything except default library, then nothing more to do
    if (state.allFilesExcludingDefaultLibraryFile === state.affectedFiles) {
        removeDiagnosticsOfLibraryFiles(state);
        // When a change affects the global scope, all files are considered to be affected without updating their signature
        // That means when affected file is handled, its signature can be out of date
        // To avoid this, ensure that we update the signature for any affected file in this scenario.
        ts_1.BuilderState.updateShapeSignature(state, ts_1.Debug.checkDefined(state.program), affectedFile, cancellationToken, host);
        return;
    }
    if (state.compilerOptions.assumeChangesOnlyAffectDirectDependencies)
        return;
    handleDtsMayChangeOfReferencingExportOfAffectedFile(state, affectedFile, cancellationToken, host);
}
/**
 * Handle the dts may change, so they need to be added to pending emit if dts emit is enabled,
 * Also we need to make sure signature is updated for these files
 */
function handleDtsMayChangeOf(state, path, cancellationToken, host) {
    removeSemanticDiagnosticsOf(state, path);
    if (!state.changedFilesSet.has(path)) {
        var program = ts_1.Debug.checkDefined(state.program);
        var sourceFile = program.getSourceFileByPath(path);
        if (sourceFile) {
            // Even though the js emit doesnt change and we are already handling dts emit and semantic diagnostics
            // we need to update the signature to reflect correctness of the signature(which is output d.ts emit) of this file
            // This ensures that we dont later during incremental builds considering wrong signature.
            // Eg where this also is needed to ensure that .tsbuildinfo generated by incremental build should be same as if it was first fresh build
            // But we avoid expensive full shape computation, as using file version as shape is enough for correctness.
            ts_1.BuilderState.updateShapeSignature(state, program, sourceFile, cancellationToken, host, 
            /*useFileVersionAsSignature*/ true);
            // If not dts emit, nothing more to do
            if ((0, ts_1.getEmitDeclarations)(state.compilerOptions)) {
                addToAffectedFilesPendingEmit(state, path, state.compilerOptions.declarationMap ? 24 /* BuilderFileEmit.AllDts */ : 8 /* BuilderFileEmit.Dts */);
            }
        }
    }
}
/**
 * Removes semantic diagnostics for path and
 * returns true if there are no more semantic diagnostics from the old state
 */
function removeSemanticDiagnosticsOf(state, path) {
    if (!state.semanticDiagnosticsFromOldState) {
        return true;
    }
    state.semanticDiagnosticsFromOldState.delete(path);
    state.semanticDiagnosticsPerFile.delete(path);
    return !state.semanticDiagnosticsFromOldState.size;
}
function isChangedSignature(state, path) {
    var oldSignature = ts_1.Debug.checkDefined(state.oldSignatures).get(path) || undefined;
    var newSignature = ts_1.Debug.checkDefined(state.fileInfos.get(path)).signature;
    return newSignature !== oldSignature;
}
function handleDtsMayChangeOfGlobalScope(state, filePath, cancellationToken, host) {
    var _a;
    if (!((_a = state.fileInfos.get(filePath)) === null || _a === void 0 ? void 0 : _a.affectsGlobalScope))
        return false;
    // Every file needs to be handled
    ts_1.BuilderState.getAllFilesExcludingDefaultLibraryFile(state, state.program, /*firstSourceFile*/ undefined)
        .forEach(function (file) { return handleDtsMayChangeOf(state, file.resolvedPath, cancellationToken, host); });
    removeDiagnosticsOfLibraryFiles(state);
    return true;
}
/**
 * Iterate on referencing modules that export entities from affected file and delete diagnostics and add pending emit
 */
function handleDtsMayChangeOfReferencingExportOfAffectedFile(state, affectedFile, cancellationToken, host) {
    var _a;
    // If there was change in signature (dts output) for the changed file,
    // then only we need to handle pending file emit
    if (!state.exportedModulesMap || !state.changedFilesSet.has(affectedFile.resolvedPath))
        return;
    if (!isChangedSignature(state, affectedFile.resolvedPath))
        return;
    // Since isolated modules dont change js files, files affected by change in signature is itself
    // But we need to cleanup semantic diagnostics and queue dts emit for affected files
    if ((0, ts_1.getIsolatedModules)(state.compilerOptions)) {
        var seenFileNamesMap = new Map();
        seenFileNamesMap.set(affectedFile.resolvedPath, true);
        var queue = ts_1.BuilderState.getReferencedByPaths(state, affectedFile.resolvedPath);
        while (queue.length > 0) {
            var currentPath = queue.pop();
            if (!seenFileNamesMap.has(currentPath)) {
                seenFileNamesMap.set(currentPath, true);
                if (handleDtsMayChangeOfGlobalScope(state, currentPath, cancellationToken, host))
                    return;
                handleDtsMayChangeOf(state, currentPath, cancellationToken, host);
                if (isChangedSignature(state, currentPath)) {
                    var currentSourceFile = ts_1.Debug.checkDefined(state.program).getSourceFileByPath(currentPath);
                    queue.push.apply(queue, ts_1.BuilderState.getReferencedByPaths(state, currentSourceFile.resolvedPath));
                }
            }
        }
    }
    var seenFileAndExportsOfFile = new Set();
    // Go through exported modules from cache first
    // If exported modules has path, all files referencing file exported from are affected
    (_a = state.exportedModulesMap.getKeys(affectedFile.resolvedPath)) === null || _a === void 0 ? void 0 : _a.forEach(function (exportedFromPath) {
        if (handleDtsMayChangeOfGlobalScope(state, exportedFromPath, cancellationToken, host))
            return true;
        var references = state.referencedMap.getKeys(exportedFromPath);
        return references && (0, ts_1.forEachKey)(references, function (filePath) {
            return handleDtsMayChangeOfFileAndExportsOfFile(state, filePath, seenFileAndExportsOfFile, cancellationToken, host);
        });
    });
}
/**
 * handle dts and semantic diagnostics on file and iterate on anything that exports this file
 * return true when all work is done and we can exit handling dts emit and semantic diagnostics
 */
function handleDtsMayChangeOfFileAndExportsOfFile(state, filePath, seenFileAndExportsOfFile, cancellationToken, host) {
    var _a, _b;
    if (!(0, ts_1.tryAddToSet)(seenFileAndExportsOfFile, filePath))
        return undefined;
    if (handleDtsMayChangeOfGlobalScope(state, filePath, cancellationToken, host))
        return true;
    handleDtsMayChangeOf(state, filePath, cancellationToken, host);
    // If exported modules has path, all files referencing file exported from are affected
    (_a = state.exportedModulesMap.getKeys(filePath)) === null || _a === void 0 ? void 0 : _a.forEach(function (exportedFromPath) {
        return handleDtsMayChangeOfFileAndExportsOfFile(state, exportedFromPath, seenFileAndExportsOfFile, cancellationToken, host);
    });
    // Remove diagnostics of files that import this file (without going to exports of referencing files)
    (_b = state.referencedMap.getKeys(filePath)) === null || _b === void 0 ? void 0 : _b.forEach(function (referencingFilePath) {
        return !seenFileAndExportsOfFile.has(referencingFilePath) && // Not already removed diagnostic file
            handleDtsMayChangeOf(// Dont add to seen since this is not yet done with the export removal
            state, referencingFilePath, cancellationToken, host);
    });
    return undefined;
}
/**
 * Gets semantic diagnostics for the file which are
 * bindAndCheckDiagnostics (from cache) and program diagnostics
 */
function getSemanticDiagnosticsOfFile(state, sourceFile, cancellationToken) {
    return (0, ts_1.concatenate)(getBinderAndCheckerDiagnosticsOfFile(state, sourceFile, cancellationToken), ts_1.Debug.checkDefined(state.program).getProgramDiagnostics(sourceFile));
}
/**
 * Gets the binder and checker diagnostics either from cache if present, or otherwise from program and caches it
 * Note that it is assumed that when asked about binder and checker diagnostics, the file has been taken out of affected files/changed file set
 */
function getBinderAndCheckerDiagnosticsOfFile(state, sourceFile, cancellationToken) {
    var path = sourceFile.resolvedPath;
    if (state.semanticDiagnosticsPerFile) {
        var cachedDiagnostics = state.semanticDiagnosticsPerFile.get(path);
        // Report the bind and check diagnostics from the cache if we already have those diagnostics present
        if (cachedDiagnostics) {
            return (0, ts_1.filterSemanticDiagnostics)(cachedDiagnostics, state.compilerOptions);
        }
    }
    // Diagnostics werent cached, get them from program, and cache the result
    var diagnostics = ts_1.Debug.checkDefined(state.program).getBindAndCheckDiagnostics(sourceFile, cancellationToken);
    if (state.semanticDiagnosticsPerFile) {
        state.semanticDiagnosticsPerFile.set(path, diagnostics);
    }
    return (0, ts_1.filterSemanticDiagnostics)(diagnostics, state.compilerOptions);
}
/** @internal */
function isProgramBundleEmitBuildInfo(info) {
    return !!(0, ts_1.outFile)(info.options || {});
}
exports.isProgramBundleEmitBuildInfo = isProgramBundleEmitBuildInfo;
/**
 * Gets the program information to be emitted in buildInfo so that we can use it to create new program
 */
function getBuildInfo(state, bundle) {
    var _a, _b, _c;
    var currentDirectory = ts_1.Debug.checkDefined(state.program).getCurrentDirectory();
    var buildInfoDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getTsBuildInfoEmitOutputFilePath)(state.compilerOptions), currentDirectory));
    // Convert the file name to Path here if we set the fileName instead to optimize multiple d.ts file emits and having to compute Canonical path
    var latestChangedDtsFile = state.latestChangedDtsFile ? relativeToBuildInfoEnsuringAbsolutePath(state.latestChangedDtsFile) : undefined;
    var fileNames = [];
    var fileNameToFileId = new Map();
    var root = [];
    if ((0, ts_1.outFile)(state.compilerOptions)) {
        // Copy all fileInfo, version and impliedFormat
        // Affects global scope and signature doesnt matter because with --out they arent calculated or needed to determine upto date ness
        var fileInfos_1 = (0, ts_1.arrayFrom)(state.fileInfos.entries(), function (_a) {
            var key = _a[0], value = _a[1];
            // Ensure fileId
            var fileId = toFileId(key);
            tryAddRoot(key, fileId);
            return value.impliedFormat ?
                { version: value.version, impliedFormat: value.impliedFormat, signature: undefined, affectsGlobalScope: undefined } :
                value.version;
        });
        var program_2 = {
            fileNames: fileNames,
            fileInfos: fileInfos_1,
            root: root,
            options: convertToProgramBuildInfoCompilerOptions(state.compilerOptions),
            outSignature: state.outSignature,
            latestChangedDtsFile: latestChangedDtsFile,
            pendingEmit: !state.programEmitPending ?
                undefined : // Pending is undefined or None is encoded as undefined
                state.programEmitPending === getBuilderFileEmit(state.compilerOptions) ?
                    false : // Pending emit is same as deteremined by compilerOptions
                    state.programEmitPending, // Actual value
        };
        // Complete the bundle information if we are doing partial emit (only js or only dts)
        var _d = bundle, js = _d.js, dts = _d.dts, commonSourceDirectory = _d.commonSourceDirectory, sourceFiles = _d.sourceFiles;
        state.bundle = bundle = {
            commonSourceDirectory: commonSourceDirectory,
            sourceFiles: sourceFiles,
            js: js || (!state.compilerOptions.emitDeclarationOnly ? (_a = state.bundle) === null || _a === void 0 ? void 0 : _a.js : undefined),
            dts: dts || ((0, ts_1.getEmitDeclarations)(state.compilerOptions) ? (_b = state.bundle) === null || _b === void 0 ? void 0 : _b.dts : undefined),
        };
        return (0, ts_1.createBuildInfo)(program_2, bundle);
    }
    var fileIdsList;
    var fileNamesToFileIdListId;
    var emitSignatures;
    var fileInfos = (0, ts_1.arrayFrom)(state.fileInfos.entries(), function (_a) {
        var _b, _c;
        var key = _a[0], value = _a[1];
        // Ensure fileId
        var fileId = toFileId(key);
        tryAddRoot(key, fileId);
        ts_1.Debug.assert(fileNames[fileId - 1] === relativeToBuildInfo(key));
        var oldSignature = (_b = state.oldSignatures) === null || _b === void 0 ? void 0 : _b.get(key);
        var actualSignature = oldSignature !== undefined ? oldSignature || undefined : value.signature;
        if (state.compilerOptions.composite) {
            var file = state.program.getSourceFileByPath(key);
            if (!(0, ts_1.isJsonSourceFile)(file) && (0, ts_1.sourceFileMayBeEmitted)(file, state.program)) {
                var emitSignature = (_c = state.emitSignatures) === null || _c === void 0 ? void 0 : _c.get(key);
                if (emitSignature !== actualSignature) {
                    (emitSignatures || (emitSignatures = [])).push(emitSignature === undefined ?
                        fileId : // There is no emit, encode as false
                        // fileId, signature: emptyArray if signature only differs in dtsMap option than our own compilerOptions otherwise EmitSignature
                        [fileId, !(0, ts_1.isString)(emitSignature) && emitSignature[0] === actualSignature ? ts_1.emptyArray : emitSignature]);
                }
            }
        }
        return value.version === actualSignature ?
            value.affectsGlobalScope || value.impliedFormat ?
                // If file version is same as signature, dont serialize signature
                { version: value.version, signature: undefined, affectsGlobalScope: value.affectsGlobalScope, impliedFormat: value.impliedFormat } :
                // If file info only contains version and signature and both are same we can just write string
                value.version :
            actualSignature !== undefined ? // If signature is not same as version, encode signature in the fileInfo
                oldSignature === undefined ?
                    // If we havent computed signature, use fileInfo as is
                    value :
                    // Serialize fileInfo with new updated signature
                    { version: value.version, signature: actualSignature, affectsGlobalScope: value.affectsGlobalScope, impliedFormat: value.impliedFormat } :
                // Signature of the FileInfo is undefined, serialize it as false
                { version: value.version, signature: false, affectsGlobalScope: value.affectsGlobalScope, impliedFormat: value.impliedFormat };
    });
    var referencedMap;
    if (state.referencedMap) {
        referencedMap = (0, ts_1.arrayFrom)(state.referencedMap.keys()).sort(ts_1.compareStringsCaseSensitive).map(function (key) { return [
            toFileId(key),
            toFileIdListId(state.referencedMap.getValues(key))
        ]; });
    }
    var exportedModulesMap;
    if (state.exportedModulesMap) {
        exportedModulesMap = (0, ts_1.mapDefined)((0, ts_1.arrayFrom)(state.exportedModulesMap.keys()).sort(ts_1.compareStringsCaseSensitive), function (key) {
            var _a;
            var oldValue = (_a = state.oldExportedModulesMap) === null || _a === void 0 ? void 0 : _a.get(key);
            // Not in temporary cache, use existing value
            if (oldValue === undefined)
                return [toFileId(key), toFileIdListId(state.exportedModulesMap.getValues(key))];
            if (oldValue)
                return [toFileId(key), toFileIdListId(oldValue)];
            return undefined;
        });
    }
    var semanticDiagnosticsPerFile;
    if (state.semanticDiagnosticsPerFile) {
        for (var _i = 0, _e = (0, ts_1.arrayFrom)(state.semanticDiagnosticsPerFile.keys()).sort(ts_1.compareStringsCaseSensitive); _i < _e.length; _i++) {
            var key = _e[_i];
            var value = state.semanticDiagnosticsPerFile.get(key);
            (semanticDiagnosticsPerFile || (semanticDiagnosticsPerFile = [])).push(value.length ?
                [
                    toFileId(key),
                    convertToReusableDiagnostics(value, relativeToBuildInfo)
                ] :
                toFileId(key));
        }
    }
    var affectedFilesPendingEmit;
    if ((_c = state.affectedFilesPendingEmit) === null || _c === void 0 ? void 0 : _c.size) {
        var fullEmitForOptions = getBuilderFileEmit(state.compilerOptions);
        var seenFiles = new Set();
        for (var _f = 0, _g = (0, ts_1.arrayFrom)(state.affectedFilesPendingEmit.keys()).sort(ts_1.compareStringsCaseSensitive); _f < _g.length; _f++) {
            var path = _g[_f];
            if ((0, ts_1.tryAddToSet)(seenFiles, path)) {
                var file = state.program.getSourceFileByPath(path);
                if (!file || !(0, ts_1.sourceFileMayBeEmitted)(file, state.program))
                    continue;
                var fileId = toFileId(path), pendingEmit = state.affectedFilesPendingEmit.get(path);
                (affectedFilesPendingEmit || (affectedFilesPendingEmit = [])).push(pendingEmit === fullEmitForOptions ?
                    fileId : // Pending full emit per options
                    pendingEmit === 8 /* BuilderFileEmit.Dts */ ?
                        [fileId] : // Pending on Dts only
                        [fileId, pendingEmit] // Anything else
                );
            }
        }
    }
    var changeFileSet;
    if (state.changedFilesSet.size) {
        for (var _h = 0, _j = (0, ts_1.arrayFrom)(state.changedFilesSet.keys()).sort(ts_1.compareStringsCaseSensitive); _h < _j.length; _h++) {
            var path = _j[_h];
            (changeFileSet || (changeFileSet = [])).push(toFileId(path));
        }
    }
    var program = {
        fileNames: fileNames,
        fileInfos: fileInfos,
        root: root,
        options: convertToProgramBuildInfoCompilerOptions(state.compilerOptions),
        fileIdsList: fileIdsList,
        referencedMap: referencedMap,
        exportedModulesMap: exportedModulesMap,
        semanticDiagnosticsPerFile: semanticDiagnosticsPerFile,
        affectedFilesPendingEmit: affectedFilesPendingEmit,
        changeFileSet: changeFileSet,
        emitSignatures: emitSignatures,
        latestChangedDtsFile: latestChangedDtsFile,
    };
    return (0, ts_1.createBuildInfo)(program, bundle);
    function relativeToBuildInfoEnsuringAbsolutePath(path) {
        return relativeToBuildInfo((0, ts_1.getNormalizedAbsolutePath)(path, currentDirectory));
    }
    function relativeToBuildInfo(path) {
        return (0, ts_1.ensurePathIsNonModuleName)((0, ts_1.getRelativePathFromDirectory)(buildInfoDirectory, path, state.program.getCanonicalFileName));
    }
    function toFileId(path) {
        var fileId = fileNameToFileId.get(path);
        if (fileId === undefined) {
            fileNames.push(relativeToBuildInfo(path));
            fileNameToFileId.set(path, fileId = fileNames.length);
        }
        return fileId;
    }
    function toFileIdListId(set) {
        var fileIds = (0, ts_1.arrayFrom)(set.keys(), toFileId).sort(ts_1.compareValues);
        var key = fileIds.join();
        var fileIdListId = fileNamesToFileIdListId === null || fileNamesToFileIdListId === void 0 ? void 0 : fileNamesToFileIdListId.get(key);
        if (fileIdListId === undefined) {
            (fileIdsList || (fileIdsList = [])).push(fileIds);
            (fileNamesToFileIdListId || (fileNamesToFileIdListId = new Map())).set(key, fileIdListId = fileIdsList.length);
        }
        return fileIdListId;
    }
    function tryAddRoot(path, fileId) {
        var file = state.program.getSourceFile(path);
        if (!state.program.getFileIncludeReasons().get(file.path).some(function (r) { return r.kind === ts_1.FileIncludeKind.RootFile; }))
            return;
        // First fileId as is
        if (!root.length)
            return root.push(fileId);
        var last = root[root.length - 1];
        var isLastStartEnd = (0, ts_1.isArray)(last);
        // If its [..., last = [start, end = fileId - 1]], update last to [start, fileId]
        if (isLastStartEnd && last[1] === fileId - 1)
            return last[1] = fileId;
        // If its [..., last = [start, end !== fileId - 1]] or [last] or [..., last !== fileId - 1], push the fileId
        if (isLastStartEnd || root.length === 1 || last !== fileId - 1)
            return root.push(fileId);
        var lastButOne = root[root.length - 2];
        // If [..., lastButOne = [start, end], lastFileId] or [..., lastButOne !== lastFileId - 1, lastFileId], push the fileId
        if (!(0, ts_1.isNumber)(lastButOne) || lastButOne !== last - 1)
            return root.push(fileId);
        // Convert lastButOne as [lastButOne, fileId]
        root[root.length - 2] = [lastButOne, fileId];
        return root.length = root.length - 1;
    }
    /**
     * @param optionKey key of CommandLineOption to use to determine if the option should be serialized in tsbuildinfo
     */
    function convertToProgramBuildInfoCompilerOptions(options) {
        var result;
        var optionsNameMap = (0, ts_1.getOptionsNameMap)().optionsNameMap;
        for (var _i = 0, _a = (0, ts_1.getOwnKeys)(options).sort(ts_1.compareStringsCaseSensitive); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var optionInfo = optionsNameMap.get(name_1.toLowerCase());
            if (optionInfo === null || optionInfo === void 0 ? void 0 : optionInfo.affectsBuildInfo) {
                (result || (result = {}))[name_1] = convertToReusableCompilerOptionValue(optionInfo, options[name_1], relativeToBuildInfoEnsuringAbsolutePath);
            }
        }
        return result;
    }
}
function convertToReusableCompilerOptionValue(option, value, relativeToBuildInfo) {
    if (option) {
        ts_1.Debug.assert(option.type !== "listOrElement");
        if (option.type === "list") {
            var values = value;
            if (option.element.isFilePath && values.length) {
                return values.map(relativeToBuildInfo);
            }
        }
        else if (option.isFilePath) {
            return relativeToBuildInfo(value);
        }
    }
    return value;
}
function convertToReusableDiagnostics(diagnostics, relativeToBuildInfo) {
    ts_1.Debug.assert(!!diagnostics.length);
    return diagnostics.map(function (diagnostic) {
        var result = convertToReusableDiagnosticRelatedInformation(diagnostic, relativeToBuildInfo);
        result.reportsUnnecessary = diagnostic.reportsUnnecessary;
        result.reportDeprecated = diagnostic.reportsDeprecated;
        result.source = diagnostic.source;
        result.skippedOn = diagnostic.skippedOn;
        var relatedInformation = diagnostic.relatedInformation;
        result.relatedInformation = relatedInformation ?
            relatedInformation.length ?
                relatedInformation.map(function (r) { return convertToReusableDiagnosticRelatedInformation(r, relativeToBuildInfo); }) :
                [] :
            undefined;
        return result;
    });
}
function convertToReusableDiagnosticRelatedInformation(diagnostic, relativeToBuildInfo) {
    var file = diagnostic.file;
    return __assign(__assign({}, diagnostic), { file: file ? relativeToBuildInfo(file.resolvedPath) : undefined, messageText: (0, ts_1.isString)(diagnostic.messageText) ? diagnostic.messageText : convertToReusableDiagnosticMessageChain(diagnostic.messageText) });
}
function convertToReusableDiagnosticMessageChain(chain) {
    if (chain.repopulateInfo) {
        return {
            info: chain.repopulateInfo(),
            next: convertToReusableDiagnosticMessageChainArray(chain.next),
        };
    }
    var next = convertToReusableDiagnosticMessageChainArray(chain.next);
    return next === chain.next ? chain : __assign(__assign({}, chain), { next: next });
}
function convertToReusableDiagnosticMessageChainArray(array) {
    if (!array)
        return array;
    return (0, ts_1.forEach)(array, function (chain, index) {
        var reusable = convertToReusableDiagnosticMessageChain(chain);
        if (chain === reusable)
            return undefined;
        var result = index > 0 ? array.slice(0, index - 1) : [];
        result.push(reusable);
        for (var i = index + 1; i < array.length; i++) {
            result.push(convertToReusableDiagnosticMessageChain(array[i]));
        }
        return result;
    }) || array;
}
/** @internal */
var BuilderProgramKind;
(function (BuilderProgramKind) {
    BuilderProgramKind[BuilderProgramKind["SemanticDiagnosticsBuilderProgram"] = 0] = "SemanticDiagnosticsBuilderProgram";
    BuilderProgramKind[BuilderProgramKind["EmitAndSemanticDiagnosticsBuilderProgram"] = 1] = "EmitAndSemanticDiagnosticsBuilderProgram";
})(BuilderProgramKind || (exports.BuilderProgramKind = BuilderProgramKind = {}));
/** @internal */
function getBuilderCreationParameters(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences) {
    var host;
    var newProgram;
    var oldProgram;
    if (newProgramOrRootNames === undefined) {
        ts_1.Debug.assert(hostOrOptions === undefined);
        host = oldProgramOrHost;
        oldProgram = configFileParsingDiagnosticsOrOldProgram;
        ts_1.Debug.assert(!!oldProgram);
        newProgram = oldProgram.getProgram();
    }
    else if ((0, ts_1.isArray)(newProgramOrRootNames)) {
        oldProgram = configFileParsingDiagnosticsOrOldProgram;
        newProgram = (0, ts_1.createProgram)({
            rootNames: newProgramOrRootNames,
            options: hostOrOptions,
            host: oldProgramOrHost,
            oldProgram: oldProgram && oldProgram.getProgramOrUndefined(),
            configFileParsingDiagnostics: configFileParsingDiagnostics,
            projectReferences: projectReferences
        });
        host = oldProgramOrHost;
    }
    else {
        newProgram = newProgramOrRootNames;
        host = hostOrOptions;
        oldProgram = oldProgramOrHost;
        configFileParsingDiagnostics = configFileParsingDiagnosticsOrOldProgram;
    }
    return { host: host, newProgram: newProgram, oldProgram: oldProgram, configFileParsingDiagnostics: configFileParsingDiagnostics || ts_1.emptyArray };
}
exports.getBuilderCreationParameters = getBuilderCreationParameters;
function getTextHandlingSourceMapForSignature(text, data) {
    return (data === null || data === void 0 ? void 0 : data.sourceMapUrlPos) !== undefined ? text.substring(0, data.sourceMapUrlPos) : text;
}
/** @internal */
function computeSignatureWithDiagnostics(program, sourceFile, text, host, data) {
    var _a, _b;
    text = getTextHandlingSourceMapForSignature(text, data);
    var sourceFileDirectory;
    if ((_a = data === null || data === void 0 ? void 0 : data.diagnostics) === null || _a === void 0 ? void 0 : _a.length) {
        text += data.diagnostics.map(function (diagnostic) {
            return "".concat(locationInfo(diagnostic)).concat(ts_1.DiagnosticCategory[diagnostic.category]).concat(diagnostic.code, ": ").concat(flattenDiagnosticMessageText(diagnostic.messageText));
        }).join("\n");
    }
    return ((_b = host.createHash) !== null && _b !== void 0 ? _b : ts_1.generateDjb2Hash)(text);
    function flattenDiagnosticMessageText(diagnostic) {
        return (0, ts_1.isString)(diagnostic) ?
            diagnostic :
            diagnostic === undefined ?
                "" :
                !diagnostic.next ?
                    diagnostic.messageText :
                    diagnostic.messageText + diagnostic.next.map(flattenDiagnosticMessageText).join("\n");
    }
    function locationInfo(diagnostic) {
        if (diagnostic.file.resolvedPath === sourceFile.resolvedPath)
            return "(".concat(diagnostic.start, ",").concat(diagnostic.length, ")");
        if (sourceFileDirectory === undefined)
            sourceFileDirectory = (0, ts_1.getDirectoryPath)(sourceFile.resolvedPath);
        return "".concat((0, ts_1.ensurePathIsNonModuleName)((0, ts_1.getRelativePathFromDirectory)(sourceFileDirectory, diagnostic.file.resolvedPath, program.getCanonicalFileName)), "(").concat(diagnostic.start, ",").concat(diagnostic.length, ")");
    }
}
exports.computeSignatureWithDiagnostics = computeSignatureWithDiagnostics;
/** @internal */
function computeSignature(text, host, data) {
    var _a;
    return ((_a = host.createHash) !== null && _a !== void 0 ? _a : ts_1.generateDjb2Hash)(getTextHandlingSourceMapForSignature(text, data));
}
exports.computeSignature = computeSignature;
/** @internal */
function createBuilderProgram(kind, _a) {
    var newProgram = _a.newProgram, host = _a.host, oldProgram = _a.oldProgram, configFileParsingDiagnostics = _a.configFileParsingDiagnostics;
    // Return same program if underlying program doesnt change
    var oldState = oldProgram && oldProgram.getState();
    if (oldState && newProgram === oldState.program && configFileParsingDiagnostics === newProgram.getConfigFileParsingDiagnostics()) {
        newProgram = undefined; // TODO: GH#18217
        oldState = undefined;
        return oldProgram;
    }
    var state = createBuilderProgramState(newProgram, oldState);
    newProgram.getBuildInfo = function (bundle) { return getBuildInfo(state, bundle); };
    // To ensure that we arent storing any references to old program or new program without state
    newProgram = undefined; // TODO: GH#18217
    oldProgram = undefined;
    oldState = undefined;
    var getState = function () { return state; };
    var builderProgram = createRedirectedBuilderProgram(getState, configFileParsingDiagnostics);
    builderProgram.getState = getState;
    builderProgram.saveEmitState = function () { return backupBuilderProgramEmitState(state); };
    builderProgram.restoreEmitState = function (saved) { return restoreBuilderProgramEmitState(state, saved); };
    builderProgram.hasChangedEmitSignature = function () { return !!state.hasChangedEmitSignature; };
    builderProgram.getAllDependencies = function (sourceFile) { return ts_1.BuilderState.getAllDependencies(state, ts_1.Debug.checkDefined(state.program), sourceFile); };
    builderProgram.getSemanticDiagnostics = getSemanticDiagnostics;
    builderProgram.emit = emit;
    builderProgram.releaseProgram = function () { return releaseCache(state); };
    if (kind === BuilderProgramKind.SemanticDiagnosticsBuilderProgram) {
        builderProgram.getSemanticDiagnosticsOfNextAffectedFile = getSemanticDiagnosticsOfNextAffectedFile;
    }
    else if (kind === BuilderProgramKind.EmitAndSemanticDiagnosticsBuilderProgram) {
        builderProgram.getSemanticDiagnosticsOfNextAffectedFile = getSemanticDiagnosticsOfNextAffectedFile;
        builderProgram.emitNextAffectedFile = emitNextAffectedFile;
        builderProgram.emitBuildInfo = emitBuildInfo;
    }
    else {
        (0, ts_1.notImplemented)();
    }
    return builderProgram;
    function emitBuildInfo(writeFile, cancellationToken) {
        if (state.buildInfoEmitPending) {
            var result = ts_1.Debug.checkDefined(state.program).emitBuildInfo(writeFile || (0, ts_1.maybeBind)(host, host.writeFile), cancellationToken);
            state.buildInfoEmitPending = false;
            return result;
        }
        return ts_1.emitSkippedWithNoDiagnostics;
    }
    /**
     * Emits the next affected file's emit result (EmitResult and sourceFiles emitted) or returns undefined if iteration is complete
     * The first of writeFile if provided, writeFile of BuilderProgramHost if provided, writeFile of compiler host
     * in that order would be used to write the files
     */
    function emitNextAffectedFile(writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
        var _a, _b, _c, _d, _e;
        var affected = getNextAffectedFile(state, cancellationToken, host);
        var programEmitKind = getBuilderFileEmit(state.compilerOptions);
        var emitKind = emitOnlyDtsFiles ?
            programEmitKind & 24 /* BuilderFileEmit.AllDts */ : programEmitKind;
        if (!affected) {
            if (!(0, ts_1.outFile)(state.compilerOptions)) {
                var pendingAffectedFile = getNextAffectedFilePendingEmit(state, emitOnlyDtsFiles);
                if (!pendingAffectedFile) {
                    // Emit buildinfo if pending
                    if (!state.buildInfoEmitPending)
                        return undefined;
                    var affected_1 = state.program;
                    var result_1 = affected_1.emitBuildInfo(writeFile || (0, ts_1.maybeBind)(host, host.writeFile), cancellationToken);
                    state.buildInfoEmitPending = false;
                    return { result: result_1, affected: affected_1 };
                }
                // Emit pending affected file
                (affected = pendingAffectedFile.affectedFile, emitKind = pendingAffectedFile.emitKind);
            }
            else {
                // Emit program if it was pending emit
                if (!state.programEmitPending)
                    return undefined;
                emitKind = state.programEmitPending;
                if (emitOnlyDtsFiles)
                    emitKind = emitKind & 24 /* BuilderFileEmit.AllDts */;
                if (!emitKind)
                    return undefined;
                affected = state.program;
            }
        }
        // Determine if we can do partial emit
        var emitOnly;
        if (emitKind & 7 /* BuilderFileEmit.AllJs */)
            emitOnly = 0 /* EmitOnly.Js */;
        if (emitKind & 24 /* BuilderFileEmit.AllDts */)
            emitOnly = emitOnly === undefined ? 1 /* EmitOnly.Dts */ : undefined;
        if (affected === state.program) {
            // Set up programEmit before calling emit so that its set in buildInfo
            state.programEmitPending = state.changedFilesSet.size ?
                getPendingEmitKind(programEmitKind, emitKind) :
                state.programEmitPending ?
                    getPendingEmitKind(state.programEmitPending, emitKind) :
                    undefined;
        }
        // Actual emit
        var result = state.program.emit(affected === state.program ? undefined : affected, getWriteFileCallback(writeFile, customTransformers), cancellationToken, emitOnly, customTransformers);
        if (affected !== state.program) {
            // update affected files
            var affectedSourceFile = affected;
            state.seenAffectedFiles.add(affectedSourceFile.resolvedPath);
            if (state.affectedFilesIndex !== undefined)
                state.affectedFilesIndex++;
            // Change in changeSet/affectedFilesPendingEmit, buildInfo needs to be emitted
            state.buildInfoEmitPending = true;
            // Update the pendingEmit for the file
            var existing = ((_a = state.seenEmittedFiles) === null || _a === void 0 ? void 0 : _a.get(affectedSourceFile.resolvedPath)) || 0 /* BuilderFileEmit.None */;
            ((_b = state.seenEmittedFiles) !== null && _b !== void 0 ? _b : (state.seenEmittedFiles = new Map())).set(affectedSourceFile.resolvedPath, emitKind | existing);
            var existingPending = ((_c = state.affectedFilesPendingEmit) === null || _c === void 0 ? void 0 : _c.get(affectedSourceFile.resolvedPath)) || programEmitKind;
            var pendingKind = getPendingEmitKind(existingPending, emitKind | existing);
            if (pendingKind)
                ((_d = state.affectedFilesPendingEmit) !== null && _d !== void 0 ? _d : (state.affectedFilesPendingEmit = new Map())).set(affectedSourceFile.resolvedPath, pendingKind);
            else
                (_e = state.affectedFilesPendingEmit) === null || _e === void 0 ? void 0 : _e.delete(affectedSourceFile.resolvedPath);
        }
        else {
            // In program clear our changed files since any emit handles all changes
            state.changedFilesSet.clear();
        }
        return { result: result, affected: affected };
    }
    function getWriteFileCallback(writeFile, customTransformers) {
        if (!(0, ts_1.getEmitDeclarations)(state.compilerOptions))
            return writeFile || (0, ts_1.maybeBind)(host, host.writeFile);
        return function (fileName, text, writeByteOrderMark, onError, sourceFiles, data) {
            var _a, _b, _c, _d, _e, _f, _g;
            if ((0, ts_1.isDeclarationFileName)(fileName)) {
                if (!(0, ts_1.outFile)(state.compilerOptions)) {
                    ts_1.Debug.assert((sourceFiles === null || sourceFiles === void 0 ? void 0 : sourceFiles.length) === 1);
                    var emitSignature = void 0;
                    if (!customTransformers) {
                        var file = sourceFiles[0];
                        var info = state.fileInfos.get(file.resolvedPath);
                        if (info.signature === file.version) {
                            var signature = computeSignatureWithDiagnostics(state.program, file, text, host, data);
                            // With d.ts diagnostics they are also part of the signature so emitSignature will be different from it since its just hash of d.ts
                            if (!((_a = data === null || data === void 0 ? void 0 : data.diagnostics) === null || _a === void 0 ? void 0 : _a.length))
                                emitSignature = signature;
                            if (signature !== file.version) { // Update it
                                if (host.storeFilesChangingSignatureDuringEmit)
                                    ((_b = state.filesChangingSignature) !== null && _b !== void 0 ? _b : (state.filesChangingSignature = new Set())).add(file.resolvedPath);
                                if (state.exportedModulesMap)
                                    ts_1.BuilderState.updateExportedModules(state, file, file.exportedModulesFromDeclarationEmit);
                                if (state.affectedFiles) {
                                    // Keep old signature so we know what to undo if cancellation happens
                                    var existing = (_c = state.oldSignatures) === null || _c === void 0 ? void 0 : _c.get(file.resolvedPath);
                                    if (existing === undefined)
                                        ((_d = state.oldSignatures) !== null && _d !== void 0 ? _d : (state.oldSignatures = new Map())).set(file.resolvedPath, info.signature || false);
                                    info.signature = signature;
                                }
                                else {
                                    // These are directly commited
                                    info.signature = signature;
                                    (_e = state.oldExportedModulesMap) === null || _e === void 0 ? void 0 : _e.clear();
                                }
                            }
                        }
                    }
                    // Store d.ts emit hash so later can be compared to check if d.ts has changed.
                    // Currently we do this only for composite projects since these are the only projects that can be referenced by other projects
                    // and would need their d.ts change time in --build mode
                    if (state.compilerOptions.composite) {
                        var filePath = sourceFiles[0].resolvedPath;
                        emitSignature = handleNewSignature((_f = state.emitSignatures) === null || _f === void 0 ? void 0 : _f.get(filePath), emitSignature);
                        if (!emitSignature)
                            return;
                        ((_g = state.emitSignatures) !== null && _g !== void 0 ? _g : (state.emitSignatures = new Map())).set(filePath, emitSignature);
                    }
                }
                else if (state.compilerOptions.composite) {
                    var newSignature = handleNewSignature(state.outSignature, /*newSignature*/ undefined);
                    if (!newSignature)
                        return;
                    state.outSignature = newSignature;
                }
            }
            if (writeFile)
                writeFile(fileName, text, writeByteOrderMark, onError, sourceFiles, data);
            else if (host.writeFile)
                host.writeFile(fileName, text, writeByteOrderMark, onError, sourceFiles, data);
            else
                state.program.writeFile(fileName, text, writeByteOrderMark, onError, sourceFiles, data);
            /**
             * Compare to existing computed signature and store it or handle the changes in d.ts map option from before
             * returning undefined means that, we dont need to emit this d.ts file since its contents didnt change
             */
            function handleNewSignature(oldSignatureFormat, newSignature) {
                var oldSignature = !oldSignatureFormat || (0, ts_1.isString)(oldSignatureFormat) ? oldSignatureFormat : oldSignatureFormat[0];
                newSignature !== null && newSignature !== void 0 ? newSignature : (newSignature = computeSignature(text, host, data));
                // Dont write dts files if they didn't change
                if (newSignature === oldSignature) {
                    // If the signature was encoded as string the dts map options match so nothing to do
                    if (oldSignatureFormat === oldSignature)
                        return undefined;
                    // Mark as differsOnlyInMap so that --build can reverse the timestamp so that
                    // the downstream projects dont detect this as change in d.ts file
                    else if (data)
                        data.differsOnlyInMap = true;
                    else
                        data = { differsOnlyInMap: true };
                }
                else {
                    state.hasChangedEmitSignature = true;
                    state.latestChangedDtsFile = fileName;
                }
                return newSignature;
            }
        };
    }
    /**
     * Emits the JavaScript and declaration files.
     * When targetSource file is specified, emits the files corresponding to that source file,
     * otherwise for the whole program.
     * In case of EmitAndSemanticDiagnosticsBuilderProgram, when targetSourceFile is specified,
     * it is assumed that that file is handled from affected file list. If targetSourceFile is not specified,
     * it will only emit all the affected files instead of whole program
     *
     * The first of writeFile if provided, writeFile of BuilderProgramHost if provided, writeFile of compiler host
     * in that order would be used to write the files
     */
    function emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
        if (kind === BuilderProgramKind.EmitAndSemanticDiagnosticsBuilderProgram) {
            assertSourceFileOkWithoutNextAffectedCall(state, targetSourceFile);
        }
        var result = (0, ts_1.handleNoEmitOptions)(builderProgram, targetSourceFile, writeFile, cancellationToken);
        if (result)
            return result;
        // Emit only affected files if using builder for emit
        if (!targetSourceFile) {
            if (kind === BuilderProgramKind.EmitAndSemanticDiagnosticsBuilderProgram) {
                // Emit and report any errors we ran into.
                var sourceMaps = [];
                var emitSkipped = false;
                var diagnostics = void 0;
                var emittedFiles = [];
                var affectedEmitResult = void 0;
                while (affectedEmitResult = emitNextAffectedFile(writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers)) {
                    emitSkipped = emitSkipped || affectedEmitResult.result.emitSkipped;
                    diagnostics = (0, ts_1.addRange)(diagnostics, affectedEmitResult.result.diagnostics);
                    emittedFiles = (0, ts_1.addRange)(emittedFiles, affectedEmitResult.result.emittedFiles);
                    sourceMaps = (0, ts_1.addRange)(sourceMaps, affectedEmitResult.result.sourceMaps);
                }
                return {
                    emitSkipped: emitSkipped,
                    diagnostics: diagnostics || ts_1.emptyArray,
                    emittedFiles: emittedFiles,
                    sourceMaps: sourceMaps
                };
            }
            // In non Emit builder, clear affected files pending emit
            else {
                clearAffectedFilesPendingEmit(state, emitOnlyDtsFiles);
            }
        }
        return ts_1.Debug.checkDefined(state.program).emit(targetSourceFile, getWriteFileCallback(writeFile, customTransformers), cancellationToken, emitOnlyDtsFiles, customTransformers);
    }
    /**
     * Return the semantic diagnostics for the next affected file or undefined if iteration is complete
     * If provided ignoreSourceFile would be called before getting the diagnostics and would ignore the sourceFile if the returned value was true
     */
    function getSemanticDiagnosticsOfNextAffectedFile(cancellationToken, ignoreSourceFile) {
        while (true) {
            var affected = getNextAffectedFile(state, cancellationToken, host);
            var result = void 0;
            if (!affected)
                return undefined; // Done
            else if (affected !== state.program) {
                // Get diagnostics for the affected file if its not ignored
                var affectedSourceFile = affected;
                if (!ignoreSourceFile || !ignoreSourceFile(affectedSourceFile)) {
                    result = getSemanticDiagnosticsOfFile(state, affectedSourceFile, cancellationToken);
                }
                state.seenAffectedFiles.add(affectedSourceFile.resolvedPath);
                state.affectedFilesIndex++;
                // Change in changeSet, buildInfo needs to be emitted
                state.buildInfoEmitPending = true;
                if (!result)
                    continue;
            }
            else {
                // When whole program is affected, get all semantic diagnostics (eg when --out or --outFile is specified)
                result = state.program.getSemanticDiagnostics(/*sourceFile*/ undefined, cancellationToken);
                state.changedFilesSet.clear();
                state.programEmitPending = getBuilderFileEmit(state.compilerOptions);
            }
            return { result: result, affected: affected };
        }
    }
    /**
     * Gets the semantic diagnostics from the program corresponding to this state of file (if provided) or whole program
     * The semantic diagnostics are cached and managed here
     * Note that it is assumed that when asked about semantic diagnostics through this API,
     * the file has been taken out of affected files so it is safe to use cache or get from program and cache the diagnostics
     * In case of SemanticDiagnosticsBuilderProgram if the source file is not provided,
     * it will iterate through all the affected files, to ensure that cache stays valid and yet provide a way to get all semantic diagnostics
     */
    function getSemanticDiagnostics(sourceFile, cancellationToken) {
        assertSourceFileOkWithoutNextAffectedCall(state, sourceFile);
        var compilerOptions = ts_1.Debug.checkDefined(state.program).getCompilerOptions();
        if ((0, ts_1.outFile)(compilerOptions)) {
            ts_1.Debug.assert(!state.semanticDiagnosticsPerFile);
            // We dont need to cache the diagnostics just return them from program
            return ts_1.Debug.checkDefined(state.program).getSemanticDiagnostics(sourceFile, cancellationToken);
        }
        if (sourceFile) {
            return getSemanticDiagnosticsOfFile(state, sourceFile, cancellationToken);
        }
        // When semantic builder asks for diagnostics of the whole program,
        // ensure that all the affected files are handled
        // eslint-disable-next-line no-empty
        while (getSemanticDiagnosticsOfNextAffectedFile(cancellationToken)) {
        }
        var diagnostics;
        for (var _i = 0, _a = ts_1.Debug.checkDefined(state.program).getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile_1 = _a[_i];
            diagnostics = (0, ts_1.addRange)(diagnostics, getSemanticDiagnosticsOfFile(state, sourceFile_1, cancellationToken));
        }
        return diagnostics || ts_1.emptyArray;
    }
}
exports.createBuilderProgram = createBuilderProgram;
function addToAffectedFilesPendingEmit(state, affectedFilePendingEmit, kind) {
    var _a, _b;
    var existingKind = ((_a = state.affectedFilesPendingEmit) === null || _a === void 0 ? void 0 : _a.get(affectedFilePendingEmit)) || 0 /* BuilderFileEmit.None */;
    ((_b = state.affectedFilesPendingEmit) !== null && _b !== void 0 ? _b : (state.affectedFilesPendingEmit = new Map())).set(affectedFilePendingEmit, existingKind | kind);
}
/** @internal */
function toBuilderStateFileInfoForMultiEmit(fileInfo) {
    return (0, ts_1.isString)(fileInfo) ?
        { version: fileInfo, signature: fileInfo, affectsGlobalScope: undefined, impliedFormat: undefined } :
        (0, ts_1.isString)(fileInfo.signature) ?
            fileInfo :
            { version: fileInfo.version, signature: fileInfo.signature === false ? undefined : fileInfo.version, affectsGlobalScope: fileInfo.affectsGlobalScope, impliedFormat: fileInfo.impliedFormat };
}
exports.toBuilderStateFileInfoForMultiEmit = toBuilderStateFileInfoForMultiEmit;
/** @internal */
function toBuilderFileEmit(value, fullEmitForOptions) {
    return (0, ts_1.isNumber)(value) ? fullEmitForOptions : value[1] || 8 /* BuilderFileEmit.Dts */;
}
exports.toBuilderFileEmit = toBuilderFileEmit;
/** @internal */
function toProgramEmitPending(value, options) {
    return !value ? getBuilderFileEmit(options || {}) : value;
}
exports.toProgramEmitPending = toProgramEmitPending;
/** @internal */
function createBuilderProgramUsingProgramBuildInfo(buildInfo, buildInfoPath, host) {
    var _a, _b, _c, _d;
    var program = buildInfo.program;
    var buildInfoDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(buildInfoPath, host.getCurrentDirectory()));
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames());
    var state;
    var filePaths = (_a = program.fileNames) === null || _a === void 0 ? void 0 : _a.map(toPathInBuildInfoDirectory);
    var filePathsSetList;
    var latestChangedDtsFile = program.latestChangedDtsFile ? toAbsolutePath(program.latestChangedDtsFile) : undefined;
    if (isProgramBundleEmitBuildInfo(program)) {
        var fileInfos_2 = new Map();
        program.fileInfos.forEach(function (fileInfo, index) {
            var path = toFilePath(index + 1);
            fileInfos_2.set(path, (0, ts_1.isString)(fileInfo) ? { version: fileInfo, signature: undefined, affectsGlobalScope: undefined, impliedFormat: undefined } : fileInfo);
        });
        state = {
            fileInfos: fileInfos_2,
            compilerOptions: program.options ? (0, ts_1.convertToOptionsWithAbsolutePaths)(program.options, toAbsolutePath) : {},
            latestChangedDtsFile: latestChangedDtsFile,
            outSignature: program.outSignature,
            programEmitPending: program.pendingEmit === undefined ? undefined : toProgramEmitPending(program.pendingEmit, program.options),
            bundle: buildInfo.bundle,
        };
    }
    else {
        filePathsSetList = (_b = program.fileIdsList) === null || _b === void 0 ? void 0 : _b.map(function (fileIds) { return new Set(fileIds.map(toFilePath)); });
        var fileInfos_3 = new Map();
        var emitSignatures_1 = ((_c = program.options) === null || _c === void 0 ? void 0 : _c.composite) && !(0, ts_1.outFile)(program.options) ? new Map() : undefined;
        program.fileInfos.forEach(function (fileInfo, index) {
            var path = toFilePath(index + 1);
            var stateFileInfo = toBuilderStateFileInfoForMultiEmit(fileInfo);
            fileInfos_3.set(path, stateFileInfo);
            if (emitSignatures_1 && stateFileInfo.signature)
                emitSignatures_1.set(path, stateFileInfo.signature);
        });
        (_d = program.emitSignatures) === null || _d === void 0 ? void 0 : _d.forEach(function (value) {
            if ((0, ts_1.isNumber)(value))
                emitSignatures_1.delete(toFilePath(value));
            else {
                var key = toFilePath(value[0]);
                emitSignatures_1.set(key, !(0, ts_1.isString)(value[1]) && !value[1].length ?
                    // File signature is emit signature but differs in map
                    [emitSignatures_1.get(key)] :
                    value[1]);
            }
        });
        var fullEmitForOptions_1 = program.affectedFilesPendingEmit ? getBuilderFileEmit(program.options || {}) : undefined;
        state = {
            fileInfos: fileInfos_3,
            compilerOptions: program.options ? (0, ts_1.convertToOptionsWithAbsolutePaths)(program.options, toAbsolutePath) : {},
            referencedMap: toManyToManyPathMap(program.referencedMap),
            exportedModulesMap: toManyToManyPathMap(program.exportedModulesMap),
            semanticDiagnosticsPerFile: program.semanticDiagnosticsPerFile && (0, ts_1.arrayToMap)(program.semanticDiagnosticsPerFile, function (value) { return toFilePath((0, ts_1.isNumber)(value) ? value : value[0]); }, function (value) { return (0, ts_1.isNumber)(value) ? ts_1.emptyArray : value[1]; }),
            hasReusableDiagnostic: true,
            affectedFilesPendingEmit: program.affectedFilesPendingEmit && (0, ts_1.arrayToMap)(program.affectedFilesPendingEmit, function (value) { return toFilePath((0, ts_1.isNumber)(value) ? value : value[0]); }, function (value) { return toBuilderFileEmit(value, fullEmitForOptions_1); }),
            changedFilesSet: new Set((0, ts_1.map)(program.changeFileSet, toFilePath)),
            latestChangedDtsFile: latestChangedDtsFile,
            emitSignatures: (emitSignatures_1 === null || emitSignatures_1 === void 0 ? void 0 : emitSignatures_1.size) ? emitSignatures_1 : undefined,
        };
    }
    return {
        getState: function () { return state; },
        saveEmitState: ts_1.noop,
        restoreEmitState: ts_1.noop,
        getProgram: ts_1.notImplemented,
        getProgramOrUndefined: ts_1.returnUndefined,
        releaseProgram: ts_1.noop,
        getCompilerOptions: function () { return state.compilerOptions; },
        getSourceFile: ts_1.notImplemented,
        getSourceFiles: ts_1.notImplemented,
        getOptionsDiagnostics: ts_1.notImplemented,
        getGlobalDiagnostics: ts_1.notImplemented,
        getConfigFileParsingDiagnostics: ts_1.notImplemented,
        getSyntacticDiagnostics: ts_1.notImplemented,
        getDeclarationDiagnostics: ts_1.notImplemented,
        getSemanticDiagnostics: ts_1.notImplemented,
        emit: ts_1.notImplemented,
        getAllDependencies: ts_1.notImplemented,
        getCurrentDirectory: ts_1.notImplemented,
        emitNextAffectedFile: ts_1.notImplemented,
        getSemanticDiagnosticsOfNextAffectedFile: ts_1.notImplemented,
        emitBuildInfo: ts_1.notImplemented,
        close: ts_1.noop,
        hasChangedEmitSignature: ts_1.returnFalse,
    };
    function toPathInBuildInfoDirectory(path) {
        return (0, ts_1.toPath)(path, buildInfoDirectory, getCanonicalFileName);
    }
    function toAbsolutePath(path) {
        return (0, ts_1.getNormalizedAbsolutePath)(path, buildInfoDirectory);
    }
    function toFilePath(fileId) {
        return filePaths[fileId - 1];
    }
    function toFilePathsSet(fileIdsListId) {
        return filePathsSetList[fileIdsListId - 1];
    }
    function toManyToManyPathMap(referenceMap) {
        if (!referenceMap) {
            return undefined;
        }
        var map = ts_1.BuilderState.createManyToManyPathMap();
        referenceMap.forEach(function (_a) {
            var fileId = _a[0], fileIdListId = _a[1];
            return map.set(toFilePath(fileId), toFilePathsSet(fileIdListId));
        });
        return map;
    }
}
exports.createBuilderProgramUsingProgramBuildInfo = createBuilderProgramUsingProgramBuildInfo;
/** @internal */
function getBuildInfoFileVersionMap(program, buildInfoPath, host) {
    var buildInfoDirectory = (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(buildInfoPath, host.getCurrentDirectory()));
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames());
    var fileInfos = new Map();
    var rootIndex = 0;
    var roots = [];
    program.fileInfos.forEach(function (fileInfo, index) {
        var path = (0, ts_1.toPath)(program.fileNames[index], buildInfoDirectory, getCanonicalFileName);
        var version = (0, ts_1.isString)(fileInfo) ? fileInfo : fileInfo.version;
        fileInfos.set(path, version);
        if (rootIndex < program.root.length) {
            var current = program.root[rootIndex];
            var fileId = (index + 1);
            if ((0, ts_1.isArray)(current)) {
                if (current[0] <= fileId && fileId <= current[1]) {
                    roots.push(path);
                    if (current[1] === fileId)
                        rootIndex++;
                }
            }
            else if (current === fileId) {
                roots.push(path);
                rootIndex++;
            }
        }
    });
    return { fileInfos: fileInfos, roots: roots };
}
exports.getBuildInfoFileVersionMap = getBuildInfoFileVersionMap;
/** @internal */
function createRedirectedBuilderProgram(getState, configFileParsingDiagnostics) {
    return {
        getState: ts_1.notImplemented,
        saveEmitState: ts_1.noop,
        restoreEmitState: ts_1.noop,
        getProgram: getProgram,
        getProgramOrUndefined: function () { return getState().program; },
        releaseProgram: function () { return getState().program = undefined; },
        getCompilerOptions: function () { return getState().compilerOptions; },
        getSourceFile: function (fileName) { return getProgram().getSourceFile(fileName); },
        getSourceFiles: function () { return getProgram().getSourceFiles(); },
        getOptionsDiagnostics: function (cancellationToken) { return getProgram().getOptionsDiagnostics(cancellationToken); },
        getGlobalDiagnostics: function (cancellationToken) { return getProgram().getGlobalDiagnostics(cancellationToken); },
        getConfigFileParsingDiagnostics: function () { return configFileParsingDiagnostics; },
        getSyntacticDiagnostics: function (sourceFile, cancellationToken) { return getProgram().getSyntacticDiagnostics(sourceFile, cancellationToken); },
        getDeclarationDiagnostics: function (sourceFile, cancellationToken) { return getProgram().getDeclarationDiagnostics(sourceFile, cancellationToken); },
        getSemanticDiagnostics: function (sourceFile, cancellationToken) { return getProgram().getSemanticDiagnostics(sourceFile, cancellationToken); },
        emit: function (sourceFile, writeFile, cancellationToken, emitOnlyDts, customTransformers) { return getProgram().emit(sourceFile, writeFile, cancellationToken, emitOnlyDts, customTransformers); },
        emitBuildInfo: function (writeFile, cancellationToken) { return getProgram().emitBuildInfo(writeFile, cancellationToken); },
        getAllDependencies: ts_1.notImplemented,
        getCurrentDirectory: function () { return getProgram().getCurrentDirectory(); },
        close: ts_1.noop,
    };
    function getProgram() {
        return ts_1.Debug.checkDefined(getState().program);
    }
}
exports.createRedirectedBuilderProgram = createRedirectedBuilderProgram;
