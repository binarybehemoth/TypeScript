"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResolutionCache = exports.getRootPathSplitLength = exports.getRootDirectoryOfResolutionCache = exports.getDirectoryToWatchFailedLookupLocationFromTypeRoot = exports.getDirectoryToWatchFailedLookupLocation = exports.canWatchAffectingLocation = exports.canWatchAtTypes = exports.canWatchDirectoryOrFile = exports.removeIgnoredPath = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
function removeIgnoredPath(path) {
    // Consider whole staging folder as if node_modules changed.
    if ((0, ts_1.endsWith)(path, "/node_modules/.staging")) {
        return (0, ts_1.removeSuffix)(path, "/.staging");
    }
    return (0, ts_1.some)(ts_1.ignoredPaths, function (searchPath) { return (0, ts_1.stringContains)(path, searchPath); }) ?
        undefined :
        path;
}
exports.removeIgnoredPath = removeIgnoredPath;
function perceivedOsRootLengthForWatching(pathComponents, length) {
    // Ignore "/", "c:/"
    if (length <= 1)
        return 1;
    var userCheckIndex = 1;
    var isDosStyle = pathComponents[0].search(/[a-zA-Z]:/) === 0;
    if (pathComponents[0] !== ts_1.directorySeparator &&
        !isDosStyle && // Non dos style paths
        pathComponents[1].search(/[a-zA-Z]\$$/) === 0) { // Dos style nextPart
        // ignore "//vda1cs4850/c$/folderAtRoot"
        if (length === 2)
            return 2;
        userCheckIndex = 2;
        isDosStyle = true;
    }
    if (isDosStyle &&
        !pathComponents[userCheckIndex].match(/^users$/i)) {
        // Paths like c:/notUsers
        return userCheckIndex;
    }
    // Paths like: c:/users/username or /home/username
    return userCheckIndex + 2;
}
/**
 * Filter out paths like
 * "/", "/user", "/user/username", "/user/username/folderAtRoot",
 * "c:/", "c:/users", "c:/users/username", "c:/users/username/folderAtRoot", "c:/folderAtRoot"
 * @param dirPath
 *
 * @internal
 */
