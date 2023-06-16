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
exports.InvalidatedProjectKind = exports.createSolutionBuilderWithWatch = exports.createSolutionBuilder = exports.createSolutionBuilderWithWatchHost = exports.createSolutionBuilderHost = exports.createBuilderStatusReporter = exports.getBuildOrderFromAnyBuildOrder = exports.isCircularBuildOrder = exports.getCurrentTime = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
var minimumDate = new Date(-8640000000000000);
var maximumDate = new Date(8640000000000000);
var BuildResultFlags;
(function (BuildResultFlags) {
    BuildResultFlags[BuildResultFlags["None"] = 0] = "None";
    /**
     * No errors of any kind occurred during build
     */
    BuildResultFlags[BuildResultFlags["Success"] = 1] = "Success";
    /**
     * None of the .d.ts files emitted by this build were
     * different from the existing files on disk
     */
    BuildResultFlags[BuildResultFlags["DeclarationOutputUnchanged"] = 2] = "DeclarationOutputUnchanged";
    BuildResultFlags[BuildResultFlags["ConfigFileErrors"] = 4] = "ConfigFileErrors";
    BuildResultFlags[BuildResultFlags["SyntaxErrors"] = 8] = "SyntaxErrors";
    BuildResultFlags[BuildResultFlags["TypeErrors"] = 16] = "TypeErrors";
    BuildResultFlags[BuildResultFlags["DeclarationEmitErrors"] = 32] = "DeclarationEmitErrors";
    BuildResultFlags[BuildResultFlags["EmitErrors"] = 64] = "EmitErrors";
    BuildResultFlags[BuildResultFlags["AnyErrors"] = 124] = "AnyErrors";
})(BuildResultFlags || (BuildResultFlags = {}));
function getOrCreateValueFromConfigFileMap(configFileMap, resolved, createT) {
    var existingValue = configFileMap.get(resolved);
    var newValue;
    if (!existingValue) {
        newValue = createT();
        configFileMap.set(resolved, newValue);
    }
    return existingValue || newValue;
}
function getOrCreateValueMapFromConfigFileMap(configFileMap, resolved) {
    return getOrCreateValueFromConfigFileMap(configFileMap, resolved, function () { return new Map(); });
}
/**
 * Helper to use now method instead of current date for testing purposes to get consistent baselines
 *
 * @internal
 */
function getCurrentTime(host) {
    return host.now ? host.now() : new Date();
}
exports.getCurrentTime = getCurrentTime;
/** @internal */
function isCircularBuildOrder(buildOrder) {
    return !!buildOrder && !!buildOrder.buildOrder;
}
exports.isCircularBuildOrder = isCircularBuildOrder;
/** @internal */
function getBuildOrderFromAnyBuildOrder(anyBuildOrder) {
    return isCircularBuildOrder(anyBuildOrder) ? anyBuildOrder.buildOrder : anyBuildOrder;
}
exports.getBuildOrderFromAnyBuildOrder = getBuildOrderFromAnyBuildOrder;
/**
 * Create a function that reports watch status by writing to the system and handles the formating of the diagnostic
 */
