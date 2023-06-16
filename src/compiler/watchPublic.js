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
exports.createWatchProgram = exports.createWatchCompilerHost = exports.createIncrementalProgram = exports.createIncrementalCompilerHost = exports.readBuilderProgram = void 0;
var ts_1 = require("./_namespaces/ts");
function readBuilderProgram(compilerOptions, host) {
    var buildInfoPath = (0, ts_1.getTsBuildInfoEmitOutputFilePath)(compilerOptions);
    if (!buildInfoPath)
        return undefined;
    var buildInfo;
    if (host.getBuildInfo) {
        // host provides buildinfo, get it from there. This allows host to cache it
        buildInfo = host.getBuildInfo(buildInfoPath, compilerOptions.configFilePath);
    }
    else {
        var content = host.readFile(buildInfoPath);
        if (!content)
            return undefined;
        buildInfo = (0, ts_1.getBuildInfo)(buildInfoPath, content);
    }
    if (!buildInfo || buildInfo.version !== ts_1.version || !buildInfo.program)
        return undefined;
    return (0, ts_1.createBuilderProgramUsingProgramBuildInfo)(buildInfo, buildInfoPath, host);
}
exports.readBuilderProgram = readBuilderProgram;
function createIncrementalCompilerHost(options, system) {
    if (system === void 0) { system = ts_1.sys; }
    var host = (0, ts_1.createCompilerHostWorker)(options, /*setParentNodes*/ undefined, system);
    host.createHash = (0, ts_1.maybeBind)(system, system.createHash);
    host.storeFilesChangingSignatureDuringEmit = system.storeFilesChangingSignatureDuringEmit;
    (0, ts_1.setGetSourceFileAsHashVersioned)(host);
    (0, ts_1.changeCompilerHostLikeToUseCache)(host, function (fileName) { return (0, ts_1.toPath)(fileName, host.getCurrentDirectory(), host.getCanonicalFileName); });
    return host;
}
exports.createIncrementalCompilerHost = createIncrementalCompilerHost;
function createIncrementalProgram(_a) {
    var rootNames = _a.rootNames, options = _a.options, configFileParsingDiagnostics = _a.configFileParsingDiagnostics, projectReferences = _a.projectReferences, host = _a.host, createProgram = _a.createProgram;
    host = host || createIncrementalCompilerHost(options);
    createProgram = createProgram || ts_1.createEmitAndSemanticDiagnosticsBuilderProgram;
    var oldProgram = readBuilderProgram(options, host);
    return createProgram(rootNames, options, host, oldProgram, configFileParsingDiagnostics, projectReferences);
}
exports.createIncrementalProgram = createIncrementalProgram;
function createWatchCompilerHost(rootFilesOrConfigFileName, options, system, createProgram, reportDiagnostic, reportWatchStatus, projectReferencesOrWatchOptionsToExtend, watchOptionsOrExtraFileExtensions) {
    if ((0, ts_1.isArray)(rootFilesOrConfigFileName)) {
        return (0, ts_1.createWatchCompilerHostOfFilesAndCompilerOptions)({
            rootFiles: rootFilesOrConfigFileName,
            options: options,
            watchOptions: watchOptionsOrExtraFileExtensions,
            projectReferences: projectReferencesOrWatchOptionsToExtend,
            system: system,
            createProgram: createProgram,
            reportDiagnostic: reportDiagnostic,
            reportWatchStatus: reportWatchStatus,
        });
    }
    else {
        return (0, ts_1.createWatchCompilerHostOfConfigFile)({
            configFileName: rootFilesOrConfigFileName,
            optionsToExtend: options,
            watchOptionsToExtend: projectReferencesOrWatchOptionsToExtend,
            extraFileExtensions: watchOptionsOrExtraFileExtensions,
            system: system,
            createProgram: createProgram,
            reportDiagnostic: reportDiagnostic,
            reportWatchStatus: reportWatchStatus,
        });
    }
}
exports.createWatchCompilerHost = createWatchCompilerHost;
function createWatchProgram(host) {
    var builderProgram;
    var reloadLevel; // level to indicate if the program needs to be reloaded from config file/just filenames etc
    var missingFilesMap; // Map of file watchers for the missing files
    var watchedWildcardDirectories; // map of watchers for the wild card directories in the config file
    var timerToUpdateProgram; // timer callback to recompile the program
    var timerToInvalidateFailedLookupResolutions; // timer callback to invalidate resolutions for changes in failed lookup locations
    var parsedConfigs; // Parsed commandline and watching cached for referenced projects
    var sharedExtendedConfigFileWatchers; // Map of file watchers for extended files, shared between different referenced projects
    var extendedConfigCache = host.extendedConfigCache; // Cache for extended config evaluation
    var reportFileChangeDetectedOnCreateProgram = false; // True if synchronizeProgram should report "File change detected..." when a new program is created
    var sourceFilesCache = new Map(); // Cache that stores the source file and version info
    var missingFilePathsRequestedForRelease; // These paths are held temporarily so that we can remove the entry from source file cache if the file is not tracked by missing files
    var hasChangedCompilerOptions = false; // True if the compiler options have changed between compilations
    var useCaseSensitiveFileNames = host.useCaseSensitiveFileNames();
    var currentDirectory = host.getCurrentDirectory();
    var configFileName = host.configFileName, _a = host.optionsToExtend, optionsToExtendForConfigFile = _a === void 0 ? {} : _a, watchOptionsToExtend = host.watchOptionsToExtend, extraFileExtensions = host.extraFileExtensions, createProgram = host.createProgram;
    var rootFileNames = host.rootFiles, compilerOptions = host.options, watchOptions = host.watchOptions, projectReferences = host.projectReferences;
    var wildcardDirectories;
    var configFileParsingDiagnostics;
    var canConfigFileJsonReportNoInputFiles = false;
    var hasChangedConfigFileParsingErrors = false;
    var cachedDirectoryStructureHost = configFileName === undefined ? undefined : (0, ts_1.createCachedDirectoryStructureHost)(host, currentDirectory, useCaseSensitiveFileNames);
    var directoryStructureHost = cachedDirectoryStructureHost || host;
    var parseConfigFileHost = (0, ts_1.parseConfigHostFromCompilerHostLike)(host, directoryStructureHost);
    // From tsc we want to get already parsed result and hence check for rootFileNames
    var newLine = updateNewLine();
    if (configFileName && host.configFileParsingResult) {
        setConfigFileParsingResult(host.configFileParsingResult);
        newLine = updateNewLine();
    }
    reportWatchDiagnostic(ts_1.Diagnostics.Starting_compilation_in_watch_mode);
    if (configFileName && !host.configFileParsingResult) {
        newLine = (0, ts_1.getNewLineCharacter)(optionsToExtendForConfigFile);
        ts_1.Debug.assert(!rootFileNames);
        parseConfigFile();
        newLine = updateNewLine();
    }
    ts_1.Debug.assert(compilerOptions);
    ts_1.Debug.assert(rootFileNames);
    var _b = (0, ts_1.createWatchFactory)(host, compilerOptions), watchFile = _b.watchFile, watchDirectory = _b.watchDirectory, writeLog = _b.writeLog;
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    writeLog("Current directory: ".concat(currentDirectory, " CaseSensitiveFileNames: ").concat(useCaseSensitiveFileNames));
    var configFileWatcher;
    if (configFileName) {
        configFileWatcher = watchFile(configFileName, scheduleProgramReload, ts_1.PollingInterval.High, watchOptions, ts_1.WatchType.ConfigFile);
    }
    var compilerHost = (0, ts_1.createCompilerHostFromProgramHost)(host, function () { return compilerOptions; }, directoryStructureHost);
    (0, ts_1.setGetSourceFileAsHashVersioned)(compilerHost);
    // Members for CompilerHost
    var getNewSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return getVersionedSourceFileByPath.apply(void 0, __spreadArray([fileName, toPath(fileName)], args, false));
    };
    compilerHost.getSourceFileByPath = getVersionedSourceFileByPath;
    compilerHost.getNewLine = function () { return newLine; };
    compilerHost.fileExists = fileExists;
    compilerHost.onReleaseOldSourceFile = onReleaseOldSourceFile;
    compilerHost.onReleaseParsedCommandLine = onReleaseParsedCommandLine;
    // Members for ResolutionCacheHost
    compilerHost.toPath = toPath;
    compilerHost.getCompilationSettings = function () { return compilerOptions; };
    compilerHost.useSourceOfProjectReferenceRedirect = (0, ts_1.maybeBind)(host, host.useSourceOfProjectReferenceRedirect);
    compilerHost.watchDirectoryOfFailedLookupLocation = function (dir, cb, flags) { return watchDirectory(dir, cb, flags, watchOptions, ts_1.WatchType.FailedLookupLocations); };
    compilerHost.watchAffectingFileLocation = function (file, cb) { return watchFile(file, cb, ts_1.PollingInterval.High, watchOptions, ts_1.WatchType.AffectingFileLocation); };
    compilerHost.watchTypeRootsDirectory = function (dir, cb, flags) { return watchDirectory(dir, cb, flags, watchOptions, ts_1.WatchType.TypeRoots); };
    compilerHost.getCachedDirectoryStructureHost = function () { return cachedDirectoryStructureHost; };
    compilerHost.scheduleInvalidateResolutionsOfFailedLookupLocations = scheduleInvalidateResolutionsOfFailedLookupLocations;
    compilerHost.onInvalidatedResolution = scheduleProgramUpdate;
    compilerHost.onChangedAutomaticTypeDirectiveNames = scheduleProgramUpdate;
    compilerHost.fileIsOpen = ts_1.returnFalse;
    compilerHost.getCurrentProgram = getCurrentProgram;
    compilerHost.writeLog = writeLog;
    compilerHost.getParsedCommandLine = getParsedCommandLine;
    // Cache for the module resolution
    var resolutionCache = (0, ts_1.createResolutionCache)(compilerHost, configFileName ?
        (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(configFileName, currentDirectory)) :
        currentDirectory, 
    /*logChangesWhenResolvingModule*/ false);
    // Resolve module using host module resolution strategy if provided otherwise use resolution cache to resolve module names
    compilerHost.resolveModuleNameLiterals = (0, ts_1.maybeBind)(host, host.resolveModuleNameLiterals);
    compilerHost.resolveModuleNames = (0, ts_1.maybeBind)(host, host.resolveModuleNames);
    if (!compilerHost.resolveModuleNameLiterals && !compilerHost.resolveModuleNames) {
        compilerHost.resolveModuleNameLiterals = resolutionCache.resolveModuleNameLiterals.bind(resolutionCache);
    }
    compilerHost.resolveTypeReferenceDirectiveReferences = (0, ts_1.maybeBind)(host, host.resolveTypeReferenceDirectiveReferences);
    compilerHost.resolveTypeReferenceDirectives = (0, ts_1.maybeBind)(host, host.resolveTypeReferenceDirectives);
    if (!compilerHost.resolveTypeReferenceDirectiveReferences && !compilerHost.resolveTypeReferenceDirectives) {
        compilerHost.resolveTypeReferenceDirectiveReferences = resolutionCache.resolveTypeReferenceDirectiveReferences.bind(resolutionCache);
    }
    compilerHost.resolveLibrary = !host.resolveLibrary ?
        resolutionCache.resolveLibrary.bind(resolutionCache) :
        host.resolveLibrary.bind(host);
    compilerHost.getModuleResolutionCache = host.resolveModuleNameLiterals || host.resolveModuleNames ?
        (0, ts_1.maybeBind)(host, host.getModuleResolutionCache) :
        (function () { return resolutionCache.getModuleResolutionCache(); });
    var userProvidedResolution = !!host.resolveModuleNameLiterals || !!host.resolveTypeReferenceDirectiveReferences ||
        !!host.resolveModuleNames || !!host.resolveTypeReferenceDirectives;
    // All resolutions are invalid if user provided resolutions and didnt supply hasInvalidatedResolutions
    var customHasInvalidatedResolutions = userProvidedResolution ?
        (0, ts_1.maybeBind)(host, host.hasInvalidatedResolutions) || ts_1.returnTrue :
        ts_1.returnFalse;
    var customHasInvalidLibResolutions = host.resolveLibrary ?
        (0, ts_1.maybeBind)(host, host.hasInvalidatedLibResolutions) || ts_1.returnTrue :
        ts_1.returnFalse;
    builderProgram = readBuilderProgram(compilerOptions, compilerHost);
    synchronizeProgram();
    // Update the wild card directory watch
    watchConfigFileWildCardDirectories();
    // Update extended config file watch
    if (configFileName)
        updateExtendedConfigFilesWatches(toPath(configFileName), compilerOptions, watchOptions, ts_1.WatchType.ExtendedConfigFile);
    return configFileName ?
        { getCurrentProgram: getCurrentBuilderProgram, getProgram: updateProgram, close: close } :
        { getCurrentProgram: getCurrentBuilderProgram, getProgram: updateProgram, updateRootFileNames: updateRootFileNames, close: close };
    function close() {
        clearInvalidateResolutionsOfFailedLookupLocations();
        resolutionCache.clear();
        (0, ts_1.clearMap)(sourceFilesCache, function (value) {
            if (value && value.fileWatcher) {
                value.fileWatcher.close();
                value.fileWatcher = undefined;
            }
        });
        if (configFileWatcher) {
            configFileWatcher.close();
            configFileWatcher = undefined;
        }
        extendedConfigCache === null || extendedConfigCache === void 0 ? void 0 : extendedConfigCache.clear();
        extendedConfigCache = undefined;
        if (sharedExtendedConfigFileWatchers) {
            (0, ts_1.clearMap)(sharedExtendedConfigFileWatchers, ts_1.closeFileWatcherOf);
            sharedExtendedConfigFileWatchers = undefined;
        }
        if (watchedWildcardDirectories) {
            (0, ts_1.clearMap)(watchedWildcardDirectories, ts_1.closeFileWatcherOf);
            watchedWildcardDirectories = undefined;
        }
        if (missingFilesMap) {
            (0, ts_1.clearMap)(missingFilesMap, ts_1.closeFileWatcher);
            missingFilesMap = undefined;
        }
        if (parsedConfigs) {
            (0, ts_1.clearMap)(parsedConfigs, function (config) {
                var _a;
                (_a = config.watcher) === null || _a === void 0 ? void 0 : _a.close();
                config.watcher = undefined;
                if (config.watchedDirectories)
                    (0, ts_1.clearMap)(config.watchedDirectories, ts_1.closeFileWatcherOf);
                config.watchedDirectories = undefined;
            });
            parsedConfigs = undefined;
        }
    }
    function getCurrentBuilderProgram() {
        return builderProgram;
    }
    function getCurrentProgram() {
        return builderProgram && builderProgram.getProgramOrUndefined();
    }
    function synchronizeProgram() {
        writeLog("Synchronizing program");
        ts_1.Debug.assert(compilerOptions);
        ts_1.Debug.assert(rootFileNames);
        clearInvalidateResolutionsOfFailedLookupLocations();
        var program = getCurrentBuilderProgram();
        if (hasChangedCompilerOptions) {
            newLine = updateNewLine();
            if (program && (0, ts_1.changesAffectModuleResolution)(program.getCompilerOptions(), compilerOptions)) {
                debugger;
                resolutionCache.onChangesAffectModuleResolution();
            }
        }
        var _a = resolutionCache.createHasInvalidatedResolutions(customHasInvalidatedResolutions, customHasInvalidLibResolutions), hasInvalidatedResolutions = _a.hasInvalidatedResolutions, hasInvalidatedLibResolutions = _a.hasInvalidatedLibResolutions;
        var _b = (0, ts_1.changeCompilerHostLikeToUseCache)(compilerHost, toPath), originalReadFile = _b.originalReadFile, originalFileExists = _b.originalFileExists, originalDirectoryExists = _b.originalDirectoryExists, originalCreateDirectory = _b.originalCreateDirectory, originalWriteFile = _b.originalWriteFile, readFileWithCache = _b.readFileWithCache;
        if ((0, ts_1.isProgramUptoDate)(getCurrentProgram(), rootFileNames, compilerOptions, function (path) { return getSourceVersion(path, readFileWithCache); }, function (fileName) { return compilerHost.fileExists(fileName); }, hasInvalidatedResolutions, hasInvalidatedLibResolutions, hasChangedAutomaticTypeDirectiveNames, getParsedCommandLine, projectReferences)) {
            if (hasChangedConfigFileParsingErrors) {
                if (reportFileChangeDetectedOnCreateProgram) {
                    reportWatchDiagnostic(ts_1.Diagnostics.File_change_detected_Starting_incremental_compilation);
                }
                builderProgram = createProgram(/*rootNames*/ undefined, /*options*/ undefined, compilerHost, builderProgram, configFileParsingDiagnostics, projectReferences);
                hasChangedConfigFileParsingErrors = false;
            }
        }
        else {
            if (reportFileChangeDetectedOnCreateProgram) {
                reportWatchDiagnostic(ts_1.Diagnostics.File_change_detected_Starting_incremental_compilation);
            }
            createNewProgram(hasInvalidatedResolutions, hasInvalidatedLibResolutions);
        }
        reportFileChangeDetectedOnCreateProgram = false;
        if (host.afterProgramCreate && program !== builderProgram) {
            host.afterProgramCreate(builderProgram);
        }
        compilerHost.readFile = originalReadFile;
        compilerHost.fileExists = originalFileExists;
        compilerHost.directoryExists = originalDirectoryExists;
        compilerHost.createDirectory = originalCreateDirectory;
        compilerHost.writeFile = originalWriteFile;
        return builderProgram;
    }
    function createNewProgram(hasInvalidatedResolutions, hasInvalidatedLibResolutions) {
        // Compile the program
        writeLog("CreatingProgramWith::");
        writeLog("  roots: ".concat(JSON.stringify(rootFileNames)));
        writeLog("  options: ".concat(JSON.stringify(compilerOptions)));
        if (projectReferences)
            writeLog("  projectReferences: ".concat(JSON.stringify(projectReferences)));
        var needsUpdateInTypeRootWatch = hasChangedCompilerOptions || !getCurrentProgram();
        hasChangedCompilerOptions = false;
        hasChangedConfigFileParsingErrors = false;
        resolutionCache.startCachingPerDirectoryResolution();
        compilerHost.hasInvalidatedResolutions = hasInvalidatedResolutions;
        compilerHost.hasInvalidatedLibResolutions = hasInvalidatedLibResolutions;
        compilerHost.hasChangedAutomaticTypeDirectiveNames = hasChangedAutomaticTypeDirectiveNames;
        var oldProgram = getCurrentProgram();
        builderProgram = createProgram(rootFileNames, compilerOptions, compilerHost, builderProgram, configFileParsingDiagnostics, projectReferences);
        resolutionCache.finishCachingPerDirectoryResolution(builderProgram.getProgram(), oldProgram);
        // Update watches
        (0, ts_1.updateMissingFilePathsWatch)(builderProgram.getProgram(), missingFilesMap || (missingFilesMap = new Map()), watchMissingFilePath);
        if (needsUpdateInTypeRootWatch) {
            resolutionCache.updateTypeRootsWatch();
        }
        if (missingFilePathsRequestedForRelease) {
            // These are the paths that program creater told us as not in use any more but were missing on the disk.
            // We didnt remove the entry for them from sourceFiles cache so that we dont have to do File IO,
            // if there is already watcher for it (for missing files)
            // At this point our watches were updated, hence now we know that these paths are not tracked and need to be removed
            // so that at later time we have correct result of their presence
            for (var _i = 0, missingFilePathsRequestedForRelease_1 = missingFilePathsRequestedForRelease; _i < missingFilePathsRequestedForRelease_1.length; _i++) {
                var missingFilePath = missingFilePathsRequestedForRelease_1[_i];
                if (!missingFilesMap.has(missingFilePath)) {
                    sourceFilesCache.delete(missingFilePath);
                }
            }
            missingFilePathsRequestedForRelease = undefined;
        }
    }
    function updateRootFileNames(files) {
        ts_1.Debug.assert(!configFileName, "Cannot update root file names with config file watch mode");
        rootFileNames = files;
        scheduleProgramUpdate();
    }
    function updateNewLine() {
        return (0, ts_1.getNewLineCharacter)(compilerOptions || optionsToExtendForConfigFile);
    }
    function toPath(fileName) {
        return (0, ts_1.toPath)(fileName, currentDirectory, getCanonicalFileName);
    }
    function isFileMissingOnHost(hostSourceFile) {
        return typeof hostSourceFile === "boolean";
    }
    function isFilePresenceUnknownOnHost(hostSourceFile) {
        return typeof hostSourceFile.version === "boolean";
    }
    function fileExists(fileName) {
        var path = toPath(fileName);
        // If file is missing on host from cache, we can definitely say file doesnt exist
        // otherwise we need to ensure from the disk
        if (isFileMissingOnHost(sourceFilesCache.get(path))) {
            return false;
        }
        return directoryStructureHost.fileExists(fileName);
    }
    function getVersionedSourceFileByPath(fileName, path, languageVersionOrOptions, onError, shouldCreateNewSourceFile) {
        var hostSourceFile = sourceFilesCache.get(path);
        // No source file on the host
        if (isFileMissingOnHost(hostSourceFile)) {
            return undefined;
        }
        // Create new source file if requested or the versions dont match
        var impliedNodeFormat = typeof languageVersionOrOptions === "object" ? languageVersionOrOptions.impliedNodeFormat : undefined;
        if (hostSourceFile === undefined || shouldCreateNewSourceFile || isFilePresenceUnknownOnHost(hostSourceFile) || hostSourceFile.sourceFile.impliedNodeFormat !== impliedNodeFormat) {
            var sourceFile = getNewSourceFile(fileName, languageVersionOrOptions, onError);
            if (hostSourceFile) {
                if (sourceFile) {
                    // Set the source file and create file watcher now that file was present on the disk
                    hostSourceFile.sourceFile = sourceFile;
                    hostSourceFile.version = sourceFile.version;
                    if (!hostSourceFile.fileWatcher) {
                        hostSourceFile.fileWatcher = watchFilePath(path, fileName, onSourceFileChange, ts_1.PollingInterval.Low, watchOptions, ts_1.WatchType.SourceFile);
                    }
                }
                else {
                    // There is no source file on host any more, close the watch, missing file paths will track it
                    if (hostSourceFile.fileWatcher) {
                        hostSourceFile.fileWatcher.close();
                    }
                    sourceFilesCache.set(path, false);
                }
            }
            else {
                if (sourceFile) {
                    var fileWatcher = watchFilePath(path, fileName, onSourceFileChange, ts_1.PollingInterval.Low, watchOptions, ts_1.WatchType.SourceFile);
                    sourceFilesCache.set(path, { sourceFile: sourceFile, version: sourceFile.version, fileWatcher: fileWatcher });
                }
                else {
                    sourceFilesCache.set(path, false);
                }
            }
            return sourceFile;
        }
        return hostSourceFile.sourceFile;
    }
    function nextSourceFileVersion(path) {
        var hostSourceFile = sourceFilesCache.get(path);
        if (hostSourceFile !== undefined) {
            if (isFileMissingOnHost(hostSourceFile)) {
                // The next version, lets set it as presence unknown file
                sourceFilesCache.set(path, { version: false });
            }
            else {
                hostSourceFile.version = false;
            }
        }
    }
    function getSourceVersion(path, readFileWithCache) {
        var hostSourceFile = sourceFilesCache.get(path);
        if (!hostSourceFile)
            return undefined;
        if (hostSourceFile.version)
            return hostSourceFile.version;
        // Read file and get new version
        var text = readFileWithCache(path);
        return text !== undefined ? (0, ts_1.getSourceFileVersionAsHashFromText)(compilerHost, text) : undefined;
    }
    function onReleaseOldSourceFile(oldSourceFile, _oldOptions, hasSourceFileByPath) {
        var hostSourceFileInfo = sourceFilesCache.get(oldSourceFile.resolvedPath);
        // If this is the source file thats in the cache and new program doesnt need it,
        // remove the cached entry.
        // Note we arent deleting entry if file became missing in new program or
        // there was version update and new source file was created.
        if (hostSourceFileInfo !== undefined) {
            // record the missing file paths so they can be removed later if watchers arent tracking them
            if (isFileMissingOnHost(hostSourceFileInfo)) {
                (missingFilePathsRequestedForRelease || (missingFilePathsRequestedForRelease = [])).push(oldSourceFile.path);
            }
            else if (hostSourceFileInfo.sourceFile === oldSourceFile) {
                if (hostSourceFileInfo.fileWatcher) {
                    hostSourceFileInfo.fileWatcher.close();
                }
                sourceFilesCache.delete(oldSourceFile.resolvedPath);
                if (!hasSourceFileByPath) {
                    resolutionCache.removeResolutionsOfFile(oldSourceFile.path);
                }
            }
        }
    }
    function reportWatchDiagnostic(message) {
        if (host.onWatchStatusChange) {
            host.onWatchStatusChange((0, ts_1.createCompilerDiagnostic)(message), newLine, compilerOptions || optionsToExtendForConfigFile);
        }
    }
    function hasChangedAutomaticTypeDirectiveNames() {
        return resolutionCache.hasChangedAutomaticTypeDirectiveNames();
    }
    function clearInvalidateResolutionsOfFailedLookupLocations() {
        if (!timerToInvalidateFailedLookupResolutions)
            return false;
        host.clearTimeout(timerToInvalidateFailedLookupResolutions);
        timerToInvalidateFailedLookupResolutions = undefined;
        return true;
    }
    function scheduleInvalidateResolutionsOfFailedLookupLocations() {
        if (!host.setTimeout || !host.clearTimeout) {
            return resolutionCache.invalidateResolutionsOfFailedLookupLocations();
        }
        var pending = clearInvalidateResolutionsOfFailedLookupLocations();
        writeLog("Scheduling invalidateFailedLookup".concat(pending ? ", Cancelled earlier one" : ""));
        timerToInvalidateFailedLookupResolutions = host.setTimeout(invalidateResolutionsOfFailedLookup, 250, "timerToInvalidateFailedLookupResolutions");
    }
    function invalidateResolutionsOfFailedLookup() {
        timerToInvalidateFailedLookupResolutions = undefined;
        if (resolutionCache.invalidateResolutionsOfFailedLookupLocations()) {
            scheduleProgramUpdate();
        }
    }
    // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
    // operations (such as saving all modified files in an editor) a chance to complete before we kick
    // off a new compilation.
    function scheduleProgramUpdate() {
        if (!host.setTimeout || !host.clearTimeout) {
            return;
        }
        if (timerToUpdateProgram) {
            host.clearTimeout(timerToUpdateProgram);
        }
        writeLog("Scheduling update");
        timerToUpdateProgram = host.setTimeout(updateProgramWithWatchStatus, 250, "timerToUpdateProgram");
    }
    function scheduleProgramReload() {
        ts_1.Debug.assert(!!configFileName);
        reloadLevel = ts_1.ConfigFileProgramReloadLevel.Full;
        scheduleProgramUpdate();
    }
    function updateProgramWithWatchStatus() {
        timerToUpdateProgram = undefined;
        reportFileChangeDetectedOnCreateProgram = true;
        updateProgram();
    }
    function updateProgram() {
        switch (reloadLevel) {
            case ts_1.ConfigFileProgramReloadLevel.Partial:
                ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartUpdateProgram("PartialConfigReload");
                reloadFileNamesFromConfigFile();
                break;
            case ts_1.ConfigFileProgramReloadLevel.Full:
                ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartUpdateProgram("FullConfigReload");
                reloadConfigFile();
                break;
            default:
                ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartUpdateProgram("SynchronizeProgram");
                synchronizeProgram();
                break;
        }
        ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStopUpdateProgram("Done");
        return getCurrentBuilderProgram();
    }
    function reloadFileNamesFromConfigFile() {
        writeLog("Reloading new file names and options");
        ts_1.Debug.assert(compilerOptions);
        ts_1.Debug.assert(configFileName);
        reloadLevel = ts_1.ConfigFileProgramReloadLevel.None;
        rootFileNames = (0, ts_1.getFileNamesFromConfigSpecs)(compilerOptions.configFile.configFileSpecs, (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getDirectoryPath)(configFileName), currentDirectory), compilerOptions, parseConfigFileHost, extraFileExtensions);
        if ((0, ts_1.updateErrorForNoInputFiles)(rootFileNames, (0, ts_1.getNormalizedAbsolutePath)(configFileName, currentDirectory), compilerOptions.configFile.configFileSpecs, configFileParsingDiagnostics, canConfigFileJsonReportNoInputFiles)) {
            hasChangedConfigFileParsingErrors = true;
        }
        // Update the program
        synchronizeProgram();
    }
    function reloadConfigFile() {
        ts_1.Debug.assert(configFileName);
        writeLog("Reloading config file: ".concat(configFileName));
        reloadLevel = ts_1.ConfigFileProgramReloadLevel.None;
        if (cachedDirectoryStructureHost) {
            cachedDirectoryStructureHost.clearCache();
        }
        parseConfigFile();
        hasChangedCompilerOptions = true;
        synchronizeProgram();
        // Update the wild card directory watch
        watchConfigFileWildCardDirectories();
        // Update extended config file watch
        updateExtendedConfigFilesWatches(toPath(configFileName), compilerOptions, watchOptions, ts_1.WatchType.ExtendedConfigFile);
    }
    function parseConfigFile() {
        ts_1.Debug.assert(configFileName);
        setConfigFileParsingResult((0, ts_1.getParsedCommandLineOfConfigFile)(configFileName, optionsToExtendForConfigFile, parseConfigFileHost, extendedConfigCache || (extendedConfigCache = new Map()), watchOptionsToExtend, extraFileExtensions)); // TODO: GH#18217
    }
    function setConfigFileParsingResult(configFileParseResult) {
        rootFileNames = configFileParseResult.fileNames;
        compilerOptions = configFileParseResult.options;
        watchOptions = configFileParseResult.watchOptions;
        projectReferences = configFileParseResult.projectReferences;
        wildcardDirectories = configFileParseResult.wildcardDirectories;
        configFileParsingDiagnostics = (0, ts_1.getConfigFileParsingDiagnostics)(configFileParseResult).slice();
        canConfigFileJsonReportNoInputFiles = (0, ts_1.canJsonReportNoInputFiles)(configFileParseResult.raw);
        hasChangedConfigFileParsingErrors = true;
    }
    function getParsedCommandLine(configFileName) {
        var configPath = toPath(configFileName);
        var config = parsedConfigs === null || parsedConfigs === void 0 ? void 0 : parsedConfigs.get(configPath);
        if (config) {
            if (!config.reloadLevel)
                return config.parsedCommandLine;
            // With host implementing getParsedCommandLine we cant just update file names
            if (config.parsedCommandLine && config.reloadLevel === ts_1.ConfigFileProgramReloadLevel.Partial && !host.getParsedCommandLine) {
                writeLog("Reloading new file names and options");
                ts_1.Debug.assert(compilerOptions);
                var fileNames = (0, ts_1.getFileNamesFromConfigSpecs)(config.parsedCommandLine.options.configFile.configFileSpecs, (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getDirectoryPath)(configFileName), currentDirectory), compilerOptions, parseConfigFileHost);
                config.parsedCommandLine = __assign(__assign({}, config.parsedCommandLine), { fileNames: fileNames });
                config.reloadLevel = undefined;
                return config.parsedCommandLine;
            }
        }
        writeLog("Loading config file: ".concat(configFileName));
        var parsedCommandLine = host.getParsedCommandLine ?
            host.getParsedCommandLine(configFileName) :
            getParsedCommandLineFromConfigFileHost(configFileName);
        if (config) {
            config.parsedCommandLine = parsedCommandLine;
            config.reloadLevel = undefined;
        }
        else {
            (parsedConfigs || (parsedConfigs = new Map())).set(configPath, config = { parsedCommandLine: parsedCommandLine });
        }
        watchReferencedProject(configFileName, configPath, config);
        return parsedCommandLine;
    }
    function getParsedCommandLineFromConfigFileHost(configFileName) {
        // Ignore the file absent errors
        var onUnRecoverableConfigFileDiagnostic = parseConfigFileHost.onUnRecoverableConfigFileDiagnostic;
        parseConfigFileHost.onUnRecoverableConfigFileDiagnostic = ts_1.noop;
        var parsedCommandLine = (0, ts_1.getParsedCommandLineOfConfigFile)(configFileName, 
        /*optionsToExtend*/ undefined, parseConfigFileHost, extendedConfigCache || (extendedConfigCache = new Map()), watchOptionsToExtend);
        parseConfigFileHost.onUnRecoverableConfigFileDiagnostic = onUnRecoverableConfigFileDiagnostic;
        return parsedCommandLine;
    }
    function onReleaseParsedCommandLine(fileName) {
        var _a;
        var path = toPath(fileName);
        var config = parsedConfigs === null || parsedConfigs === void 0 ? void 0 : parsedConfigs.get(path);
        if (!config)
            return;
        parsedConfigs.delete(path);
        if (config.watchedDirectories)
            (0, ts_1.clearMap)(config.watchedDirectories, ts_1.closeFileWatcherOf);
        (_a = config.watcher) === null || _a === void 0 ? void 0 : _a.close();
        (0, ts_1.clearSharedExtendedConfigFileWatcher)(path, sharedExtendedConfigFileWatchers);
    }
    function watchFilePath(path, file, callback, pollingInterval, options, watchType) {
        return watchFile(file, function (fileName, eventKind) { return callback(fileName, eventKind, path); }, pollingInterval, options, watchType);
    }
    function onSourceFileChange(fileName, eventKind, path) {
        updateCachedSystemWithFile(fileName, path, eventKind);
        // Update the source file cache
        if (eventKind === ts_1.FileWatcherEventKind.Deleted && sourceFilesCache.has(path)) {
            resolutionCache.invalidateResolutionOfFile(path);
        }
        nextSourceFileVersion(path);
        // Update the program
        scheduleProgramUpdate();
    }
    function updateCachedSystemWithFile(fileName, path, eventKind) {
        if (cachedDirectoryStructureHost) {
            cachedDirectoryStructureHost.addOrDeleteFile(fileName, path, eventKind);
        }
    }
    function watchMissingFilePath(missingFilePath) {
        // If watching missing referenced config file, we are already watching it so no need for separate watcher
        return (parsedConfigs === null || parsedConfigs === void 0 ? void 0 : parsedConfigs.has(missingFilePath)) ?
            ts_1.noopFileWatcher :
            watchFilePath(missingFilePath, missingFilePath, onMissingFileChange, ts_1.PollingInterval.Medium, watchOptions, ts_1.WatchType.MissingFile);
    }
    function onMissingFileChange(fileName, eventKind, missingFilePath) {
        updateCachedSystemWithFile(fileName, missingFilePath, eventKind);
        if (eventKind === ts_1.FileWatcherEventKind.Created && missingFilesMap.has(missingFilePath)) {
            missingFilesMap.get(missingFilePath).close();
            missingFilesMap.delete(missingFilePath);
            // Delete the entry in the source files cache so that new source file is created
            nextSourceFileVersion(missingFilePath);
            // When a missing file is created, we should update the graph.
            scheduleProgramUpdate();
        }
    }
    function watchConfigFileWildCardDirectories() {
        if (wildcardDirectories) {
            (0, ts_1.updateWatchingWildcardDirectories)(watchedWildcardDirectories || (watchedWildcardDirectories = new Map()), new Map(Object.entries(wildcardDirectories)), watchWildcardDirectory);
        }
        else if (watchedWildcardDirectories) {
            (0, ts_1.clearMap)(watchedWildcardDirectories, ts_1.closeFileWatcherOf);
        }
    }
    function watchWildcardDirectory(directory, flags) {
        return watchDirectory(directory, function (fileOrDirectory) {
            ts_1.Debug.assert(configFileName);
            ts_1.Debug.assert(compilerOptions);
            var fileOrDirectoryPath = toPath(fileOrDirectory);
            // Since the file existence changed, update the sourceFiles cache
            if (cachedDirectoryStructureHost) {
                cachedDirectoryStructureHost.addOrDeleteFileOrDirectory(fileOrDirectory, fileOrDirectoryPath);
            }
            nextSourceFileVersion(fileOrDirectoryPath);
            if ((0, ts_1.isIgnoredFileFromWildCardWatching)({
                watchedDirPath: toPath(directory),
                fileOrDirectory: fileOrDirectory,
                fileOrDirectoryPath: fileOrDirectoryPath,
                configFileName: configFileName,
                extraFileExtensions: extraFileExtensions,
                options: compilerOptions,
                program: getCurrentBuilderProgram() || rootFileNames,
                currentDirectory: currentDirectory,
                useCaseSensitiveFileNames: useCaseSensitiveFileNames,
                writeLog: writeLog,
                toPath: toPath,
            }))
                return;
            // Reload is pending, do the reload
            if (reloadLevel !== ts_1.ConfigFileProgramReloadLevel.Full) {
                reloadLevel = ts_1.ConfigFileProgramReloadLevel.Partial;
                // Schedule Update the program
                scheduleProgramUpdate();
            }
        }, flags, watchOptions, ts_1.WatchType.WildcardDirectory);
    }
    function updateExtendedConfigFilesWatches(forProjectPath, options, watchOptions, watchType) {
        (0, ts_1.updateSharedExtendedConfigFileWatcher)(forProjectPath, options, sharedExtendedConfigFileWatchers || (sharedExtendedConfigFileWatchers = new Map()), function (extendedConfigFileName, extendedConfigFilePath) { return watchFile(extendedConfigFileName, function (_fileName, eventKind) {
            var _a;
            updateCachedSystemWithFile(extendedConfigFileName, extendedConfigFilePath, eventKind);
            // Update extended config cache
            if (extendedConfigCache)
                (0, ts_1.cleanExtendedConfigCache)(extendedConfigCache, extendedConfigFilePath, toPath);
            // Update projects
            var projects = (_a = sharedExtendedConfigFileWatchers.get(extendedConfigFilePath)) === null || _a === void 0 ? void 0 : _a.projects;
            // If there are no referenced projects this extended config file watcher depend on ignore
            if (!(projects === null || projects === void 0 ? void 0 : projects.size))
                return;
            projects.forEach(function (projectPath) {
                if (configFileName && toPath(configFileName) === projectPath) {
                    // If this is the config file of the project, reload completely
                    reloadLevel = ts_1.ConfigFileProgramReloadLevel.Full;
                }
                else {
                    // Reload config for the referenced projects and remove the resolutions from referenced projects since the config file changed
                    var config = parsedConfigs === null || parsedConfigs === void 0 ? void 0 : parsedConfigs.get(projectPath);
                    if (config)
                        config.reloadLevel = ts_1.ConfigFileProgramReloadLevel.Full;
                    resolutionCache.removeResolutionsFromProjectReferenceRedirects(projectPath);
                }
                scheduleProgramUpdate();
            });
        }, ts_1.PollingInterval.High, watchOptions, watchType); }, toPath);
    }
    function watchReferencedProject(configFileName, configPath, commandLine) {
        var _a, _b, _c, _d, _e;
        // Watch file
        commandLine.watcher || (commandLine.watcher = watchFile(configFileName, function (_fileName, eventKind) {
            updateCachedSystemWithFile(configFileName, configPath, eventKind);
            var config = parsedConfigs === null || parsedConfigs === void 0 ? void 0 : parsedConfigs.get(configPath);
            if (config)
                config.reloadLevel = ts_1.ConfigFileProgramReloadLevel.Full;
            resolutionCache.removeResolutionsFromProjectReferenceRedirects(configPath);
            scheduleProgramUpdate();
        }, ts_1.PollingInterval.High, ((_a = commandLine.parsedCommandLine) === null || _a === void 0 ? void 0 : _a.watchOptions) || watchOptions, ts_1.WatchType.ConfigFileOfReferencedProject));
        // Watch Wild card
        if ((_b = commandLine.parsedCommandLine) === null || _b === void 0 ? void 0 : _b.wildcardDirectories) {
            (0, ts_1.updateWatchingWildcardDirectories)(commandLine.watchedDirectories || (commandLine.watchedDirectories = new Map()), new Map(Object.entries((_c = commandLine.parsedCommandLine) === null || _c === void 0 ? void 0 : _c.wildcardDirectories)), function (directory, flags) {
                var _a;
                return watchDirectory(directory, function (fileOrDirectory) {
                    var fileOrDirectoryPath = toPath(fileOrDirectory);
                    // Since the file existence changed, update the sourceFiles cache
                    if (cachedDirectoryStructureHost) {
                        cachedDirectoryStructureHost.addOrDeleteFileOrDirectory(fileOrDirectory, fileOrDirectoryPath);
                    }
                    nextSourceFileVersion(fileOrDirectoryPath);
                    var config = parsedConfigs === null || parsedConfigs === void 0 ? void 0 : parsedConfigs.get(configPath);
                    if (!(config === null || config === void 0 ? void 0 : config.parsedCommandLine))
                        return;
                    if ((0, ts_1.isIgnoredFileFromWildCardWatching)({
                        watchedDirPath: toPath(directory),
                        fileOrDirectory: fileOrDirectory,
                        fileOrDirectoryPath: fileOrDirectoryPath,
                        configFileName: configFileName,
                        options: config.parsedCommandLine.options,
                        program: config.parsedCommandLine.fileNames,
                        currentDirectory: currentDirectory,
                        useCaseSensitiveFileNames: useCaseSensitiveFileNames,
                        writeLog: writeLog,
                        toPath: toPath,
                    }))
                        return;
                    // Reload is pending, do the reload
                    if (config.reloadLevel !== ts_1.ConfigFileProgramReloadLevel.Full) {
                        config.reloadLevel = ts_1.ConfigFileProgramReloadLevel.Partial;
                        // Schedule Update the program
                        scheduleProgramUpdate();
                    }
                }, flags, ((_a = commandLine.parsedCommandLine) === null || _a === void 0 ? void 0 : _a.watchOptions) || watchOptions, ts_1.WatchType.WildcardDirectoryOfReferencedProject);
            });
        }
        else if (commandLine.watchedDirectories) {
            (0, ts_1.clearMap)(commandLine.watchedDirectories, ts_1.closeFileWatcherOf);
            commandLine.watchedDirectories = undefined;
        }
        // Watch extended config files
        updateExtendedConfigFilesWatches(configPath, (_d = commandLine.parsedCommandLine) === null || _d === void 0 ? void 0 : _d.options, ((_e = commandLine.parsedCommandLine) === null || _e === void 0 ? void 0 : _e.watchOptions) || watchOptions, ts_1.WatchType.ExtendedConfigOfReferencedProject);
    }
}
exports.createWatchProgram = createWatchProgram;