function canWatchDirectoryOrFile(pathComponents, length) {
    if (length === undefined)
        length = pathComponents.length;
    // Ignore "/", "c:/"
    // ignore "/user", "c:/users" or "c:/folderAtRoot"
    if (length <= 2)
        return false;
    var perceivedOsRootLength = perceivedOsRootLengthForWatching(pathComponents, length);
    return length > perceivedOsRootLength + 1;
}
exports.canWatchDirectoryOrFile = canWatchDirectoryOrFile;
/** @internal */
function canWatchAtTypes(atTypes) {
    // Otherwise can watch directory only if we can watch the parent directory of node_modules/@types
    return canWatchAffectedPackageJsonOrNodeModulesOfAtTypes((0, ts_1.getDirectoryPath)(atTypes));
}
exports.canWatchAtTypes = canWatchAtTypes;
function isInDirectoryPath(dirComponents, fileOrDirComponents) {
    if (fileOrDirComponents.length < fileOrDirComponents.length)
        return false;
    for (var i = 0; i < dirComponents.length; i++) {
        if (fileOrDirComponents[i] !== dirComponents[i])
            return false;
    }
    return true;
}
function canWatchAffectedPackageJsonOrNodeModulesOfAtTypes(fileOrDirPath) {
    return canWatchDirectoryOrFile((0, ts_1.getPathComponents)(fileOrDirPath));
}
/** @internal */
function canWatchAffectingLocation(filePath) {
    return canWatchAffectedPackageJsonOrNodeModulesOfAtTypes(filePath);
}
exports.canWatchAffectingLocation = canWatchAffectingLocation;
/** @internal */
function getDirectoryToWatchFailedLookupLocation(failedLookupLocation, failedLookupLocationPath, rootDir, rootPath, rootPathComponents, getCurrentDirectory) {
    var failedLookupPathComponents = (0, ts_1.getPathComponents)(failedLookupLocationPath);
    // Ensure failed look up is normalized path
    failedLookupLocation = (0, ts_1.isRootedDiskPath)(failedLookupLocation) ? (0, ts_1.normalizePath)(failedLookupLocation) : (0, ts_1.getNormalizedAbsolutePath)(failedLookupLocation, getCurrentDirectory());
    var failedLookupComponents = (0, ts_1.getPathComponents)(failedLookupLocation);
    var perceivedOsRootLength = perceivedOsRootLengthForWatching(failedLookupPathComponents, failedLookupPathComponents.length);
    if (failedLookupPathComponents.length <= perceivedOsRootLength + 1)
        return undefined;
    // If directory path contains node module, get the most parent node_modules directory for watching
    var nodeModulesIndex = failedLookupPathComponents.indexOf("node_modules");
    if (nodeModulesIndex !== -1 && nodeModulesIndex + 1 <= perceivedOsRootLength + 1)
        return undefined; // node_modules not at position where it can be watched
    if (isInDirectoryPath(rootPathComponents, failedLookupPathComponents)) {
        if (failedLookupPathComponents.length > rootPathComponents.length + 1) {
            // Instead of watching root, watch directory in root to avoid watching excluded directories not needed for module resolution
            return getDirectoryOfFailedLookupWatch(failedLookupComponents, failedLookupPathComponents, Math.max(rootPathComponents.length + 1, perceivedOsRootLength + 1));
        }
        else {
            // Always watch root directory non recursively
            return {
                dir: rootDir,
                dirPath: rootPath,
                nonRecursive: true,
            };
        }
    }
    return getDirectoryToWatchFromFailedLookupLocationDirectory(failedLookupComponents, failedLookupPathComponents, failedLookupPathComponents.length - 1, perceivedOsRootLength, nodeModulesIndex, rootPathComponents);
}
exports.getDirectoryToWatchFailedLookupLocation = getDirectoryToWatchFailedLookupLocation;
function getDirectoryToWatchFromFailedLookupLocationDirectory(dirComponents, dirPathComponents, dirPathComponentsLength, perceivedOsRootLength, nodeModulesIndex, rootPathComponents) {
    // If directory path contains node module, get the most parent node_modules directory for watching
    if (nodeModulesIndex !== -1) {
        // If the directory is node_modules use it to watch, always watch it recursively
        return getDirectoryOfFailedLookupWatch(dirComponents, dirPathComponents, nodeModulesIndex + 1);
    }
    // Use some ancestor of the root directory
    var nonRecursive = true;
    var length = dirPathComponentsLength;
    for (var i = 0; i < dirPathComponentsLength; i++) {
        if (dirPathComponents[i] !== rootPathComponents[i]) {
            nonRecursive = false;
            length = Math.max(i + 1, perceivedOsRootLength + 1);
            break;
        }
    }
    return getDirectoryOfFailedLookupWatch(dirComponents, dirPathComponents, length, nonRecursive);
}
function getDirectoryOfFailedLookupWatch(dirComponents, dirPathComponents, length, nonRecursive) {
    return {
        dir: (0, ts_1.getPathFromPathComponents)(dirComponents, length),
        dirPath: (0, ts_1.getPathFromPathComponents)(dirPathComponents, length),
        nonRecursive: nonRecursive,
    };
}
/** @internal */
function getDirectoryToWatchFailedLookupLocationFromTypeRoot(typeRoot, typeRootPath, rootPath, rootPathComponents, getCurrentDirectory, filterCustomPath) {
    var typeRootPathComponents = (0, ts_1.getPathComponents)(typeRootPath);
    if (isInDirectoryPath(rootPathComponents, typeRootPathComponents)) {
        // Because this is called when we are watching typeRoot, we dont need additional check whether typeRoot is not say c:/users/node_modules/@types when root is c:/
        return rootPath;
    }
    typeRoot = (0, ts_1.isRootedDiskPath)(typeRoot) ? (0, ts_1.normalizePath)(typeRoot) : (0, ts_1.getNormalizedAbsolutePath)(typeRoot, getCurrentDirectory());
    var toWatch = getDirectoryToWatchFromFailedLookupLocationDirectory((0, ts_1.getPathComponents)(typeRoot), typeRootPathComponents, typeRootPathComponents.length, perceivedOsRootLengthForWatching(typeRootPathComponents, typeRootPathComponents.length), typeRootPathComponents.indexOf("node_modules"), rootPathComponents);
    return toWatch && filterCustomPath(toWatch.dirPath) ? toWatch.dirPath : undefined;
}
exports.getDirectoryToWatchFailedLookupLocationFromTypeRoot = getDirectoryToWatchFailedLookupLocationFromTypeRoot;
/** @internal */
function getRootDirectoryOfResolutionCache(rootDirForResolution, getCurrentDirectory) {
    var normalized = (0, ts_1.getNormalizedAbsolutePath)(rootDirForResolution, getCurrentDirectory());
    return !(0, ts_1.isDiskPathRoot)(normalized) ?
        (0, ts_1.removeTrailingDirectorySeparator)(normalized) :
        normalized;
}
exports.getRootDirectoryOfResolutionCache = getRootDirectoryOfResolutionCache;
/** @internal */
function getRootPathSplitLength(rootPath) {
    return rootPath.split(ts_1.directorySeparator).length - ((0, ts_1.hasTrailingDirectorySeparator)(rootPath) ? 1 : 0);
}
exports.getRootPathSplitLength = getRootPathSplitLength;
/** @internal */
function createResolutionCache(resolutionHost, rootDirForResolution, logChangesWhenResolvingModule) {
    var filesWithChangedSetOfUnresolvedImports;
    var filesWithInvalidatedResolutions;
    var filesWithInvalidatedNonRelativeUnresolvedImports;
    var nonRelativeExternalModuleResolutions = (0, ts_1.createMultiMap)();
    var resolutionsWithFailedLookups = new Set();
    var resolutionsWithOnlyAffectingLocations = new Set();
    var resolvedFileToResolution = new Map();
    var impliedFormatPackageJsons = new Map();
    var hasChangedAutomaticTypeDirectiveNames = false;
    var affectingPathChecksForFile;
    var affectingPathChecks;
    var failedLookupChecks;
    var startsWithPathChecks;
    var isInDirectoryChecks;
    var allModuleAndTypeResolutionsAreInvalidated = false;
    var getCurrentDirectory = (0, ts_1.memoize)(function () { return resolutionHost.getCurrentDirectory(); }); // TODO: GH#18217
    var cachedDirectoryStructureHost = resolutionHost.getCachedDirectoryStructureHost();
    // The resolvedModuleNames and resolvedTypeReferenceDirectives are the cache of resolutions per file.
    // The key in the map is source file's path.
    // The values are Map of resolutions with key being name lookedup.
    var resolvedModuleNames = new Map();
    var moduleResolutionCache = (0, ts_1.createModuleResolutionCache)(getCurrentDirectory(), resolutionHost.getCanonicalFileName, resolutionHost.getCompilationSettings());
    var resolvedTypeReferenceDirectives = new Map();
    var typeReferenceDirectiveResolutionCache = (0, ts_1.createTypeReferenceDirectiveResolutionCache)(getCurrentDirectory(), resolutionHost.getCanonicalFileName, resolutionHost.getCompilationSettings(), moduleResolutionCache.getPackageJsonInfoCache());
    var resolvedLibraries = new Map();
    var libraryResolutionCache = (0, ts_1.createModuleResolutionCache)(getCurrentDirectory(), resolutionHost.getCanonicalFileName, (0, ts_1.getOptionsForLibraryResolution)(resolutionHost.getCompilationSettings()), moduleResolutionCache.getPackageJsonInfoCache());
    var directoryWatchesOfFailedLookups = new Map();
    var fileWatchesOfAffectingLocations = new Map();
    var rootDir = getRootDirectoryOfResolutionCache(rootDirForResolution, getCurrentDirectory);
    var rootPath = resolutionHost.toPath(rootDir);
    var rootPathComponents = (0, ts_1.getPathComponents)(rootPath);
    // TypeRoot watches for the types that get added as part of getAutomaticTypeDirectiveNames
    var typeRootsWatches = new Map();
    return {
        getModuleResolutionCache: function () { return moduleResolutionCache; },
        startRecordingFilesWithChangedResolutions: startRecordingFilesWithChangedResolutions,
        finishRecordingFilesWithChangedResolutions: finishRecordingFilesWithChangedResolutions,
        // perDirectoryResolvedModuleNames and perDirectoryResolvedTypeReferenceDirectives could be non empty if there was exception during program update
        // (between startCachingPerDirectoryResolution and finishCachingPerDirectoryResolution)
        startCachingPerDirectoryResolution: startCachingPerDirectoryResolution,
        finishCachingPerDirectoryResolution: finishCachingPerDirectoryResolution,
        resolveModuleNameLiterals: resolveModuleNameLiterals,
        resolveTypeReferenceDirectiveReferences: resolveTypeReferenceDirectiveReferences,
        resolveLibrary: resolveLibrary,
        resolveSingleModuleNameWithoutWatching: resolveSingleModuleNameWithoutWatching,
        removeResolutionsFromProjectReferenceRedirects: removeResolutionsFromProjectReferenceRedirects,
        removeResolutionsOfFile: removeResolutionsOfFile,
        hasChangedAutomaticTypeDirectiveNames: function () { return hasChangedAutomaticTypeDirectiveNames; },
        invalidateResolutionOfFile: invalidateResolutionOfFile,
        invalidateResolutionsOfFailedLookupLocations: invalidateResolutionsOfFailedLookupLocations,
        setFilesWithInvalidatedNonRelativeUnresolvedImports: setFilesWithInvalidatedNonRelativeUnresolvedImports,
        createHasInvalidatedResolutions: createHasInvalidatedResolutions,
        isFileWithInvalidatedNonRelativeUnresolvedImports: isFileWithInvalidatedNonRelativeUnresolvedImports,
        updateTypeRootsWatch: updateTypeRootsWatch,
        closeTypeRootsWatch: closeTypeRootsWatch,
        clear: clear,
        onChangesAffectModuleResolution: onChangesAffectModuleResolution,
    };
    function getResolvedModule(resolution) {
        return resolution.resolvedModule;
    }
    function getResolvedTypeReferenceDirective(resolution) {
        return resolution.resolvedTypeReferenceDirective;
    }
    function clear() {
        (0, ts_1.clearMap)(directoryWatchesOfFailedLookups, ts_1.closeFileWatcherOf);
        (0, ts_1.clearMap)(fileWatchesOfAffectingLocations, ts_1.closeFileWatcherOf);
        nonRelativeExternalModuleResolutions.clear();
        closeTypeRootsWatch();
        resolvedModuleNames.clear();
        resolvedTypeReferenceDirectives.clear();
        resolvedFileToResolution.clear();
        resolutionsWithFailedLookups.clear();
        resolutionsWithOnlyAffectingLocations.clear();
        failedLookupChecks = undefined;
        startsWithPathChecks = undefined;
        isInDirectoryChecks = undefined;
        affectingPathChecks = undefined;
        affectingPathChecksForFile = undefined;
        allModuleAndTypeResolutionsAreInvalidated = false;
        moduleResolutionCache.clear();
        typeReferenceDirectiveResolutionCache.clear();
        moduleResolutionCache.update(resolutionHost.getCompilationSettings());
        typeReferenceDirectiveResolutionCache.update(resolutionHost.getCompilationSettings());
        libraryResolutionCache.clear();
        impliedFormatPackageJsons.clear();
        resolvedLibraries.clear();
        hasChangedAutomaticTypeDirectiveNames = false;
    }
    function onChangesAffectModuleResolution() {
        allModuleAndTypeResolutionsAreInvalidated = true;
        moduleResolutionCache.clearAllExceptPackageJsonInfoCache();
        typeReferenceDirectiveResolutionCache.clearAllExceptPackageJsonInfoCache();
        moduleResolutionCache.update(resolutionHost.getCompilationSettings());
        typeReferenceDirectiveResolutionCache.update(resolutionHost.getCompilationSettings());
    }
    function startRecordingFilesWithChangedResolutions() {
        filesWithChangedSetOfUnresolvedImports = [];
    }
    function finishRecordingFilesWithChangedResolutions() {
        var collected = filesWithChangedSetOfUnresolvedImports;
        filesWithChangedSetOfUnresolvedImports = undefined;
        return collected;
    }
    function isFileWithInvalidatedNonRelativeUnresolvedImports(path) {
        if (!filesWithInvalidatedNonRelativeUnresolvedImports) {
            return false;
        }
        // Invalidated if file has unresolved imports
        var value = filesWithInvalidatedNonRelativeUnresolvedImports.get(path);
        return !!value && !!value.length;
    }
    function createHasInvalidatedResolutions(customHasInvalidatedResolutions, customHasInvalidatedLibResolutions) {
        // Ensure pending resolutions are applied
        invalidateResolutionsOfFailedLookupLocations();
        var collected = filesWithInvalidatedResolutions;
        filesWithInvalidatedResolutions = undefined;
        return {
            hasInvalidatedResolutions: function (path) { return customHasInvalidatedResolutions(path) ||
                allModuleAndTypeResolutionsAreInvalidated ||
                !!(collected === null || collected === void 0 ? void 0 : collected.has(path)) ||
                isFileWithInvalidatedNonRelativeUnresolvedImports(path); },
            hasInvalidatedLibResolutions: function (libFileName) {
                var _a;
                return customHasInvalidatedLibResolutions(libFileName) ||
                    !!((_a = resolvedLibraries === null || resolvedLibraries === void 0 ? void 0 : resolvedLibraries.get(libFileName)) === null || _a === void 0 ? void 0 : _a.isInvalidated);
            },
        };
    }
    function startCachingPerDirectoryResolution() {
        moduleResolutionCache.clearAllExceptPackageJsonInfoCache();
        typeReferenceDirectiveResolutionCache.clearAllExceptPackageJsonInfoCache();
        libraryResolutionCache.clearAllExceptPackageJsonInfoCache();
        // perDirectoryResolvedModuleNames and perDirectoryResolvedTypeReferenceDirectives could be non empty if there was exception during program update
        // (between startCachingPerDirectoryResolution and finishCachingPerDirectoryResolution)
        nonRelativeExternalModuleResolutions.forEach(watchFailedLookupLocationOfNonRelativeModuleResolutions);
        nonRelativeExternalModuleResolutions.clear();
    }
    function cleanupLibResolutionWatching(newProgram) {
        resolvedLibraries.forEach(function (resolution, libFileName) {
            var _a;
            if (!((_a = newProgram === null || newProgram === void 0 ? void 0 : newProgram.resolvedLibReferences) === null || _a === void 0 ? void 0 : _a.has(libFileName))) {
                stopWatchFailedLookupLocationOfResolution(resolution, resolutionHost.toPath((0, ts_1.getInferredLibraryNameResolveFrom)(newProgram.getCompilerOptions(), getCurrentDirectory(), libFileName)), getResolvedModule);
                resolvedLibraries.delete(libFileName);
            }
        });
    }
    function finishCachingPerDirectoryResolution(newProgram, oldProgram) {
        filesWithInvalidatedNonRelativeUnresolvedImports = undefined;
        allModuleAndTypeResolutionsAreInvalidated = false;
        nonRelativeExternalModuleResolutions.forEach(watchFailedLookupLocationOfNonRelativeModuleResolutions);
        nonRelativeExternalModuleResolutions.clear();
        // Update file watches
        if (newProgram !== oldProgram) {
            cleanupLibResolutionWatching(newProgram);
            newProgram === null || newProgram === void 0 ? void 0 : newProgram.getSourceFiles().forEach(function (newFile) {
                var _a, _b, _c;
                var expected = (0, ts_1.isExternalOrCommonJsModule)(newFile) ? (_b = (_a = newFile.packageJsonLocations) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0 : 0;
                var existing = (_c = impliedFormatPackageJsons.get(newFile.path)) !== null && _c !== void 0 ? _c : ts_1.emptyArray;
                for (var i = existing.length; i < expected; i++) {
                    createFileWatcherOfAffectingLocation(newFile.packageJsonLocations[i], /*forResolution*/ false);
                }
                if (existing.length > expected) {
                    for (var i = expected; i < existing.length; i++) {
                        fileWatchesOfAffectingLocations.get(existing[i]).files--;
                    }
                }
                if (expected)
                    impliedFormatPackageJsons.set(newFile.path, newFile.packageJsonLocations);
                else
                    impliedFormatPackageJsons.delete(newFile.path);
            });
            impliedFormatPackageJsons.forEach(function (existing, path) {
                if (!(newProgram === null || newProgram === void 0 ? void 0 : newProgram.getSourceFileByPath(path))) {
                    existing.forEach(function (location) { return fileWatchesOfAffectingLocations.get(location).files--; });
                    impliedFormatPackageJsons.delete(path);
                }
            });
        }
        directoryWatchesOfFailedLookups.forEach(function (watcher, path) {
            if (watcher.refCount === 0) {
                directoryWatchesOfFailedLookups.delete(path);
                watcher.watcher.close();
            }
        });
        fileWatchesOfAffectingLocations.forEach(function (watcher, path) {
            if (watcher.files === 0 && watcher.resolutions === 0) {
                fileWatchesOfAffectingLocations.delete(path);
                watcher.watcher.close();
            }
        });
        hasChangedAutomaticTypeDirectiveNames = false;
    }
    function resolveModuleName(moduleName, containingFile, compilerOptions, redirectedReference, mode) {
        var _a;
        var host = ((_a = resolutionHost.getCompilerHost) === null || _a === void 0 ? void 0 : _a.call(resolutionHost)) || resolutionHost;
        var primaryResult = (0, ts_1.resolveModuleName)(moduleName, containingFile, compilerOptions, host, moduleResolutionCache, redirectedReference, mode);
        // return result immediately only if global cache support is not enabled or if it is .ts, .tsx or .d.ts
        if (!resolutionHost.getGlobalCache) {
            return primaryResult;
        }
        // otherwise try to load typings from @types
        var globalCache = resolutionHost.getGlobalCache();
        if (globalCache !== undefined && !(0, ts_1.isExternalModuleNameRelative)(moduleName) && !(primaryResult.resolvedModule && (0, ts_1.extensionIsTS)(primaryResult.resolvedModule.extension))) {
            // create different collection of failed lookup locations for second pass
            // if it will fail and we've already found something during the first pass - we don't want to pollute its results
            var _b = (0, ts_1.loadModuleFromGlobalCache)(ts_1.Debug.checkDefined(resolutionHost.globalCacheResolutionModuleName)(moduleName), resolutionHost.projectName, compilerOptions, host, globalCache, moduleResolutionCache), resolvedModule = _b.resolvedModule, failedLookupLocations = _b.failedLookupLocations, affectingLocations = _b.affectingLocations, resolutionDiagnostics = _b.resolutionDiagnostics;
            if (resolvedModule) {
                // Modify existing resolution so its saved in the directory cache as well
                primaryResult.resolvedModule = resolvedModule;
                primaryResult.failedLookupLocations = (0, ts_1.updateResolutionField)(primaryResult.failedLookupLocations, failedLookupLocations);
                primaryResult.affectingLocations = (0, ts_1.updateResolutionField)(primaryResult.affectingLocations, affectingLocations);
                primaryResult.resolutionDiagnostics = (0, ts_1.updateResolutionField)(primaryResult.resolutionDiagnostics, resolutionDiagnostics);
                return primaryResult;
            }
        }
        // Default return the result from the first pass
        return primaryResult;
    }
    function createModuleResolutionLoader(containingFile, redirectedReference, options) {
        return {
            nameAndMode: ts_1.moduleResolutionNameAndModeGetter,
            resolve: function (moduleName, resoluionMode) { return resolveModuleName(moduleName, containingFile, options, redirectedReference, resoluionMode); },
        };
    }
    function resolveNamesWithLocalCache(_a) {
        var _b;
        var entries = _a.entries, containingFile = _a.containingFile, containingSourceFile = _a.containingSourceFile, redirectedReference = _a.redirectedReference, options = _a.options, perFileCache = _a.perFileCache, reusedNames = _a.reusedNames, loader = _a.loader, getResolutionWithResolvedFileName = _a.getResolutionWithResolvedFileName, deferWatchingNonRelativeResolution = _a.deferWatchingNonRelativeResolution, shouldRetryResolution = _a.shouldRetryResolution, logChanges = _a.logChanges;
        var path = resolutionHost.toPath(containingFile);
        var resolutionsInFile = perFileCache.get(path) || perFileCache.set(path, (0, ts_1.createModeAwareCache)()).get(path);
        var resolvedModules = [];
        var hasInvalidatedNonRelativeUnresolvedImport = logChanges && isFileWithInvalidatedNonRelativeUnresolvedImports(path);
        // All the resolutions in this file are invalidated if this file wasn't resolved using same redirect
        var program = resolutionHost.getCurrentProgram();
        var oldRedirect = program && program.getResolvedProjectReferenceToRedirect(containingFile);
        var unmatchedRedirects = oldRedirect ?
            !redirectedReference || redirectedReference.sourceFile.path !== oldRedirect.sourceFile.path :
            !!redirectedReference;
        var seenNamesInFile = (0, ts_1.createModeAwareCache)();
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var name_1 = loader.nameAndMode.getName(entry);
            var mode = loader.nameAndMode.getMode(entry, containingSourceFile);
            var resolution = resolutionsInFile.get(name_1, mode);
            // Resolution is valid if it is present and not invalidated
            if (!seenNamesInFile.has(name_1, mode) &&
                (allModuleAndTypeResolutionsAreInvalidated || unmatchedRedirects || !resolution || resolution.isInvalidated ||
                    // If the name is unresolved import that was invalidated, recalculate
                    (hasInvalidatedNonRelativeUnresolvedImport && !(0, ts_1.isExternalModuleNameRelative)(name_1) && shouldRetryResolution(resolution)))) {
                var existingResolution = resolution;
                resolution = loader.resolve(name_1, mode);
                if (resolutionHost.onDiscoveredSymlink && resolutionIsSymlink(resolution)) {
                    resolutionHost.onDiscoveredSymlink();
                }
                resolutionsInFile.set(name_1, mode, resolution);
                watchFailedLookupLocationsOfExternalModuleResolutions(name_1, resolution, path, getResolutionWithResolvedFileName, deferWatchingNonRelativeResolution);
                if (existingResolution) {
                    stopWatchFailedLookupLocationOfResolution(existingResolution, path, getResolutionWithResolvedFileName);
                }
                if (logChanges && filesWithChangedSetOfUnresolvedImports && !resolutionIsEqualTo(existingResolution, resolution)) {
                    filesWithChangedSetOfUnresolvedImports.push(path);
                    // reset log changes to avoid recording the same file multiple times
                    logChanges = false;
                }
            }
            else {
                var host = ((_b = resolutionHost.getCompilerHost) === null || _b === void 0 ? void 0 : _b.call(resolutionHost)) || resolutionHost;
                if ((0, ts_1.isTraceEnabled)(options, host) && !seenNamesInFile.has(name_1, mode)) {
                    var resolved = getResolutionWithResolvedFileName(resolution);
                    (0, ts_1.trace)(host, perFileCache === resolvedModuleNames ?
                        (resolved === null || resolved === void 0 ? void 0 : resolved.resolvedFileName) ?
                            resolved.packageId ?
                                ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2_with_Package_ID_3 :
                                ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2 :
                            ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_not_resolved :
                        (resolved === null || resolved === void 0 ? void 0 : resolved.resolvedFileName) ?
                            resolved.packageId ?
                                ts_1.Diagnostics.Reusing_resolution_of_type_reference_directive_0_from_1_of_old_program_it_was_successfully_resolved_to_2_with_Package_ID_3 :
                                ts_1.Diagnostics.Reusing_resolution_of_type_reference_directive_0_from_1_of_old_program_it_was_successfully_resolved_to_2 :
                            ts_1.Diagnostics.Reusing_resolution_of_type_reference_directive_0_from_1_of_old_program_it_was_not_resolved, name_1, containingFile, resolved === null || resolved === void 0 ? void 0 : resolved.resolvedFileName, (resolved === null || resolved === void 0 ? void 0 : resolved.packageId) && (0, ts_1.packageIdToString)(resolved.packageId));
                }
            }
            ts_1.Debug.assert(resolution !== undefined && !resolution.isInvalidated);
            seenNamesInFile.set(name_1, mode, true);
            resolvedModules.push(resolution);
        }
        reusedNames === null || reusedNames === void 0 ? void 0 : reusedNames.forEach(function (entry) { return seenNamesInFile.set(loader.nameAndMode.getName(entry), loader.nameAndMode.getMode(entry, containingSourceFile), true); });
        if (resolutionsInFile.size() !== seenNamesInFile.size()) {
            // Stop watching and remove the unused name
            resolutionsInFile.forEach(function (resolution, name, mode) {
                if (!seenNamesInFile.has(name, mode)) {
                    stopWatchFailedLookupLocationOfResolution(resolution, path, getResolutionWithResolvedFileName);
                    resolutionsInFile.delete(name, mode);
                }
            });
        }
        return resolvedModules;
        function resolutionIsEqualTo(oldResolution, newResolution) {
            if (oldResolution === newResolution) {
                return true;
            }
            if (!oldResolution || !newResolution) {
                return false;
            }
            var oldResult = getResolutionWithResolvedFileName(oldResolution);
            var newResult = getResolutionWithResolvedFileName(newResolution);
            if (oldResult === newResult) {
                return true;
            }
            if (!oldResult || !newResult) {
                return false;
            }
            return oldResult.resolvedFileName === newResult.resolvedFileName;
        }
    }
    function resolveTypeReferenceDirectiveReferences(typeDirectiveReferences, containingFile, redirectedReference, options, containingSourceFile, reusedNames) {
        var _a;
        return resolveNamesWithLocalCache({
            entries: typeDirectiveReferences,
            containingFile: containingFile,
            containingSourceFile: containingSourceFile,
            redirectedReference: redirectedReference,
            options: options,
            reusedNames: reusedNames,
            perFileCache: resolvedTypeReferenceDirectives,
            loader: (0, ts_1.createTypeReferenceResolutionLoader)(containingFile, redirectedReference, options, ((_a = resolutionHost.getCompilerHost) === null || _a === void 0 ? void 0 : _a.call(resolutionHost)) || resolutionHost, typeReferenceDirectiveResolutionCache),
            getResolutionWithResolvedFileName: getResolvedTypeReferenceDirective,
            shouldRetryResolution: function (resolution) { return resolution.resolvedTypeReferenceDirective === undefined; },
            deferWatchingNonRelativeResolution: false,
        });
    }
    function resolveModuleNameLiterals(moduleLiterals, containingFile, redirectedReference, options, containingSourceFile, reusedNames) {
        return resolveNamesWithLocalCache({
            entries: moduleLiterals,
            containingFile: containingFile,
            containingSourceFile: containingSourceFile,
            redirectedReference: redirectedReference,
            options: options,
            reusedNames: reusedNames,
            perFileCache: resolvedModuleNames,
            loader: createModuleResolutionLoader(containingFile, redirectedReference, options),
            getResolutionWithResolvedFileName: getResolvedModule,
            shouldRetryResolution: function (resolution) { return !resolution.resolvedModule || !(0, ts_1.resolutionExtensionIsTSOrJson)(resolution.resolvedModule.extension); },
            logChanges: logChangesWhenResolvingModule,
            deferWatchingNonRelativeResolution: true, // Defer non relative resolution watch because we could be using ambient modules
        });
    }
    function resolveLibrary(libraryName, resolveFrom, options, libFileName) {
        var _a;
        var host = ((_a = resolutionHost.getCompilerHost) === null || _a === void 0 ? void 0 : _a.call(resolutionHost)) || resolutionHost;
        var resolution = resolvedLibraries === null || resolvedLibraries === void 0 ? void 0 : resolvedLibraries.get(libFileName);
        if (!resolution || resolution.isInvalidated) {
            var existingResolution = resolution;
            resolution = (0, ts_1.resolveLibrary)(libraryName, resolveFrom, options, host, libraryResolutionCache);
            var path = resolutionHost.toPath(resolveFrom);
            watchFailedLookupLocationsOfExternalModuleResolutions(libraryName, resolution, path, getResolvedModule, /*deferWatchingNonRelativeResolution*/ false);
            resolvedLibraries.set(libFileName, resolution);
            if (existingResolution) {
                stopWatchFailedLookupLocationOfResolution(existingResolution, path, getResolvedModule);
            }
        }
        else {
            if ((0, ts_1.isTraceEnabled)(options, host)) {
                var resolved = getResolvedModule(resolution);
                (0, ts_1.trace)(host, (resolved === null || resolved === void 0 ? void 0 : resolved.resolvedFileName) ?
                    resolved.packageId ?
                        ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2_with_Package_ID_3 :
                        ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_successfully_resolved_to_2 :
                    ts_1.Diagnostics.Reusing_resolution_of_module_0_from_1_of_old_program_it_was_not_resolved, libraryName, resolveFrom, resolved === null || resolved === void 0 ? void 0 : resolved.resolvedFileName, (resolved === null || resolved === void 0 ? void 0 : resolved.packageId) && (0, ts_1.packageIdToString)(resolved.packageId));
            }
        }
        return resolution;
    }
    function resolveSingleModuleNameWithoutWatching(moduleName, containingFile) {
        var path = resolutionHost.toPath(containingFile);
        var resolutionsInFile = resolvedModuleNames.get(path);
        var resolution = resolutionsInFile === null || resolutionsInFile === void 0 ? void 0 : resolutionsInFile.get(moduleName, /*mode*/ undefined);
        if (resolution && !resolution.isInvalidated)
            return resolution;
        return resolveModuleName(moduleName, containingFile, resolutionHost.getCompilationSettings());
    }
    function isNodeModulesAtTypesDirectory(dirPath) {
        return (0, ts_1.endsWith)(dirPath, "/node_modules/@types");
    }
    function watchFailedLookupLocationsOfExternalModuleResolutions(name, resolution, filePath, getResolutionWithResolvedFileName, deferWatchingNonRelativeResolution) {
        var _a, _b;
        if (resolution.refCount) {
            resolution.refCount++;
            ts_1.Debug.assertIsDefined(resolution.files);
        }
        else {
            resolution.refCount = 1;
            ts_1.Debug.assert(!((_a = resolution.files) === null || _a === void 0 ? void 0 : _a.size)); // This resolution shouldnt be referenced by any file yet
            if (!deferWatchingNonRelativeResolution || (0, ts_1.isExternalModuleNameRelative)(name)) {
                watchFailedLookupLocationOfResolution(resolution);
            }
            else {
                nonRelativeExternalModuleResolutions.add(name, resolution);
            }
            var resolved = getResolutionWithResolvedFileName(resolution);
            if (resolved && resolved.resolvedFileName) {
                var key = resolutionHost.toPath(resolved.resolvedFileName);
                var resolutions = resolvedFileToResolution.get(key);
                if (!resolutions)
                    resolvedFileToResolution.set(key, resolutions = new Set());
                resolutions.add(resolution);
            }
        }
        ((_b = resolution.files) !== null && _b !== void 0 ? _b : (resolution.files = new Set())).add(filePath);
    }
    function watchFailedLookupLocation(failedLookupLocation, setAtRoot) {
        var failedLookupLocationPath = resolutionHost.toPath(failedLookupLocation);
        var toWatch = getDirectoryToWatchFailedLookupLocation(failedLookupLocation, failedLookupLocationPath, rootDir, rootPath, rootPathComponents, getCurrentDirectory);
        if (toWatch) {
            var dir = toWatch.dir, dirPath = toWatch.dirPath, nonRecursive = toWatch.nonRecursive;
            if (dirPath === rootPath) {
                ts_1.Debug.assert(nonRecursive);
                setAtRoot = true;
            }
            else {
                setDirectoryWatcher(dir, dirPath, nonRecursive);
            }
        }
        return setAtRoot;
    }
    function watchFailedLookupLocationOfResolution(resolution) {
        ts_1.Debug.assert(!!resolution.refCount);
        var failedLookupLocations = resolution.failedLookupLocations, affectingLocations = resolution.affectingLocations, node10Result = resolution.node10Result;
        if (!(failedLookupLocations === null || failedLookupLocations === void 0 ? void 0 : failedLookupLocations.length) && !(affectingLocations === null || affectingLocations === void 0 ? void 0 : affectingLocations.length) && !node10Result)
            return;
        if ((failedLookupLocations === null || failedLookupLocations === void 0 ? void 0 : failedLookupLocations.length) || node10Result)
            resolutionsWithFailedLookups.add(resolution);
        var setAtRoot = false;
        if (failedLookupLocations) {
            for (var _i = 0, failedLookupLocations_1 = failedLookupLocations; _i < failedLookupLocations_1.length; _i++) {
                var failedLookupLocation = failedLookupLocations_1[_i];
                setAtRoot = watchFailedLookupLocation(failedLookupLocation, setAtRoot);
            }
        }
        if (node10Result)
            setAtRoot = watchFailedLookupLocation(node10Result, setAtRoot);
        if (setAtRoot) {
            // This is always non recursive
            setDirectoryWatcher(rootDir, rootPath, /*nonRecursive*/ true);
        }
        watchAffectingLocationsOfResolution(resolution, !(failedLookupLocations === null || failedLookupLocations === void 0 ? void 0 : failedLookupLocations.length) && !node10Result);
    }
    function watchAffectingLocationsOfResolution(resolution, addToResolutionsWithOnlyAffectingLocations) {
        ts_1.Debug.assert(!!resolution.refCount);
        var affectingLocations = resolution.affectingLocations;
        if (!(affectingLocations === null || affectingLocations === void 0 ? void 0 : affectingLocations.length))
            return;
        if (addToResolutionsWithOnlyAffectingLocations)
            resolutionsWithOnlyAffectingLocations.add(resolution);
        // Watch package json
        for (var _i = 0, affectingLocations_1 = affectingLocations; _i < affectingLocations_1.length; _i++) {
            var affectingLocation = affectingLocations_1[_i];
            createFileWatcherOfAffectingLocation(affectingLocation, /*forResolution*/ true);
        }
    }
    function createFileWatcherOfAffectingLocation(affectingLocation, forResolution) {
        var fileWatcher = fileWatchesOfAffectingLocations.get(affectingLocation);
        if (fileWatcher) {
            if (forResolution)
                fileWatcher.resolutions++;
            else
                fileWatcher.files++;
            return;
        }
        var locationToWatch = affectingLocation;
        if (resolutionHost.realpath) {
            locationToWatch = resolutionHost.realpath(affectingLocation);
            if (affectingLocation !== locationToWatch) {
                var fileWatcher_1 = fileWatchesOfAffectingLocations.get(locationToWatch);
                if (fileWatcher_1) {
                    if (forResolution)
                        fileWatcher_1.resolutions++;
                    else
                        fileWatcher_1.files++;
                    fileWatcher_1.paths.add(affectingLocation);
                    fileWatchesOfAffectingLocations.set(affectingLocation, fileWatcher_1);
                    return;
                }
            }
        }
        var paths = new Set();
        paths.add(locationToWatch);
        var actualWatcher = canWatchAffectingLocation(resolutionHost.toPath(locationToWatch)) ?
            resolutionHost.watchAffectingFileLocation(locationToWatch, function (fileName, eventKind) {
                cachedDirectoryStructureHost === null || cachedDirectoryStructureHost === void 0 ? void 0 : cachedDirectoryStructureHost.addOrDeleteFile(fileName, resolutionHost.toPath(locationToWatch), eventKind);
                var packageJsonMap = moduleResolutionCache.getPackageJsonInfoCache().getInternalMap();
                paths.forEach(function (path) {
                    if (watcher.resolutions)
                        (affectingPathChecks !== null && affectingPathChecks !== void 0 ? affectingPathChecks : (affectingPathChecks = new Set())).add(path);
                    if (watcher.files)
                        (affectingPathChecksForFile !== null && affectingPathChecksForFile !== void 0 ? affectingPathChecksForFile : (affectingPathChecksForFile = new Set())).add(path);
                    packageJsonMap === null || packageJsonMap === void 0 ? void 0 : packageJsonMap.delete(resolutionHost.toPath(path));
                });
                resolutionHost.scheduleInvalidateResolutionsOfFailedLookupLocations();
            }) : ts_1.noopFileWatcher;
        var watcher = {
            watcher: actualWatcher !== ts_1.noopFileWatcher ? {
                close: function () {
                    actualWatcher.close();
                    // Ensure when watching symlinked package.json, we can close the actual file watcher only once
                    actualWatcher = ts_1.noopFileWatcher;
                }
            } : actualWatcher,
            resolutions: forResolution ? 1 : 0,
            files: forResolution ? 0 : 1,
            paths: paths,
        };
        fileWatchesOfAffectingLocations.set(locationToWatch, watcher);
        if (affectingLocation !== locationToWatch) {
            fileWatchesOfAffectingLocations.set(affectingLocation, watcher);
            paths.add(affectingLocation);
        }
    }
    function watchFailedLookupLocationOfNonRelativeModuleResolutions(resolutions, name) {
        var program = resolutionHost.getCurrentProgram();
        if (!program || !program.getTypeChecker().tryFindAmbientModuleWithoutAugmentations(name)) {
            resolutions.forEach(watchFailedLookupLocationOfResolution);
        }
        else {
            resolutions.forEach(function (resolution) { return watchAffectingLocationsOfResolution(resolution, /*addToResolutionsWithOnlyAffectingLocations*/ true); });
        }
    }
    function setDirectoryWatcher(dir, dirPath, nonRecursive) {
        var dirWatcher = directoryWatchesOfFailedLookups.get(dirPath);
        if (dirWatcher) {
            ts_1.Debug.assert(!!nonRecursive === !!dirWatcher.nonRecursive);
            dirWatcher.refCount++;
        }
        else {
            directoryWatchesOfFailedLookups.set(dirPath, { watcher: createDirectoryWatcher(dir, dirPath, nonRecursive), refCount: 1, nonRecursive: nonRecursive });
        }
    }
    function stopWatchFailedLookupLocation(failedLookupLocation, removeAtRoot) {
        var failedLookupLocationPath = resolutionHost.toPath(failedLookupLocation);
        var toWatch = getDirectoryToWatchFailedLookupLocation(failedLookupLocation, failedLookupLocationPath, rootDir, rootPath, rootPathComponents, getCurrentDirectory);
        if (toWatch) {
            var dirPath = toWatch.dirPath;
            if (dirPath === rootPath) {
                removeAtRoot = true;
            }
            else {
                removeDirectoryWatcher(dirPath);
            }
        }
        return removeAtRoot;
    }
    function stopWatchFailedLookupLocationOfResolution(resolution, filePath, getResolutionWithResolvedFileName) {
        ts_1.Debug.checkDefined(resolution.files).delete(filePath);
        resolution.refCount--;
        if (resolution.refCount) {
            return;
        }
        var resolved = getResolutionWithResolvedFileName(resolution);
        if (resolved && resolved.resolvedFileName) {
            var key = resolutionHost.toPath(resolved.resolvedFileName);
            var resolutions = resolvedFileToResolution.get(key);
            if ((resolutions === null || resolutions === void 0 ? void 0 : resolutions.delete(resolution)) && !resolutions.size)
                resolvedFileToResolution.delete(key);
        }
        var failedLookupLocations = resolution.failedLookupLocations, affectingLocations = resolution.affectingLocations, node10Result = resolution.node10Result;
        if (resolutionsWithFailedLookups.delete(resolution)) {
            var removeAtRoot = false;
            if (failedLookupLocations) {
                for (var _i = 0, failedLookupLocations_2 = failedLookupLocations; _i < failedLookupLocations_2.length; _i++) {
                    var failedLookupLocation = failedLookupLocations_2[_i];
                    removeAtRoot = stopWatchFailedLookupLocation(failedLookupLocation, removeAtRoot);
                }
            }
            if (node10Result)
                removeAtRoot = stopWatchFailedLookupLocation(node10Result, removeAtRoot);
            if (removeAtRoot)
                removeDirectoryWatcher(rootPath);
        }
        else if (affectingLocations === null || affectingLocations === void 0 ? void 0 : affectingLocations.length) {
            resolutionsWithOnlyAffectingLocations.delete(resolution);
        }
        if (affectingLocations) {
            for (var _a = 0, affectingLocations_2 = affectingLocations; _a < affectingLocations_2.length; _a++) {
                var affectingLocation = affectingLocations_2[_a];
                var watcher = fileWatchesOfAffectingLocations.get(affectingLocation);
                watcher.resolutions--;
            }
        }
    }
    function removeDirectoryWatcher(dirPath) {
        var dirWatcher = directoryWatchesOfFailedLookups.get(dirPath);
        // Do not close the watcher yet since it might be needed by other failed lookup locations.
        dirWatcher.refCount--;
    }
    function createDirectoryWatcher(directory, dirPath, nonRecursive) {
        return resolutionHost.watchDirectoryOfFailedLookupLocation(directory, function (fileOrDirectory) {
            var fileOrDirectoryPath = resolutionHost.toPath(fileOrDirectory);
            if (cachedDirectoryStructureHost) {
                // Since the file existence changed, update the sourceFiles cache
                cachedDirectoryStructureHost.addOrDeleteFileOrDirectory(fileOrDirectory, fileOrDirectoryPath);
            }
            scheduleInvalidateResolutionOfFailedLookupLocation(fileOrDirectoryPath, dirPath === fileOrDirectoryPath);
        }, nonRecursive ? 0 /* WatchDirectoryFlags.None */ : 1 /* WatchDirectoryFlags.Recursive */);
    }
    function removeResolutionsOfFileFromCache(cache, filePath, getResolutionWithResolvedFileName) {
        // Deleted file, stop watching failed lookups for all the resolutions in the file
        var resolutions = cache.get(filePath);
        if (resolutions) {
            resolutions.forEach(function (resolution) { return stopWatchFailedLookupLocationOfResolution(resolution, filePath, getResolutionWithResolvedFileName); });
            cache.delete(filePath);
        }
    }
    function removeResolutionsFromProjectReferenceRedirects(filePath) {
        if (!(0, ts_1.fileExtensionIs)(filePath, ".json" /* Extension.Json */))
            return;
        var program = resolutionHost.getCurrentProgram();
        if (!program)
            return;
        // If this file is input file for the referenced project, get it
        var resolvedProjectReference = program.getResolvedProjectReferenceByPath(filePath);
        if (!resolvedProjectReference)
            return;
        // filePath is for the projectReference and the containing file is from this project reference, invalidate the resolution
        resolvedProjectReference.commandLine.fileNames.forEach(function (f) { return removeResolutionsOfFile(resolutionHost.toPath(f)); });
    }
    function removeResolutionsOfFile(filePath) {
        removeResolutionsOfFileFromCache(resolvedModuleNames, filePath, getResolvedModule);
        removeResolutionsOfFileFromCache(resolvedTypeReferenceDirectives, filePath, getResolvedTypeReferenceDirective);
    }
    function invalidateResolutions(resolutions, canInvalidate) {
        if (!resolutions)
            return false;
        var invalidated = false;
        resolutions.forEach(function (resolution) {
            if (resolution.isInvalidated || !canInvalidate(resolution))
                return;
            resolution.isInvalidated = invalidated = true;
            for (var _i = 0, _a = ts_1.Debug.checkDefined(resolution.files); _i < _a.length; _i++) {
                var containingFilePath = _a[_i];
                (filesWithInvalidatedResolutions !== null && filesWithInvalidatedResolutions !== void 0 ? filesWithInvalidatedResolutions : (filesWithInvalidatedResolutions = new Set())).add(containingFilePath);
                // When its a file with inferred types resolution, invalidate type reference directive resolution
                hasChangedAutomaticTypeDirectiveNames = hasChangedAutomaticTypeDirectiveNames || (0, ts_1.endsWith)(containingFilePath, ts_1.inferredTypesContainingFile);
            }
        });
        return invalidated;
    }
    function invalidateResolutionOfFile(filePath) {
        removeResolutionsOfFile(filePath);
        // Resolution is invalidated if the resulting file name is same as the deleted file path
        var prevHasChangedAutomaticTypeDirectiveNames = hasChangedAutomaticTypeDirectiveNames;
        if (invalidateResolutions(resolvedFileToResolution.get(filePath), ts_1.returnTrue) &&
            hasChangedAutomaticTypeDirectiveNames &&
            !prevHasChangedAutomaticTypeDirectiveNames) {
            resolutionHost.onChangedAutomaticTypeDirectiveNames();
        }
    }
    function setFilesWithInvalidatedNonRelativeUnresolvedImports(filesMap) {
        ts_1.Debug.assert(filesWithInvalidatedNonRelativeUnresolvedImports === filesMap || filesWithInvalidatedNonRelativeUnresolvedImports === undefined);
        filesWithInvalidatedNonRelativeUnresolvedImports = filesMap;
    }
    function scheduleInvalidateResolutionOfFailedLookupLocation(fileOrDirectoryPath, isCreatingWatchedDirectory) {
        if (isCreatingWatchedDirectory) {
            // Watching directory is created
            // Invalidate any resolution has failed lookup in this directory
            (isInDirectoryChecks || (isInDirectoryChecks = new Set())).add(fileOrDirectoryPath);
        }
        else {
            // If something to do with folder/file starting with "." in node_modules folder, skip it
            var updatedPath = removeIgnoredPath(fileOrDirectoryPath);
            if (!updatedPath)
                return false;
            fileOrDirectoryPath = updatedPath;
            // prevent saving an open file from over-eagerly triggering invalidation
            if (resolutionHost.fileIsOpen(fileOrDirectoryPath)) {
                return false;
            }
            // Some file or directory in the watching directory is created
            // Return early if it does not have any of the watching extension or not the custom failed lookup path
            var dirOfFileOrDirectory = (0, ts_1.getDirectoryPath)(fileOrDirectoryPath);
            if (isNodeModulesAtTypesDirectory(fileOrDirectoryPath) || (0, ts_1.isNodeModulesDirectory)(fileOrDirectoryPath) ||
                isNodeModulesAtTypesDirectory(dirOfFileOrDirectory) || (0, ts_1.isNodeModulesDirectory)(dirOfFileOrDirectory)) {
                // Invalidate any resolution from this directory
                (failedLookupChecks || (failedLookupChecks = new Set())).add(fileOrDirectoryPath);
                (startsWithPathChecks || (startsWithPathChecks = new Set())).add(fileOrDirectoryPath);
            }
            else {
                // Ignore emits from the program
                if ((0, ts_1.isEmittedFileOfProgram)(resolutionHost.getCurrentProgram(), fileOrDirectoryPath)) {
                    return false;
                }
                // Ignore .map files
                if ((0, ts_1.fileExtensionIs)(fileOrDirectoryPath, ".map")) {
                    return false;
                }
                // Resolution need to be invalidated if failed lookup location is same as the file or directory getting created
                (failedLookupChecks || (failedLookupChecks = new Set())).add(fileOrDirectoryPath);
                // If the invalidated file is from a node_modules package, invalidate everything else
                // in the package since we might not get notifications for other files in the package.
                // This hardens our logic against unreliable file watchers.
                var packagePath = (0, ts_1.parseNodeModuleFromPath)(fileOrDirectoryPath, /*isFolder*/ true);
                if (packagePath)
                    (startsWithPathChecks || (startsWithPathChecks = new Set())).add(packagePath);
            }
        }
        resolutionHost.scheduleInvalidateResolutionsOfFailedLookupLocations();
    }
    function invalidatePackageJsonMap() {
        var packageJsonMap = moduleResolutionCache.getPackageJsonInfoCache().getInternalMap();
        if (packageJsonMap && (failedLookupChecks || startsWithPathChecks || isInDirectoryChecks)) {
            packageJsonMap.forEach(function (_value, path) { return isInvalidatedFailedLookup(path) ? packageJsonMap.delete(path) : undefined; });
        }
    }
    function invalidateResolutionsOfFailedLookupLocations() {
        var _a;
        if (allModuleAndTypeResolutionsAreInvalidated) {
            affectingPathChecksForFile = undefined;
            invalidatePackageJsonMap();
            if (failedLookupChecks || startsWithPathChecks || isInDirectoryChecks || affectingPathChecks) {
                invalidateResolutions(resolvedLibraries, canInvalidateFailedLookupResolution);
            }
            failedLookupChecks = undefined;
            startsWithPathChecks = undefined;
            isInDirectoryChecks = undefined;
            affectingPathChecks = undefined;
            return true;
        }
        var invalidated = false;
        if (affectingPathChecksForFile) {
            (_a = resolutionHost.getCurrentProgram()) === null || _a === void 0 ? void 0 : _a.getSourceFiles().forEach(function (f) {
                if ((0, ts_1.some)(f.packageJsonLocations, function (location) { return affectingPathChecksForFile.has(location); })) {
                    (filesWithInvalidatedResolutions !== null && filesWithInvalidatedResolutions !== void 0 ? filesWithInvalidatedResolutions : (filesWithInvalidatedResolutions = new Set())).add(f.path);
                    invalidated = true;
                }
            });
            affectingPathChecksForFile = undefined;
        }
        if (!failedLookupChecks && !startsWithPathChecks && !isInDirectoryChecks && !affectingPathChecks) {
            return invalidated;
        }
        invalidated = invalidateResolutions(resolutionsWithFailedLookups, canInvalidateFailedLookupResolution) || invalidated;
        invalidatePackageJsonMap();
        failedLookupChecks = undefined;
        startsWithPathChecks = undefined;
        isInDirectoryChecks = undefined;
        invalidated = invalidateResolutions(resolutionsWithOnlyAffectingLocations, canInvalidatedFailedLookupResolutionWithAffectingLocation) || invalidated;
        affectingPathChecks = undefined;
        return invalidated;
    }
    function canInvalidateFailedLookupResolution(resolution) {
        var _a;
        if (canInvalidatedFailedLookupResolutionWithAffectingLocation(resolution))
            return true;
        if (!failedLookupChecks && !startsWithPathChecks && !isInDirectoryChecks)
            return false;
        return ((_a = resolution.failedLookupLocations) === null || _a === void 0 ? void 0 : _a.some(function (location) { return isInvalidatedFailedLookup(resolutionHost.toPath(location)); })) ||
            (!!resolution.node10Result && isInvalidatedFailedLookup(resolutionHost.toPath(resolution.node10Result)));
    }
    function isInvalidatedFailedLookup(locationPath) {
        return (failedLookupChecks === null || failedLookupChecks === void 0 ? void 0 : failedLookupChecks.has(locationPath)) ||
            (0, ts_1.firstDefinedIterator)((startsWithPathChecks === null || startsWithPathChecks === void 0 ? void 0 : startsWithPathChecks.keys()) || [], function (fileOrDirectoryPath) { return (0, ts_1.startsWith)(locationPath, fileOrDirectoryPath) ? true : undefined; }) ||
            (0, ts_1.firstDefinedIterator)((isInDirectoryChecks === null || isInDirectoryChecks === void 0 ? void 0 : isInDirectoryChecks.keys()) || [], function (dirPath) { return locationPath.length > dirPath.length &&
                (0, ts_1.startsWith)(locationPath, dirPath) && ((0, ts_1.isDiskPathRoot)(dirPath) || locationPath[dirPath.length] === ts_1.directorySeparator) ? true : undefined; });
    }
    function canInvalidatedFailedLookupResolutionWithAffectingLocation(resolution) {
        var _a;
        return !!affectingPathChecks && ((_a = resolution.affectingLocations) === null || _a === void 0 ? void 0 : _a.some(function (location) { return affectingPathChecks.has(location); }));
    }
    function closeTypeRootsWatch() {
        (0, ts_1.clearMap)(typeRootsWatches, ts_1.closeFileWatcher);
    }
    function createTypeRootsWatch(typeRootPath, typeRoot) {
        // Create new watch and recursive info
        return canWatchTypeRootPath(typeRootPath) ?
            resolutionHost.watchTypeRootsDirectory(typeRoot, function (fileOrDirectory) {
                var fileOrDirectoryPath = resolutionHost.toPath(fileOrDirectory);
                if (cachedDirectoryStructureHost) {
                    // Since the file existence changed, update the sourceFiles cache
                    cachedDirectoryStructureHost.addOrDeleteFileOrDirectory(fileOrDirectory, fileOrDirectoryPath);
                }
                // For now just recompile
                // We could potentially store more data here about whether it was/would be really be used or not
                // and with that determine to trigger compilation but for now this is enough
                hasChangedAutomaticTypeDirectiveNames = true;
                resolutionHost.onChangedAutomaticTypeDirectiveNames();
                // Since directory watchers invoked are flaky, the failed lookup location events might not be triggered
                // So handle to failed lookup locations here as well to ensure we are invalidating resolutions
                var dirPath = getDirectoryToWatchFailedLookupLocationFromTypeRoot(typeRoot, typeRootPath, rootPath, rootPathComponents, getCurrentDirectory, function (dirPath) { return directoryWatchesOfFailedLookups.has(dirPath); });
                if (dirPath) {
                    scheduleInvalidateResolutionOfFailedLookupLocation(fileOrDirectoryPath, dirPath === fileOrDirectoryPath);
                }
            }, 1 /* WatchDirectoryFlags.Recursive */) :
            ts_1.noopFileWatcher;
    }
    /**
     * Watches the types that would get added as part of getAutomaticTypeDirectiveNames
     * To be called when compiler options change
     */
    function updateTypeRootsWatch() {
        var options = resolutionHost.getCompilationSettings();
        if (options.types) {
            // No need to do any watch since resolution cache is going to handle the failed lookups
            // for the types added by this
            closeTypeRootsWatch();
            return;
        }
        // we need to assume the directories exist to ensure that we can get all the type root directories that get included
        // But filter directories that are at root level to say directory doesnt exist, so that we arent watching them
        var typeRoots = (0, ts_1.getEffectiveTypeRoots)(options, { getCurrentDirectory: getCurrentDirectory });
        if (typeRoots) {
            (0, ts_1.mutateMap)(typeRootsWatches, (0, ts_1.arrayToMap)(typeRoots, function (tr) { return resolutionHost.toPath(tr); }), {
                createNewValue: createTypeRootsWatch,
                onDeleteValue: ts_1.closeFileWatcher
            });
        }
        else {
            closeTypeRootsWatch();
        }
    }
    function canWatchTypeRootPath(typeRoot) {
        // If type roots is specified, watch that path
        if (resolutionHost.getCompilationSettings().typeRoots)
            return true;
        // Otherwise can watch directory only if we can watch the parent directory of node_modules/@types
        return canWatchAtTypes(resolutionHost.toPath(typeRoot));
    }
}
exports.createResolutionCache = createResolutionCache;
function resolutionIsSymlink(resolution) {
    var _a, _b;
    return !!(((_a = resolution.resolvedModule) === null || _a === void 0 ? void 0 : _a.originalPath) ||
        ((_b = resolution.resolvedTypeReferenceDirective) === null || _b === void 0 ? void 0 : _b.originalPath));
}
