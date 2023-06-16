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
exports.closeFileWatcherOf = exports.getFallbackOptions = exports.getWatchFactory = exports.WatchLogLevel = exports.isEmittedFileOfProgram = exports.isIgnoredFileFromWildCardWatching = exports.updateWatchingWildcardDirectories = exports.updateMissingFilePathsWatch = exports.updatePackageJsonWatch = exports.cleanExtendedConfigCache = exports.clearSharedExtendedConfigFileWatcher = exports.updateSharedExtendedConfigFileWatcher = exports.ConfigFileProgramReloadLevel = exports.createCachedDirectoryStructureHost = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
function createCachedDirectoryStructureHost(host, currentDirectory, useCaseSensitiveFileNames) {
    if (!host.getDirectories || !host.readDirectory) {
        return undefined;
    }
    var cachedReadDirectoryResult = new Map();
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    return {
        useCaseSensitiveFileNames: useCaseSensitiveFileNames,
        fileExists: fileExists,
        readFile: function (path, encoding) { return host.readFile(path, encoding); },
        directoryExists: host.directoryExists && directoryExists,
        getDirectories: getDirectories,
        readDirectory: readDirectory,
        createDirectory: host.createDirectory && createDirectory,
        writeFile: host.writeFile && writeFile,
        addOrDeleteFileOrDirectory: addOrDeleteFileOrDirectory,
        addOrDeleteFile: addOrDeleteFile,
        clearCache: clearCache,
        realpath: host.realpath && realpath
    };
    function toPath(fileName) {
        return (0, ts_1.toPath)(fileName, currentDirectory, getCanonicalFileName);
    }
    function getCachedFileSystemEntries(rootDirPath) {
        return cachedReadDirectoryResult.get((0, ts_1.ensureTrailingDirectorySeparator)(rootDirPath));
    }
    function getCachedFileSystemEntriesForBaseDir(path) {
        var entries = getCachedFileSystemEntries((0, ts_1.getDirectoryPath)(path));
        if (!entries) {
            return entries;
        }
        // If we're looking for the base directory, we're definitely going to search the entries
        if (!entries.sortedAndCanonicalizedFiles) {
            entries.sortedAndCanonicalizedFiles = entries.files.map(getCanonicalFileName).sort();
            entries.sortedAndCanonicalizedDirectories = entries.directories.map(getCanonicalFileName).sort();
        }
        return entries;
    }
    function getBaseNameOfFileName(fileName) {
        return (0, ts_1.getBaseFileName)((0, ts_1.normalizePath)(fileName));
    }
    function createCachedFileSystemEntries(rootDir, rootDirPath) {
        var _a;
        if (!host.realpath || (0, ts_1.ensureTrailingDirectorySeparator)(toPath(host.realpath(rootDir))) === rootDirPath) {
            var resultFromHost = {
                files: (0, ts_1.map)(host.readDirectory(rootDir, /*extensions*/ undefined, /*exclude*/ undefined, /*include*/ ["*.*"]), getBaseNameOfFileName) || [],
                directories: host.getDirectories(rootDir) || []
            };
            cachedReadDirectoryResult.set((0, ts_1.ensureTrailingDirectorySeparator)(rootDirPath), resultFromHost);
            return resultFromHost;
        }
        // If the directory is symlink do not cache the result
        if ((_a = host.directoryExists) === null || _a === void 0 ? void 0 : _a.call(host, rootDir)) {
            cachedReadDirectoryResult.set(rootDirPath, false);
            return false;
        }
        // Non existing directory
        return undefined;
    }
    /**
     * If the readDirectory result was already cached, it returns that
     * Otherwise gets result from host and caches it.
     * The host request is done under try catch block to avoid caching incorrect result
     */
    function tryReadDirectory(rootDir, rootDirPath) {
        rootDirPath = (0, ts_1.ensureTrailingDirectorySeparator)(rootDirPath);
        var cachedResult = getCachedFileSystemEntries(rootDirPath);
        if (cachedResult) {
            return cachedResult;
        }
        try {
            return createCachedFileSystemEntries(rootDir, rootDirPath);
        }
        catch (_e) {
            // If there is exception to read directories, dont cache the result and direct the calls to host
            ts_1.Debug.assert(!cachedReadDirectoryResult.has((0, ts_1.ensureTrailingDirectorySeparator)(rootDirPath)));
            return undefined;
        }
    }
    function hasEntry(entries, name) {
        // Case-sensitive comparison since already canonicalized
        var index = (0, ts_1.binarySearch)(entries, name, ts_1.identity, ts_1.compareStringsCaseSensitive);
        return index >= 0;
    }
    function writeFile(fileName, data, writeByteOrderMark) {
        var path = toPath(fileName);
        var result = getCachedFileSystemEntriesForBaseDir(path);
        if (result) {
            updateFilesOfFileSystemEntry(result, getBaseNameOfFileName(fileName), /*fileExists*/ true);
        }
        return host.writeFile(fileName, data, writeByteOrderMark);
    }
    function fileExists(fileName) {
        var path = toPath(fileName);
        var result = getCachedFileSystemEntriesForBaseDir(path);
        return result && hasEntry(result.sortedAndCanonicalizedFiles, getCanonicalFileName(getBaseNameOfFileName(fileName))) ||
            host.fileExists(fileName);
    }
    function directoryExists(dirPath) {
        var path = toPath(dirPath);
        return cachedReadDirectoryResult.has((0, ts_1.ensureTrailingDirectorySeparator)(path)) || host.directoryExists(dirPath);
    }
    function createDirectory(dirPath) {
        var path = toPath(dirPath);
        var result = getCachedFileSystemEntriesForBaseDir(path);
        if (result) {
            var baseName = getBaseNameOfFileName(dirPath);
            var canonicalizedBaseName = getCanonicalFileName(baseName);
            var canonicalizedDirectories = result.sortedAndCanonicalizedDirectories;
            // Case-sensitive comparison since already canonicalized
            if ((0, ts_1.insertSorted)(canonicalizedDirectories, canonicalizedBaseName, ts_1.compareStringsCaseSensitive)) {
                result.directories.push(baseName);
            }
        }
        host.createDirectory(dirPath);
    }
    function getDirectories(rootDir) {
        var rootDirPath = toPath(rootDir);
        var result = tryReadDirectory(rootDir, rootDirPath);
        if (result) {
            return result.directories.slice();
        }
        return host.getDirectories(rootDir);
    }
    function readDirectory(rootDir, extensions, excludes, includes, depth) {
        var rootDirPath = toPath(rootDir);
        var rootResult = tryReadDirectory(rootDir, rootDirPath);
        var rootSymLinkResult;
        if (rootResult !== undefined) {
            return (0, ts_1.matchFiles)(rootDir, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory, depth, getFileSystemEntries, realpath);
        }
        return host.readDirectory(rootDir, extensions, excludes, includes, depth);
        function getFileSystemEntries(dir) {
            var path = toPath(dir);
            if (path === rootDirPath) {
                return rootResult || getFileSystemEntriesFromHost(dir, path);
            }
            var result = tryReadDirectory(dir, path);
            return result !== undefined ?
                result || getFileSystemEntriesFromHost(dir, path) :
                ts_1.emptyFileSystemEntries;
        }
        function getFileSystemEntriesFromHost(dir, path) {
            if (rootSymLinkResult && path === rootDirPath)
                return rootSymLinkResult;
            var result = {
                files: (0, ts_1.map)(host.readDirectory(dir, /*extensions*/ undefined, /*exclude*/ undefined, /*include*/ ["*.*"]), getBaseNameOfFileName) || ts_1.emptyArray,
                directories: host.getDirectories(dir) || ts_1.emptyArray
            };
            if (path === rootDirPath)
                rootSymLinkResult = result;
            return result;
        }
    }
    function realpath(s) {
        return host.realpath ? host.realpath(s) : s;
    }
    function addOrDeleteFileOrDirectory(fileOrDirectory, fileOrDirectoryPath) {
        var existingResult = getCachedFileSystemEntries(fileOrDirectoryPath);
        if (existingResult !== undefined) {
            // Just clear the cache for now
            // For now just clear the cache, since this could mean that multiple level entries might need to be re-evaluated
            clearCache();
            return undefined;
        }
        var parentResult = getCachedFileSystemEntriesForBaseDir(fileOrDirectoryPath);
        if (!parentResult) {
            return undefined;
        }
        // This was earlier a file (hence not in cached directory contents)
        // or we never cached the directory containing it
        if (!host.directoryExists) {
            // Since host doesnt support directory exists, clear the cache as otherwise it might not be same
            clearCache();
            return undefined;
        }
        var baseName = getBaseNameOfFileName(fileOrDirectory);
        var fsQueryResult = {
            fileExists: host.fileExists(fileOrDirectoryPath),
            directoryExists: host.directoryExists(fileOrDirectoryPath)
        };
        if (fsQueryResult.directoryExists || hasEntry(parentResult.sortedAndCanonicalizedDirectories, getCanonicalFileName(baseName))) {
            // Folder added or removed, clear the cache instead of updating the folder and its structure
            clearCache();
        }
        else {
            // No need to update the directory structure, just files
            updateFilesOfFileSystemEntry(parentResult, baseName, fsQueryResult.fileExists);
        }
        return fsQueryResult;
    }
    function addOrDeleteFile(fileName, filePath, eventKind) {
        if (eventKind === ts_1.FileWatcherEventKind.Changed) {
            return;
        }
        var parentResult = getCachedFileSystemEntriesForBaseDir(filePath);
        if (parentResult) {
            updateFilesOfFileSystemEntry(parentResult, getBaseNameOfFileName(fileName), eventKind === ts_1.FileWatcherEventKind.Created);
        }
    }
    function updateFilesOfFileSystemEntry(parentResult, baseName, fileExists) {
        var canonicalizedFiles = parentResult.sortedAndCanonicalizedFiles;
        var canonicalizedBaseName = getCanonicalFileName(baseName);
        if (fileExists) {
            // Case-sensitive comparison since already canonicalized
            if ((0, ts_1.insertSorted)(canonicalizedFiles, canonicalizedBaseName, ts_1.compareStringsCaseSensitive)) {
                parentResult.files.push(baseName);
            }
        }
        else {
            // Case-sensitive comparison since already canonicalized
            var sortedIndex = (0, ts_1.binarySearch)(canonicalizedFiles, canonicalizedBaseName, ts_1.identity, ts_1.compareStringsCaseSensitive);
            if (sortedIndex >= 0) {
                canonicalizedFiles.splice(sortedIndex, 1);
                var unsortedIndex = parentResult.files.findIndex(function (entry) { return getCanonicalFileName(entry) === canonicalizedBaseName; });
                parentResult.files.splice(unsortedIndex, 1);
            }
        }
    }
    function clearCache() {
        cachedReadDirectoryResult.clear();
    }
}
exports.createCachedDirectoryStructureHost = createCachedDirectoryStructureHost;
/** @internal */
var ConfigFileProgramReloadLevel;
(function (ConfigFileProgramReloadLevel) {
    ConfigFileProgramReloadLevel[ConfigFileProgramReloadLevel["None"] = 0] = "None";
    /** Update the file name list from the disk */
    ConfigFileProgramReloadLevel[ConfigFileProgramReloadLevel["Partial"] = 1] = "Partial";
    /** Reload completely by re-reading contents of config file from disk and updating program */
    ConfigFileProgramReloadLevel[ConfigFileProgramReloadLevel["Full"] = 2] = "Full";
})(ConfigFileProgramReloadLevel || (exports.ConfigFileProgramReloadLevel = ConfigFileProgramReloadLevel = {}));
/**
 * Updates the map of shared extended config file watches with a new set of extended config files from a base config file of the project
 *
 * @internal
 */
