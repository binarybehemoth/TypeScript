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
exports.setSys = exports.sys = exports.patchWriteFileEnsuringDirectory = exports.createSystemWatchFunctions = exports.setSysLog = exports.sysLog = exports.ignoredPaths = exports.getFileWatcherEventKind = exports.unchangedPollThresholds = exports.getModifiedTime = exports.missingFileModifiedTime = exports.PollingInterval = exports.FileWatcherEventKind = exports.setStackTraceLimit = exports.generateDjb2Hash = void 0;
var ts_1 = require("./_namespaces/ts");
/**
 * djb2 hashing algorithm
 * http://www.cse.yorku.ca/~oz/hash.html
 *
 * @internal
 */
function generateDjb2Hash(data) {
    var acc = 5381;
    for (var i = 0; i < data.length; i++) {
        acc = ((acc << 5) + acc) + data.charCodeAt(i);
    }
    return acc.toString();
}
exports.generateDjb2Hash = generateDjb2Hash;
/**
 * Set a high stack trace limit to provide more information in case of an error.
 * Called for command-line and server use cases.
 * Not called if TypeScript is used as a library.
 *
 * @internal
 */
function setStackTraceLimit() {
    if (Error.stackTraceLimit < 100) { // Also tests that we won't set the property if it doesn't exist.
        Error.stackTraceLimit = 100;
    }
}
exports.setStackTraceLimit = setStackTraceLimit;
var FileWatcherEventKind;
(function (FileWatcherEventKind) {
    FileWatcherEventKind[FileWatcherEventKind["Created"] = 0] = "Created";
    FileWatcherEventKind[FileWatcherEventKind["Changed"] = 1] = "Changed";
    FileWatcherEventKind[FileWatcherEventKind["Deleted"] = 2] = "Deleted";
})(FileWatcherEventKind || (exports.FileWatcherEventKind = FileWatcherEventKind = {}));
/** @internal */
var PollingInterval;
(function (PollingInterval) {
    PollingInterval[PollingInterval["High"] = 2000] = "High";
    PollingInterval[PollingInterval["Medium"] = 500] = "Medium";
    PollingInterval[PollingInterval["Low"] = 250] = "Low";
})(PollingInterval || (exports.PollingInterval = PollingInterval = {}));
/** @internal */
exports.missingFileModifiedTime = new Date(0); // Any subsequent modification will occur after this time
/** @internal */
function getModifiedTime(host, fileName) {
    return host.getModifiedTime(fileName) || exports.missingFileModifiedTime;
}
exports.getModifiedTime = getModifiedTime;
function createPollingIntervalBasedLevels(levels) {
    var _a;
    return _a = {},
        _a[PollingInterval.Low] = levels.Low,
        _a[PollingInterval.Medium] = levels.Medium,
        _a[PollingInterval.High] = levels.High,
        _a;
}
var defaultChunkLevels = { Low: 32, Medium: 64, High: 256 };
var pollingChunkSize = createPollingIntervalBasedLevels(defaultChunkLevels);
/** @internal */
exports.unchangedPollThresholds = createPollingIntervalBasedLevels(defaultChunkLevels);
function setCustomPollingValues(system) {
    if (!system.getEnvironmentVariable) {
        return;
    }
    var pollingIntervalChanged = setCustomLevels("TSC_WATCH_POLLINGINTERVAL", PollingInterval);
    pollingChunkSize = getCustomPollingBasedLevels("TSC_WATCH_POLLINGCHUNKSIZE", defaultChunkLevels) || pollingChunkSize;
    exports.unchangedPollThresholds = getCustomPollingBasedLevels("TSC_WATCH_UNCHANGEDPOLLTHRESHOLDS", defaultChunkLevels) || exports.unchangedPollThresholds;
    function getLevel(envVar, level) {
        return system.getEnvironmentVariable("".concat(envVar, "_").concat(level.toUpperCase()));
    }
    function getCustomLevels(baseVariable) {
        var customLevels;
        setCustomLevel("Low");
        setCustomLevel("Medium");
        setCustomLevel("High");
        return customLevels;
        function setCustomLevel(level) {
            var customLevel = getLevel(baseVariable, level);
            if (customLevel) {
                (customLevels || (customLevels = {}))[level] = Number(customLevel);
            }
        }
    }
    function setCustomLevels(baseVariable, levels) {
        var customLevels = getCustomLevels(baseVariable);
        if (customLevels) {
            setLevel("Low");
            setLevel("Medium");
            setLevel("High");
            return true;
        }
        return false;
        function setLevel(level) {
            levels[level] = customLevels[level] || levels[level];
        }
    }
    function getCustomPollingBasedLevels(baseVariable, defaultLevels) {
        var customLevels = getCustomLevels(baseVariable);
        return (pollingIntervalChanged || customLevels) &&
            createPollingIntervalBasedLevels(customLevels ? __assign(__assign({}, defaultLevels), customLevels) : defaultLevels);
    }
}
function pollWatchedFileQueue(host, queue, pollIndex, chunkSize, callbackOnWatchFileStat) {
    var definedValueCopyToIndex = pollIndex;
    // Max visit would be all elements of the queue
    for (var canVisit = queue.length; chunkSize && canVisit; nextPollIndex(), canVisit--) {
        var watchedFile = queue[pollIndex];
        if (!watchedFile) {
            continue;
        }
        else if (watchedFile.isClosed) {
            queue[pollIndex] = undefined;
            continue;
        }
        // Only files polled count towards chunkSize
        chunkSize--;
        var fileChanged = onWatchedFileStat(watchedFile, getModifiedTime(host, watchedFile.fileName));
        if (watchedFile.isClosed) {
            // Closed watcher as part of callback
            queue[pollIndex] = undefined;
            continue;
        }
        callbackOnWatchFileStat === null || callbackOnWatchFileStat === void 0 ? void 0 : callbackOnWatchFileStat(watchedFile, pollIndex, fileChanged);
        // Defragment the queue while we are at it
        if (queue[pollIndex]) {
            // Copy this file to the non hole location
            if (definedValueCopyToIndex < pollIndex) {
                queue[definedValueCopyToIndex] = watchedFile;
                queue[pollIndex] = undefined;
            }
            definedValueCopyToIndex++;
        }
    }
    // Return next poll index
    return pollIndex;
    function nextPollIndex() {
        pollIndex++;
        if (pollIndex === queue.length) {
            if (definedValueCopyToIndex < pollIndex) {
                // There are holes from definedValueCopyToIndex to end of queue, change queue size
                queue.length = definedValueCopyToIndex;
            }
            pollIndex = 0;
            definedValueCopyToIndex = 0;
        }
    }
}
function createDynamicPriorityPollingWatchFile(host) {
    var watchedFiles = [];
    var changedFilesInLastPoll = [];
    var lowPollingIntervalQueue = createPollingIntervalQueue(PollingInterval.Low);
    var mediumPollingIntervalQueue = createPollingIntervalQueue(PollingInterval.Medium);
    var highPollingIntervalQueue = createPollingIntervalQueue(PollingInterval.High);
    return watchFile;
    function watchFile(fileName, callback, defaultPollingInterval) {
        var file = {
            fileName: fileName,
            callback: callback,
            unchangedPolls: 0,
            mtime: getModifiedTime(host, fileName)
        };
        watchedFiles.push(file);
        addToPollingIntervalQueue(file, defaultPollingInterval);
        return {
            close: function () {
                file.isClosed = true;
                // Remove from watchedFiles
                (0, ts_1.unorderedRemoveItem)(watchedFiles, file);
                // Do not update polling interval queue since that will happen as part of polling
            }
        };
    }
    function createPollingIntervalQueue(pollingInterval) {
        var queue = [];
        queue.pollingInterval = pollingInterval;
        queue.pollIndex = 0;
        queue.pollScheduled = false;
        return queue;
    }
    function pollPollingIntervalQueue(_timeoutType, queue) {
        queue.pollIndex = pollQueue(queue, queue.pollingInterval, queue.pollIndex, pollingChunkSize[queue.pollingInterval]);
        // Set the next polling index and timeout
        if (queue.length) {
            scheduleNextPoll(queue.pollingInterval);
        }
        else {
            ts_1.Debug.assert(queue.pollIndex === 0);
            queue.pollScheduled = false;
        }
    }
    function pollLowPollingIntervalQueue(_timeoutType, queue) {
        // Always poll complete list of changedFilesInLastPoll
        pollQueue(changedFilesInLastPoll, PollingInterval.Low, /*pollIndex*/ 0, changedFilesInLastPoll.length);
        // Finally do the actual polling of the queue
        pollPollingIntervalQueue(_timeoutType, queue);
        // Schedule poll if there are files in changedFilesInLastPoll but no files in the actual queue
        // as pollPollingIntervalQueue wont schedule for next poll
        if (!queue.pollScheduled && changedFilesInLastPoll.length) {
            scheduleNextPoll(PollingInterval.Low);
        }
    }
    function pollQueue(queue, pollingInterval, pollIndex, chunkSize) {
        return pollWatchedFileQueue(host, queue, pollIndex, chunkSize, onWatchFileStat);
        function onWatchFileStat(watchedFile, pollIndex, fileChanged) {
            if (fileChanged) {
                watchedFile.unchangedPolls = 0;
                // Changed files go to changedFilesInLastPoll queue
                if (queue !== changedFilesInLastPoll) {
                    queue[pollIndex] = undefined;
                    addChangedFileToLowPollingIntervalQueue(watchedFile);
                }
            }
            else if (watchedFile.unchangedPolls !== exports.unchangedPollThresholds[pollingInterval]) {
                watchedFile.unchangedPolls++;
            }
            else if (queue === changedFilesInLastPoll) {
                // Restart unchangedPollCount for unchanged file and move to low polling interval queue
                watchedFile.unchangedPolls = 1;
                queue[pollIndex] = undefined;
                addToPollingIntervalQueue(watchedFile, PollingInterval.Low);
            }
            else if (pollingInterval !== PollingInterval.High) {
                watchedFile.unchangedPolls++;
                queue[pollIndex] = undefined;
                addToPollingIntervalQueue(watchedFile, pollingInterval === PollingInterval.Low ? PollingInterval.Medium : PollingInterval.High);
            }
        }
    }
    function pollingIntervalQueue(pollingInterval) {
        switch (pollingInterval) {
            case PollingInterval.Low:
                return lowPollingIntervalQueue;
            case PollingInterval.Medium:
                return mediumPollingIntervalQueue;
            case PollingInterval.High:
                return highPollingIntervalQueue;
        }
    }
    function addToPollingIntervalQueue(file, pollingInterval) {
        pollingIntervalQueue(pollingInterval).push(file);
        scheduleNextPollIfNotAlreadyScheduled(pollingInterval);
    }
    function addChangedFileToLowPollingIntervalQueue(file) {
        changedFilesInLastPoll.push(file);
        scheduleNextPollIfNotAlreadyScheduled(PollingInterval.Low);
    }
    function scheduleNextPollIfNotAlreadyScheduled(pollingInterval) {
        if (!pollingIntervalQueue(pollingInterval).pollScheduled) {
            scheduleNextPoll(pollingInterval);
        }
    }
    function scheduleNextPoll(pollingInterval) {
        pollingIntervalQueue(pollingInterval).pollScheduled = host.setTimeout(pollingInterval === PollingInterval.Low ? pollLowPollingIntervalQueue : pollPollingIntervalQueue, pollingInterval, pollingInterval === PollingInterval.Low ? "pollLowPollingIntervalQueue" : "pollPollingIntervalQueue", pollingIntervalQueue(pollingInterval));
    }
}
function createUseFsEventsOnParentDirectoryWatchFile(fsWatch, useCaseSensitiveFileNames) {
    // One file can have multiple watchers
    var fileWatcherCallbacks = (0, ts_1.createMultiMap)();
    var dirWatchers = new Map();
    var toCanonicalName = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    return nonPollingWatchFile;
    function nonPollingWatchFile(fileName, callback, _pollingInterval, fallbackOptions) {
        var filePath = toCanonicalName(fileName);
        fileWatcherCallbacks.add(filePath, callback);
        var dirPath = (0, ts_1.getDirectoryPath)(filePath) || ".";
        var watcher = dirWatchers.get(dirPath) ||
            createDirectoryWatcher((0, ts_1.getDirectoryPath)(fileName) || ".", dirPath, fallbackOptions);
        watcher.referenceCount++;
        return {
            close: function () {
                if (watcher.referenceCount === 1) {
                    watcher.close();
                    dirWatchers.delete(dirPath);
                }
                else {
                    watcher.referenceCount--;
                }
                fileWatcherCallbacks.remove(filePath, callback);
            }
        };
    }
    function createDirectoryWatcher(dirName, dirPath, fallbackOptions) {
        var watcher = fsWatch(dirName, 1 /* FileSystemEntryKind.Directory */, function (_eventName, relativeFileName, modifiedTime) {
            // When files are deleted from disk, the triggered "rename" event would have a relativefileName of "undefined"
            if (!(0, ts_1.isString)(relativeFileName))
                return;
            var fileName = (0, ts_1.getNormalizedAbsolutePath)(relativeFileName, dirName);
            // Some applications save a working file via rename operations
            var callbacks = fileName && fileWatcherCallbacks.get(toCanonicalName(fileName));
            if (callbacks) {
                for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                    var fileCallback = callbacks_1[_i];
                    fileCallback(fileName, FileWatcherEventKind.Changed, modifiedTime);
                }
            }
        }, 
        /*recursive*/ false, PollingInterval.Medium, fallbackOptions);
        watcher.referenceCount = 0;
        dirWatchers.set(dirPath, watcher);
        return watcher;
    }
}
function createFixedChunkSizePollingWatchFile(host) {
    var watchedFiles = [];
    var pollIndex = 0;
    var pollScheduled;
    return watchFile;
    function watchFile(fileName, callback) {
        var file = {
            fileName: fileName,
            callback: callback,
            mtime: getModifiedTime(host, fileName)
        };
        watchedFiles.push(file);
        scheduleNextPoll();
        return {
            close: function () {
                file.isClosed = true;
                (0, ts_1.unorderedRemoveItem)(watchedFiles, file);
            }
        };
    }
    function pollQueue() {
        pollScheduled = undefined;
        pollIndex = pollWatchedFileQueue(host, watchedFiles, pollIndex, pollingChunkSize[PollingInterval.Low]);
        scheduleNextPoll();
    }
    function scheduleNextPoll() {
        if (!watchedFiles.length || pollScheduled)
            return;
        pollScheduled = host.setTimeout(pollQueue, PollingInterval.High, "pollQueue");
    }
}
function createSingleWatcherPerName(cache, useCaseSensitiveFileNames, name, callback, createWatcher) {
    var toCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    var path = toCanonicalFileName(name);
    var existing = cache.get(path);
    if (existing) {
        existing.callbacks.push(callback);
    }
    else {
        cache.set(path, {
            watcher: createWatcher((
            // Cant infer types correctly so lets satisfy checker
            function (param1, param2, param3) { var _a; return (_a = cache.get(path)) === null || _a === void 0 ? void 0 : _a.callbacks.slice().forEach(function (cb) { return cb(param1, param2, param3); }); })),
            callbacks: [callback]
        });
    }
    return {
        close: function () {
            var watcher = cache.get(path);
            // Watcher is not expected to be undefined, but if it is normally its because
            // exception was thrown somewhere else and watch state is not what it should be
            if (!watcher)
                return;
            if (!(0, ts_1.orderedRemoveItem)(watcher.callbacks, callback) || watcher.callbacks.length)
                return;
            cache.delete(path);
            (0, ts_1.closeFileWatcherOf)(watcher);
        }
    };
}
/**
 * Returns true if file status changed
 */