function createBuilderStatusReporter(system, pretty) {
    return function (diagnostic) {
        var output = pretty ? "[".concat((0, ts_1.formatColorAndReset)((0, ts_1.getLocaleTimeString)(system), ts_1.ForegroundColorEscapeSequences.Grey), "] ") : "".concat((0, ts_1.getLocaleTimeString)(system), " - ");
        output += "".concat((0, ts_1.flattenDiagnosticMessageText)(diagnostic.messageText, system.newLine)).concat(system.newLine + system.newLine);
        system.write(output);
    };
}
exports.createBuilderStatusReporter = createBuilderStatusReporter;
function createSolutionBuilderHostBase(system, createProgram, reportDiagnostic, reportSolutionBuilderStatus) {
    var host = (0, ts_1.createProgramHost)(system, createProgram);
    host.getModifiedTime = system.getModifiedTime ? function (path) { return system.getModifiedTime(path); } : ts_1.returnUndefined;
    host.setModifiedTime = system.setModifiedTime ? function (path, date) { return system.setModifiedTime(path, date); } : ts_1.noop;
    host.deleteFile = system.deleteFile ? function (path) { return system.deleteFile(path); } : ts_1.noop;
    host.reportDiagnostic = reportDiagnostic || (0, ts_1.createDiagnosticReporter)(system);
    host.reportSolutionBuilderStatus = reportSolutionBuilderStatus || createBuilderStatusReporter(system);
    host.now = (0, ts_1.maybeBind)(system, system.now); // For testing
    return host;
}
function createSolutionBuilderHost(system, createProgram, reportDiagnostic, reportSolutionBuilderStatus, reportErrorSummary) {
    if (system === void 0) { system = ts_1.sys; }
    var host = createSolutionBuilderHostBase(system, createProgram, reportDiagnostic, reportSolutionBuilderStatus);
    host.reportErrorSummary = reportErrorSummary;
    return host;
}
exports.createSolutionBuilderHost = createSolutionBuilderHost;
function createSolutionBuilderWithWatchHost(system, createProgram, reportDiagnostic, reportSolutionBuilderStatus, reportWatchStatus) {
    if (system === void 0) { system = ts_1.sys; }
    var host = createSolutionBuilderHostBase(system, createProgram, reportDiagnostic, reportSolutionBuilderStatus);
    var watchHost = (0, ts_1.createWatchHost)(system, reportWatchStatus);
    (0, ts_1.copyProperties)(host, watchHost);
    return host;
}
exports.createSolutionBuilderWithWatchHost = createSolutionBuilderWithWatchHost;
function getCompilerOptionsOfBuildOptions(buildOptions) {
    var result = {};
    ts_1.commonOptionsWithBuild.forEach(function (option) {
        if ((0, ts_1.hasProperty)(buildOptions, option.name))
            result[option.name] = buildOptions[option.name];
    });
    return result;
}
function createSolutionBuilder(host, rootNames, defaultOptions) {
    return createSolutionBuilderWorker(/*watch*/ false, host, rootNames, defaultOptions);
}
exports.createSolutionBuilder = createSolutionBuilder;
function createSolutionBuilderWithWatch(host, rootNames, defaultOptions, baseWatchOptions) {
    return createSolutionBuilderWorker(/*watch*/ true, host, rootNames, defaultOptions, baseWatchOptions);
}
exports.createSolutionBuilderWithWatch = createSolutionBuilderWithWatch;
function createSolutionBuilderState(watch, hostOrHostWithWatch, rootNames, options, baseWatchOptions) {
    var host = hostOrHostWithWatch;
    var hostWithWatch = hostOrHostWithWatch;
    // State of the solution
    var baseCompilerOptions = getCompilerOptionsOfBuildOptions(options);
    var compilerHost = (0, ts_1.createCompilerHostFromProgramHost)(host, function () { return state.projectCompilerOptions; });
    (0, ts_1.setGetSourceFileAsHashVersioned)(compilerHost);
    compilerHost.getParsedCommandLine = function (fileName) { return parseConfigFile(state, fileName, toResolvedConfigFilePath(state, fileName)); };
    compilerHost.resolveModuleNameLiterals = (0, ts_1.maybeBind)(host, host.resolveModuleNameLiterals);
    compilerHost.resolveTypeReferenceDirectiveReferences = (0, ts_1.maybeBind)(host, host.resolveTypeReferenceDirectiveReferences);
    compilerHost.resolveLibrary = (0, ts_1.maybeBind)(host, host.resolveLibrary);
    compilerHost.resolveModuleNames = (0, ts_1.maybeBind)(host, host.resolveModuleNames);
    compilerHost.resolveTypeReferenceDirectives = (0, ts_1.maybeBind)(host, host.resolveTypeReferenceDirectives);
    compilerHost.getModuleResolutionCache = (0, ts_1.maybeBind)(host, host.getModuleResolutionCache);
    var moduleResolutionCache, typeReferenceDirectiveResolutionCache;
    if (!compilerHost.resolveModuleNameLiterals && !compilerHost.resolveModuleNames) {
        moduleResolutionCache = (0, ts_1.createModuleResolutionCache)(compilerHost.getCurrentDirectory(), compilerHost.getCanonicalFileName);
        compilerHost.resolveModuleNameLiterals = function (moduleNames, containingFile, redirectedReference, options, containingSourceFile) {
            return (0, ts_1.loadWithModeAwareCache)(moduleNames, containingFile, redirectedReference, options, containingSourceFile, host, moduleResolutionCache, ts_1.createModuleResolutionLoader);
        };
        compilerHost.getModuleResolutionCache = function () { return moduleResolutionCache; };
    }
    if (!compilerHost.resolveTypeReferenceDirectiveReferences && !compilerHost.resolveTypeReferenceDirectives) {
        typeReferenceDirectiveResolutionCache = (0, ts_1.createTypeReferenceDirectiveResolutionCache)(compilerHost.getCurrentDirectory(), compilerHost.getCanonicalFileName, /*options*/ undefined, moduleResolutionCache === null || moduleResolutionCache === void 0 ? void 0 : moduleResolutionCache.getPackageJsonInfoCache());
        compilerHost.resolveTypeReferenceDirectiveReferences = function (typeDirectiveNames, containingFile, redirectedReference, options, containingSourceFile) {
            return (0, ts_1.loadWithModeAwareCache)(typeDirectiveNames, containingFile, redirectedReference, options, containingSourceFile, host, typeReferenceDirectiveResolutionCache, ts_1.createTypeReferenceResolutionLoader);
        };
    }
    var libraryResolutionCache;
    if (!compilerHost.resolveLibrary) {
        libraryResolutionCache = (0, ts_1.createModuleResolutionCache)(compilerHost.getCurrentDirectory(), compilerHost.getCanonicalFileName, /*options*/ undefined, moduleResolutionCache === null || moduleResolutionCache === void 0 ? void 0 : moduleResolutionCache.getPackageJsonInfoCache());
        compilerHost.resolveLibrary = function (libraryName, resolveFrom, options) { return (0, ts_1.resolveLibrary)(libraryName, resolveFrom, options, host, libraryResolutionCache); };
    }
    compilerHost.getBuildInfo = function (fileName, configFilePath) { return getBuildInfo(state, fileName, toResolvedConfigFilePath(state, configFilePath), /*modifiedTime*/ undefined); };
    var _a = (0, ts_1.createWatchFactory)(hostWithWatch, options), watchFile = _a.watchFile, watchDirectory = _a.watchDirectory, writeLog = _a.writeLog;
    var state = {
        host: host,
        hostWithWatch: hostWithWatch,
        parseConfigFileHost: (0, ts_1.parseConfigHostFromCompilerHostLike)(host),
        write: (0, ts_1.maybeBind)(host, host.trace),
        // State of solution
        options: options,
        baseCompilerOptions: baseCompilerOptions,
        rootNames: rootNames,
        baseWatchOptions: baseWatchOptions,
        resolvedConfigFilePaths: new Map(),
        configFileCache: new Map(),
        projectStatus: new Map(),
        extendedConfigCache: new Map(),
        buildInfoCache: new Map(),
        outputTimeStamps: new Map(),
        builderPrograms: new Map(),
        diagnostics: new Map(),
        projectPendingBuild: new Map(),
        projectErrorsReported: new Map(),
        compilerHost: compilerHost,
        moduleResolutionCache: moduleResolutionCache,
        typeReferenceDirectiveResolutionCache: typeReferenceDirectiveResolutionCache,
        libraryResolutionCache: libraryResolutionCache,
        // Mutable state
        buildOrder: undefined,
        readFileWithCache: function (f) { return host.readFile(f); },
        projectCompilerOptions: baseCompilerOptions,
        cache: undefined,
        allProjectBuildPending: true,
        needsSummary: true,
        watchAllProjectsPending: watch,
        // Watch state
        watch: watch,
        allWatchedWildcardDirectories: new Map(),
        allWatchedInputFiles: new Map(),
        allWatchedConfigFiles: new Map(),
        allWatchedExtendedConfigFiles: new Map(),
        allWatchedPackageJsonFiles: new Map(),
        filesWatched: new Map(),
        lastCachedPackageJsonLookups: new Map(),
        timerToBuildInvalidatedProject: undefined,
        reportFileChangeDetected: false,
        watchFile: watchFile,
        watchDirectory: watchDirectory,
        writeLog: writeLog,
    };
    return state;
}
function toPath(state, fileName) {
    return (0, ts_1.toPath)(fileName, state.compilerHost.getCurrentDirectory(), state.compilerHost.getCanonicalFileName);
}
function toResolvedConfigFilePath(state, fileName) {
    var resolvedConfigFilePaths = state.resolvedConfigFilePaths;
    var path = resolvedConfigFilePaths.get(fileName);
    if (path !== undefined)
        return path;
    var resolvedPath = toPath(state, fileName);
    resolvedConfigFilePaths.set(fileName, resolvedPath);
    return resolvedPath;
}
function isParsedCommandLine(entry) {
    return !!entry.options;
}
function getCachedParsedConfigFile(state, configFilePath) {
    var value = state.configFileCache.get(configFilePath);
    return value && isParsedCommandLine(value) ? value : undefined;
}
function parseConfigFile(state, configFileName, configFilePath) {
    var configFileCache = state.configFileCache;
    var value = configFileCache.get(configFilePath);
    if (value) {
        return isParsedCommandLine(value) ? value : undefined;
    }
    performance.mark("SolutionBuilder::beforeConfigFileParsing");
    var diagnostic;
    var parseConfigFileHost = state.parseConfigFileHost, baseCompilerOptions = state.baseCompilerOptions, baseWatchOptions = state.baseWatchOptions, extendedConfigCache = state.extendedConfigCache, host = state.host;
    var parsed;
    if (host.getParsedCommandLine) {
        parsed = host.getParsedCommandLine(configFileName);
        if (!parsed)
            diagnostic = (0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.File_0_not_found, configFileName);
    }
    else {
        parseConfigFileHost.onUnRecoverableConfigFileDiagnostic = function (d) { return diagnostic = d; };
        parsed = (0, ts_1.getParsedCommandLineOfConfigFile)(configFileName, baseCompilerOptions, parseConfigFileHost, extendedConfigCache, baseWatchOptions);
        parseConfigFileHost.onUnRecoverableConfigFileDiagnostic = ts_1.noop;
    }
    configFileCache.set(configFilePath, parsed || diagnostic);
    performance.mark("SolutionBuilder::afterConfigFileParsing");
    performance.measure("SolutionBuilder::Config file parsing", "SolutionBuilder::beforeConfigFileParsing", "SolutionBuilder::afterConfigFileParsing");
    return parsed;
}
function resolveProjectName(state, name) {
    return (0, ts_1.resolveConfigFileProjectName)((0, ts_1.resolvePath)(state.compilerHost.getCurrentDirectory(), name));
}
function createBuildOrder(state, roots) {
    var temporaryMarks = new Map();
    var permanentMarks = new Map();
    var circularityReportStack = [];
    var buildOrder;
    var circularDiagnostics;
    for (var _i = 0, roots_1 = roots; _i < roots_1.length; _i++) {
        var root = roots_1[_i];
        visit(root);
    }
    return circularDiagnostics ?
        { buildOrder: buildOrder || ts_1.emptyArray, circularDiagnostics: circularDiagnostics } :
        buildOrder || ts_1.emptyArray;
    function visit(configFileName, inCircularContext) {
        var projPath = toResolvedConfigFilePath(state, configFileName);
        // Already visited
        if (permanentMarks.has(projPath))
            return;
        // Circular
        if (temporaryMarks.has(projPath)) {
            if (!inCircularContext) {
                (circularDiagnostics || (circularDiagnostics = [])).push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Project_references_may_not_form_a_circular_graph_Cycle_detected_Colon_0, circularityReportStack.join("\r\n")));
            }
            return;
        }
        temporaryMarks.set(projPath, true);
        circularityReportStack.push(configFileName);
        var parsed = parseConfigFile(state, configFileName, projPath);
        if (parsed && parsed.projectReferences) {
            for (var _i = 0, _a = parsed.projectReferences; _i < _a.length; _i++) {
                var ref = _a[_i];
                var resolvedRefPath = resolveProjectName(state, ref.path);
                visit(resolvedRefPath, inCircularContext || ref.circular);
            }
        }
        circularityReportStack.pop();
        permanentMarks.set(projPath, true);
        (buildOrder || (buildOrder = [])).push(configFileName);
    }
}
function getBuildOrder(state) {
    return state.buildOrder || createStateBuildOrder(state);
}
function createStateBuildOrder(state) {
    var buildOrder = createBuildOrder(state, state.rootNames.map(function (f) { return resolveProjectName(state, f); }));
    // Clear all to ResolvedConfigFilePaths cache to start fresh
    state.resolvedConfigFilePaths.clear();
    // TODO(rbuckton): Should be a `Set`, but that requires changing the code below that uses `mutateMapSkippingNewValues`
    var currentProjects = new Map(getBuildOrderFromAnyBuildOrder(buildOrder).map(function (resolved) { return [toResolvedConfigFilePath(state, resolved), true]; }));
    var noopOnDelete = { onDeleteValue: ts_1.noop };
    // Config file cache
    (0, ts_1.mutateMapSkippingNewValues)(state.configFileCache, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.projectStatus, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.builderPrograms, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.diagnostics, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.projectPendingBuild, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.projectErrorsReported, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.buildInfoCache, currentProjects, noopOnDelete);
    (0, ts_1.mutateMapSkippingNewValues)(state.outputTimeStamps, currentProjects, noopOnDelete);
    // Remove watches for the program no longer in the solution
    if (state.watch) {
        (0, ts_1.mutateMapSkippingNewValues)(state.allWatchedConfigFiles, currentProjects, { onDeleteValue: ts_1.closeFileWatcher });
        state.allWatchedExtendedConfigFiles.forEach(function (watcher) {
            watcher.projects.forEach(function (project) {
                if (!currentProjects.has(project)) {
                    watcher.projects.delete(project);
                }
            });
            watcher.close();
        });
        (0, ts_1.mutateMapSkippingNewValues)(state.allWatchedWildcardDirectories, currentProjects, { onDeleteValue: function (existingMap) { return existingMap.forEach(ts_1.closeFileWatcherOf); } });
        (0, ts_1.mutateMapSkippingNewValues)(state.allWatchedInputFiles, currentProjects, { onDeleteValue: function (existingMap) { return existingMap.forEach(ts_1.closeFileWatcher); } });
        (0, ts_1.mutateMapSkippingNewValues)(state.allWatchedPackageJsonFiles, currentProjects, { onDeleteValue: function (existingMap) { return existingMap.forEach(ts_1.closeFileWatcher); } });
    }
    return state.buildOrder = buildOrder;
}
function getBuildOrderFor(state, project, onlyReferences) {
    var resolvedProject = project && resolveProjectName(state, project);
    var buildOrderFromState = getBuildOrder(state);
    if (isCircularBuildOrder(buildOrderFromState))
        return buildOrderFromState;
    if (resolvedProject) {
        var projectPath_1 = toResolvedConfigFilePath(state, resolvedProject);
        var projectIndex = (0, ts_1.findIndex)(buildOrderFromState, function (configFileName) { return toResolvedConfigFilePath(state, configFileName) === projectPath_1; });
        if (projectIndex === -1)
            return undefined;
    }
    var buildOrder = resolvedProject ? createBuildOrder(state, [resolvedProject]) : buildOrderFromState;
    ts_1.Debug.assert(!isCircularBuildOrder(buildOrder));
    ts_1.Debug.assert(!onlyReferences || resolvedProject !== undefined);
    ts_1.Debug.assert(!onlyReferences || buildOrder[buildOrder.length - 1] === resolvedProject);
    return onlyReferences ? buildOrder.slice(0, buildOrder.length - 1) : buildOrder;
}
function enableCache(state) {
    if (state.cache) {
        disableCache(state);
    }
    var compilerHost = state.compilerHost, host = state.host;
    var originalReadFileWithCache = state.readFileWithCache;
    var originalGetSourceFile = compilerHost.getSourceFile;
    var _a = (0, ts_1.changeCompilerHostLikeToUseCache)(host, function (fileName) { return toPath(state, fileName); }, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return originalGetSourceFile.call.apply(originalGetSourceFile, __spreadArray([compilerHost], args, false));
    }), originalReadFile = _a.originalReadFile, originalFileExists = _a.originalFileExists, originalDirectoryExists = _a.originalDirectoryExists, originalCreateDirectory = _a.originalCreateDirectory, originalWriteFile = _a.originalWriteFile, getSourceFileWithCache = _a.getSourceFileWithCache, readFileWithCache = _a.readFileWithCache;
    state.readFileWithCache = readFileWithCache;
    compilerHost.getSourceFile = getSourceFileWithCache;
    state.cache = {
        originalReadFile: originalReadFile,
        originalFileExists: originalFileExists,
        originalDirectoryExists: originalDirectoryExists,
        originalCreateDirectory: originalCreateDirectory,
        originalWriteFile: originalWriteFile,
        originalReadFileWithCache: originalReadFileWithCache,
        originalGetSourceFile: originalGetSourceFile,
    };
}
function disableCache(state) {
    if (!state.cache)
        return;
    var cache = state.cache, host = state.host, compilerHost = state.compilerHost, extendedConfigCache = state.extendedConfigCache, moduleResolutionCache = state.moduleResolutionCache, typeReferenceDirectiveResolutionCache = state.typeReferenceDirectiveResolutionCache, libraryResolutionCache = state.libraryResolutionCache;
    host.readFile = cache.originalReadFile;
    host.fileExists = cache.originalFileExists;
    host.directoryExists = cache.originalDirectoryExists;
    host.createDirectory = cache.originalCreateDirectory;
    host.writeFile = cache.originalWriteFile;
    compilerHost.getSourceFile = cache.originalGetSourceFile;
    state.readFileWithCache = cache.originalReadFileWithCache;
    extendedConfigCache.clear();
    moduleResolutionCache === null || moduleResolutionCache === void 0 ? void 0 : moduleResolutionCache.clear();
    typeReferenceDirectiveResolutionCache === null || typeReferenceDirectiveResolutionCache === void 0 ? void 0 : typeReferenceDirectiveResolutionCache.clear();
    libraryResolutionCache === null || libraryResolutionCache === void 0 ? void 0 : libraryResolutionCache.clear();
    state.cache = undefined;
}
function clearProjectStatus(state, resolved) {
    state.projectStatus.delete(resolved);
    state.diagnostics.delete(resolved);
}
function addProjToQueue(_a, proj, reloadLevel) {
    var projectPendingBuild = _a.projectPendingBuild;
    var value = projectPendingBuild.get(proj);
    if (value === undefined) {
        projectPendingBuild.set(proj, reloadLevel);
    }
    else if (value < reloadLevel) {
        projectPendingBuild.set(proj, reloadLevel);
    }
}
function setupInitialBuild(state, cancellationToken) {
    // Set initial build if not already built
    if (!state.allProjectBuildPending)
        return;
    state.allProjectBuildPending = false;
    if (state.options.watch)
        reportWatchStatus(state, ts_1.Diagnostics.Starting_compilation_in_watch_mode);
    enableCache(state);
    var buildOrder = getBuildOrderFromAnyBuildOrder(getBuildOrder(state));
    buildOrder.forEach(function (configFileName) {
        return state.projectPendingBuild.set(toResolvedConfigFilePath(state, configFileName), ts_1.ConfigFileProgramReloadLevel.None);
    });
    if (cancellationToken) {
        cancellationToken.throwIfCancellationRequested();
    }
}
var InvalidatedProjectKind;
(function (InvalidatedProjectKind) {
    InvalidatedProjectKind[InvalidatedProjectKind["Build"] = 0] = "Build";
    /** @deprecated */ InvalidatedProjectKind[InvalidatedProjectKind["UpdateBundle"] = 1] = "UpdateBundle";
    InvalidatedProjectKind[InvalidatedProjectKind["UpdateOutputFileStamps"] = 2] = "UpdateOutputFileStamps";
})(InvalidatedProjectKind || (exports.InvalidatedProjectKind = InvalidatedProjectKind = {}));
function doneInvalidatedProject(state, projectPath) {
    state.projectPendingBuild.delete(projectPath);
    return state.diagnostics.has(projectPath) ?
        ts_1.ExitStatus.DiagnosticsPresent_OutputsSkipped :
        ts_1.ExitStatus.Success;
}
function createUpdateOutputFileStampsProject(state, project, projectPath, config, buildOrder) {
    var updateOutputFileStampsPending = true;
    return {
        kind: InvalidatedProjectKind.UpdateOutputFileStamps,
        project: project,
        projectPath: projectPath,
        buildOrder: buildOrder,
        getCompilerOptions: function () { return config.options; },
        getCurrentDirectory: function () { return state.compilerHost.getCurrentDirectory(); },
        updateOutputFileStatmps: function () {
            updateOutputTimestamps(state, config, projectPath);
            updateOutputFileStampsPending = false;
        },
        done: function () {
            if (updateOutputFileStampsPending) {
                updateOutputTimestamps(state, config, projectPath);
            }
            performance.mark("SolutionBuilder::Timestamps only updates");
            return doneInvalidatedProject(state, projectPath);
        }
    };
}
var BuildStep;
(function (BuildStep) {
    BuildStep[BuildStep["CreateProgram"] = 0] = "CreateProgram";
    BuildStep[BuildStep["SyntaxDiagnostics"] = 1] = "SyntaxDiagnostics";
    BuildStep[BuildStep["SemanticDiagnostics"] = 2] = "SemanticDiagnostics";
    BuildStep[BuildStep["Emit"] = 3] = "Emit";
    /** @deprecated */ BuildStep[BuildStep["EmitBundle"] = 4] = "EmitBundle";
    BuildStep[BuildStep["EmitBuildInfo"] = 5] = "EmitBuildInfo";
    /** @deprecated */ BuildStep[BuildStep["BuildInvalidatedProjectOfBundle"] = 6] = "BuildInvalidatedProjectOfBundle";
    BuildStep[BuildStep["QueueReferencingProjects"] = 7] = "QueueReferencingProjects";
    BuildStep[BuildStep["Done"] = 8] = "Done";
})(BuildStep || (BuildStep = {}));
function createBuildOrUpdateInvalidedProject(kind, state, project, projectPath, projectIndex, config, buildOrder) {
    var step = kind === InvalidatedProjectKind.Build ? BuildStep.CreateProgram : BuildStep.EmitBundle;
    var program;
    var buildResult;
    var invalidatedProjectOfBundle;
    return kind === InvalidatedProjectKind.Build ?
        {
            kind: kind,
            project: project,
            projectPath: projectPath,
            buildOrder: buildOrder,
            getCompilerOptions: function () { return config.options; },
            getCurrentDirectory: function () { return state.compilerHost.getCurrentDirectory(); },
            getBuilderProgram: function () { return withProgramOrUndefined(ts_1.identity); },
            getProgram: function () {
                return withProgramOrUndefined(function (program) { return program.getProgramOrUndefined(); });
            },
            getSourceFile: function (fileName) {
                return withProgramOrUndefined(function (program) { return program.getSourceFile(fileName); });
            },
            getSourceFiles: function () {
                return withProgramOrEmptyArray(function (program) { return program.getSourceFiles(); });
            },
            getOptionsDiagnostics: function (cancellationToken) {
                return withProgramOrEmptyArray(function (program) { return program.getOptionsDiagnostics(cancellationToken); });
            },
            getGlobalDiagnostics: function (cancellationToken) {
                return withProgramOrEmptyArray(function (program) { return program.getGlobalDiagnostics(cancellationToken); });
            },
            getConfigFileParsingDiagnostics: function () {
                return withProgramOrEmptyArray(function (program) { return program.getConfigFileParsingDiagnostics(); });
            },
            getSyntacticDiagnostics: function (sourceFile, cancellationToken) {
                return withProgramOrEmptyArray(function (program) { return program.getSyntacticDiagnostics(sourceFile, cancellationToken); });
            },
            getAllDependencies: function (sourceFile) {
                return withProgramOrEmptyArray(function (program) { return program.getAllDependencies(sourceFile); });
            },
            getSemanticDiagnostics: function (sourceFile, cancellationToken) {
                return withProgramOrEmptyArray(function (program) { return program.getSemanticDiagnostics(sourceFile, cancellationToken); });
            },
            getSemanticDiagnosticsOfNextAffectedFile: function (cancellationToken, ignoreSourceFile) {
                return withProgramOrUndefined(function (program) {
                    return (program.getSemanticDiagnosticsOfNextAffectedFile) &&
                        program.getSemanticDiagnosticsOfNextAffectedFile(cancellationToken, ignoreSourceFile);
                });
            },
            emit: function (targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
                if (targetSourceFile || emitOnlyDtsFiles) {
                    return withProgramOrUndefined(function (program) { var _a, _b; return program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers || ((_b = (_a = state.host).getCustomTransformers) === null || _b === void 0 ? void 0 : _b.call(_a, project))); });
                }
                executeSteps(BuildStep.SemanticDiagnostics, cancellationToken);
                if (step === BuildStep.EmitBuildInfo) {
                    return emitBuildInfo(writeFile, cancellationToken);
                }
                if (step !== BuildStep.Emit)
                    return undefined;
                return emit(writeFile, cancellationToken, customTransformers);
            },
            done: done
        } :
        {
            kind: kind,
            project: project,
            projectPath: projectPath,
            buildOrder: buildOrder,
            getCompilerOptions: function () { return config.options; },
            getCurrentDirectory: function () { return state.compilerHost.getCurrentDirectory(); },
            emit: function (writeFile, customTransformers) {
                if (step !== BuildStep.EmitBundle)
                    return invalidatedProjectOfBundle;
                return emitBundle(writeFile, customTransformers);
            },
            done: done,
        };
    function done(cancellationToken, writeFile, customTransformers) {
        executeSteps(BuildStep.Done, cancellationToken, writeFile, customTransformers);
        if (kind === InvalidatedProjectKind.Build)
            performance.mark("SolutionBuilder::Projects built");
        else
            performance.mark("SolutionBuilder::Bundles updated");
        return doneInvalidatedProject(state, projectPath);
    }
    function withProgramOrUndefined(action) {
        executeSteps(BuildStep.CreateProgram);
        return program && action(program);
    }
    function withProgramOrEmptyArray(action) {
        return withProgramOrUndefined(action) || ts_1.emptyArray;
    }
    function createProgram() {
        var _a, _b;
        ts_1.Debug.assert(program === undefined);
        if (state.options.dry) {
            reportStatus(state, ts_1.Diagnostics.A_non_dry_build_would_build_project_0, project);
            buildResult = BuildResultFlags.Success;
            step = BuildStep.QueueReferencingProjects;
            return;
        }
        if (state.options.verbose)
            reportStatus(state, ts_1.Diagnostics.Building_project_0, project);
        if (config.fileNames.length === 0) {
            reportAndStoreErrors(state, projectPath, (0, ts_1.getConfigFileParsingDiagnostics)(config));
            // Nothing to build - must be a solution file, basically
            buildResult = BuildResultFlags.None;
            step = BuildStep.QueueReferencingProjects;
            return;
        }
        var host = state.host, compilerHost = state.compilerHost;
        state.projectCompilerOptions = config.options;
        // Update module resolution cache if needed
        (_a = state.moduleResolutionCache) === null || _a === void 0 ? void 0 : _a.update(config.options);
        (_b = state.typeReferenceDirectiveResolutionCache) === null || _b === void 0 ? void 0 : _b.update(config.options);
        // Create program
        program = host.createProgram(config.fileNames, config.options, compilerHost, getOldProgram(state, projectPath, config), (0, ts_1.getConfigFileParsingDiagnostics)(config), config.projectReferences);
        if (state.watch) {
            state.lastCachedPackageJsonLookups.set(projectPath, state.moduleResolutionCache && (0, ts_1.map)(state.moduleResolutionCache.getPackageJsonInfoCache().entries(), function (_a) {
                var path = _a[0], data = _a[1];
                return [state.host.realpath && data ? toPath(state, state.host.realpath(path)) : path, data];
            }));
            state.builderPrograms.set(projectPath, program);
        }
        step++;
    }
    function handleDiagnostics(diagnostics, errorFlags, errorType) {
        var _a;
        if (diagnostics.length) {
            (_a = buildErrors(state, projectPath, program, config, diagnostics, errorFlags, errorType), buildResult = _a.buildResult, step = _a.step);
        }
        else {
            step++;
        }
    }
    function getSyntaxDiagnostics(cancellationToken) {
        ts_1.Debug.assertIsDefined(program);
        handleDiagnostics(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], program.getConfigFileParsingDiagnostics(), true), program.getOptionsDiagnostics(cancellationToken), true), program.getGlobalDiagnostics(cancellationToken), true), program.getSyntacticDiagnostics(/*sourceFile*/ undefined, cancellationToken), true), BuildResultFlags.SyntaxErrors, "Syntactic");
    }
    function getSemanticDiagnostics(cancellationToken) {
        handleDiagnostics(ts_1.Debug.checkDefined(program).getSemanticDiagnostics(/*sourceFile*/ undefined, cancellationToken), BuildResultFlags.TypeErrors, "Semantic");
    }
    function emit(writeFileCallback, cancellationToken, customTransformers) {
        var _a;
        var _b, _c, _d;
        ts_1.Debug.assertIsDefined(program);
        ts_1.Debug.assert(step === BuildStep.Emit);
        // Before emitting lets backup state, so we can revert it back if there are declaration errors to handle emit and declaration errors correctly
        var saved = program.saveEmitState();
        var declDiagnostics;
        var reportDeclarationDiagnostics = function (d) { return (declDiagnostics || (declDiagnostics = [])).push(d); };
        var outputFiles = [];
        var emitResult = (0, ts_1.emitFilesAndReportErrors)(program, reportDeclarationDiagnostics, 
        /*write*/ undefined, 
        /*reportSummary*/ undefined, function (name, text, writeByteOrderMark, _onError, _sourceFiles, data) { return outputFiles.push({ name: name, text: text, writeByteOrderMark: writeByteOrderMark, data: data }); }, cancellationToken, 
        /*emitOnlyDtsFiles*/ false, customTransformers || ((_c = (_b = state.host).getCustomTransformers) === null || _c === void 0 ? void 0 : _c.call(_b, project))).emitResult;
        // Don't emit .d.ts if there are decl file errors
        if (declDiagnostics) {
            program.restoreEmitState(saved);
            (_a = buildErrors(state, projectPath, program, config, declDiagnostics, BuildResultFlags.DeclarationEmitErrors, "Declaration file"), buildResult = _a.buildResult, step = _a.step);
            return {
                emitSkipped: true,
                diagnostics: emitResult.diagnostics
            };
        }
        // Actual Emit
        var host = state.host, compilerHost = state.compilerHost;
        var resultFlags = ((_d = program.hasChangedEmitSignature) === null || _d === void 0 ? void 0 : _d.call(program)) ? BuildResultFlags.None : BuildResultFlags.DeclarationOutputUnchanged;
        var emitterDiagnostics = (0, ts_1.createDiagnosticCollection)();
        var emittedOutputs = new Map();
        var options = program.getCompilerOptions();
        var isIncremental = (0, ts_1.isIncrementalCompilation)(options);
        var outputTimeStampMap;
        var now;
        outputFiles.forEach(function (_a) {
            var name = _a.name, text = _a.text, writeByteOrderMark = _a.writeByteOrderMark, data = _a.data;
            var path = toPath(state, name);
            emittedOutputs.set(toPath(state, name), name);
            if (data === null || data === void 0 ? void 0 : data.buildInfo)
                setBuildInfo(state, data.buildInfo, projectPath, options, resultFlags);
            var modifiedTime = (data === null || data === void 0 ? void 0 : data.differsOnlyInMap) ? (0, ts_1.getModifiedTime)(state.host, name) : undefined;
            (0, ts_1.writeFile)(writeFileCallback ? { writeFile: writeFileCallback } : compilerHost, emitterDiagnostics, name, text, writeByteOrderMark);
            // Revert the timestamp for the d.ts that is same
            if (data === null || data === void 0 ? void 0 : data.differsOnlyInMap)
                state.host.setModifiedTime(name, modifiedTime);
            else if (!isIncremental && state.watch) {
                (outputTimeStampMap || (outputTimeStampMap = getOutputTimeStampMap(state, projectPath))).set(path, now || (now = getCurrentTime(state.host)));
            }
        });
        finishEmit(emitterDiagnostics, emittedOutputs, outputFiles.length ? outputFiles[0].name : (0, ts_1.getFirstProjectOutput)(config, !host.useCaseSensitiveFileNames()), resultFlags);
        return emitResult;
    }
    function emitBuildInfo(writeFileCallback, cancellationToken) {
        ts_1.Debug.assertIsDefined(program);
        ts_1.Debug.assert(step === BuildStep.EmitBuildInfo);
        var emitResult = program.emitBuildInfo(function (name, text, writeByteOrderMark, onError, sourceFiles, data) {
            if (data === null || data === void 0 ? void 0 : data.buildInfo)
                setBuildInfo(state, data.buildInfo, projectPath, program.getCompilerOptions(), BuildResultFlags.DeclarationOutputUnchanged);
            if (writeFileCallback)
                writeFileCallback(name, text, writeByteOrderMark, onError, sourceFiles, data);
            else
                state.compilerHost.writeFile(name, text, writeByteOrderMark, onError, sourceFiles, data);
        }, cancellationToken);
        if (emitResult.diagnostics.length) {
            reportErrors(state, emitResult.diagnostics);
            state.diagnostics.set(projectPath, __spreadArray(__spreadArray([], state.diagnostics.get(projectPath), true), emitResult.diagnostics, true));
            buildResult = BuildResultFlags.EmitErrors & buildResult;
        }
        if (emitResult.emittedFiles && state.write) {
            emitResult.emittedFiles.forEach(function (name) { return listEmittedFile(state, config, name); });
        }
        afterProgramDone(state, program, config);
        step = BuildStep.QueueReferencingProjects;
        return emitResult;
    }
    function finishEmit(emitterDiagnostics, emittedOutputs, oldestOutputFileName, resultFlags) {
        var _a;
        var emitDiagnostics = emitterDiagnostics.getDiagnostics();
        if (emitDiagnostics.length) {
            (_a = buildErrors(state, projectPath, program, config, emitDiagnostics, BuildResultFlags.EmitErrors, "Emit"), buildResult = _a.buildResult, step = _a.step);
            return emitDiagnostics;
        }
        if (state.write) {
            emittedOutputs.forEach(function (name) { return listEmittedFile(state, config, name); });
        }
        // Update time stamps for rest of the outputs
        updateOutputTimestampsWorker(state, config, projectPath, ts_1.Diagnostics.Updating_unchanged_output_timestamps_of_project_0, emittedOutputs);
        state.diagnostics.delete(projectPath);
        state.projectStatus.set(projectPath, {
            type: ts_1.UpToDateStatusType.UpToDate,
            oldestOutputFileName: oldestOutputFileName
        });
        afterProgramDone(state, program, config);
        step = BuildStep.QueueReferencingProjects;
        buildResult = resultFlags;
        return emitDiagnostics;
    }
    function emitBundle(writeFileCallback, customTransformers) {
        var _a, _b, _c, _d;
        ts_1.Debug.assert(kind === InvalidatedProjectKind.UpdateBundle);
        if (state.options.dry) {
            reportStatus(state, ts_1.Diagnostics.A_non_dry_build_would_update_output_of_project_0, project);
            buildResult = BuildResultFlags.Success;
            step = BuildStep.QueueReferencingProjects;
            return undefined;
        }
        if (state.options.verbose)
            reportStatus(state, ts_1.Diagnostics.Updating_output_of_project_0, project);
        // Update js, and source map
        var compilerHost = state.compilerHost;
        state.projectCompilerOptions = config.options;
        (_b = (_a = state.host).beforeEmitBundle) === null || _b === void 0 ? void 0 : _b.call(_a, config);
        var outputFiles = (0, ts_1.emitUsingBuildInfo)(config, compilerHost, function (ref) {
            var refName = resolveProjectName(state, ref.path);
            return parseConfigFile(state, refName, toResolvedConfigFilePath(state, refName));
        }, customTransformers || ((_d = (_c = state.host).getCustomTransformers) === null || _d === void 0 ? void 0 : _d.call(_c, project)));
        if ((0, ts_1.isString)(outputFiles)) {
            reportStatus(state, ts_1.Diagnostics.Cannot_update_output_of_project_0_because_there_was_error_reading_file_1, project, relName(state, outputFiles));
            step = BuildStep.BuildInvalidatedProjectOfBundle;
            return invalidatedProjectOfBundle = createBuildOrUpdateInvalidedProject(InvalidatedProjectKind.Build, state, project, projectPath, projectIndex, config, buildOrder);
        }
        // Actual Emit
        ts_1.Debug.assert(!!outputFiles.length);
        var emitterDiagnostics = (0, ts_1.createDiagnosticCollection)();
        var emittedOutputs = new Map();
        var resultFlags = BuildResultFlags.DeclarationOutputUnchanged;
        var existingBuildInfo = state.buildInfoCache.get(projectPath).buildInfo || undefined;
        outputFiles.forEach(function (_a) {
            var _b, _c;
            var name = _a.name, text = _a.text, writeByteOrderMark = _a.writeByteOrderMark, data = _a.data;
            emittedOutputs.set(toPath(state, name), name);
            if (data === null || data === void 0 ? void 0 : data.buildInfo) {
                if (((_b = data.buildInfo.program) === null || _b === void 0 ? void 0 : _b.outSignature) !== ((_c = existingBuildInfo === null || existingBuildInfo === void 0 ? void 0 : existingBuildInfo.program) === null || _c === void 0 ? void 0 : _c.outSignature)) {
                    resultFlags &= ~BuildResultFlags.DeclarationOutputUnchanged;
                }
                setBuildInfo(state, data.buildInfo, projectPath, config.options, resultFlags);
            }
            (0, ts_1.writeFile)(writeFileCallback ? { writeFile: writeFileCallback } : compilerHost, emitterDiagnostics, name, text, writeByteOrderMark);
        });
        var emitDiagnostics = finishEmit(emitterDiagnostics, emittedOutputs, outputFiles[0].name, resultFlags);
        return { emitSkipped: false, diagnostics: emitDiagnostics };
    }
    function executeSteps(till, cancellationToken, writeFile, customTransformers) {
        while (step <= till && step < BuildStep.Done) {
            var currentStep = step;
            switch (step) {
                case BuildStep.CreateProgram:
                    createProgram();
                    break;
                case BuildStep.SyntaxDiagnostics:
                    getSyntaxDiagnostics(cancellationToken);
                    break;
                case BuildStep.SemanticDiagnostics:
                    getSemanticDiagnostics(cancellationToken);
                    break;
                case BuildStep.Emit:
                    emit(writeFile, cancellationToken, customTransformers);
                    break;
                case BuildStep.EmitBuildInfo:
                    emitBuildInfo(writeFile, cancellationToken);
                    break;
                case BuildStep.EmitBundle:
                    emitBundle(writeFile, customTransformers);
                    break;
                case BuildStep.BuildInvalidatedProjectOfBundle:
                    ts_1.Debug.checkDefined(invalidatedProjectOfBundle).done(cancellationToken, writeFile, customTransformers);
                    step = BuildStep.Done;
                    break;
                case BuildStep.QueueReferencingProjects:
                    queueReferencingProjects(state, project, projectPath, projectIndex, config, buildOrder, ts_1.Debug.checkDefined(buildResult));
                    step++;
                    break;
                // Should never be done
                case BuildStep.Done:
                default:
                    (0, ts_1.assertType)(step);
            }
            ts_1.Debug.assert(step > currentStep);
        }
    }
}
function needsBuild(_a, status, config) {
    var options = _a.options;
    if (status.type !== ts_1.UpToDateStatusType.OutOfDateWithPrepend || options.force)
        return true;
    return config.fileNames.length === 0 ||
        !!(0, ts_1.getConfigFileParsingDiagnostics)(config).length ||
        !(0, ts_1.isIncrementalCompilation)(config.options);
}
function getNextInvalidatedProjectCreateInfo(state, buildOrder, reportQueue) {
    if (!state.projectPendingBuild.size)
        return undefined;
    if (isCircularBuildOrder(buildOrder))
        return undefined;
    var options = state.options, projectPendingBuild = state.projectPendingBuild;
    for (var projectIndex = 0; projectIndex < buildOrder.length; projectIndex++) {
        var project = buildOrder[projectIndex];
        var projectPath = toResolvedConfigFilePath(state, project);
        var reloadLevel = state.projectPendingBuild.get(projectPath);
        if (reloadLevel === undefined)
            continue;
        if (reportQueue) {
            reportQueue = false;
            reportBuildQueue(state, buildOrder);
        }
        var config = parseConfigFile(state, project, projectPath);
        if (!config) {
            reportParseConfigFileDiagnostic(state, projectPath);
            projectPendingBuild.delete(projectPath);
            continue;
        }
        if (reloadLevel === ts_1.ConfigFileProgramReloadLevel.Full) {
            watchConfigFile(state, project, projectPath, config);
            watchExtendedConfigFiles(state, projectPath, config);
            watchWildCardDirectories(state, project, projectPath, config);
            watchInputFiles(state, project, projectPath, config);
            watchPackageJsonFiles(state, project, projectPath, config);
        }
        else if (reloadLevel === ts_1.ConfigFileProgramReloadLevel.Partial) {
            // Update file names
            config.fileNames = (0, ts_1.getFileNamesFromConfigSpecs)(config.options.configFile.configFileSpecs, (0, ts_1.getDirectoryPath)(project), config.options, state.parseConfigFileHost);
            (0, ts_1.updateErrorForNoInputFiles)(config.fileNames, project, config.options.configFile.configFileSpecs, config.errors, (0, ts_1.canJsonReportNoInputFiles)(config.raw));
            watchInputFiles(state, project, projectPath, config);
            watchPackageJsonFiles(state, project, projectPath, config);
        }
        var status_1 = getUpToDateStatus(state, config, projectPath);
        if (!options.force) {
            if (status_1.type === ts_1.UpToDateStatusType.UpToDate) {
                verboseReportProjectStatus(state, project, status_1);
                reportAndStoreErrors(state, projectPath, (0, ts_1.getConfigFileParsingDiagnostics)(config));
                projectPendingBuild.delete(projectPath);
                // Up to date, skip
                if (options.dry) {
                    // In a dry build, inform the user of this fact
                    reportStatus(state, ts_1.Diagnostics.Project_0_is_up_to_date, project);
                }
                continue;
            }
            if (status_1.type === ts_1.UpToDateStatusType.UpToDateWithUpstreamTypes || status_1.type === ts_1.UpToDateStatusType.UpToDateWithInputFileText) {
                reportAndStoreErrors(state, projectPath, (0, ts_1.getConfigFileParsingDiagnostics)(config));
                return {
                    kind: InvalidatedProjectKind.UpdateOutputFileStamps,
                    status: status_1,
                    project: project,
                    projectPath: projectPath,
                    projectIndex: projectIndex,
                    config: config
                };
            }
        }
        if (status_1.type === ts_1.UpToDateStatusType.UpstreamBlocked) {
            verboseReportProjectStatus(state, project, status_1);
            reportAndStoreErrors(state, projectPath, (0, ts_1.getConfigFileParsingDiagnostics)(config));
            projectPendingBuild.delete(projectPath);
            if (options.verbose) {
                reportStatus(state, status_1.upstreamProjectBlocked ?
                    ts_1.Diagnostics.Skipping_build_of_project_0_because_its_dependency_1_was_not_built :
                    ts_1.Diagnostics.Skipping_build_of_project_0_because_its_dependency_1_has_errors, project, status_1.upstreamProjectName);
            }
            continue;
        }
        if (status_1.type === ts_1.UpToDateStatusType.ContainerOnly) {
            verboseReportProjectStatus(state, project, status_1);
            reportAndStoreErrors(state, projectPath, (0, ts_1.getConfigFileParsingDiagnostics)(config));
            projectPendingBuild.delete(projectPath);
            // Do nothing
            continue;
        }
        return {
            kind: needsBuild(state, status_1, config) ?
                InvalidatedProjectKind.Build :
                InvalidatedProjectKind.UpdateBundle,
            status: status_1,
            project: project,
            projectPath: projectPath,
            projectIndex: projectIndex,
            config: config,
        };
    }
    return undefined;
}
function createInvalidatedProjectWithInfo(state, info, buildOrder) {
    verboseReportProjectStatus(state, info.project, info.status);
    return info.kind !== InvalidatedProjectKind.UpdateOutputFileStamps ?
        createBuildOrUpdateInvalidedProject(info.kind, state, info.project, info.projectPath, info.projectIndex, info.config, buildOrder) :
        createUpdateOutputFileStampsProject(state, info.project, info.projectPath, info.config, buildOrder);
}
function getNextInvalidatedProject(state, buildOrder, reportQueue) {
    var info = getNextInvalidatedProjectCreateInfo(state, buildOrder, reportQueue);
    if (!info)
        return info;
    return createInvalidatedProjectWithInfo(state, info, buildOrder);
}
function listEmittedFile(_a, proj, file) {
    var write = _a.write;
    if (write && proj.options.listEmittedFiles) {
        write("TSFILE: ".concat(file));
    }
}
function getOldProgram(_a, proj, parsed) {
    var options = _a.options, builderPrograms = _a.builderPrograms, compilerHost = _a.compilerHost;
    if (options.force)
        return undefined;
    var value = builderPrograms.get(proj);
    if (value)
        return value;
    return (0, ts_1.readBuilderProgram)(parsed.options, compilerHost);
}
function afterProgramDone(state, program, config) {
    if (program) {
        if (state.write)
            (0, ts_1.listFiles)(program, state.write);
        if (state.host.afterProgramEmitAndDiagnostics) {
            state.host.afterProgramEmitAndDiagnostics(program);
        }
        program.releaseProgram();
    }
    else if (state.host.afterEmitBundle) {
        state.host.afterEmitBundle(config);
    }
    state.projectCompilerOptions = state.baseCompilerOptions;
}
function buildErrors(state, resolvedPath, program, config, diagnostics, buildResult, errorType) {
    // Since buildinfo has changeset and diagnostics when doing multi file emit, only --out cannot emit buildinfo if it has errors
    var canEmitBuildInfo = program && !(0, ts_1.outFile)(program.getCompilerOptions());
    reportAndStoreErrors(state, resolvedPath, diagnostics);
    state.projectStatus.set(resolvedPath, { type: ts_1.UpToDateStatusType.Unbuildable, reason: "".concat(errorType, " errors") });
    if (canEmitBuildInfo)
        return { buildResult: buildResult, step: BuildStep.EmitBuildInfo };
    afterProgramDone(state, program, config);
    return { buildResult: buildResult, step: BuildStep.QueueReferencingProjects };
}
function isFileWatcherWithModifiedTime(value) {
    return !!value.watcher;
}
function getModifiedTime(state, fileName) {
    var path = toPath(state, fileName);
    var existing = state.filesWatched.get(path);
    if (state.watch && !!existing) {
        if (!isFileWatcherWithModifiedTime(existing))
            return existing;
        if (existing.modifiedTime)
            return existing.modifiedTime;
    }
    // In watch mode we store the modified times in the cache
    // This is either Date | FileWatcherWithModifiedTime because we query modified times first and
    // then after complete compilation of the project, watch the files so we dont want to loose these modified times.
    var result = (0, ts_1.getModifiedTime)(state.host, fileName);
    if (state.watch) {
        if (existing)
            existing.modifiedTime = result;
        else
            state.filesWatched.set(path, result);
    }
    return result;
}
function watchFile(state, file, callback, pollingInterval, options, watchType, project) {
    var path = toPath(state, file);
    var existing = state.filesWatched.get(path);
    if (existing && isFileWatcherWithModifiedTime(existing)) {
        existing.callbacks.push(callback);
    }
    else {
        var watcher = state.watchFile(file, function (fileName, eventKind, modifiedTime) {
            var existing = ts_1.Debug.checkDefined(state.filesWatched.get(path));
            ts_1.Debug.assert(isFileWatcherWithModifiedTime(existing));
            existing.modifiedTime = modifiedTime;
            existing.callbacks.forEach(function (cb) { return cb(fileName, eventKind, modifiedTime); });
        }, pollingInterval, options, watchType, project);
        state.filesWatched.set(path, { callbacks: [callback], watcher: watcher, modifiedTime: existing });
    }
    return {
        close: function () {
            var existing = ts_1.Debug.checkDefined(state.filesWatched.get(path));
            ts_1.Debug.assert(isFileWatcherWithModifiedTime(existing));
            if (existing.callbacks.length === 1) {
                state.filesWatched.delete(path);
                (0, ts_1.closeFileWatcherOf)(existing);
            }
            else {
                (0, ts_1.unorderedRemoveItem)(existing.callbacks, callback);
            }
        }
    };
}
function getOutputTimeStampMap(state, resolvedConfigFilePath) {
    // Output timestamps are stored only in watch mode
    if (!state.watch)
        return undefined;
    var result = state.outputTimeStamps.get(resolvedConfigFilePath);
    if (!result)
        state.outputTimeStamps.set(resolvedConfigFilePath, result = new Map());
    return result;
}
function setBuildInfo(state, buildInfo, resolvedConfigPath, options, resultFlags) {
    var buildInfoPath = (0, ts_1.getTsBuildInfoEmitOutputFilePath)(options);
    var existing = getBuildInfoCacheEntry(state, buildInfoPath, resolvedConfigPath);
    var modifiedTime = getCurrentTime(state.host);
    if (existing) {
        existing.buildInfo = buildInfo;
        existing.modifiedTime = modifiedTime;
        if (!(resultFlags & BuildResultFlags.DeclarationOutputUnchanged))
            existing.latestChangedDtsTime = modifiedTime;
    }
    else {
        state.buildInfoCache.set(resolvedConfigPath, {
            path: toPath(state, buildInfoPath),
            buildInfo: buildInfo,
            modifiedTime: modifiedTime,
            latestChangedDtsTime: resultFlags & BuildResultFlags.DeclarationOutputUnchanged ? undefined : modifiedTime,
        });
    }
}
function getBuildInfoCacheEntry(state, buildInfoPath, resolvedConfigPath) {
    var path = toPath(state, buildInfoPath);
    var existing = state.buildInfoCache.get(resolvedConfigPath);
    return (existing === null || existing === void 0 ? void 0 : existing.path) === path ? existing : undefined;
}
function getBuildInfo(state, buildInfoPath, resolvedConfigPath, modifiedTime) {
    var path = toPath(state, buildInfoPath);
    var existing = state.buildInfoCache.get(resolvedConfigPath);
    if (existing !== undefined && existing.path === path) {
        return existing.buildInfo || undefined;
    }
    var value = state.readFileWithCache(buildInfoPath);
    var buildInfo = value ? (0, ts_1.getBuildInfo)(buildInfoPath, value) : undefined;
    state.buildInfoCache.set(resolvedConfigPath, { path: path, buildInfo: buildInfo || false, modifiedTime: modifiedTime || ts_1.missingFileModifiedTime });
    return buildInfo;
}
function checkConfigFileUpToDateStatus(state, configFile, oldestOutputFileTime, oldestOutputFileName) {
    // Check tsconfig time
    var tsconfigTime = getModifiedTime(state, configFile);
    if (oldestOutputFileTime < tsconfigTime) {
        return {
            type: ts_1.UpToDateStatusType.OutOfDateWithSelf,
            outOfDateOutputFileName: oldestOutputFileName,
            newerInputFileName: configFile
        };
    }
}
function getUpToDateStatusWorker(state, project, resolvedPath) {
    var _a, _b;
    // Container if no files are specified in the project
    if (!project.fileNames.length && !(0, ts_1.canJsonReportNoInputFiles)(project.raw)) {
        return {
            type: ts_1.UpToDateStatusType.ContainerOnly
        };
    }
    // Fast check to see if reference projects are upto date and error free
    var referenceStatuses;
    var force = !!state.options.force;
    if (project.projectReferences) {
        state.projectStatus.set(resolvedPath, { type: ts_1.UpToDateStatusType.ComputingUpstream });
        for (var _i = 0, _c = project.projectReferences; _i < _c.length; _i++) {
            var ref = _c[_i];
            var resolvedRef = (0, ts_1.resolveProjectReferencePath)(ref);
            var resolvedRefPath = toResolvedConfigFilePath(state, resolvedRef);
            var resolvedConfig = parseConfigFile(state, resolvedRef, resolvedRefPath);
            var refStatus = getUpToDateStatus(state, resolvedConfig, resolvedRefPath);
            // Its a circular reference ignore the status of this project
            if (refStatus.type === ts_1.UpToDateStatusType.ComputingUpstream ||
                refStatus.type === ts_1.UpToDateStatusType.ContainerOnly) { // Container only ignore this project
                continue;
            }
            // An upstream project is blocked
            if (refStatus.type === ts_1.UpToDateStatusType.Unbuildable ||
                refStatus.type === ts_1.UpToDateStatusType.UpstreamBlocked) {
                return {
                    type: ts_1.UpToDateStatusType.UpstreamBlocked,
                    upstreamProjectName: ref.path,
                    upstreamProjectBlocked: refStatus.type === ts_1.UpToDateStatusType.UpstreamBlocked
                };
            }
            // If the upstream project is out of date, then so are we (someone shouldn't have asked, though?)
            if (refStatus.type !== ts_1.UpToDateStatusType.UpToDate) {
                return {
                    type: ts_1.UpToDateStatusType.UpstreamOutOfDate,
                    upstreamProjectName: ref.path
                };
            }
            if (!force)
                (referenceStatuses || (referenceStatuses = [])).push({ ref: ref, refStatus: refStatus, resolvedRefPath: resolvedRefPath, resolvedConfig: resolvedConfig });
        }
    }
    if (force)
        return { type: ts_1.UpToDateStatusType.ForceBuild };
    // Check buildinfo first
    var host = state.host;
    var buildInfoPath = (0, ts_1.getTsBuildInfoEmitOutputFilePath)(project.options);
    var oldestOutputFileName;
    var oldestOutputFileTime = maximumDate;
    var buildInfoTime;
    var buildInfoProgram;
    var buildInfoVersionMap;
    if (buildInfoPath) {
        var buildInfoCacheEntry_1 = getBuildInfoCacheEntry(state, buildInfoPath, resolvedPath);
        buildInfoTime = (buildInfoCacheEntry_1 === null || buildInfoCacheEntry_1 === void 0 ? void 0 : buildInfoCacheEntry_1.modifiedTime) || (0, ts_1.getModifiedTime)(host, buildInfoPath);
        if (buildInfoTime === ts_1.missingFileModifiedTime) {
            if (!buildInfoCacheEntry_1) {
                state.buildInfoCache.set(resolvedPath, {
                    path: toPath(state, buildInfoPath),
                    buildInfo: false,
                    modifiedTime: buildInfoTime
                });
            }
            return {
                type: ts_1.UpToDateStatusType.OutputMissing,
                missingOutputFileName: buildInfoPath
            };
        }
        var buildInfo = getBuildInfo(state, buildInfoPath, resolvedPath, buildInfoTime);
        if (!buildInfo) {
            // Error reading buildInfo
            return {
                type: ts_1.UpToDateStatusType.ErrorReadingFile,
                fileName: buildInfoPath
            };
        }
        if ((buildInfo.bundle || buildInfo.program) && buildInfo.version !== ts_1.version) {
            return {
                type: ts_1.UpToDateStatusType.TsVersionOutputOfDate,
                version: buildInfo.version
            };
        }
        if (buildInfo.program) {
            // If there are pending changes that are not emitted, project is out of date
            // When there are syntax errors, changeFileSet will have list of files changed (irrespective of noEmit)
            // But in case of semantic error we need special treatment.
            // Checking presence of affectedFilesPendingEmit list is fast and good way to tell if there were semantic errors and file emit was blocked
            // But if noEmit is true, affectedFilesPendingEmit will have file list even if there are no semantic errors to preserve list of files to be emitted when running with noEmit false
            // So with noEmit set to true, check on semantic diagnostics needs to be explicit as oppose to when it is false when only files pending emit is sufficient
            if (((_a = buildInfo.program.changeFileSet) === null || _a === void 0 ? void 0 : _a.length) ||
                (!project.options.noEmit ?
                    (_b = buildInfo.program.affectedFilesPendingEmit) === null || _b === void 0 ? void 0 : _b.length :
                    (0, ts_1.some)(buildInfo.program.semanticDiagnosticsPerFile, ts_1.isArray))) {
                return {
                    type: ts_1.UpToDateStatusType.OutOfDateBuildInfo,
                    buildInfoFile: buildInfoPath
                };
            }
            if (!project.options.noEmit && (0, ts_1.getPendingEmitKind)(project.options, buildInfo.program.options || {})) {
                return {
                    type: ts_1.UpToDateStatusType.OutOfDateOptions,
                    buildInfoFile: buildInfoPath
                };
            }
            buildInfoProgram = buildInfo.program;
        }
        oldestOutputFileTime = buildInfoTime;
        oldestOutputFileName = buildInfoPath;
    }
    // Check input files
    var newestInputFileName = undefined;
    var newestInputFileTime = minimumDate;
    /** True if input file has changed timestamp but text is not changed, we can then do only timestamp updates on output to make it look up-to-date later */
    var pseudoInputUpToDate = false;
    var seenRoots = new Set();
    // Get timestamps of input files
    for (var _d = 0, _e = project.fileNames; _d < _e.length; _d++) {
        var inputFile = _e[_d];
        var inputTime = getModifiedTime(state, inputFile);
        if (inputTime === ts_1.missingFileModifiedTime) {
            return {
                type: ts_1.UpToDateStatusType.Unbuildable,
                reason: "".concat(inputFile, " does not exist")
            };
        }
        // If an buildInfo is older than the newest input, we can stop checking
        if (buildInfoTime && buildInfoTime < inputTime) {
            var version_1 = void 0;
            var currentVersion = void 0;
            if (buildInfoProgram) {
                // Read files and see if they are same, read is anyways cached
                if (!buildInfoVersionMap)
                    buildInfoVersionMap = (0, ts_1.getBuildInfoFileVersionMap)(buildInfoProgram, buildInfoPath, host);
                version_1 = buildInfoVersionMap.fileInfos.get(toPath(state, inputFile));
                var text = version_1 ? state.readFileWithCache(inputFile) : undefined;
                currentVersion = text !== undefined ? (0, ts_1.getSourceFileVersionAsHashFromText)(host, text) : undefined;
                if (version_1 && version_1 === currentVersion)
                    pseudoInputUpToDate = true;
            }
            if (!version_1 || version_1 !== currentVersion) {
                return {
                    type: ts_1.UpToDateStatusType.OutOfDateWithSelf,
                    outOfDateOutputFileName: buildInfoPath,
                    newerInputFileName: inputFile
                };
            }
        }
        if (inputTime > newestInputFileTime) {
            newestInputFileName = inputFile;
            newestInputFileTime = inputTime;
        }
        if (buildInfoProgram)
            seenRoots.add(toPath(state, inputFile));
    }
    if (buildInfoProgram) {
        if (!buildInfoVersionMap)
            buildInfoVersionMap = (0, ts_1.getBuildInfoFileVersionMap)(buildInfoProgram, buildInfoPath, host);
        for (var _f = 0, _g = buildInfoVersionMap.roots; _f < _g.length; _f++) {
            var existingRoot = _g[_f];
            if (!seenRoots.has(existingRoot)) {
                // File was root file when project was built but its not any more
                return {
                    type: ts_1.UpToDateStatusType.OutOfDateRoots,
                    buildInfoFile: buildInfoPath,
                    inputFile: existingRoot,
                };
            }
        }
    }
    // Now see if all outputs are newer than the newest input
    // Dont check output timestamps if we have buildinfo telling us output is uptodate
    if (!buildInfoPath) {
        // Collect the expected outputs of this project
        var outputs = (0, ts_1.getAllProjectOutputs)(project, !host.useCaseSensitiveFileNames());
        var outputTimeStampMap = getOutputTimeStampMap(state, resolvedPath);
        for (var _h = 0, outputs_1 = outputs; _h < outputs_1.length; _h++) {
            var output = outputs_1[_h];
            var path = toPath(state, output);
            // Output is missing; can stop checking
            var outputTime = outputTimeStampMap === null || outputTimeStampMap === void 0 ? void 0 : outputTimeStampMap.get(path);
            if (!outputTime) {
                outputTime = (0, ts_1.getModifiedTime)(state.host, output);
                outputTimeStampMap === null || outputTimeStampMap === void 0 ? void 0 : outputTimeStampMap.set(path, outputTime);
            }
            if (outputTime === ts_1.missingFileModifiedTime) {
                return {
                    type: ts_1.UpToDateStatusType.OutputMissing,
                    missingOutputFileName: output
                };
            }
            // If an output is older than the newest input, we can stop checking
            if (outputTime < newestInputFileTime) {
                return {
                    type: ts_1.UpToDateStatusType.OutOfDateWithSelf,
                    outOfDateOutputFileName: output,
                    newerInputFileName: newestInputFileName
                };
            }
            // No need to get newestDeclarationFileContentChangedTime since thats needed only for composite projects
            // And composite projects are the only ones that can be referenced
            if (outputTime < oldestOutputFileTime) {
                oldestOutputFileTime = outputTime;
                oldestOutputFileName = output;
            }
        }
    }
    var buildInfoCacheEntry = state.buildInfoCache.get(resolvedPath);
    /** Inputs are up-to-date, just need either timestamp update or bundle prepend manipulation to make it look up-to-date */
    var pseudoUpToDate = false;
    var usesPrepend = false;
    var upstreamChangedProject;
    if (referenceStatuses) {
        for (var _j = 0, referenceStatuses_1 = referenceStatuses; _j < referenceStatuses_1.length; _j++) {
            var _k = referenceStatuses_1[_j], ref = _k.ref, refStatus = _k.refStatus, resolvedConfig = _k.resolvedConfig, resolvedRefPath = _k.resolvedRefPath;
            usesPrepend = usesPrepend || !!(ref.prepend);
            // If the upstream project's newest file is older than our oldest output, we
            // can't be out of date because of it
            if (refStatus.newestInputFileTime && refStatus.newestInputFileTime <= oldestOutputFileTime) {
                continue;
            }
            // Check if tsbuildinfo path is shared, then we need to rebuild
            if (buildInfoCacheEntry && hasSameBuildInfo(state, buildInfoCacheEntry, resolvedRefPath)) {
                return {
                    type: ts_1.UpToDateStatusType.OutOfDateWithUpstream,
                    outOfDateOutputFileName: buildInfoPath,
                    newerProjectName: ref.path
                };
            }
            // If the upstream project has only change .d.ts files, and we've built
            // *after* those files, then we're "psuedo up to date" and eligible for a fast rebuild
            var newestDeclarationFileContentChangedTime = getLatestChangedDtsTime(state, resolvedConfig.options, resolvedRefPath);
            if (newestDeclarationFileContentChangedTime && newestDeclarationFileContentChangedTime <= oldestOutputFileTime) {
                pseudoUpToDate = true;
                upstreamChangedProject = ref.path;
                continue;
            }
            // We have an output older than an upstream output - we are out of date
            ts_1.Debug.assert(oldestOutputFileName !== undefined, "Should have an oldest output filename here");
            return {
                type: ts_1.UpToDateStatusType.OutOfDateWithUpstream,
                outOfDateOutputFileName: oldestOutputFileName,
                newerProjectName: ref.path
            };
        }
    }
    // Check tsconfig time
    var configStatus = checkConfigFileUpToDateStatus(state, project.options.configFilePath, oldestOutputFileTime, oldestOutputFileName);
    if (configStatus)
        return configStatus;
    // Check extended config time
    var extendedConfigStatus = (0, ts_1.forEach)(project.options.configFile.extendedSourceFiles || ts_1.emptyArray, function (configFile) { return checkConfigFileUpToDateStatus(state, configFile, oldestOutputFileTime, oldestOutputFileName); });
    if (extendedConfigStatus)
        return extendedConfigStatus;
    // Check package file time
    var dependentPackageFileStatus = (0, ts_1.forEach)(state.lastCachedPackageJsonLookups.get(resolvedPath) || ts_1.emptyArray, function (_a) {
        var path = _a[0];
        return checkConfigFileUpToDateStatus(state, path, oldestOutputFileTime, oldestOutputFileName);
    });
    if (dependentPackageFileStatus)
        return dependentPackageFileStatus;
    if (usesPrepend && pseudoUpToDate) {
        return {
            type: ts_1.UpToDateStatusType.OutOfDateWithPrepend,
            outOfDateOutputFileName: oldestOutputFileName,
            newerProjectName: upstreamChangedProject
        };
    }
    // Up to date
    return {
        type: pseudoUpToDate ?
            ts_1.UpToDateStatusType.UpToDateWithUpstreamTypes :
            pseudoInputUpToDate ?
                ts_1.UpToDateStatusType.UpToDateWithInputFileText :
                ts_1.UpToDateStatusType.UpToDate,
        newestInputFileTime: newestInputFileTime,
        newestInputFileName: newestInputFileName,
        oldestOutputFileName: oldestOutputFileName
    };
}
function hasSameBuildInfo(state, buildInfoCacheEntry, resolvedRefPath) {
    var refBuildInfo = state.buildInfoCache.get(resolvedRefPath);
    return refBuildInfo.path === buildInfoCacheEntry.path;
}
function getUpToDateStatus(state, project, resolvedPath) {
    if (project === undefined) {
        return { type: ts_1.UpToDateStatusType.Unbuildable, reason: "File deleted mid-build" };
    }
    var prior = state.projectStatus.get(resolvedPath);
    if (prior !== undefined) {
        return prior;
    }
    performance.mark("SolutionBuilder::beforeUpToDateCheck");
    var actual = getUpToDateStatusWorker(state, project, resolvedPath);
    performance.mark("SolutionBuilder::afterUpToDateCheck");
    performance.measure("SolutionBuilder::Up-to-date check", "SolutionBuilder::beforeUpToDateCheck", "SolutionBuilder::afterUpToDateCheck");
    state.projectStatus.set(resolvedPath, actual);
    return actual;
}
function updateOutputTimestampsWorker(state, proj, projectPath, verboseMessage, skipOutputs) {
    if (proj.options.noEmit)
        return;
    var now;
    var buildInfoPath = (0, ts_1.getTsBuildInfoEmitOutputFilePath)(proj.options);
    if (buildInfoPath) {
        // For incremental projects, only buildinfo needs to be upto date with timestamp check
        // as we dont check output files for up-to-date ness
        if (!(skipOutputs === null || skipOutputs === void 0 ? void 0 : skipOutputs.has(toPath(state, buildInfoPath)))) {
            if (!!state.options.verbose)
                reportStatus(state, verboseMessage, proj.options.configFilePath);
            state.host.setModifiedTime(buildInfoPath, now = getCurrentTime(state.host));
            getBuildInfoCacheEntry(state, buildInfoPath, projectPath).modifiedTime = now;
        }
        state.outputTimeStamps.delete(projectPath);
        return;
    }
    var host = state.host;
    var outputs = (0, ts_1.getAllProjectOutputs)(proj, !host.useCaseSensitiveFileNames());
    var outputTimeStampMap = getOutputTimeStampMap(state, projectPath);
    var modifiedOutputs = outputTimeStampMap ? new Set() : undefined;
    if (!skipOutputs || outputs.length !== skipOutputs.size) {
        var reportVerbose = !!state.options.verbose;
        for (var _i = 0, outputs_2 = outputs; _i < outputs_2.length; _i++) {
            var file = outputs_2[_i];
            var path = toPath(state, file);
            if (skipOutputs === null || skipOutputs === void 0 ? void 0 : skipOutputs.has(path))
                continue;
            if (reportVerbose) {
                reportVerbose = false;
                reportStatus(state, verboseMessage, proj.options.configFilePath);
            }
            host.setModifiedTime(file, now || (now = getCurrentTime(state.host)));
            // Store output timestamps in a map because non incremental build will need to check them to determine up-to-dateness
            if (outputTimeStampMap) {
                outputTimeStampMap.set(path, now);
                modifiedOutputs.add(path);
            }
        }
    }
    // Clear out timestamps not in output list any more
    outputTimeStampMap === null || outputTimeStampMap === void 0 ? void 0 : outputTimeStampMap.forEach(function (_value, key) {
        if (!(skipOutputs === null || skipOutputs === void 0 ? void 0 : skipOutputs.has(key)) && !modifiedOutputs.has(key))
            outputTimeStampMap.delete(key);
    });
}
function getLatestChangedDtsTime(state, options, resolvedConfigPath) {
    if (!options.composite)
        return undefined;
    var entry = ts_1.Debug.checkDefined(state.buildInfoCache.get(resolvedConfigPath));
    if (entry.latestChangedDtsTime !== undefined)
        return entry.latestChangedDtsTime || undefined;
    var latestChangedDtsTime = entry.buildInfo && entry.buildInfo.program && entry.buildInfo.program.latestChangedDtsFile ?
        state.host.getModifiedTime((0, ts_1.getNormalizedAbsolutePath)(entry.buildInfo.program.latestChangedDtsFile, (0, ts_1.getDirectoryPath)(entry.path))) :
        undefined;
    entry.latestChangedDtsTime = latestChangedDtsTime || false;
    return latestChangedDtsTime;
}
function updateOutputTimestamps(state, proj, resolvedPath) {
    if (state.options.dry) {
        return reportStatus(state, ts_1.Diagnostics.A_non_dry_build_would_update_timestamps_for_output_of_project_0, proj.options.configFilePath);
    }
    updateOutputTimestampsWorker(state, proj, resolvedPath, ts_1.Diagnostics.Updating_output_timestamps_of_project_0);
    state.projectStatus.set(resolvedPath, {
        type: ts_1.UpToDateStatusType.UpToDate,
        oldestOutputFileName: (0, ts_1.getFirstProjectOutput)(proj, !state.host.useCaseSensitiveFileNames())
    });
}
function queueReferencingProjects(state, project, projectPath, projectIndex, config, buildOrder, buildResult) {
    // Queue only if there are no errors
    if (buildResult & BuildResultFlags.AnyErrors)
        return;
    // Only composite projects can be referenced by other projects
    if (!config.options.composite)
        return;
    // Always use build order to queue projects
    for (var index = projectIndex + 1; index < buildOrder.length; index++) {
        var nextProject = buildOrder[index];
        var nextProjectPath = toResolvedConfigFilePath(state, nextProject);
        if (state.projectPendingBuild.has(nextProjectPath))
            continue;
        var nextProjectConfig = parseConfigFile(state, nextProject, nextProjectPath);
        if (!nextProjectConfig || !nextProjectConfig.projectReferences)
            continue;
        for (var _i = 0, _a = nextProjectConfig.projectReferences; _i < _a.length; _i++) {
            var ref = _a[_i];
            var resolvedRefPath = resolveProjectName(state, ref.path);
            if (toResolvedConfigFilePath(state, resolvedRefPath) !== projectPath)
                continue;
            // If the project is referenced with prepend, always build downstream projects,
            // If declaration output is changed, build the project
            // otherwise mark the project UpToDateWithUpstreamTypes so it updates output time stamps
            var status_2 = state.projectStatus.get(nextProjectPath);
            if (status_2) {
                switch (status_2.type) {
                    case ts_1.UpToDateStatusType.UpToDate:
                        if (buildResult & BuildResultFlags.DeclarationOutputUnchanged) {
                            if (ref.prepend) {
                                state.projectStatus.set(nextProjectPath, {
                                    type: ts_1.UpToDateStatusType.OutOfDateWithPrepend,
                                    outOfDateOutputFileName: status_2.oldestOutputFileName,
                                    newerProjectName: project
                                });
                            }
                            else {
                                status_2.type = ts_1.UpToDateStatusType.UpToDateWithUpstreamTypes;
                            }
                            break;
                        }
                    // falls through
                    case ts_1.UpToDateStatusType.UpToDateWithInputFileText:
                    case ts_1.UpToDateStatusType.UpToDateWithUpstreamTypes:
                    case ts_1.UpToDateStatusType.OutOfDateWithPrepend:
                        if (!(buildResult & BuildResultFlags.DeclarationOutputUnchanged)) {
                            state.projectStatus.set(nextProjectPath, {
                                type: ts_1.UpToDateStatusType.OutOfDateWithUpstream,
                                outOfDateOutputFileName: status_2.type === ts_1.UpToDateStatusType.OutOfDateWithPrepend ? status_2.outOfDateOutputFileName : status_2.oldestOutputFileName,
                                newerProjectName: project
                            });
                        }
                        break;
                    case ts_1.UpToDateStatusType.UpstreamBlocked:
                        if (toResolvedConfigFilePath(state, resolveProjectName(state, status_2.upstreamProjectName)) === projectPath) {
                            clearProjectStatus(state, nextProjectPath);
                        }
                        break;
                }
            }
            addProjToQueue(state, nextProjectPath, ts_1.ConfigFileProgramReloadLevel.None);
            break;
        }
    }
}
function build(state, project, cancellationToken, writeFile, getCustomTransformers, onlyReferences) {
    performance.mark("SolutionBuilder::beforeBuild");
    var result = buildWorker(state, project, cancellationToken, writeFile, getCustomTransformers, onlyReferences);
    performance.mark("SolutionBuilder::afterBuild");
    performance.measure("SolutionBuilder::Build", "SolutionBuilder::beforeBuild", "SolutionBuilder::afterBuild");
    return result;
}
function buildWorker(state, project, cancellationToken, writeFile, getCustomTransformers, onlyReferences) {
    var buildOrder = getBuildOrderFor(state, project, onlyReferences);
    if (!buildOrder)
        return ts_1.ExitStatus.InvalidProject_OutputsSkipped;
    setupInitialBuild(state, cancellationToken);
    var reportQueue = true;
    var successfulProjects = 0;
    while (true) {
        var invalidatedProject = getNextInvalidatedProject(state, buildOrder, reportQueue);
        if (!invalidatedProject)
            break;
        reportQueue = false;
        invalidatedProject.done(cancellationToken, writeFile, getCustomTransformers === null || getCustomTransformers === void 0 ? void 0 : getCustomTransformers(invalidatedProject.project));
        if (!state.diagnostics.has(invalidatedProject.projectPath))
            successfulProjects++;
    }
    disableCache(state);
    reportErrorSummary(state, buildOrder);
    startWatching(state, buildOrder);
    return isCircularBuildOrder(buildOrder)
        ? ts_1.ExitStatus.ProjectReferenceCycle_OutputsSkipped
        : !buildOrder.some(function (p) { return state.diagnostics.has(toResolvedConfigFilePath(state, p)); })
            ? ts_1.ExitStatus.Success
            : successfulProjects
                ? ts_1.ExitStatus.DiagnosticsPresent_OutputsGenerated
                : ts_1.ExitStatus.DiagnosticsPresent_OutputsSkipped;
}
function clean(state, project, onlyReferences) {
    performance.mark("SolutionBuilder::beforeClean");
    var result = cleanWorker(state, project, onlyReferences);
    performance.mark("SolutionBuilder::afterClean");
    performance.measure("SolutionBuilder::Clean", "SolutionBuilder::beforeClean", "SolutionBuilder::afterClean");
    return result;
}
function cleanWorker(state, project, onlyReferences) {
    var buildOrder = getBuildOrderFor(state, project, onlyReferences);
    if (!buildOrder)
        return ts_1.ExitStatus.InvalidProject_OutputsSkipped;
    if (isCircularBuildOrder(buildOrder)) {
        reportErrors(state, buildOrder.circularDiagnostics);
        return ts_1.ExitStatus.ProjectReferenceCycle_OutputsSkipped;
    }
    var options = state.options, host = state.host;
    var filesToDelete = options.dry ? [] : undefined;
    for (var _i = 0, buildOrder_1 = buildOrder; _i < buildOrder_1.length; _i++) {
        var proj = buildOrder_1[_i];
        var resolvedPath = toResolvedConfigFilePath(state, proj);
        var parsed = parseConfigFile(state, proj, resolvedPath);
        if (parsed === undefined) {
            // File has gone missing; fine to ignore here
            reportParseConfigFileDiagnostic(state, resolvedPath);
            continue;
        }
        var outputs = (0, ts_1.getAllProjectOutputs)(parsed, !host.useCaseSensitiveFileNames());
        if (!outputs.length)
            continue;
        var inputFileNames = new Set(parsed.fileNames.map(function (f) { return toPath(state, f); }));
        for (var _a = 0, outputs_3 = outputs; _a < outputs_3.length; _a++) {
            var output = outputs_3[_a];
            // If output name is same as input file name, do not delete and ignore the error
            if (inputFileNames.has(toPath(state, output)))
                continue;
            if (host.fileExists(output)) {
                if (filesToDelete) {
                    filesToDelete.push(output);
                }
                else {
                    host.deleteFile(output);
                    invalidateProject(state, resolvedPath, ts_1.ConfigFileProgramReloadLevel.None);
                }
            }
        }
    }
    if (filesToDelete) {
        reportStatus(state, ts_1.Diagnostics.A_non_dry_build_would_delete_the_following_files_Colon_0, filesToDelete.map(function (f) { return "\r\n * ".concat(f); }).join(""));
    }
    return ts_1.ExitStatus.Success;
}
function invalidateProject(state, resolved, reloadLevel) {
    // If host implements getParsedCommandLine, we cant get list of files from parseConfigFileHost
    if (state.host.getParsedCommandLine && reloadLevel === ts_1.ConfigFileProgramReloadLevel.Partial) {
        reloadLevel = ts_1.ConfigFileProgramReloadLevel.Full;
    }
    if (reloadLevel === ts_1.ConfigFileProgramReloadLevel.Full) {
        state.configFileCache.delete(resolved);
        state.buildOrder = undefined;
    }
    state.needsSummary = true;
    clearProjectStatus(state, resolved);
    addProjToQueue(state, resolved, reloadLevel);
    enableCache(state);
}
function invalidateProjectAndScheduleBuilds(state, resolvedPath, reloadLevel) {
    state.reportFileChangeDetected = true;
    invalidateProject(state, resolvedPath, reloadLevel);
    scheduleBuildInvalidatedProject(state, 250, /*changeDetected*/ true);
}
function scheduleBuildInvalidatedProject(state, time, changeDetected) {
    var hostWithWatch = state.hostWithWatch;
    if (!hostWithWatch.setTimeout || !hostWithWatch.clearTimeout) {
        return;
    }
    if (state.timerToBuildInvalidatedProject) {
        hostWithWatch.clearTimeout(state.timerToBuildInvalidatedProject);
    }
    state.timerToBuildInvalidatedProject = hostWithWatch.setTimeout(buildNextInvalidatedProject, time, "timerToBuildInvalidatedProject", state, changeDetected);
}
function buildNextInvalidatedProject(_timeoutType, state, changeDetected) {
    performance.mark("SolutionBuilder::beforeBuild");
    var buildOrder = buildNextInvalidatedProjectWorker(state, changeDetected);
    performance.mark("SolutionBuilder::afterBuild");
    performance.measure("SolutionBuilder::Build", "SolutionBuilder::beforeBuild", "SolutionBuilder::afterBuild");
    if (buildOrder)
        reportErrorSummary(state, buildOrder);
}
function buildNextInvalidatedProjectWorker(state, changeDetected) {
    state.timerToBuildInvalidatedProject = undefined;
    if (state.reportFileChangeDetected) {
        state.reportFileChangeDetected = false;
        state.projectErrorsReported.clear();
        reportWatchStatus(state, ts_1.Diagnostics.File_change_detected_Starting_incremental_compilation);
    }
    var projectsBuilt = 0;
    var buildOrder = getBuildOrder(state);
    var invalidatedProject = getNextInvalidatedProject(state, buildOrder, /*reportQueue*/ false);
    if (invalidatedProject) {
        invalidatedProject.done();
        projectsBuilt++;
        while (state.projectPendingBuild.size) {
            // If already scheduled, skip
            if (state.timerToBuildInvalidatedProject)
                return;
            // Before scheduling check if the next project needs build
            var info = getNextInvalidatedProjectCreateInfo(state, buildOrder, /*reportQueue*/ false);
            if (!info)
                break; // Nothing to build any more
            if (info.kind !== InvalidatedProjectKind.UpdateOutputFileStamps && (changeDetected || projectsBuilt === 5)) {
                // Schedule next project for build
                scheduleBuildInvalidatedProject(state, 100, /*changeDetected*/ false);
                return;
            }
            var project = createInvalidatedProjectWithInfo(state, info, buildOrder);
            project.done();
            if (info.kind !== InvalidatedProjectKind.UpdateOutputFileStamps)
                projectsBuilt++;
        }
    }
    disableCache(state);
    return buildOrder;
}
function watchConfigFile(state, resolved, resolvedPath, parsed) {
    if (!state.watch || state.allWatchedConfigFiles.has(resolvedPath))
        return;
    state.allWatchedConfigFiles.set(resolvedPath, watchFile(state, resolved, function () { return invalidateProjectAndScheduleBuilds(state, resolvedPath, ts_1.ConfigFileProgramReloadLevel.Full); }, ts_1.PollingInterval.High, parsed === null || parsed === void 0 ? void 0 : parsed.watchOptions, ts_1.WatchType.ConfigFile, resolved));
}
function watchExtendedConfigFiles(state, resolvedPath, parsed) {
    (0, ts_1.updateSharedExtendedConfigFileWatcher)(resolvedPath, parsed === null || parsed === void 0 ? void 0 : parsed.options, state.allWatchedExtendedConfigFiles, function (extendedConfigFileName, extendedConfigFilePath) { return watchFile(state, extendedConfigFileName, function () {
        var _a;
        return (_a = state.allWatchedExtendedConfigFiles.get(extendedConfigFilePath)) === null || _a === void 0 ? void 0 : _a.projects.forEach(function (projectConfigFilePath) {
            return invalidateProjectAndScheduleBuilds(state, projectConfigFilePath, ts_1.ConfigFileProgramReloadLevel.Full);
        });
    }, ts_1.PollingInterval.High, parsed === null || parsed === void 0 ? void 0 : parsed.watchOptions, ts_1.WatchType.ExtendedConfigFile); }, function (fileName) { return toPath(state, fileName); });
}
function watchWildCardDirectories(state, resolved, resolvedPath, parsed) {
    if (!state.watch)
        return;
    (0, ts_1.updateWatchingWildcardDirectories)(getOrCreateValueMapFromConfigFileMap(state.allWatchedWildcardDirectories, resolvedPath), new Map(Object.entries(parsed.wildcardDirectories)), function (dir, flags) { return state.watchDirectory(dir, function (fileOrDirectory) {
        var _a;
        if ((0, ts_1.isIgnoredFileFromWildCardWatching)({
            watchedDirPath: toPath(state, dir),
            fileOrDirectory: fileOrDirectory,
            fileOrDirectoryPath: toPath(state, fileOrDirectory),
            configFileName: resolved,
            currentDirectory: state.compilerHost.getCurrentDirectory(),
            options: parsed.options,
            program: state.builderPrograms.get(resolvedPath) || ((_a = getCachedParsedConfigFile(state, resolvedPath)) === null || _a === void 0 ? void 0 : _a.fileNames),
            useCaseSensitiveFileNames: state.parseConfigFileHost.useCaseSensitiveFileNames,
            writeLog: function (s) { return state.writeLog(s); },
            toPath: function (fileName) { return toPath(state, fileName); }
        }))
            return;
        invalidateProjectAndScheduleBuilds(state, resolvedPath, ts_1.ConfigFileProgramReloadLevel.Partial);
    }, flags, parsed === null || parsed === void 0 ? void 0 : parsed.watchOptions, ts_1.WatchType.WildcardDirectory, resolved); });
}
function watchInputFiles(state, resolved, resolvedPath, parsed) {
    if (!state.watch)
        return;
    (0, ts_1.mutateMap)(getOrCreateValueMapFromConfigFileMap(state.allWatchedInputFiles, resolvedPath), (0, ts_1.arrayToMap)(parsed.fileNames, function (fileName) { return toPath(state, fileName); }), {
        createNewValue: function (_path, input) { return watchFile(state, input, function () { return invalidateProjectAndScheduleBuilds(state, resolvedPath, ts_1.ConfigFileProgramReloadLevel.None); }, ts_1.PollingInterval.Low, parsed === null || parsed === void 0 ? void 0 : parsed.watchOptions, ts_1.WatchType.SourceFile, resolved); },
        onDeleteValue: ts_1.closeFileWatcher,
    });
}
function watchPackageJsonFiles(state, resolved, resolvedPath, parsed) {
    if (!state.watch || !state.lastCachedPackageJsonLookups)
        return;
    (0, ts_1.mutateMap)(getOrCreateValueMapFromConfigFileMap(state.allWatchedPackageJsonFiles, resolvedPath), new Map(state.lastCachedPackageJsonLookups.get(resolvedPath)), {
        createNewValue: function (path, _input) { return watchFile(state, path, function () { return invalidateProjectAndScheduleBuilds(state, resolvedPath, ts_1.ConfigFileProgramReloadLevel.None); }, ts_1.PollingInterval.High, parsed === null || parsed === void 0 ? void 0 : parsed.watchOptions, ts_1.WatchType.PackageJson, resolved); },
        onDeleteValue: ts_1.closeFileWatcher,
    });
}
function startWatching(state, buildOrder) {
    if (!state.watchAllProjectsPending)
        return;
    performance.mark("SolutionBuilder::beforeWatcherCreation");
    state.watchAllProjectsPending = false;
    for (var _i = 0, _a = getBuildOrderFromAnyBuildOrder(buildOrder); _i < _a.length; _i++) {
        var resolved = _a[_i];
        var resolvedPath = toResolvedConfigFilePath(state, resolved);
        var cfg = parseConfigFile(state, resolved, resolvedPath);
        // Watch this file
        watchConfigFile(state, resolved, resolvedPath, cfg);
        watchExtendedConfigFiles(state, resolvedPath, cfg);
        if (cfg) {
            // Update watchers for wildcard directories
            watchWildCardDirectories(state, resolved, resolvedPath, cfg);
            // Watch input files
            watchInputFiles(state, resolved, resolvedPath, cfg);
            // Watch package json files
            watchPackageJsonFiles(state, resolved, resolvedPath, cfg);
        }
    }
    performance.mark("SolutionBuilder::afterWatcherCreation");
    performance.measure("SolutionBuilder::Watcher creation", "SolutionBuilder::beforeWatcherCreation", "SolutionBuilder::afterWatcherCreation");
}
function stopWatching(state) {
    (0, ts_1.clearMap)(state.allWatchedConfigFiles, ts_1.closeFileWatcher);
    (0, ts_1.clearMap)(state.allWatchedExtendedConfigFiles, ts_1.closeFileWatcherOf);
    (0, ts_1.clearMap)(state.allWatchedWildcardDirectories, function (watchedWildcardDirectories) { return (0, ts_1.clearMap)(watchedWildcardDirectories, ts_1.closeFileWatcherOf); });
    (0, ts_1.clearMap)(state.allWatchedInputFiles, function (watchedWildcardDirectories) { return (0, ts_1.clearMap)(watchedWildcardDirectories, ts_1.closeFileWatcher); });
    (0, ts_1.clearMap)(state.allWatchedPackageJsonFiles, function (watchedPacageJsonFiles) { return (0, ts_1.clearMap)(watchedPacageJsonFiles, ts_1.closeFileWatcher); });
}
function createSolutionBuilderWorker(watch, hostOrHostWithWatch, rootNames, options, baseWatchOptions) {
    var state = createSolutionBuilderState(watch, hostOrHostWithWatch, rootNames, options, baseWatchOptions);
    return {
        build: function (project, cancellationToken, writeFile, getCustomTransformers) { return build(state, project, cancellationToken, writeFile, getCustomTransformers); },
        clean: function (project) { return clean(state, project); },
        buildReferences: function (project, cancellationToken, writeFile, getCustomTransformers) { return build(state, project, cancellationToken, writeFile, getCustomTransformers, /*onlyReferences*/ true); },
        cleanReferences: function (project) { return clean(state, project, /*onlyReferences*/ true); },
        getNextInvalidatedProject: function (cancellationToken) {
            setupInitialBuild(state, cancellationToken);
            return getNextInvalidatedProject(state, getBuildOrder(state), /*reportQueue*/ false);
        },
        getBuildOrder: function () { return getBuildOrder(state); },
        getUpToDateStatusOfProject: function (project) {
            var configFileName = resolveProjectName(state, project);
            var configFilePath = toResolvedConfigFilePath(state, configFileName);
            return getUpToDateStatus(state, parseConfigFile(state, configFileName, configFilePath), configFilePath);
        },
        invalidateProject: function (configFilePath, reloadLevel) { return invalidateProject(state, configFilePath, reloadLevel || ts_1.ConfigFileProgramReloadLevel.None); },
        close: function () { return stopWatching(state); },
    };
}
function relName(state, path) {
    return (0, ts_1.convertToRelativePath)(path, state.compilerHost.getCurrentDirectory(), state.compilerHost.getCanonicalFileName);
}
function reportStatus(state, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    state.host.reportSolutionBuilderStatus(ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)));
}
function reportWatchStatus(state, message) {
    var _a, _b;
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    (_b = (_a = state.hostWithWatch).onWatchStatusChange) === null || _b === void 0 ? void 0 : _b.call(_a, ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)), state.host.getNewLine(), state.baseCompilerOptions);
}
function reportErrors(_a, errors) {
    var host = _a.host;
    errors.forEach(function (err) { return host.reportDiagnostic(err); });
}
function reportAndStoreErrors(state, proj, errors) {
    reportErrors(state, errors);
    state.projectErrorsReported.set(proj, true);
    if (errors.length) {
        state.diagnostics.set(proj, errors);
    }
}
function reportParseConfigFileDiagnostic(state, proj) {
    reportAndStoreErrors(state, proj, [state.configFileCache.get(proj)]);
}
function reportErrorSummary(state, buildOrder) {
    if (!state.needsSummary)
        return;
    state.needsSummary = false;
    var canReportSummary = state.watch || !!state.host.reportErrorSummary;
    var diagnostics = state.diagnostics;
    var totalErrors = 0;
    var filesInError = [];
    if (isCircularBuildOrder(buildOrder)) {
        reportBuildQueue(state, buildOrder.buildOrder);
        reportErrors(state, buildOrder.circularDiagnostics);
        if (canReportSummary)
            totalErrors += (0, ts_1.getErrorCountForSummary)(buildOrder.circularDiagnostics);
        if (canReportSummary)
            filesInError = __spreadArray(__spreadArray([], filesInError, true), (0, ts_1.getFilesInErrorForSummary)(buildOrder.circularDiagnostics), true);
    }
    else {
        // Report errors from the other projects
        buildOrder.forEach(function (project) {
            var projectPath = toResolvedConfigFilePath(state, project);
            if (!state.projectErrorsReported.has(projectPath)) {
                reportErrors(state, diagnostics.get(projectPath) || ts_1.emptyArray);
            }
        });
        if (canReportSummary)
            diagnostics.forEach(function (singleProjectErrors) { return totalErrors += (0, ts_1.getErrorCountForSummary)(singleProjectErrors); });
        if (canReportSummary)
            diagnostics.forEach(function (singleProjectErrors) { return __spreadArray(__spreadArray([], filesInError, true), (0, ts_1.getFilesInErrorForSummary)(singleProjectErrors), true); });
    }
    if (state.watch) {
        reportWatchStatus(state, (0, ts_1.getWatchErrorSummaryDiagnosticMessage)(totalErrors), totalErrors);
    }
    else if (state.host.reportErrorSummary) {
        state.host.reportErrorSummary(totalErrors, filesInError);
    }
}
/**
 * Report the build ordering inferred from the current project graph if we're in verbose mode
 */