function updateSharedExtendedConfigFileWatcher(projectPath, options, extendedConfigFilesMap, createExtendedConfigFileWatch, toPath) {
    var _a;
    var extendedConfigs = (0, ts_1.arrayToMap)(((_a = options === null || options === void 0 ? void 0 : options.configFile) === null || _a === void 0 ? void 0 : _a.extendedSourceFiles) || ts_1.emptyArray, toPath);
    // remove project from all unrelated watchers
    extendedConfigFilesMap.forEach(function (watcher, extendedConfigFilePath) {
        if (!extendedConfigs.has(extendedConfigFilePath)) {
            watcher.projects.delete(projectPath);
            watcher.close();
        }
    });
    // Update the extended config files watcher
    extendedConfigs.forEach(function (extendedConfigFileName, extendedConfigFilePath) {
        var existing = extendedConfigFilesMap.get(extendedConfigFilePath);
        if (existing) {
            existing.projects.add(projectPath);
        }
        else {
            // start watching previously unseen extended config
            extendedConfigFilesMap.set(extendedConfigFilePath, {
                projects: new Set([projectPath]),
                watcher: createExtendedConfigFileWatch(extendedConfigFileName, extendedConfigFilePath),
                close: function () {
                    var existing = extendedConfigFilesMap.get(extendedConfigFilePath);
                    if (!existing || existing.projects.size !== 0)
                        return;
                    existing.watcher.close();
                    extendedConfigFilesMap.delete(extendedConfigFilePath);
                },
            });
        }
    });
}
exports.updateSharedExtendedConfigFileWatcher = updateSharedExtendedConfigFileWatcher;
/**
 * Remove the project from the extended config file watchers and close not needed watches
 *
 * @internal
 */