function onWatchedFileStat(watchedFile, modifiedTime) {
    var oldTime = watchedFile.mtime.getTime();
    var newTime = modifiedTime.getTime();
    if (oldTime !== newTime) {
        watchedFile.mtime = modifiedTime;
        // Pass modified times so tsc --build can use it
        watchedFile.callback(watchedFile.fileName, getFileWatcherEventKind(oldTime, newTime), modifiedTime);
        return true;
    }
    return false;
}
/** @internal */
function getFileWatcherEventKind(oldTime, newTime) {
    return oldTime === 0
        ? FileWatcherEventKind.Created
        : newTime === 0
            ? FileWatcherEventKind.Deleted
            : FileWatcherEventKind.Changed;
}
exports.getFileWatcherEventKind = getFileWatcherEventKind;
/** @internal */
exports.ignoredPaths = ["/node_modules/.", "/.git", "/.#"];
var curSysLog = ts_1.noop;
/** @internal */
function sysLog(s) {
    return curSysLog(s);
}
exports.sysLog = sysLog;
/** @internal */
function setSysLog(logger) {
    curSysLog = logger;
}
exports.setSysLog = setSysLog;
/**
 * Watch the directory recursively using host provided method to watch child directories
 * that means if this is recursive watcher, watch the children directories as well
 * (eg on OS that dont support recursive watch using fs.watch use fs.watchFile)
 */
