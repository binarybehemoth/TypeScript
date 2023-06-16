"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderState = exports.getFileEmitOutput = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
function getFileEmitOutput(program, sourceFile, emitOnlyDtsFiles, cancellationToken, customTransformers, forceDtsEmit) {
    var outputFiles = [];
    var _a = program.emit(sourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers, forceDtsEmit), emitSkipped = _a.emitSkipped, diagnostics = _a.diagnostics;
    return { outputFiles: outputFiles, emitSkipped: emitSkipped, diagnostics: diagnostics };
    function writeFile(fileName, text, writeByteOrderMark) {
        outputFiles.push({ name: fileName, writeByteOrderMark: writeByteOrderMark, text: text });
    }
}
exports.getFileEmitOutput = getFileEmitOutput;
/** @internal */
var BuilderState;
(function (BuilderState) {
    function createManyToManyPathMap() {
        function create(forward, reverse, deleted) {
            var map = {
                getKeys: function (v) { return reverse.get(v); },
                getValues: function (k) { return forward.get(k); },
                keys: function () { return forward.keys(); },
                deleteKey: function (k) {
                    (deleted || (deleted = new Set())).add(k);
                    var set = forward.get(k);
                    if (!set) {
                        return false;
                    }
                    set.forEach(function (v) { return deleteFromMultimap(reverse, v, k); });
                    forward.delete(k);
                    return true;
                },
                set: function (k, vSet) {
                    deleted === null || deleted === void 0 ? void 0 : deleted.delete(k);
                    var existingVSet = forward.get(k);
                    forward.set(k, vSet);
                    existingVSet === null || existingVSet === void 0 ? void 0 : existingVSet.forEach(function (v) {
                        if (!vSet.has(v)) {
                            deleteFromMultimap(reverse, v, k);
                        }
                    });
                    vSet.forEach(function (v) {
                        if (!(existingVSet === null || existingVSet === void 0 ? void 0 : existingVSet.has(v))) {
                            addToMultimap(reverse, v, k);
                        }
                    });
                    return map;
                },
            };
            return map;
        }
        return create(new Map(), new Map(), /*deleted*/ undefined);
    }
    BuilderState.createManyToManyPathMap = createManyToManyPathMap;
    function addToMultimap(map, k, v) {
        var set = map.get(k);
        if (!set) {
            set = new Set();
            map.set(k, set);
        }
        set.add(v);
    }
    function deleteFromMultimap(map, k, v) {
        var set = map.get(k);
        if (set === null || set === void 0 ? void 0 : set.delete(v)) {
            if (!set.size) {
                map.delete(k);
            }
            return true;
        }
        return false;
    }
    function getReferencedFilesFromImportedModuleSymbol(symbol) {
        return (0, ts_1.mapDefined)(symbol.declarations, function (declaration) { var _a; return (_a = (0, ts_1.getSourceFileOfNode)(declaration)) === null || _a === void 0 ? void 0 : _a.resolvedPath; });
    }
    /**
     * Get the module source file and all augmenting files from the import name node from file
     */
    function getReferencedFilesFromImportLiteral(checker, importName) {
        var symbol = checker.getSymbolAtLocation(importName);
        return symbol && getReferencedFilesFromImportedModuleSymbol(symbol);
    }
    /**
     * Gets the path to reference file from file name, it could be resolvedPath if present otherwise path
     */
    function getReferencedFileFromFileName(program, fileName, sourceFileDirectory, getCanonicalFileName) {
        return (0, ts_1.toPath)(program.getProjectReferenceRedirect(fileName) || fileName, sourceFileDirectory, getCanonicalFileName);
    }
    /**
     * Gets the referenced files for a file from the program with values for the keys as referenced file's path to be true
     */
    function getReferencedFiles(program, sourceFile, getCanonicalFileName) {
        var referencedFiles;
        // We need to use a set here since the code can contain the same import twice,
        // but that will only be one dependency.
        // To avoid invernal conversion, the key of the referencedFiles map must be of type Path
        if (sourceFile.imports && sourceFile.imports.length > 0) {
            var checker = program.getTypeChecker();
            for (var _i = 0, _a = sourceFile.imports; _i < _a.length; _i++) {
                var importName = _a[_i];
                var declarationSourceFilePaths = getReferencedFilesFromImportLiteral(checker, importName);
                declarationSourceFilePaths === null || declarationSourceFilePaths === void 0 ? void 0 : declarationSourceFilePaths.forEach(addReferencedFile);
            }
        }
        var sourceFileDirectory = (0, ts_1.getDirectoryPath)(sourceFile.resolvedPath);
        // Handle triple slash references
        if (sourceFile.referencedFiles && sourceFile.referencedFiles.length > 0) {
            for (var _b = 0, _c = sourceFile.referencedFiles; _b < _c.length; _b++) {
                var referencedFile = _c[_b];
                var referencedPath = getReferencedFileFromFileName(program, referencedFile.fileName, sourceFileDirectory, getCanonicalFileName);
                addReferencedFile(referencedPath);
            }
        }
        // Handle type reference directives
        if (sourceFile.resolvedTypeReferenceDirectiveNames) {
            sourceFile.resolvedTypeReferenceDirectiveNames.forEach(function (_a) {
                var resolvedTypeReferenceDirective = _a.resolvedTypeReferenceDirective;
                if (!resolvedTypeReferenceDirective) {
                    return;
                }
                var fileName = resolvedTypeReferenceDirective.resolvedFileName; // TODO: GH#18217
                var typeFilePath = getReferencedFileFromFileName(program, fileName, sourceFileDirectory, getCanonicalFileName);
                addReferencedFile(typeFilePath);
            });
        }
        // Add module augmentation as references
        if (sourceFile.moduleAugmentations.length) {
            var checker = program.getTypeChecker();
            for (var _d = 0, _e = sourceFile.moduleAugmentations; _d < _e.length; _d++) {
                var moduleName = _e[_d];
                if (!(0, ts_1.isStringLiteral)(moduleName))
                    continue;
                var symbol = checker.getSymbolAtLocation(moduleName);
                if (!symbol)
                    continue;
                // Add any file other than our own as reference
                addReferenceFromAmbientModule(symbol);
            }
        }
        // From ambient modules
        for (var _f = 0, _g = program.getTypeChecker().getAmbientModules(); _f < _g.length; _f++) {
            var ambientModule = _g[_f];
            if (ambientModule.declarations && ambientModule.declarations.length > 1) {
                addReferenceFromAmbientModule(ambientModule);
            }
        }
        return referencedFiles;
        function addReferenceFromAmbientModule(symbol) {
            if (!symbol.declarations) {
                return;
            }
            // Add any file other than our own as reference
            for (var _i = 0, _a = symbol.declarations; _i < _a.length; _i++) {
                var declaration = _a[_i];
                var declarationSourceFile = (0, ts_1.getSourceFileOfNode)(declaration);
                if (declarationSourceFile &&
                    declarationSourceFile !== sourceFile) {
                    addReferencedFile(declarationSourceFile.resolvedPath);
                }
            }
        }
        function addReferencedFile(referencedPath) {
            (referencedFiles || (referencedFiles = new Set())).add(referencedPath);
        }
    }
    /**
     * Returns true if oldState is reusable, that is the emitKind = module/non module has not changed
     */
    function canReuseOldState(newReferencedMap, oldState) {
        return oldState && !oldState.referencedMap === !newReferencedMap;
    }
    BuilderState.canReuseOldState = canReuseOldState;
    /**
     * Creates the state of file references and signature for the new program from oldState if it is safe
     */
    function create(newProgram, oldState, disableUseFileVersionAsSignature) {
        var _a, _b, _c;
        var fileInfos = new Map();
        var options = newProgram.getCompilerOptions();
        var isOutFile = (0, ts_1.outFile)(options);
        var referencedMap = options.module !== ts_1.ModuleKind.None && !isOutFile ?
            createManyToManyPathMap() : undefined;
        var exportedModulesMap = referencedMap ? createManyToManyPathMap() : undefined;
        var useOldState = canReuseOldState(referencedMap, oldState);
        // Ensure source files have parent pointers set
        newProgram.getTypeChecker();
        // Create the reference map, and set the file infos
        for (var _i = 0, _d = newProgram.getSourceFiles(); _i < _d.length; _i++) {
            var sourceFile = _d[_i];
            var version = ts_1.Debug.checkDefined(sourceFile.version, "Program intended to be used with Builder should have source files with versions set");
            var oldUncommittedSignature = useOldState ? (_a = oldState.oldSignatures) === null || _a === void 0 ? void 0 : _a.get(sourceFile.resolvedPath) : undefined;
            var signature = oldUncommittedSignature === undefined ?
                useOldState ? (_b = oldState.fileInfos.get(sourceFile.resolvedPath)) === null || _b === void 0 ? void 0 : _b.signature : undefined :
                oldUncommittedSignature || undefined;
            if (referencedMap) {
                var newReferences = getReferencedFiles(newProgram, sourceFile, newProgram.getCanonicalFileName);
                if (newReferences) {
                    referencedMap.set(sourceFile.resolvedPath, newReferences);
                }
                // Copy old visible to outside files map
                if (useOldState) {
                    var oldUncommittedExportedModules = (_c = oldState.oldExportedModulesMap) === null || _c === void 0 ? void 0 : _c.get(sourceFile.resolvedPath);
                    var exportedModules = oldUncommittedExportedModules === undefined ?
                        oldState.exportedModulesMap.getValues(sourceFile.resolvedPath) :
                        oldUncommittedExportedModules || undefined;
                    if (exportedModules) {
                        exportedModulesMap.set(sourceFile.resolvedPath, exportedModules);
                    }
                }
            }
            fileInfos.set(sourceFile.resolvedPath, {
                version: version,
                signature: signature,
                // No need to calculate affectsGlobalScope with --out since its not used at all
                affectsGlobalScope: !isOutFile ? isFileAffectingGlobalScope(sourceFile) || undefined : undefined,
                impliedFormat: sourceFile.impliedNodeFormat
            });
        }
        return {
            fileInfos: fileInfos,
            referencedMap: referencedMap,
            exportedModulesMap: exportedModulesMap,
            useFileVersionAsSignature: !disableUseFileVersionAsSignature && !useOldState
        };
    }
    BuilderState.create = create;
    /**
     * Releases needed properties
     */
    function releaseCache(state) {
        state.allFilesExcludingDefaultLibraryFile = undefined;
        state.allFileNames = undefined;
    }
    BuilderState.releaseCache = releaseCache;
    /**
     * Gets the files affected by the path from the program
     */
    function getFilesAffectedBy(state, programOfThisState, path, cancellationToken, host) {
        var _a, _b;
        var result = getFilesAffectedByWithOldState(state, programOfThisState, path, cancellationToken, host);
        (_a = state.oldSignatures) === null || _a === void 0 ? void 0 : _a.clear();
        (_b = state.oldExportedModulesMap) === null || _b === void 0 ? void 0 : _b.clear();
        return result;
    }
    BuilderState.getFilesAffectedBy = getFilesAffectedBy;
    function getFilesAffectedByWithOldState(state, programOfThisState, path, cancellationToken, host) {
        var sourceFile = programOfThisState.getSourceFileByPath(path);
        if (!sourceFile) {
            return ts_1.emptyArray;
        }
        if (!updateShapeSignature(state, programOfThisState, sourceFile, cancellationToken, host)) {
            return [sourceFile];
        }
        return (state.referencedMap ? getFilesAffectedByUpdatedShapeWhenModuleEmit : getFilesAffectedByUpdatedShapeWhenNonModuleEmit)(state, programOfThisState, sourceFile, cancellationToken, host);
    }
    BuilderState.getFilesAffectedByWithOldState = getFilesAffectedByWithOldState;
    function updateSignatureOfFile(state, signature, path) {
        state.fileInfos.get(path).signature = signature;
        (state.hasCalledUpdateShapeSignature || (state.hasCalledUpdateShapeSignature = new Set())).add(path);
    }
    BuilderState.updateSignatureOfFile = updateSignatureOfFile;
    function computeDtsSignature(programOfThisState, sourceFile, cancellationToken, host, onNewSignature) {
        programOfThisState.emit(sourceFile, function (fileName, text, _writeByteOrderMark, _onError, sourceFiles, data) {
            ts_1.Debug.assert((0, ts_1.isDeclarationFileName)(fileName), "File extension for signature expected to be dts: Got:: ".concat(fileName));
            onNewSignature((0, ts_1.computeSignatureWithDiagnostics)(programOfThisState, sourceFile, text, host, data), sourceFiles);
        }, cancellationToken, 
        /*emitOnly*/ true, 
        /*customTransformers*/ undefined, 
        /*forceDtsEmit*/ true);
    }
    BuilderState.computeDtsSignature = computeDtsSignature;
    /**
     * Returns if the shape of the signature has changed since last emit
     */
    function updateShapeSignature(state, programOfThisState, sourceFile, cancellationToken, host, useFileVersionAsSignature) {
        var _a;
        if (useFileVersionAsSignature === void 0) { useFileVersionAsSignature = state.useFileVersionAsSignature; }
        // If we have cached the result for this file, that means hence forth we should assume file shape is uptodate
        if ((_a = state.hasCalledUpdateShapeSignature) === null || _a === void 0 ? void 0 : _a.has(sourceFile.resolvedPath))
            return false;
        var info = state.fileInfos.get(sourceFile.resolvedPath);
        var prevSignature = info.signature;
        var latestSignature;
        if (!sourceFile.isDeclarationFile && !useFileVersionAsSignature) {
            computeDtsSignature(programOfThisState, sourceFile, cancellationToken, host, function (signature, sourceFiles) {
                latestSignature = signature;
                if (latestSignature !== prevSignature) {
                    updateExportedModules(state, sourceFile, sourceFiles[0].exportedModulesFromDeclarationEmit);
                }
            });
        }
        // Default is to use file version as signature
        if (latestSignature === undefined) {
            latestSignature = sourceFile.version;
            if (state.exportedModulesMap && latestSignature !== prevSignature) {
                (state.oldExportedModulesMap || (state.oldExportedModulesMap = new Map())).set(sourceFile.resolvedPath, state.exportedModulesMap.getValues(sourceFile.resolvedPath) || false);
                // All the references in this file are exported
                var references = state.referencedMap ? state.referencedMap.getValues(sourceFile.resolvedPath) : undefined;
                if (references) {
                    state.exportedModulesMap.set(sourceFile.resolvedPath, references);
                }
                else {
                    state.exportedModulesMap.deleteKey(sourceFile.resolvedPath);
                }
            }
        }
        (state.oldSignatures || (state.oldSignatures = new Map())).set(sourceFile.resolvedPath, prevSignature || false);
        (state.hasCalledUpdateShapeSignature || (state.hasCalledUpdateShapeSignature = new Set())).add(sourceFile.resolvedPath);
        info.signature = latestSignature;
        return latestSignature !== prevSignature;
    }
    BuilderState.updateShapeSignature = updateShapeSignature;
    /**
     * Coverts the declaration emit result into exported modules map
     */
    function updateExportedModules(state, sourceFile, exportedModulesFromDeclarationEmit) {
        if (!state.exportedModulesMap)
            return;
        (state.oldExportedModulesMap || (state.oldExportedModulesMap = new Map())).set(sourceFile.resolvedPath, state.exportedModulesMap.getValues(sourceFile.resolvedPath) || false);
        var exportedModules = getExportedModules(exportedModulesFromDeclarationEmit);
        if (exportedModules) {
            state.exportedModulesMap.set(sourceFile.resolvedPath, exportedModules);
        }
        else {
            state.exportedModulesMap.deleteKey(sourceFile.resolvedPath);
        }
    }
    BuilderState.updateExportedModules = updateExportedModules;
    function getExportedModules(exportedModulesFromDeclarationEmit) {
        var exportedModules;
        exportedModulesFromDeclarationEmit === null || exportedModulesFromDeclarationEmit === void 0 ? void 0 : exportedModulesFromDeclarationEmit.forEach(function (symbol) { return getReferencedFilesFromImportedModuleSymbol(symbol).forEach(function (path) { return (exportedModules !== null && exportedModules !== void 0 ? exportedModules : (exportedModules = new Set())).add(path); }); });
        return exportedModules;
    }
    BuilderState.getExportedModules = getExportedModules;
    /**
     * Get all the dependencies of the sourceFile
     */
    function getAllDependencies(state, programOfThisState, sourceFile) {
        var compilerOptions = programOfThisState.getCompilerOptions();
        // With --out or --outFile all outputs go into single file, all files depend on each other
        if ((0, ts_1.outFile)(compilerOptions)) {
            return getAllFileNames(state, programOfThisState);
        }
        // If this is non module emit, or its a global file, it depends on all the source files
        if (!state.referencedMap || isFileAffectingGlobalScope(sourceFile)) {
            return getAllFileNames(state, programOfThisState);
        }
        // Get the references, traversing deep from the referenceMap
        var seenMap = new Set();
        var queue = [sourceFile.resolvedPath];
        while (queue.length) {
            var path = queue.pop();
            if (!seenMap.has(path)) {
                seenMap.add(path);
                var references = state.referencedMap.getValues(path);
                if (references) {
                    for (var _i = 0, _a = references.keys(); _i < _a.length; _i++) {
                        var key = _a[_i];
                        queue.push(key);
                    }
                }
            }
        }
        return (0, ts_1.arrayFrom)((0, ts_1.mapDefinedIterator)(seenMap.keys(), function (path) { var _a, _b; return (_b = (_a = programOfThisState.getSourceFileByPath(path)) === null || _a === void 0 ? void 0 : _a.fileName) !== null && _b !== void 0 ? _b : path; }));
    }
    BuilderState.getAllDependencies = getAllDependencies;
    /**
     * Gets the names of all files from the program
     */
    function getAllFileNames(state, programOfThisState) {
        if (!state.allFileNames) {
            var sourceFiles = programOfThisState.getSourceFiles();
            state.allFileNames = sourceFiles === ts_1.emptyArray ? ts_1.emptyArray : sourceFiles.map(function (file) { return file.fileName; });
        }
        return state.allFileNames;
    }
    /**
     * Gets the files referenced by the the file path
     */
    function getReferencedByPaths(state, referencedFilePath) {
        var keys = state.referencedMap.getKeys(referencedFilePath);
        return keys ? (0, ts_1.arrayFrom)(keys.keys()) : [];
    }
    BuilderState.getReferencedByPaths = getReferencedByPaths;
    /**
     * For script files that contains only ambient external modules, although they are not actually external module files,
     * they can only be consumed via importing elements from them. Regular script files cannot consume them. Therefore,
     * there are no point to rebuild all script files if these special files have changed. However, if any statement
     * in the file is not ambient external module, we treat it as a regular script file.
     */
    function containsOnlyAmbientModules(sourceFile) {
        for (var _i = 0, _a = sourceFile.statements; _i < _a.length; _i++) {
            var statement = _a[_i];
            if (!(0, ts_1.isModuleWithStringLiteralName)(statement)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Return true if file contains anything that augments to global scope we need to build them as if
     * they are global files as well as module
     */
    function containsGlobalScopeAugmentation(sourceFile) {
        return (0, ts_1.some)(sourceFile.moduleAugmentations, function (augmentation) { return (0, ts_1.isGlobalScopeAugmentation)(augmentation.parent); });
    }
    /**
     * Return true if the file will invalidate all files because it affectes global scope
     */
    function isFileAffectingGlobalScope(sourceFile) {
        return containsGlobalScopeAugmentation(sourceFile) ||
            !(0, ts_1.isExternalOrCommonJsModule)(sourceFile) && !(0, ts_1.isJsonSourceFile)(sourceFile) && !containsOnlyAmbientModules(sourceFile);
    }
    /**
     * Gets all files of the program excluding the default library file
     */
    function getAllFilesExcludingDefaultLibraryFile(state, programOfThisState, firstSourceFile) {
        // Use cached result
        if (state.allFilesExcludingDefaultLibraryFile) {
            return state.allFilesExcludingDefaultLibraryFile;
        }
        var result;
        if (firstSourceFile)
            addSourceFile(firstSourceFile);
        for (var _i = 0, _a = programOfThisState.getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile = _a[_i];
            if (sourceFile !== firstSourceFile) {
                addSourceFile(sourceFile);
            }
        }
        state.allFilesExcludingDefaultLibraryFile = result || ts_1.emptyArray;
        return state.allFilesExcludingDefaultLibraryFile;
        function addSourceFile(sourceFile) {
            if (!programOfThisState.isSourceFileDefaultLibrary(sourceFile)) {
                (result || (result = [])).push(sourceFile);
            }
        }
    }
    BuilderState.getAllFilesExcludingDefaultLibraryFile = getAllFilesExcludingDefaultLibraryFile;
    /**
     * When program emits non modular code, gets the files affected by the sourceFile whose shape has changed
     */
    function getFilesAffectedByUpdatedShapeWhenNonModuleEmit(state, programOfThisState, sourceFileWithUpdatedShape) {
        var compilerOptions = programOfThisState.getCompilerOptions();
        // If `--out` or `--outFile` is specified, any new emit will result in re-emitting the entire project,
        // so returning the file itself is good enough.
        if (compilerOptions && (0, ts_1.outFile)(compilerOptions)) {
            return [sourceFileWithUpdatedShape];
        }
        return getAllFilesExcludingDefaultLibraryFile(state, programOfThisState, sourceFileWithUpdatedShape);
    }
    /**
     * When program emits modular code, gets the files affected by the sourceFile whose shape has changed
     */
    function getFilesAffectedByUpdatedShapeWhenModuleEmit(state, programOfThisState, sourceFileWithUpdatedShape, cancellationToken, host) {
        if (isFileAffectingGlobalScope(sourceFileWithUpdatedShape)) {
            return getAllFilesExcludingDefaultLibraryFile(state, programOfThisState, sourceFileWithUpdatedShape);
        }
        var compilerOptions = programOfThisState.getCompilerOptions();
        if (compilerOptions && ((0, ts_1.getIsolatedModules)(compilerOptions) || (0, ts_1.outFile)(compilerOptions))) {
            return [sourceFileWithUpdatedShape];
        }
        // Now we need to if each file in the referencedBy list has a shape change as well.
        // Because if so, its own referencedBy files need to be saved as well to make the
        // emitting result consistent with files on disk.
        var seenFileNamesMap = new Map();
        // Start with the paths this file was referenced by
        seenFileNamesMap.set(sourceFileWithUpdatedShape.resolvedPath, sourceFileWithUpdatedShape);
        var queue = getReferencedByPaths(state, sourceFileWithUpdatedShape.resolvedPath);
        while (queue.length > 0) {
            var currentPath = queue.pop();
            if (!seenFileNamesMap.has(currentPath)) {
                var currentSourceFile = programOfThisState.getSourceFileByPath(currentPath);
                seenFileNamesMap.set(currentPath, currentSourceFile);
                if (currentSourceFile && updateShapeSignature(state, programOfThisState, currentSourceFile, cancellationToken, host)) {
                    queue.push.apply(queue, getReferencedByPaths(state, currentSourceFile.resolvedPath));
                }
            }
        }
        // Return array of values that needs emit
        return (0, ts_1.arrayFrom)((0, ts_1.mapDefinedIterator)(seenFileNamesMap.values(), function (value) { return value; }));
    }
})(BuilderState || (exports.BuilderState = BuilderState = {}));