function clearSharedExtendedConfigFileWatcher(projectPath, extendedConfigFilesMap) {
    extendedConfigFilesMap.forEach(function (watcher) {
        if (watcher.projects.delete(projectPath))
            watcher.close();
    });
}
exports.clearSharedExtendedConfigFileWatcher = clearSharedExtendedConfigFileWatcher;
/**
 * Clean the extendsConfigCache when extended config file has changed
 *
 * @internal
 */
function cleanExtendedConfigCache(extendedConfigCache, extendedConfigFilePath, toPath) {
    if (!extendedConfigCache.delete(extendedConfigFilePath))
        return;
    extendedConfigCache.forEach(function (_a, key) {
        var _b;
        var extendedResult = _a.extendedResult;
        if ((_b = extendedResult.extendedSourceFiles) === null || _b === void 0 ? void 0 : _b.some(function (extendedFile) { return toPath(extendedFile) === extendedConfigFilePath; })) {
            cleanExtendedConfigCache(extendedConfigCache, key, toPath);
        }
    });
}
exports.cleanExtendedConfigCache = cleanExtendedConfigCache;
/**
 * Updates watchers based on the package json files used in module resolution
 *
 * @internal
 */
function updatePackageJsonWatch(lookups, packageJsonWatches, createPackageJsonWatch) {
    var newMap = new Map(lookups);
    (0, ts_1.mutateMap)(packageJsonWatches, newMap, {
        createNewValue: createPackageJsonWatch,
        onDeleteValue: ts_1.closeFileWatcher
    });
}
exports.updatePackageJsonWatch = updatePackageJsonWatch;
/**
 * Updates the existing missing file watches with the new set of missing files after new program is created
 *
 * @internal
 */