function createDirectoryWatcherSupportingRecursive(_a) {
    var watchDirectory = _a.watchDirectory, useCaseSensitiveFileNames = _a.useCaseSensitiveFileNames, getCurrentDirectory = _a.getCurrentDirectory, getAccessibleSortedChildDirectories = _a.getAccessibleSortedChildDirectories, fileSystemEntryExists = _a.fileSystemEntryExists, realpath = _a.realpath, setTimeout = _a.setTimeout, clearTimeout = _a.clearTimeout;
    var cache = new Map();
    var callbackCache = (0, ts_1.createMultiMap)();
    var cacheToUpdateChildWatches = new Map();
    var timerToUpdateChildWatches;
    var filePathComparer = (0, ts_1.getStringComparer)(!useCaseSensitiveFileNames);
    var toCanonicalFilePath = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    return function (dirName, callback, recursive, options) { return recursive ?
        createDirectoryWatcher(dirName, options, callback) :
        watchDirectory(dirName, callback, recursive, options); };
    /**
     * Create the directory watcher for the dirPath.
     */
    function createDirectoryWatcher(dirName, options, callback) {
        var dirPath = toCanonicalFilePath(dirName);
        var directoryWatcher = cache.get(dirPath);
        if (directoryWatcher) {
            directoryWatcher.refCount++;
        }
        else {
            directoryWatcher = {
                watcher: watchDirectory(dirName, function (fileName) {
                    if (isIgnoredPath(fileName, options))
                        return;
                    if (options === null || options === void 0 ? void 0 : options.synchronousWatchDirectory) {
                        // Call the actual callback
                        invokeCallbacks(dirPath, fileName);
                        // Iterate through existing children and update the watches if needed
                        updateChildWatches(dirName, dirPath, options);
                    }
                    else {
                        nonSyncUpdateChildWatches(dirName, dirPath, fileName, options);
                    }
                }, /*recursive*/ false, options),
                refCount: 1,
                childWatches: ts_1.emptyArray
            };
            cache.set(dirPath, directoryWatcher);
            updateChildWatches(dirName, dirPath, options);
        }
        var callbackToAdd = callback && { dirName: dirName, callback: callback };
        if (callbackToAdd) {
            callbackCache.add(dirPath, callbackToAdd);
        }
        return {
            dirName: dirName,
            close: function () {
                var directoryWatcher = ts_1.Debug.checkDefined(cache.get(dirPath));
                if (callbackToAdd)
                    callbackCache.remove(dirPath, callbackToAdd);
                directoryWatcher.refCount--;
                if (directoryWatcher.refCount)
                    return;
                cache.delete(dirPath);
                (0, ts_1.closeFileWatcherOf)(directoryWatcher);
                directoryWatcher.childWatches.forEach(ts_1.closeFileWatcher);
            }
        };
    }
    function invokeCallbacks(dirPath, fileNameOrInvokeMap, fileNames) {
        var fileName;
        var invokeMap;
        if ((0, ts_1.isString)(fileNameOrInvokeMap)) {
            fileName = fileNameOrInvokeMap;
        }
        else {
            invokeMap = fileNameOrInvokeMap;
        }
        // Call the actual callback
        callbackCache.forEach(function (callbacks, rootDirName) {
            var _a;
            if (invokeMap && invokeMap.get(rootDirName) === true)
                return;
            if (rootDirName === dirPath || ((0, ts_1.startsWith)(dirPath, rootDirName) && dirPath[rootDirName.length] === ts_1.directorySeparator)) {
                if (invokeMap) {
                    if (fileNames) {
                        var existing = invokeMap.get(rootDirName);
                        if (existing) {
                            (_a = existing).push.apply(_a, fileNames);
                        }
                        else {
                            invokeMap.set(rootDirName, fileNames.slice());
                        }
                    }
                    else {
                        invokeMap.set(rootDirName, true);
                    }
                }
                else {
                    callbacks.forEach(function (_a) {
                        var callback = _a.callback;
                        return callback(fileName);
                    });
                }
            }
        });
    }
    function nonSyncUpdateChildWatches(dirName, dirPath, fileName, options) {
        // Iterate through existing children and update the watches if needed
        var parentWatcher = cache.get(dirPath);
        if (parentWatcher && fileSystemEntryExists(dirName, 1 /* FileSystemEntryKind.Directory */)) {
            // Schedule the update and postpone invoke for callbacks
            scheduleUpdateChildWatches(dirName, dirPath, fileName, options);
            return;
        }
        // Call the actual callbacks and remove child watches
        invokeCallbacks(dirPath, fileName);
        removeChildWatches(parentWatcher);
    }
    function scheduleUpdateChildWatches(dirName, dirPath, fileName, options) {
        var existing = cacheToUpdateChildWatches.get(dirPath);
        if (existing) {
            existing.fileNames.push(fileName);
        }
        else {
            cacheToUpdateChildWatches.set(dirPath, { dirName: dirName, options: options, fileNames: [fileName] });
        }
        if (timerToUpdateChildWatches) {
            clearTimeout(timerToUpdateChildWatches);
            timerToUpdateChildWatches = undefined;
        }
        timerToUpdateChildWatches = setTimeout(onTimerToUpdateChildWatches, 1000, "timerToUpdateChildWatches");
    }
    function onTimerToUpdateChildWatches() {
        timerToUpdateChildWatches = undefined;
        sysLog("sysLog:: onTimerToUpdateChildWatches:: ".concat(cacheToUpdateChildWatches.size));
        var start = (0, ts_1.timestamp)();
        var invokeMap = new Map();
        while (!timerToUpdateChildWatches && cacheToUpdateChildWatches.size) {
            var result = cacheToUpdateChildWatches.entries().next();
            ts_1.Debug.assert(!result.done);
            var _a = result.value, dirPath = _a[0], _b = _a[1], dirName = _b.dirName, options = _b.options, fileNames = _b.fileNames;
            cacheToUpdateChildWatches.delete(dirPath);
            // Because the child refresh is fresh, we would need to invalidate whole root directory being watched
            // to ensure that all the changes are reflected at this time
            var hasChanges = updateChildWatches(dirName, dirPath, options);
            invokeCallbacks(dirPath, invokeMap, hasChanges ? undefined : fileNames);
        }
        sysLog("sysLog:: invokingWatchers:: Elapsed:: ".concat((0, ts_1.timestamp)() - start, "ms:: ").concat(cacheToUpdateChildWatches.size));
        callbackCache.forEach(function (callbacks, rootDirName) {
            var existing = invokeMap.get(rootDirName);
            if (existing) {
                callbacks.forEach(function (_a) {
                    var callback = _a.callback, dirName = _a.dirName;
                    if ((0, ts_1.isArray)(existing)) {
                        existing.forEach(callback);
                    }
                    else {
                        callback(dirName);
                    }
                });
            }
        });
        var elapsed = (0, ts_1.timestamp)() - start;
        sysLog("sysLog:: Elapsed:: ".concat(elapsed, "ms:: onTimerToUpdateChildWatches:: ").concat(cacheToUpdateChildWatches.size, " ").concat(timerToUpdateChildWatches));
    }
    function removeChildWatches(parentWatcher) {
        if (!parentWatcher)
            return;
        var existingChildWatches = parentWatcher.childWatches;
        parentWatcher.childWatches = ts_1.emptyArray;
        for (var _i = 0, existingChildWatches_1 = existingChildWatches; _i < existingChildWatches_1.length; _i++) {
            var childWatcher = existingChildWatches_1[_i];
            childWatcher.close();
            removeChildWatches(cache.get(toCanonicalFilePath(childWatcher.dirName)));
        }
    }
    function updateChildWatches(parentDir, parentDirPath, options) {
        // Iterate through existing children and update the watches if needed
        var parentWatcher = cache.get(parentDirPath);
        if (!parentWatcher)
            return false;
        var newChildWatches;
        var hasChanges = (0, ts_1.enumerateInsertsAndDeletes)(fileSystemEntryExists(parentDir, 1 /* FileSystemEntryKind.Directory */) ? (0, ts_1.mapDefined)(getAccessibleSortedChildDirectories(parentDir), function (child) {
            var childFullName = (0, ts_1.getNormalizedAbsolutePath)(child, parentDir);
            // Filter our the symbolic link directories since those arent included in recursive watch
            // which is same behaviour when recursive: true is passed to fs.watch
            return !isIgnoredPath(childFullName, options) && filePathComparer(childFullName, (0, ts_1.normalizePath)(realpath(childFullName))) === 0 /* Comparison.EqualTo */ ? childFullName : undefined;
        }) : ts_1.emptyArray, parentWatcher.childWatches, function (child, childWatcher) { return filePathComparer(child, childWatcher.dirName); }, createAndAddChildDirectoryWatcher, ts_1.closeFileWatcher, addChildDirectoryWatcher);
        parentWatcher.childWatches = newChildWatches || ts_1.emptyArray;
        return hasChanges;
        /**
         * Create new childDirectoryWatcher and add it to the new ChildDirectoryWatcher list
         */
        function createAndAddChildDirectoryWatcher(childName) {
            var result = createDirectoryWatcher(childName, options);
            addChildDirectoryWatcher(result);
        }
        /**
         * Add child directory watcher to the new ChildDirectoryWatcher list
         */
        function addChildDirectoryWatcher(childWatcher) {
            (newChildWatches || (newChildWatches = [])).push(childWatcher);
        }
    }
    function isIgnoredPath(path, options) {
        return (0, ts_1.some)(exports.ignoredPaths, function (searchPath) { return isInPath(path, searchPath); }) ||
            isIgnoredByWatchOptions(path, options, useCaseSensitiveFileNames, getCurrentDirectory);
    }
    function isInPath(path, searchPath) {
        if ((0, ts_1.stringContains)(path, searchPath))
            return true;
        if (useCaseSensitiveFileNames)
            return false;
        return (0, ts_1.stringContains)(toCanonicalFilePath(path), searchPath);
    }
}
function createFileWatcherCallback(callback) {
    return function (_fileName, eventKind, modifiedTime) { return callback(eventKind === FileWatcherEventKind.Changed ? "change" : "rename", "", modifiedTime); };
}
function createFsWatchCallbackForFileWatcherCallback(fileName, callback, getModifiedTime) {
    return function (eventName, _relativeFileName, modifiedTime) {
        if (eventName === "rename") {
            // Check time stamps rather than file system entry checks
            modifiedTime || (modifiedTime = getModifiedTime(fileName) || exports.missingFileModifiedTime);
            callback(fileName, modifiedTime !== exports.missingFileModifiedTime ? FileWatcherEventKind.Created : FileWatcherEventKind.Deleted, modifiedTime);
        }
        else {
            // Change
            callback(fileName, FileWatcherEventKind.Changed, modifiedTime);
        }
    };
}
function isIgnoredByWatchOptions(pathToCheck, options, useCaseSensitiveFileNames, getCurrentDirectory) {
    return ((options === null || options === void 0 ? void 0 : options.excludeDirectories) || (options === null || options === void 0 ? void 0 : options.excludeFiles)) && ((0, ts_1.matchesExclude)(pathToCheck, options === null || options === void 0 ? void 0 : options.excludeFiles, useCaseSensitiveFileNames, getCurrentDirectory()) ||
        (0, ts_1.matchesExclude)(pathToCheck, options === null || options === void 0 ? void 0 : options.excludeDirectories, useCaseSensitiveFileNames, getCurrentDirectory()));
}
function createFsWatchCallbackForDirectoryWatcherCallback(directoryName, callback, options, useCaseSensitiveFileNames, getCurrentDirectory) {
    return function (eventName, relativeFileName) {
        // In watchDirectory we only care about adding and removing files (when event name is
        // "rename"); changes made within files are handled by corresponding fileWatchers (when
        // event name is "change")
        if (eventName === "rename") {
            // When deleting a file, the passed baseFileName is null
            var fileName = !relativeFileName ? directoryName : (0, ts_1.normalizePath)((0, ts_1.combinePaths)(directoryName, relativeFileName));
            if (!relativeFileName || !isIgnoredByWatchOptions(fileName, options, useCaseSensitiveFileNames, getCurrentDirectory)) {
                callback(fileName);
            }
        }
    };
}
/** @internal */
function createSystemWatchFunctions(_a) {
    var pollingWatchFileWorker = _a.pollingWatchFileWorker, getModifiedTime = _a.getModifiedTime, setTimeout = _a.setTimeout, clearTimeout = _a.clearTimeout, fsWatchWorker = _a.fsWatchWorker, fileSystemEntryExists = _a.fileSystemEntryExists, useCaseSensitiveFileNames = _a.useCaseSensitiveFileNames, getCurrentDirectory = _a.getCurrentDirectory, fsSupportsRecursiveFsWatch = _a.fsSupportsRecursiveFsWatch, getAccessibleSortedChildDirectories = _a.getAccessibleSortedChildDirectories, realpath = _a.realpath, tscWatchFile = _a.tscWatchFile, useNonPollingWatchers = _a.useNonPollingWatchers, tscWatchDirectory = _a.tscWatchDirectory, inodeWatching = _a.inodeWatching, sysLog = _a.sysLog;
    var pollingWatches = new Map();
    var fsWatches = new Map();
    var fsWatchesRecursive = new Map();
    var dynamicPollingWatchFile;
    var fixedChunkSizePollingWatchFile;
    var nonPollingWatchFile;
    var hostRecursiveDirectoryWatcher;
    var hitSystemWatcherLimit = false;
    return {
        watchFile: watchFile,
        watchDirectory: watchDirectory
    };
    function watchFile(fileName, callback, pollingInterval, options) {
        options = updateOptionsForWatchFile(options, useNonPollingWatchers);
        var watchFileKind = ts_1.Debug.checkDefined(options.watchFile);
        switch (watchFileKind) {
            case ts_1.WatchFileKind.FixedPollingInterval:
                return pollingWatchFile(fileName, callback, PollingInterval.Low, /*options*/ undefined);
            case ts_1.WatchFileKind.PriorityPollingInterval:
                return pollingWatchFile(fileName, callback, pollingInterval, /*options*/ undefined);
            case ts_1.WatchFileKind.DynamicPriorityPolling:
                return ensureDynamicPollingWatchFile()(fileName, callback, pollingInterval, /*options*/ undefined);
            case ts_1.WatchFileKind.FixedChunkSizePolling:
                return ensureFixedChunkSizePollingWatchFile()(fileName, callback, /* pollingInterval */ undefined, /*options*/ undefined);
            case ts_1.WatchFileKind.UseFsEvents:
                return fsWatch(fileName, 0 /* FileSystemEntryKind.File */, createFsWatchCallbackForFileWatcherCallback(fileName, callback, getModifiedTime), 
                /*recursive*/ false, pollingInterval, (0, ts_1.getFallbackOptions)(options));
            case ts_1.WatchFileKind.UseFsEventsOnParentDirectory:
                if (!nonPollingWatchFile) {
                    nonPollingWatchFile = createUseFsEventsOnParentDirectoryWatchFile(fsWatch, useCaseSensitiveFileNames);
                }
                return nonPollingWatchFile(fileName, callback, pollingInterval, (0, ts_1.getFallbackOptions)(options));
            default:
                ts_1.Debug.assertNever(watchFileKind);
        }
    }
    function ensureDynamicPollingWatchFile() {
        return dynamicPollingWatchFile || (dynamicPollingWatchFile = createDynamicPriorityPollingWatchFile({ getModifiedTime: getModifiedTime, setTimeout: setTimeout }));
    }
    function ensureFixedChunkSizePollingWatchFile() {
        return fixedChunkSizePollingWatchFile || (fixedChunkSizePollingWatchFile = createFixedChunkSizePollingWatchFile({ getModifiedTime: getModifiedTime, setTimeout: setTimeout }));
    }
    function updateOptionsForWatchFile(options, useNonPollingWatchers) {
        if (options && options.watchFile !== undefined)
            return options;
        switch (tscWatchFile) {
            case "PriorityPollingInterval":
                // Use polling interval based on priority when create watch using host.watchFile
                return { watchFile: ts_1.WatchFileKind.PriorityPollingInterval };
            case "DynamicPriorityPolling":
                // Use polling interval but change the interval depending on file changes and their default polling interval
                return { watchFile: ts_1.WatchFileKind.DynamicPriorityPolling };
            case "UseFsEvents":
                // Use notifications from FS to watch with falling back to fs.watchFile
                return generateWatchFileOptions(ts_1.WatchFileKind.UseFsEvents, ts_1.PollingWatchKind.PriorityInterval, options);
            case "UseFsEventsWithFallbackDynamicPolling":
                // Use notifications from FS to watch with falling back to dynamic watch file
                return generateWatchFileOptions(ts_1.WatchFileKind.UseFsEvents, ts_1.PollingWatchKind.DynamicPriority, options);
            case "UseFsEventsOnParentDirectory":
                useNonPollingWatchers = true;
            // fall through
            default:
                return useNonPollingWatchers ?
                    // Use notifications from FS to watch with falling back to fs.watchFile
                    generateWatchFileOptions(ts_1.WatchFileKind.UseFsEventsOnParentDirectory, ts_1.PollingWatchKind.PriorityInterval, options) :
                    // Default to using fs events
                    { watchFile: ts_1.WatchFileKind.UseFsEvents };
        }
    }
    function generateWatchFileOptions(watchFile, fallbackPolling, options) {
        var defaultFallbackPolling = options === null || options === void 0 ? void 0 : options.fallbackPolling;
        return {
            watchFile: watchFile,
            fallbackPolling: defaultFallbackPolling === undefined ?
                fallbackPolling :
                defaultFallbackPolling
        };
    }
    function watchDirectory(directoryName, callback, recursive, options) {
        if (fsSupportsRecursiveFsWatch) {
            return fsWatch(directoryName, 1 /* FileSystemEntryKind.Directory */, createFsWatchCallbackForDirectoryWatcherCallback(directoryName, callback, options, useCaseSensitiveFileNames, getCurrentDirectory), recursive, PollingInterval.Medium, (0, ts_1.getFallbackOptions)(options));
        }
        if (!hostRecursiveDirectoryWatcher) {
            hostRecursiveDirectoryWatcher = createDirectoryWatcherSupportingRecursive({
                useCaseSensitiveFileNames: useCaseSensitiveFileNames,
                getCurrentDirectory: getCurrentDirectory,
                fileSystemEntryExists: fileSystemEntryExists,
                getAccessibleSortedChildDirectories: getAccessibleSortedChildDirectories,
                watchDirectory: nonRecursiveWatchDirectory,
                realpath: realpath,
                setTimeout: setTimeout,
                clearTimeout: clearTimeout
            });
        }
        return hostRecursiveDirectoryWatcher(directoryName, callback, recursive, options);
    }
    function nonRecursiveWatchDirectory(directoryName, callback, recursive, options) {
        ts_1.Debug.assert(!recursive);
        var watchDirectoryOptions = updateOptionsForWatchDirectory(options);
        var watchDirectoryKind = ts_1.Debug.checkDefined(watchDirectoryOptions.watchDirectory);
        switch (watchDirectoryKind) {
            case ts_1.WatchDirectoryKind.FixedPollingInterval:
                return pollingWatchFile(directoryName, function () { return callback(directoryName); }, PollingInterval.Medium, 
                /*options*/ undefined);
            case ts_1.WatchDirectoryKind.DynamicPriorityPolling:
                return ensureDynamicPollingWatchFile()(directoryName, function () { return callback(directoryName); }, PollingInterval.Medium, 
                /*options*/ undefined);
            case ts_1.WatchDirectoryKind.FixedChunkSizePolling:
                return ensureFixedChunkSizePollingWatchFile()(directoryName, function () { return callback(directoryName); }, 
                /* pollingInterval */ undefined, 
                /*options*/ undefined);
            case ts_1.WatchDirectoryKind.UseFsEvents:
                return fsWatch(directoryName, 1 /* FileSystemEntryKind.Directory */, createFsWatchCallbackForDirectoryWatcherCallback(directoryName, callback, options, useCaseSensitiveFileNames, getCurrentDirectory), recursive, PollingInterval.Medium, (0, ts_1.getFallbackOptions)(watchDirectoryOptions));
            default:
                ts_1.Debug.assertNever(watchDirectoryKind);
        }
    }
    function updateOptionsForWatchDirectory(options) {
        if (options && options.watchDirectory !== undefined)
            return options;
        switch (tscWatchDirectory) {
            case "RecursiveDirectoryUsingFsWatchFile":
                // Use polling interval based on priority when create watch using host.watchFile
                return { watchDirectory: ts_1.WatchDirectoryKind.FixedPollingInterval };
            case "RecursiveDirectoryUsingDynamicPriorityPolling":
                // Use polling interval but change the interval depending on file changes and their default polling interval
                return { watchDirectory: ts_1.WatchDirectoryKind.DynamicPriorityPolling };
            default:
                var defaultFallbackPolling = options === null || options === void 0 ? void 0 : options.fallbackPolling;
                return {
                    watchDirectory: ts_1.WatchDirectoryKind.UseFsEvents,
                    fallbackPolling: defaultFallbackPolling !== undefined ?
                        defaultFallbackPolling :
                        undefined
                };
        }
    }
    function pollingWatchFile(fileName, callback, pollingInterval, options) {
        return createSingleWatcherPerName(pollingWatches, useCaseSensitiveFileNames, fileName, callback, function (cb) { return pollingWatchFileWorker(fileName, cb, pollingInterval, options); });
    }
    function fsWatch(fileOrDirectory, entryKind, callback, recursive, fallbackPollingInterval, fallbackOptions) {
        return createSingleWatcherPerName(recursive ? fsWatchesRecursive : fsWatches, useCaseSensitiveFileNames, fileOrDirectory, callback, function (cb) { return fsWatchHandlingExistenceOnHost(fileOrDirectory, entryKind, cb, recursive, fallbackPollingInterval, fallbackOptions); });
    }
    function fsWatchHandlingExistenceOnHost(fileOrDirectory, entryKind, callback, recursive, fallbackPollingInterval, fallbackOptions) {
        var lastDirectoryPartWithDirectorySeparator;
        var lastDirectoryPart;
        if (inodeWatching) {
            lastDirectoryPartWithDirectorySeparator = fileOrDirectory.substring(fileOrDirectory.lastIndexOf(ts_1.directorySeparator));
            lastDirectoryPart = lastDirectoryPartWithDirectorySeparator.slice(ts_1.directorySeparator.length);
        }
        /** Watcher for the file system entry depending on whether it is missing or present */
        var watcher = !fileSystemEntryExists(fileOrDirectory, entryKind) ?
            watchMissingFileSystemEntry() :
            watchPresentFileSystemEntry();
        return {
            close: function () {
                // Close the watcher (either existing file system entry watcher or missing file system entry watcher)
                if (watcher) {
                    watcher.close();
                    watcher = undefined;
                }
            }
        };
        function updateWatcher(createWatcher) {
            // If watcher is not closed, update it
            if (watcher) {
                sysLog("sysLog:: ".concat(fileOrDirectory, ":: Changing watcher to ").concat(createWatcher === watchPresentFileSystemEntry ? "Present" : "Missing", "FileSystemEntryWatcher"));
                watcher.close();
                watcher = createWatcher();
            }
        }
        /**
         * Watch the file or directory that is currently present
         * and when the watched file or directory is deleted, switch to missing file system entry watcher
         */
        function watchPresentFileSystemEntry() {
            if (hitSystemWatcherLimit) {
                sysLog("sysLog:: ".concat(fileOrDirectory, ":: Defaulting to watchFile"));
                return watchPresentFileSystemEntryWithFsWatchFile();
            }
            try {
                var presentWatcher = fsWatchWorker(fileOrDirectory, recursive, inodeWatching ?
                    callbackChangingToMissingFileSystemEntry :
                    callback);
                // Watch the missing file or directory or error
                presentWatcher.on("error", function () {
                    callback("rename", "");
                    updateWatcher(watchMissingFileSystemEntry);
                });
                return presentWatcher;
            }
            catch (e) {
                // Catch the exception and use polling instead
                // Eg. on linux the number of watches are limited and one could easily exhaust watches and the exception ENOSPC is thrown when creating watcher at that point
                // so instead of throwing error, use fs.watchFile
                hitSystemWatcherLimit || (hitSystemWatcherLimit = e.code === "ENOSPC");
                sysLog("sysLog:: ".concat(fileOrDirectory, ":: Changing to watchFile"));
                return watchPresentFileSystemEntryWithFsWatchFile();
            }
        }
        function callbackChangingToMissingFileSystemEntry(event, relativeName) {
            // In some scenarios, file save operation fires event with fileName.ext~ instead of fileName.ext
            // To ensure we see the file going missing and coming back up (file delete and then recreated)
            // and watches being updated correctly we are calling back with fileName.ext as well as fileName.ext~
            // The worst is we have fired event that was not needed but we wont miss any changes
            // especially in cases where file goes missing and watches wrong inode
            var originalRelativeName;
            if (relativeName && (0, ts_1.endsWith)(relativeName, "~")) {
                originalRelativeName = relativeName;
                relativeName = relativeName.slice(0, relativeName.length - 1);
            }
            // because relativeName is not guaranteed to be correct we need to check on each rename with few combinations
            // Eg on ubuntu while watching app/node_modules the relativeName is "node_modules" which is neither relative nor full path
            if (event === "rename" &&
                (!relativeName ||
                    relativeName === lastDirectoryPart ||
                    (0, ts_1.endsWith)(relativeName, lastDirectoryPartWithDirectorySeparator))) {
                var modifiedTime = getModifiedTime(fileOrDirectory) || exports.missingFileModifiedTime;
                if (originalRelativeName)
                    callback(event, originalRelativeName, modifiedTime);
                callback(event, relativeName, modifiedTime);
                if (inodeWatching) {
                    // If this was rename event, inode has changed means we need to update watcher
                    updateWatcher(modifiedTime === exports.missingFileModifiedTime ? watchMissingFileSystemEntry : watchPresentFileSystemEntry);
                }
                else if (modifiedTime === exports.missingFileModifiedTime) {
                    updateWatcher(watchMissingFileSystemEntry);
                }
            }
            else {
                if (originalRelativeName)
                    callback(event, originalRelativeName);
                callback(event, relativeName);
            }
        }
        /**
         * Watch the file or directory using fs.watchFile since fs.watch threw exception
         * Eg. on linux the number of watches are limited and one could easily exhaust watches and the exception ENOSPC is thrown when creating watcher at that point
         */
        function watchPresentFileSystemEntryWithFsWatchFile() {
            return watchFile(fileOrDirectory, createFileWatcherCallback(callback), fallbackPollingInterval, fallbackOptions);
        }
        /**
         * Watch the file or directory that is missing
         * and switch to existing file or directory when the missing filesystem entry is created
         */
        function watchMissingFileSystemEntry() {
            return watchFile(fileOrDirectory, function (_fileName, eventKind, modifiedTime) {
                if (eventKind === FileWatcherEventKind.Created) {
                    modifiedTime || (modifiedTime = getModifiedTime(fileOrDirectory) || exports.missingFileModifiedTime);
                    if (modifiedTime !== exports.missingFileModifiedTime) {
                        callback("rename", "", modifiedTime);
                        // Call the callback for current file or directory
                        // For now it could be callback for the inner directory creation,
                        // but just return current directory, better than current no-op
                        updateWatcher(watchPresentFileSystemEntry);
                    }
                }
            }, fallbackPollingInterval, fallbackOptions);
        }
    }
}
exports.createSystemWatchFunctions = createSystemWatchFunctions;
/**
 * patch writefile to create folder before writing the file
 *
 * @internal
 */