function reportBuildQueue(state, buildQueue) {
    if (state.options.verbose) {
        reportStatus(state, ts_1.Diagnostics.Projects_in_this_build_Colon_0, buildQueue.map(function (s) { return "\r\n    * " + relName(state, s); }).join(""));
    }
}
function reportUpToDateStatus(state, configFileName, status) {
    switch (status.type) {
        case ts_1.UpToDateStatusType.OutOfDateWithSelf:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_output_1_is_older_than_input_2, relName(state, configFileName), relName(state, status.outOfDateOutputFileName), relName(state, status.newerInputFileName));
        case ts_1.UpToDateStatusType.OutOfDateWithUpstream:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_output_1_is_older_than_input_2, relName(state, configFileName), relName(state, status.outOfDateOutputFileName), relName(state, status.newerProjectName));
        case ts_1.UpToDateStatusType.OutputMissing:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_output_file_1_does_not_exist, relName(state, configFileName), relName(state, status.missingOutputFileName));
        case ts_1.UpToDateStatusType.ErrorReadingFile:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_there_was_error_reading_file_1, relName(state, configFileName), relName(state, status.fileName));
        case ts_1.UpToDateStatusType.OutOfDateBuildInfo:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_buildinfo_file_1_indicates_that_some_of_the_changes_were_not_emitted, relName(state, configFileName), relName(state, status.buildInfoFile));
        case ts_1.UpToDateStatusType.OutOfDateOptions:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_buildinfo_file_1_indicates_there_is_change_in_compilerOptions, relName(state, configFileName), relName(state, status.buildInfoFile));
        case ts_1.UpToDateStatusType.OutOfDateRoots:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_buildinfo_file_1_indicates_that_file_2_was_root_file_of_compilation_but_not_any_more, relName(state, configFileName), relName(state, status.buildInfoFile), relName(state, status.inputFile));
        case ts_1.UpToDateStatusType.UpToDate:
            if (status.newestInputFileTime !== undefined) {
                return reportStatus(state, ts_1.Diagnostics.Project_0_is_up_to_date_because_newest_input_1_is_older_than_output_2, relName(state, configFileName), relName(state, status.newestInputFileName || ""), relName(state, status.oldestOutputFileName || ""));
            }
            // Don't report anything for "up to date because it was already built" -- too verbose
            break;
        case ts_1.UpToDateStatusType.OutOfDateWithPrepend:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_output_of_its_dependency_1_has_changed, relName(state, configFileName), relName(state, status.newerProjectName));
        case ts_1.UpToDateStatusType.UpToDateWithUpstreamTypes:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_up_to_date_with_d_ts_files_from_its_dependencies, relName(state, configFileName));
        case ts_1.UpToDateStatusType.UpToDateWithInputFileText:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_up_to_date_but_needs_to_update_timestamps_of_output_files_that_are_older_than_input_files, relName(state, configFileName));
        case ts_1.UpToDateStatusType.UpstreamOutOfDate:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_its_dependency_1_is_out_of_date, relName(state, configFileName), relName(state, status.upstreamProjectName));
        case ts_1.UpToDateStatusType.UpstreamBlocked:
            return reportStatus(state, status.upstreamProjectBlocked ?
                ts_1.Diagnostics.Project_0_can_t_be_built_because_its_dependency_1_was_not_built :
                ts_1.Diagnostics.Project_0_can_t_be_built_because_its_dependency_1_has_errors, relName(state, configFileName), relName(state, status.upstreamProjectName));
        case ts_1.UpToDateStatusType.Unbuildable:
            return reportStatus(state, ts_1.Diagnostics.Failed_to_parse_file_0_Colon_1, relName(state, configFileName), status.reason);
        case ts_1.UpToDateStatusType.TsVersionOutputOfDate:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_out_of_date_because_output_for_it_was_generated_with_version_1_that_differs_with_current_version_2, relName(state, configFileName), status.version, ts_1.version);
        case ts_1.UpToDateStatusType.ForceBuild:
            return reportStatus(state, ts_1.Diagnostics.Project_0_is_being_forcibly_rebuilt, relName(state, configFileName));
        case ts_1.UpToDateStatusType.ContainerOnly:
        // Don't report status on "solution" projects
        // falls through
        case ts_1.UpToDateStatusType.ComputingUpstream:
            // Should never leak from getUptoDateStatusWorker
            break;
        default:
            (0, ts_1.assertType)(status);
    }
}
/**
 * Report the up-to-date status of a project if we're in verbose mode
 */
function verboseReportProjectStatus(state, configFileName, status) {
    if (state.options.verbose) {
        reportUpToDateStatus(state, configFileName, status);
    }
}