function updateMissingFilePathsWatch(program, missingFileWatches, createMissingFileWatch) {
    var missingFilePaths = program.getMissingFilePaths();
    // TODO(rbuckton): Should be a `Set` but that requires changing the below code that uses `mutateMap`
    var newMissingFilePathMap = (0, ts_1.arrayToMap)(missingFilePaths, ts_1.identity, ts_1.returnTrue);
    // Update the missing file paths watcher
    (0, ts_1.mutateMap)(missingFileWatches, newMissingFilePathMap, {
        // Watch the missing files
        createNewValue: createMissingFileWatch,
        // Files that are no longer missing (e.g. because they are no longer required)
        // should no longer be watched.
        onDeleteValue: ts_1.closeFileWatcher
    });
}
exports.updateMissingFilePathsWatch = updateMissingFilePathsWatch;
/**
 * Updates the existing wild card directory watches with the new set of wild card directories from the config file
 * after new program is created because the config file was reloaded or program was created first time from the config file
 * Note that there is no need to call this function when the program is updated with additional files without reloading config files,
 * as wildcard directories wont change unless reloading config file
 *
 * @internal
 */
function updateWatchingWildcardDirectories(existingWatchedForWildcards, wildcardDirectories, watchDirectory) {
    (0, ts_1.mutateMap)(existingWatchedForWildcards, wildcardDirectories, {
        // Create new watch and recursive info
        createNewValue: createWildcardDirectoryWatcher,
        // Close existing watch thats not needed any more
        onDeleteValue: closeFileWatcherOf,
        // Close existing watch that doesnt match in the flags
        onExistingValue: updateWildcardDirectoryWatcher
    });
    function createWildcardDirectoryWatcher(directory, flags) {
        // Create new watch and recursive info
        return {
            watcher: watchDirectory(directory, flags),
            flags: flags
        };
    }
    function updateWildcardDirectoryWatcher(existingWatcher, flags, directory) {
        // Watcher needs to be updated if the recursive flags dont match
        if (existingWatcher.flags === flags) {
            return;
        }
        existingWatcher.watcher.close();
        existingWatchedForWildcards.set(directory, createWildcardDirectoryWatcher(directory, flags));
    }
}
exports.updateWatchingWildcardDirectories = updateWatchingWildcardDirectories;
/** @internal */
function isIgnoredFileFromWildCardWatching(_a) {
    var watchedDirPath = _a.watchedDirPath, fileOrDirectory = _a.fileOrDirectory, fileOrDirectoryPath = _a.fileOrDirectoryPath, configFileName = _a.configFileName, options = _a.options, program = _a.program, extraFileExtensions = _a.extraFileExtensions, currentDirectory = _a.currentDirectory, useCaseSensitiveFileNames = _a.useCaseSensitiveFileNames, writeLog = _a.writeLog, toPath = _a.toPath;
    var newPath = (0, ts_1.removeIgnoredPath)(fileOrDirectoryPath);
    if (!newPath) {
        writeLog("Project: ".concat(configFileName, " Detected ignored path: ").concat(fileOrDirectory));
        return true;
    }
    fileOrDirectoryPath = newPath;
    if (fileOrDirectoryPath === watchedDirPath)
        return false;
    // If the the added or created file or directory is not supported file name, ignore the file
    // But when watched directory is added/removed, we need to reload the file list
    if ((0, ts_1.hasExtension)(fileOrDirectoryPath) && !(0, ts_1.isSupportedSourceFileName)(fileOrDirectory, options, extraFileExtensions)) {
        writeLog("Project: ".concat(configFileName, " Detected file add/remove of non supported extension: ").concat(fileOrDirectory));
        return true;
    }
    if ((0, ts_1.isExcludedFile)(fileOrDirectory, options.configFile.configFileSpecs, (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getDirectoryPath)(configFileName), currentDirectory), useCaseSensitiveFileNames, currentDirectory)) {
        writeLog("Project: ".concat(configFileName, " Detected excluded file: ").concat(fileOrDirectory));
        return true;
    }
    if (!program)
        return false;
    // We want to ignore emit file check if file is not going to be emitted next to source file
    // In that case we follow config file inclusion rules
    if ((0, ts_1.outFile)(options) || options.outDir)
        return false;
    // File if emitted next to input needs to be ignored
    if ((0, ts_1.isDeclarationFileName)(fileOrDirectoryPath)) {
        // If its declaration directory: its not ignored if not excluded by config
        if (options.declarationDir)
            return false;
    }
    else if (!(0, ts_1.fileExtensionIsOneOf)(fileOrDirectoryPath, ts_1.supportedJSExtensionsFlat)) {
        return false;
    }
    // just check if sourceFile with the name exists
    var filePathWithoutExtension = (0, ts_1.removeFileExtension)(fileOrDirectoryPath);
    var realProgram = (0, ts_1.isArray)(program) ? undefined : isBuilderProgram(program) ? program.getProgramOrUndefined() : program;
    var builderProgram = !realProgram && !(0, ts_1.isArray)(program) ? program : undefined;
    if (hasSourceFile((filePathWithoutExtension + ".ts" /* Extension.Ts */)) ||
        hasSourceFile((filePathWithoutExtension + ".tsx" /* Extension.Tsx */))) {
        writeLog("Project: ".concat(configFileName, " Detected output file: ").concat(fileOrDirectory));
        return true;
    }
    return false;
    function hasSourceFile(file) {
        return realProgram ?
            !!realProgram.getSourceFileByPath(file) :
            builderProgram ?
                builderProgram.getState().fileInfos.has(file) :
                !!(0, ts_1.find)(program, function (rootFile) { return toPath(rootFile) === file; });
    }
}
exports.isIgnoredFileFromWildCardWatching = isIgnoredFileFromWildCardWatching;
function isBuilderProgram(program) {
    return !!program.getState;
}
/** @internal */
function isEmittedFileOfProgram(program, file) {
    if (!program) {
        return false;
    }
    return program.isEmittedFile(file);
}
exports.isEmittedFileOfProgram = isEmittedFileOfProgram;
/** @internal */
var WatchLogLevel;
(function (WatchLogLevel) {
    WatchLogLevel[WatchLogLevel["None"] = 0] = "None";
    WatchLogLevel[WatchLogLevel["TriggerOnly"] = 1] = "TriggerOnly";
    WatchLogLevel[WatchLogLevel["Verbose"] = 2] = "Verbose";
})(WatchLogLevel || (exports.WatchLogLevel = WatchLogLevel = {}));
/** @internal */
function getWatchFactory(host, watchLogLevel, log, getDetailWatchInfo) {
    (0, ts_1.setSysLog)(watchLogLevel === WatchLogLevel.Verbose ? log : ts_1.noop);
    var plainInvokeFactory = {
        watchFile: function (file, callback, pollingInterval, options) { return host.watchFile(file, callback, pollingInterval, options); },
        watchDirectory: function (directory, callback, flags, options) { return host.watchDirectory(directory, callback, (flags & 1 /* WatchDirectoryFlags.Recursive */) !== 0, options); },
    };
    var triggerInvokingFactory = watchLogLevel !== WatchLogLevel.None ?
        {
            watchFile: createTriggerLoggingAddWatch("watchFile"),
            watchDirectory: createTriggerLoggingAddWatch("watchDirectory")
        } :
        undefined;
    var factory = watchLogLevel === WatchLogLevel.Verbose ?
        {
            watchFile: createFileWatcherWithLogging,
            watchDirectory: createDirectoryWatcherWithLogging
        } :
        triggerInvokingFactory || plainInvokeFactory;
    var excludeWatcherFactory = watchLogLevel === WatchLogLevel.Verbose ?
        createExcludeWatcherWithLogging :
        ts_1.returnNoopFileWatcher;
    return {
        watchFile: createExcludeHandlingAddWatch("watchFile"),
        watchDirectory: createExcludeHandlingAddWatch("watchDirectory")
    };
    function createExcludeHandlingAddWatch(key) {
        return function (file, cb, flags, options, detailInfo1, detailInfo2) {
            var _a;
            return !(0, ts_1.matchesExclude)(file, key === "watchFile" ? options === null || options === void 0 ? void 0 : options.excludeFiles : options === null || options === void 0 ? void 0 : options.excludeDirectories, useCaseSensitiveFileNames(), ((_a = host.getCurrentDirectory) === null || _a === void 0 ? void 0 : _a.call(host)) || "") ?
                factory[key].call(/*thisArgs*/ undefined, file, cb, flags, options, detailInfo1, detailInfo2) :
                excludeWatcherFactory(file, flags, options, detailInfo1, detailInfo2);
        };
    }
    function useCaseSensitiveFileNames() {
        return typeof host.useCaseSensitiveFileNames === "boolean" ?
            host.useCaseSensitiveFileNames :
            host.useCaseSensitiveFileNames();
    }
    function createExcludeWatcherWithLogging(file, flags, options, detailInfo1, detailInfo2) {
        log("ExcludeWatcher:: Added:: ".concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo)));
        return {
            close: function () { return log("ExcludeWatcher:: Close:: ".concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo))); }
        };
    }
    function createFileWatcherWithLogging(file, cb, flags, options, detailInfo1, detailInfo2) {
        log("FileWatcher:: Added:: ".concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo)));
        var watcher = triggerInvokingFactory.watchFile(file, cb, flags, options, detailInfo1, detailInfo2);
        return {
            close: function () {
                log("FileWatcher:: Close:: ".concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo)));
                watcher.close();
            }
        };
    }
    function createDirectoryWatcherWithLogging(file, cb, flags, options, detailInfo1, detailInfo2) {
        var watchInfo = "DirectoryWatcher:: Added:: ".concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo));
        log(watchInfo);
        var start = (0, ts_1.timestamp)();
        var watcher = triggerInvokingFactory.watchDirectory(file, cb, flags, options, detailInfo1, detailInfo2);
        var elapsed = (0, ts_1.timestamp)() - start;
        log("Elapsed:: ".concat(elapsed, "ms ").concat(watchInfo));
        return {
            close: function () {
                var watchInfo = "DirectoryWatcher:: Close:: ".concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo));
                log(watchInfo);
                var start = (0, ts_1.timestamp)();
                watcher.close();
                var elapsed = (0, ts_1.timestamp)() - start;
                log("Elapsed:: ".concat(elapsed, "ms ").concat(watchInfo));
            }
        };
    }
    function createTriggerLoggingAddWatch(key) {
        return function (file, cb, flags, options, detailInfo1, detailInfo2) { return plainInvokeFactory[key].call(/*thisArgs*/ undefined, file, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var triggerredInfo = "".concat(key === "watchFile" ? "FileWatcher" : "DirectoryWatcher", ":: Triggered with ").concat(args[0], " ").concat(args[1] !== undefined ? args[1] : "", ":: ").concat(getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo));
            log(triggerredInfo);
            var start = (0, ts_1.timestamp)();
            cb.call.apply(cb, __spreadArray([/*thisArg*/ undefined], args, false));
            var elapsed = (0, ts_1.timestamp)() - start;
            log("Elapsed:: ".concat(elapsed, "ms ").concat(triggerredInfo));
        }, flags, options, detailInfo1, detailInfo2); };
    }
    function getWatchInfo(file, flags, options, detailInfo1, detailInfo2, getDetailWatchInfo) {
        return "WatchInfo: ".concat(file, " ").concat(flags, " ").concat(JSON.stringify(options), " ").concat(getDetailWatchInfo ? getDetailWatchInfo(detailInfo1, detailInfo2) : detailInfo2 === undefined ? detailInfo1 : "".concat(detailInfo1, " ").concat(detailInfo2));
    }
}
exports.getWatchFactory = getWatchFactory;
/** @internal */
function getFallbackOptions(options) {
    var fallbackPolling = options === null || options === void 0 ? void 0 : options.fallbackPolling;
    return {
        watchFile: fallbackPolling !== undefined ?
            fallbackPolling :
            ts_1.WatchFileKind.PriorityPollingInterval
    };
}
exports.getFallbackOptions = getFallbackOptions;
/** @internal */
function closeFileWatcherOf(objWithWatcher) {
    objWithWatcher.watcher.close();
}
exports.closeFileWatcherOf = closeFileWatcherOf;