function patchWriteFileEnsuringDirectory(sys) {
    // patch writefile to create folder before writing the file
    var originalWriteFile = sys.writeFile;
    sys.writeFile = function (path, data, writeBom) {
        return (0, ts_1.writeFileEnsuringDirectories)(path, data, !!writeBom, function (path, data, writeByteOrderMark) { return originalWriteFile.call(sys, path, data, writeByteOrderMark); }, function (path) { return sys.createDirectory(path); }, function (path) { return sys.directoryExists(path); });
    };
}
exports.patchWriteFileEnsuringDirectory = patchWriteFileEnsuringDirectory;
// TODO: GH#18217 this is used as if it's certainly defined in many places.
exports.sys = (function () {
    // NodeJS detects "\uFEFF" at the start of the string and *replaces* it with the actual
    // byte order mark from the specified encoding. Using any other byte order mark does
    // not actually work.
    var byteOrderMarkIndicator = "\uFEFF";
    function getNodeSystem() {
        var _a;
        var nativePattern = /^native |^\([^)]+\)$|^(internal[\\/]|[a-zA-Z0-9_\s]+(\.js)?$)/;
        var _fs = require("fs");
        var _path = require("path");
        var _os = require("os");
        // crypto can be absent on reduced node installations
        var _crypto;
        try {
            _crypto = require("crypto");
        }
        catch (_b) {
            _crypto = undefined;
        }
        var activeSession;
        var profilePath = "./profile.cpuprofile";
        var Buffer = require("buffer").Buffer;
        var isLinuxOrMacOs = process.platform === "linux" || process.platform === "darwin";
        var platform = _os.platform();
        var useCaseSensitiveFileNames = isFileSystemCaseSensitive();
        var fsRealpath = !!_fs.realpathSync.native ? process.platform === "win32" ? fsRealPathHandlingLongPath : _fs.realpathSync.native : _fs.realpathSync;
        // If our filename is "sys.js", then we are executing unbundled on the raw tsc output.
        // In that case, simulate a faked path in the directory where a bundle would normally
        // appear (e.g. the directory containing lib.*.d.ts files).
        //
        // Note that if we ever emit as files like cjs/mjs, this check will be wrong.
        var executingFilePath = __filename.endsWith("sys.js") ? _path.join(_path.dirname(__dirname), "__fake__.js") : __filename;
        var fsSupportsRecursiveFsWatch = process.platform === "win32" || process.platform === "darwin";
        var getCurrentDirectory = (0, ts_1.memoize)(function () { return process.cwd(); });
        var watchFile = (_a = createSystemWatchFunctions({
            pollingWatchFileWorker: fsWatchFileWorker,
            getModifiedTime: getModifiedTime,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            fsWatchWorker: fsWatchWorker,
            useCaseSensitiveFileNames: useCaseSensitiveFileNames,
            getCurrentDirectory: getCurrentDirectory,
            fileSystemEntryExists: fileSystemEntryExists,
            // Node 4.0 `fs.watch` function supports the "recursive" option on both OSX and Windows
            // (ref: https://github.com/nodejs/node/pull/2649 and https://github.com/Microsoft/TypeScript/issues/4643)
            fsSupportsRecursiveFsWatch: fsSupportsRecursiveFsWatch,
            getAccessibleSortedChildDirectories: function (path) { return getAccessibleFileSystemEntries(path).directories; },
            realpath: realpath,
            tscWatchFile: process.env.TSC_WATCHFILE,
            useNonPollingWatchers: !!process.env.TSC_NONPOLLING_WATCHER,
            tscWatchDirectory: process.env.TSC_WATCHDIRECTORY,
            inodeWatching: isLinuxOrMacOs,
            sysLog: sysLog,
        }), _a.watchFile), watchDirectory = _a.watchDirectory;
        var nodeSystem = {
            args: process.argv.slice(2),
            newLine: _os.EOL,
            useCaseSensitiveFileNames: useCaseSensitiveFileNames,
            write: function (s) {
                process.stdout.write(s);
            },
            getWidthOfTerminal: function () {
                return process.stdout.columns;
            },
            writeOutputIsTTY: function () {
                return process.stdout.isTTY;
            },
            readFile: readFile,
            writeFile: writeFile,
            watchFile: watchFile,
            watchDirectory: watchDirectory,
            resolvePath: function (path) { return _path.resolve(path); },
            fileExists: fileExists,
            directoryExists: directoryExists,
            createDirectory: function (directoryName) {
                if (!nodeSystem.directoryExists(directoryName)) {
                    // Wrapped in a try-catch to prevent crashing if we are in a race
                    // with another copy of ourselves to create the same directory
                    try {
                        _fs.mkdirSync(directoryName);
                    }
                    catch (e) {
                        if (e.code !== "EEXIST") {
                            // Failed for some other reason (access denied?); still throw
                            throw e;
                        }
                    }
                }
            },
            getExecutingFilePath: function () {
                return executingFilePath;
            },
            getCurrentDirectory: getCurrentDirectory,
            getDirectories: getDirectories,
            getEnvironmentVariable: function (name) {
                return process.env[name] || "";
            },
            readDirectory: readDirectory,
            getModifiedTime: getModifiedTime,
            setModifiedTime: setModifiedTime,
            deleteFile: deleteFile,
            createHash: _crypto ? createSHA256Hash : generateDjb2Hash,
            createSHA256Hash: _crypto ? createSHA256Hash : undefined,
            getMemoryUsage: function () {
                if (global.gc) {
                    global.gc();
                }
                return process.memoryUsage().heapUsed;
            },
            getFileSize: function (path) {
                try {
                    var stat = statSync(path);
                    if (stat === null || stat === void 0 ? void 0 : stat.isFile()) {
                        return stat.size;
                    }
                }
                catch ( /*ignore*/_a) { /*ignore*/ }
                return 0;
            },
            exit: function (exitCode) {
                disableCPUProfiler(function () { return process.exit(exitCode); });
            },
            enableCPUProfiler: enableCPUProfiler,
            disableCPUProfiler: disableCPUProfiler,
            cpuProfilingEnabled: function () { return !!activeSession || (0, ts_1.contains)(process.execArgv, "--cpu-prof") || (0, ts_1.contains)(process.execArgv, "--prof"); },
            realpath: realpath,
            debugMode: !!process.env.NODE_INSPECTOR_IPC || !!process.env.VSCODE_INSPECTOR_OPTIONS || (0, ts_1.some)(process.execArgv, function (arg) { return /^--(inspect|debug)(-brk)?(=\d+)?$/i.test(arg); }),
            tryEnableSourceMapsForHost: function () {
                try {
                    require("source-map-support").install();
                }
                catch (_a) {
                    // Could not enable source maps.
                }
            },
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            clearScreen: function () {
                process.stdout.write("\x1Bc");
            },
            setBlocking: function () {
                var _a;
                var handle = (_a = process.stdout) === null || _a === void 0 ? void 0 : _a._handle;
                if (handle && handle.setBlocking) {
                    handle.setBlocking(true);
                }
            },
            bufferFrom: bufferFrom,
            base64decode: function (input) { return bufferFrom(input, "base64").toString("utf8"); },
            base64encode: function (input) { return bufferFrom(input).toString("base64"); },
            require: function (baseDir, moduleName) {
                try {
                    var modulePath = (0, ts_1.resolveJSModule)(moduleName, baseDir, nodeSystem);
                    return { module: require(modulePath), modulePath: modulePath, error: undefined };
                }
                catch (error) {
                    return { module: undefined, modulePath: undefined, error: error };
                }
            }
        };
        return nodeSystem;
        /**
         * `throwIfNoEntry` was added so recently that it's not in the node types.
         * This helper encapsulates the mitigating usage of `any`.
         * See https://github.com/nodejs/node/pull/33716
         */
        function statSync(path) {
            // throwIfNoEntry will be ignored by older versions of node
            return _fs.statSync(path, { throwIfNoEntry: false });
        }
        /**
         * Uses the builtin inspector APIs to capture a CPU profile
         * See https://nodejs.org/api/inspector.html#inspector_example_usage for details
         */
        function enableCPUProfiler(path, cb) {
            if (activeSession) {
                cb();
                return false;
            }
            var inspector = require("inspector");
            if (!inspector || !inspector.Session) {
                cb();
                return false;
            }
            var session = new inspector.Session();
            session.connect();
            session.post("Profiler.enable", function () {
                session.post("Profiler.start", function () {
                    activeSession = session;
                    profilePath = path;
                    cb();
                });
            });
            return true;
        }
        /**
         * Strips non-TS paths from the profile, so users with private projects shouldn't
         * need to worry about leaking paths by submitting a cpu profile to us
         */
        function cleanupPaths(profile) {
            var externalFileCounter = 0;
            var remappedPaths = new Map();
            var normalizedDir = (0, ts_1.normalizeSlashes)(_path.dirname(executingFilePath));
            // Windows rooted dir names need an extra `/` prepended to be valid file:/// urls
            var fileUrlRoot = "file://".concat((0, ts_1.getRootLength)(normalizedDir) === 1 ? "" : "/").concat(normalizedDir);
            for (var _i = 0, _a = profile.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node.callFrame.url) {
                    var url = (0, ts_1.normalizeSlashes)(node.callFrame.url);
                    if ((0, ts_1.containsPath)(fileUrlRoot, url, useCaseSensitiveFileNames)) {
                        node.callFrame.url = (0, ts_1.getRelativePathToDirectoryOrUrl)(fileUrlRoot, url, fileUrlRoot, (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames), /*isAbsolutePathAnUrl*/ true);
                    }
                    else if (!nativePattern.test(url)) {
                        node.callFrame.url = (remappedPaths.has(url) ? remappedPaths : remappedPaths.set(url, "external".concat(externalFileCounter, ".js"))).get(url);
                        externalFileCounter++;
                    }
                }
            }
            return profile;
        }
        function disableCPUProfiler(cb) {
            if (activeSession && activeSession !== "stopping") {
                var s_1 = activeSession;
                activeSession.post("Profiler.stop", function (err, _a) {
                    var _b;
                    var profile = _a.profile;
                    if (!err) {
                        try {
                            if ((_b = statSync(profilePath)) === null || _b === void 0 ? void 0 : _b.isDirectory()) {
                                profilePath = _path.join(profilePath, "".concat((new Date()).toISOString().replace(/:/g, "-"), "+P").concat(process.pid, ".cpuprofile"));
                            }
                        }
                        catch (_c) {
                            // do nothing and ignore fallible fs operation
                        }
                        try {
                            _fs.mkdirSync(_path.dirname(profilePath), { recursive: true });
                        }
                        catch (_d) {
                            // do nothing and ignore fallible fs operation
                        }
                        _fs.writeFileSync(profilePath, JSON.stringify(cleanupPaths(profile)));
                    }
                    activeSession = undefined;
                    s_1.disconnect();
                    cb();
                });
                activeSession = "stopping";
                return true;
            }
            else {
                cb();
                return false;
            }
        }
        function bufferFrom(input, encoding) {
            // See https://github.com/Microsoft/TypeScript/issues/25652
            return Buffer.from && Buffer.from !== Int8Array.from
                ? Buffer.from(input, encoding)
                : new Buffer(input, encoding);
        }
        function isFileSystemCaseSensitive() {
            // win32\win64 are case insensitive platforms
            if (platform === "win32" || platform === "win64") {
                return false;
            }
            // If this file exists under a different case, we must be case-insensitve.
            return !fileExists(swapCase(__filename));
        }
        /** Convert all lowercase chars to uppercase, and vice-versa */
        function swapCase(s) {
            return s.replace(/\w/g, function (ch) {
                var up = ch.toUpperCase();
                return ch === up ? ch.toLowerCase() : up;
            });
        }
        function fsWatchFileWorker(fileName, callback, pollingInterval) {
            _fs.watchFile(fileName, { persistent: true, interval: pollingInterval }, fileChanged);
            var eventKind;
            return {
                close: function () { return _fs.unwatchFile(fileName, fileChanged); }
            };
            function fileChanged(curr, prev) {
                // previous event kind check is to ensure we recongnize the file as previously also missing when it is restored or renamed twice (that is it disappears and reappears)
                // In such case, prevTime returned is same as prev time of event when file was deleted as per node documentation
                var isPreviouslyDeleted = +prev.mtime === 0 || eventKind === FileWatcherEventKind.Deleted;
                if (+curr.mtime === 0) {
                    if (isPreviouslyDeleted) {
                        // Already deleted file, no need to callback again
                        return;
                    }
                    eventKind = FileWatcherEventKind.Deleted;
                }
                else if (isPreviouslyDeleted) {
                    eventKind = FileWatcherEventKind.Created;
                }
                // If there is no change in modified time, ignore the event
                else if (+curr.mtime === +prev.mtime) {
                    return;
                }
                else {
                    // File changed
                    eventKind = FileWatcherEventKind.Changed;
                }
                callback(fileName, eventKind, curr.mtime);
            }
        }
        function fsWatchWorker(fileOrDirectory, recursive, callback) {
            // Node 4.0 `fs.watch` function supports the "recursive" option on both OSX and Windows
            // (ref: https://github.com/nodejs/node/pull/2649 and https://github.com/Microsoft/TypeScript/issues/4643)
            return _fs.watch(fileOrDirectory, fsSupportsRecursiveFsWatch ?
                { persistent: true, recursive: !!recursive } : { persistent: true }, callback);
        }
        function readFileWorker(fileName, _encoding) {
            var buffer;
            try {
                buffer = _fs.readFileSync(fileName);
            }
            catch (e) {
                return undefined;
            }
            var len = buffer.length;
            if (len >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
                // Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
                // flip all byte pairs and treat as little endian.
                len &= ~1; // Round down to a multiple of 2
                for (var i = 0; i < len; i += 2) {
                    var temp = buffer[i];
                    buffer[i] = buffer[i + 1];
                    buffer[i + 1] = temp;
                }
                return buffer.toString("utf16le", 2);
            }
            if (len >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
                // Little endian UTF-16 byte order mark detected
                return buffer.toString("utf16le", 2);
            }
            if (len >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
                // UTF-8 byte order mark detected
                return buffer.toString("utf8", 3);
            }
            // Default is UTF-8 with no byte order mark
            return buffer.toString("utf8");
        }
        function readFile(fileName, _encoding) {
            ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartReadFile(fileName);
            var file = readFileWorker(fileName, _encoding);
            ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStopReadFile();
            return file;
        }
        function writeFile(fileName, data, writeByteOrderMark) {
            ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logEvent("WriteFile: " + fileName);
            // If a BOM is required, emit one
            if (writeByteOrderMark) {
                data = byteOrderMarkIndicator + data;
            }
            var fd;
            try {
                fd = _fs.openSync(fileName, "w");
                _fs.writeSync(fd, data, /*position*/ undefined, "utf8");
            }
            finally {
                if (fd !== undefined) {
                    _fs.closeSync(fd);
                }
            }
        }
        function getAccessibleFileSystemEntries(path) {
            ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logEvent("ReadDir: " + (path || "."));
            try {
                var entries = _fs.readdirSync(path || ".", { withFileTypes: true });
                var files = [];
                var directories = [];
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var dirent = entries_1[_i];
                    // withFileTypes is not supported before Node 10.10.
                    var entry = typeof dirent === "string" ? dirent : dirent.name;
                    // This is necessary because on some file system node fails to exclude
                    // "." and "..". See https://github.com/nodejs/node/issues/4002
                    if (entry === "." || entry === "..") {
                        continue;
                    }
                    var stat = void 0;
                    if (typeof dirent === "string" || dirent.isSymbolicLink()) {
                        var name_1 = (0, ts_1.combinePaths)(path, entry);
                        try {
                            stat = statSync(name_1);
                            if (!stat) {
                                continue;
                            }
                        }
                        catch (e) {
                            continue;
                        }
                    }
                    else {
                        stat = dirent;
                    }
                    if (stat.isFile()) {
                        files.push(entry);
                    }
                    else if (stat.isDirectory()) {
                        directories.push(entry);
                    }
                }
                files.sort();
                directories.sort();
                return { files: files, directories: directories };
            }
            catch (e) {
                return ts_1.emptyFileSystemEntries;
            }
        }
        function readDirectory(path, extensions, excludes, includes, depth) {
            return (0, ts_1.matchFiles)(path, extensions, excludes, includes, useCaseSensitiveFileNames, process.cwd(), depth, getAccessibleFileSystemEntries, realpath);
        }
        function fileSystemEntryExists(path, entryKind) {
            // Since the error thrown by fs.statSync isn't used, we can avoid collecting a stack trace to improve
            // the CPU time performance.
            var originalStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 0;
            try {
                var stat = statSync(path);
                if (!stat) {
                    return false;
                }
                switch (entryKind) {
                    case 0 /* FileSystemEntryKind.File */: return stat.isFile();
                    case 1 /* FileSystemEntryKind.Directory */: return stat.isDirectory();
                    default: return false;
                }
            }
            catch (e) {
                return false;
            }
            finally {
                Error.stackTraceLimit = originalStackTraceLimit;
            }
        }
        function fileExists(path) {
            return fileSystemEntryExists(path, 0 /* FileSystemEntryKind.File */);
        }
        function directoryExists(path) {
            return fileSystemEntryExists(path, 1 /* FileSystemEntryKind.Directory */);
        }
        function getDirectories(path) {
            return getAccessibleFileSystemEntries(path).directories.slice();
        }
        function fsRealPathHandlingLongPath(path) {
            return path.length < 260 ? _fs.realpathSync.native(path) : _fs.realpathSync(path);
        }
        function realpath(path) {
            try {
                return fsRealpath(path);
            }
            catch (_a) {
                return path;
            }
        }
        function getModifiedTime(path) {
            var _a;
            // Since the error thrown by fs.statSync isn't used, we can avoid collecting a stack trace to improve
            // the CPU time performance.
            var originalStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 0;
            try {
                return (_a = statSync(path)) === null || _a === void 0 ? void 0 : _a.mtime;
            }
            catch (e) {
                return undefined;
            }
            finally {
                Error.stackTraceLimit = originalStackTraceLimit;
            }
        }
        function setModifiedTime(path, time) {
            try {
                _fs.utimesSync(path, time, time);
            }
            catch (e) {
                return;
            }
        }
        function deleteFile(path) {
            try {
                return _fs.unlinkSync(path);
            }
            catch (e) {
                return;
            }
        }
        function createSHA256Hash(data) {
            var hash = _crypto.createHash("sha256");
            hash.update(data);
            return hash.digest("hex");
        }
    }
    var sys;
    if ((0, ts_1.isNodeLikeSystem)()) {
        sys = getNodeSystem();
    }
    if (sys) {
        // patch writefile to create folder before writing the file
        patchWriteFileEnsuringDirectory(sys);
    }
    return sys;
})();
/** @internal */
function setSys(s) {
    exports.sys = s;
}
exports.setSys = setSys;
if (exports.sys && exports.sys.getEnvironmentVariable) {
    setCustomPollingValues(exports.sys);
    ts_1.Debug.setAssertionLevel(/^development$/i.test(exports.sys.getEnvironmentVariable("NODE_ENV"))
        ? 1 /* AssertionLevel.Normal */
        : 0 /* AssertionLevel.None */);
}
if (exports.sys && exports.sys.debugMode) {
    ts_1.Debug.isDebugging = true;
}
