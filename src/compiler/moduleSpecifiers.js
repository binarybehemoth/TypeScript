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
exports.tryGetJSExtensionForFile = exports.tryGetRealFileNameForNonJsDeclarationFileName = exports.forEachFileNameOfModule = exports.countPathComponents = exports.getModuleSpecifiersWithCacheInfo = exports.getModuleSpecifiers = exports.tryGetModuleSpecifiersFromCache = exports.getNodeModulesPackageName = exports.getModuleSpecifier = exports.updateModuleSpecifier = void 0;
var ts_1 = require("./_namespaces/ts");
function getPreferences(_a, compilerOptions, importingSourceFile, oldImportSpecifier) {
    var importModuleSpecifierPreference = _a.importModuleSpecifierPreference, importModuleSpecifierEnding = _a.importModuleSpecifierEnding;
    var preferredEnding = getPreferredEnding();
    return {
        relativePreference: oldImportSpecifier !== undefined ? ((0, ts_1.isExternalModuleNameRelative)(oldImportSpecifier) ?
            0 /* RelativePreference.Relative */ :
            1 /* RelativePreference.NonRelative */) :
            importModuleSpecifierPreference === "relative" ? 0 /* RelativePreference.Relative */ :
                importModuleSpecifierPreference === "non-relative" ? 1 /* RelativePreference.NonRelative */ :
                    importModuleSpecifierPreference === "project-relative" ? 3 /* RelativePreference.ExternalNonRelative */ :
                        2 /* RelativePreference.Shortest */,
        getAllowedEndingsInPreferredOrder: function (syntaxImpliedNodeFormat) {
            if ((syntaxImpliedNodeFormat !== null && syntaxImpliedNodeFormat !== void 0 ? syntaxImpliedNodeFormat : importingSourceFile.impliedNodeFormat) === ts_1.ModuleKind.ESNext) {
                if ((0, ts_1.shouldAllowImportingTsExtension)(compilerOptions, importingSourceFile.fileName)) {
                    return [3 /* ModuleSpecifierEnding.TsExtension */, 2 /* ModuleSpecifierEnding.JsExtension */];
                }
                return [2 /* ModuleSpecifierEnding.JsExtension */];
            }
            if ((0, ts_1.getEmitModuleResolutionKind)(compilerOptions) === ts_1.ModuleResolutionKind.Classic) {
                return preferredEnding === 2 /* ModuleSpecifierEnding.JsExtension */
                    ? [2 /* ModuleSpecifierEnding.JsExtension */, 1 /* ModuleSpecifierEnding.Index */]
                    : [1 /* ModuleSpecifierEnding.Index */, 2 /* ModuleSpecifierEnding.JsExtension */];
            }
            var allowImportingTsExtension = (0, ts_1.shouldAllowImportingTsExtension)(compilerOptions, importingSourceFile.fileName);
            switch (preferredEnding) {
                case 2 /* ModuleSpecifierEnding.JsExtension */: return allowImportingTsExtension
                    ? [2 /* ModuleSpecifierEnding.JsExtension */, 3 /* ModuleSpecifierEnding.TsExtension */, 0 /* ModuleSpecifierEnding.Minimal */, 1 /* ModuleSpecifierEnding.Index */]
                    : [2 /* ModuleSpecifierEnding.JsExtension */, 0 /* ModuleSpecifierEnding.Minimal */, 1 /* ModuleSpecifierEnding.Index */];
                case 3 /* ModuleSpecifierEnding.TsExtension */: return [3 /* ModuleSpecifierEnding.TsExtension */, 0 /* ModuleSpecifierEnding.Minimal */, 2 /* ModuleSpecifierEnding.JsExtension */, 1 /* ModuleSpecifierEnding.Index */];
                case 1 /* ModuleSpecifierEnding.Index */: return allowImportingTsExtension
                    ? [1 /* ModuleSpecifierEnding.Index */, 0 /* ModuleSpecifierEnding.Minimal */, 3 /* ModuleSpecifierEnding.TsExtension */, 2 /* ModuleSpecifierEnding.JsExtension */]
                    : [1 /* ModuleSpecifierEnding.Index */, 0 /* ModuleSpecifierEnding.Minimal */, 2 /* ModuleSpecifierEnding.JsExtension */];
                case 0 /* ModuleSpecifierEnding.Minimal */: return allowImportingTsExtension
                    ? [0 /* ModuleSpecifierEnding.Minimal */, 1 /* ModuleSpecifierEnding.Index */, 3 /* ModuleSpecifierEnding.TsExtension */, 2 /* ModuleSpecifierEnding.JsExtension */]
                    : [0 /* ModuleSpecifierEnding.Minimal */, 1 /* ModuleSpecifierEnding.Index */, 2 /* ModuleSpecifierEnding.JsExtension */];
                default: ts_1.Debug.assertNever(preferredEnding);
            }
        },
    };
    function getPreferredEnding() {
        if (oldImportSpecifier !== undefined) {
            if ((0, ts_1.hasJSFileExtension)(oldImportSpecifier))
                return 2 /* ModuleSpecifierEnding.JsExtension */;
            if ((0, ts_1.endsWith)(oldImportSpecifier, "/index"))
                return 1 /* ModuleSpecifierEnding.Index */;
        }
        return (0, ts_1.getModuleSpecifierEndingPreference)(importModuleSpecifierEnding, importingSourceFile.impliedNodeFormat, compilerOptions, importingSourceFile);
    }
}
// `importingSourceFile` and `importingSourceFileName`? Why not just use `importingSourceFile.path`?
// Because when this is called by the file renamer, `importingSourceFile` is the file being renamed,
// while `importingSourceFileName` its *new* name. We need a source file just to get its
// `impliedNodeFormat` and to detect certain preferences from existing import module specifiers.
/** @internal */
function updateModuleSpecifier(compilerOptions, importingSourceFile, importingSourceFileName, toFileName, host, oldImportSpecifier, options) {
    if (options === void 0) { options = {}; }
    var res = getModuleSpecifierWorker(compilerOptions, importingSourceFile, importingSourceFileName, toFileName, host, getPreferences({}, compilerOptions, importingSourceFile, oldImportSpecifier), {}, options);
    if (res === oldImportSpecifier)
        return undefined;
    return res;
}
exports.updateModuleSpecifier = updateModuleSpecifier;
// `importingSourceFile` and `importingSourceFileName`? Why not just use `importingSourceFile.path`?
// Because when this is called by the declaration emitter, `importingSourceFile` is the implementation
// file, but `importingSourceFileName` and `toFileName` refer to declaration files (the former to the
// one currently being produced; the latter to the one being imported). We need an implementation file
// just to get its `impliedNodeFormat` and to detect certain preferences from existing import module
// specifiers.
/** @internal */
function getModuleSpecifier(compilerOptions, importingSourceFile, importingSourceFileName, toFileName, host, options) {
    if (options === void 0) { options = {}; }
    return getModuleSpecifierWorker(compilerOptions, importingSourceFile, importingSourceFileName, toFileName, host, getPreferences({}, compilerOptions, importingSourceFile), {}, options);
}
exports.getModuleSpecifier = getModuleSpecifier;
/** @internal */
function getNodeModulesPackageName(compilerOptions, importingSourceFile, nodeModulesFileName, host, preferences, options) {
    if (options === void 0) { options = {}; }
    var info = getInfo(importingSourceFile.path, host);
    var modulePaths = getAllModulePaths(importingSourceFile.path, nodeModulesFileName, host, preferences, options);
    return (0, ts_1.firstDefined)(modulePaths, function (modulePath) { return tryGetModuleNameAsNodeModule(modulePath, info, importingSourceFile, host, compilerOptions, preferences, /*packageNameOnly*/ true, options.overrideImportMode); });
}
exports.getNodeModulesPackageName = getNodeModulesPackageName;
function getModuleSpecifierWorker(compilerOptions, importingSourceFile, importingSourceFileName, toFileName, host, preferences, userPreferences, options) {
    if (options === void 0) { options = {}; }
    var info = getInfo(importingSourceFileName, host);
    var modulePaths = getAllModulePaths(importingSourceFileName, toFileName, host, userPreferences, options);
    return (0, ts_1.firstDefined)(modulePaths, function (modulePath) { return tryGetModuleNameAsNodeModule(modulePath, info, importingSourceFile, host, compilerOptions, userPreferences, /*packageNameOnly*/ undefined, options.overrideImportMode); }) ||
        getLocalModuleSpecifier(toFileName, info, compilerOptions, host, options.overrideImportMode || importingSourceFile.impliedNodeFormat, preferences);
}
/** @internal */
function tryGetModuleSpecifiersFromCache(moduleSymbol, importingSourceFile, host, userPreferences, options) {
    if (options === void 0) { options = {}; }
    return tryGetModuleSpecifiersFromCacheWorker(moduleSymbol, importingSourceFile, host, userPreferences, options)[0];
}
exports.tryGetModuleSpecifiersFromCache = tryGetModuleSpecifiersFromCache;
function tryGetModuleSpecifiersFromCacheWorker(moduleSymbol, importingSourceFile, host, userPreferences, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var moduleSourceFile = (0, ts_1.getSourceFileOfModule)(moduleSymbol);
    if (!moduleSourceFile) {
        return ts_1.emptyArray;
    }
    var cache = (_a = host.getModuleSpecifierCache) === null || _a === void 0 ? void 0 : _a.call(host);
    var cached = cache === null || cache === void 0 ? void 0 : cache.get(importingSourceFile.path, moduleSourceFile.path, userPreferences, options);
    return [cached === null || cached === void 0 ? void 0 : cached.moduleSpecifiers, moduleSourceFile, cached === null || cached === void 0 ? void 0 : cached.modulePaths, cache];
}
/**
 * Returns an import for each symlink and for the realpath.
 *
 * @internal
 */
function getModuleSpecifiers(moduleSymbol, checker, compilerOptions, importingSourceFile, host, userPreferences, options) {
    if (options === void 0) { options = {}; }
    return getModuleSpecifiersWithCacheInfo(moduleSymbol, checker, compilerOptions, importingSourceFile, host, userPreferences, options).moduleSpecifiers;
}
exports.getModuleSpecifiers = getModuleSpecifiers;
/** @internal */
function getModuleSpecifiersWithCacheInfo(moduleSymbol, checker, compilerOptions, importingSourceFile, host, userPreferences, options) {
    if (options === void 0) { options = {}; }
    var computedWithoutCache = false;
    var ambient = tryGetModuleNameFromAmbientModule(moduleSymbol, checker);
    if (ambient)
        return { moduleSpecifiers: [ambient], computedWithoutCache: computedWithoutCache };
    // eslint-disable-next-line prefer-const
    var _a = tryGetModuleSpecifiersFromCacheWorker(moduleSymbol, importingSourceFile, host, userPreferences, options), specifiers = _a[0], moduleSourceFile = _a[1], modulePaths = _a[2], cache = _a[3];
    if (specifiers)
        return { moduleSpecifiers: specifiers, computedWithoutCache: computedWithoutCache };
    if (!moduleSourceFile)
        return { moduleSpecifiers: ts_1.emptyArray, computedWithoutCache: computedWithoutCache };
    computedWithoutCache = true;
    modulePaths || (modulePaths = getAllModulePathsWorker(importingSourceFile.path, moduleSourceFile.originalFileName, host));
    var result = computeModuleSpecifiers(modulePaths, compilerOptions, importingSourceFile, host, userPreferences, options);
    cache === null || cache === void 0 ? void 0 : cache.set(importingSourceFile.path, moduleSourceFile.path, userPreferences, options, modulePaths, result);
    return { moduleSpecifiers: result, computedWithoutCache: computedWithoutCache };
}
exports.getModuleSpecifiersWithCacheInfo = getModuleSpecifiersWithCacheInfo;
function computeModuleSpecifiers(modulePaths, compilerOptions, importingSourceFile, host, userPreferences, options) {
    if (options === void 0) { options = {}; }
    var info = getInfo(importingSourceFile.path, host);
    var preferences = getPreferences(userPreferences, compilerOptions, importingSourceFile);
    var existingSpecifier = (0, ts_1.forEach)(modulePaths, function (modulePath) { return (0, ts_1.forEach)(host.getFileIncludeReasons().get((0, ts_1.toPath)(modulePath.path, host.getCurrentDirectory(), info.getCanonicalFileName)), function (reason) {
        if (reason.kind !== ts_1.FileIncludeKind.Import || reason.file !== importingSourceFile.path)
            return undefined;
        // If the candidate import mode doesn't match the mode we're generating for, don't consider it
        // TODO: maybe useful to keep around as an alternative option for certain contexts where the mode is overridable
        if (importingSourceFile.impliedNodeFormat && importingSourceFile.impliedNodeFormat !== (0, ts_1.getModeForResolutionAtIndex)(importingSourceFile, reason.index))
            return undefined;
        var specifier = (0, ts_1.getModuleNameStringLiteralAt)(importingSourceFile, reason.index).text;
        // If the preference is for non relative and the module specifier is relative, ignore it
        return preferences.relativePreference !== 1 /* RelativePreference.NonRelative */ || !(0, ts_1.pathIsRelative)(specifier) ?
            specifier :
            undefined;
    }); });
    if (existingSpecifier) {
        var moduleSpecifiers = [existingSpecifier];
        return moduleSpecifiers;
    }
    var importedFileIsInNodeModules = (0, ts_1.some)(modulePaths, function (p) { return p.isInNodeModules; });
    // Module specifier priority:
    //   1. "Bare package specifiers" (e.g. "@foo/bar") resulting from a path through node_modules to a package.json's "types" entry
    //   2. Specifiers generated using "paths" from tsconfig
    //   3. Non-relative specfiers resulting from a path through node_modules (e.g. "@foo/bar/path/to/file")
    //   4. Relative paths
    var nodeModulesSpecifiers;
    var pathsSpecifiers;
    var redirectPathsSpecifiers;
    var relativeSpecifiers;
    for (var _i = 0, modulePaths_1 = modulePaths; _i < modulePaths_1.length; _i++) {
        var modulePath = modulePaths_1[_i];
        var specifier = modulePath.isInNodeModules
            ? tryGetModuleNameAsNodeModule(modulePath, info, importingSourceFile, host, compilerOptions, userPreferences, /*packageNameOnly*/ undefined, options.overrideImportMode)
            : undefined;
        nodeModulesSpecifiers = (0, ts_1.append)(nodeModulesSpecifiers, specifier);
        if (specifier && modulePath.isRedirect) {
            // If we got a specifier for a redirect, it was a bare package specifier (e.g. "@foo/bar",
            // not "@foo/bar/path/to/file"). No other specifier will be this good, so stop looking.
            return nodeModulesSpecifiers;
        }
        if (!specifier) {
            var local = getLocalModuleSpecifier(modulePath.path, info, compilerOptions, host, options.overrideImportMode || importingSourceFile.impliedNodeFormat, preferences, 
            /*pathsOnly*/ modulePath.isRedirect);
            if (!local) {
                continue;
            }
            if (modulePath.isRedirect) {
                redirectPathsSpecifiers = (0, ts_1.append)(redirectPathsSpecifiers, local);
            }
            else if ((0, ts_1.pathIsBareSpecifier)(local)) {
                pathsSpecifiers = (0, ts_1.append)(pathsSpecifiers, local);
            }
            else if (!importedFileIsInNodeModules || modulePath.isInNodeModules) {
                // Why this extra conditional, not just an `else`? If some path to the file contained
                // 'node_modules', but we can't create a non-relative specifier (e.g. "@foo/bar/path/to/file"),
                // that means we had to go through a *sibling's* node_modules, not one we can access directly.
                // If some path to the file was in node_modules but another was not, this likely indicates that
                // we have a monorepo structure with symlinks. In this case, the non-node_modules path is
                // probably the realpath, e.g. "../bar/path/to/file", but a relative path to another package
                // in a monorepo is probably not portable. So, the module specifier we actually go with will be
                // the relative path through node_modules, so that the declaration emitter can produce a
                // portability error. (See declarationEmitReexportedSymlinkReference3)
                relativeSpecifiers = (0, ts_1.append)(relativeSpecifiers, local);
            }
        }
    }
    return (pathsSpecifiers === null || pathsSpecifiers === void 0 ? void 0 : pathsSpecifiers.length) ? pathsSpecifiers :
        (redirectPathsSpecifiers === null || redirectPathsSpecifiers === void 0 ? void 0 : redirectPathsSpecifiers.length) ? redirectPathsSpecifiers :
            (nodeModulesSpecifiers === null || nodeModulesSpecifiers === void 0 ? void 0 : nodeModulesSpecifiers.length) ? nodeModulesSpecifiers :
                ts_1.Debug.checkDefined(relativeSpecifiers);
}
// importingSourceFileName is separate because getEditsForFileRename may need to specify an updated path
function getInfo(importingSourceFileName, host) {
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames ? host.useCaseSensitiveFileNames() : true);
    var sourceDirectory = (0, ts_1.getDirectoryPath)(importingSourceFileName);
    return { getCanonicalFileName: getCanonicalFileName, importingSourceFileName: importingSourceFileName, sourceDirectory: sourceDirectory };
}
function getLocalModuleSpecifier(moduleFileName, info, compilerOptions, host, importMode, _a, pathsOnly) {
    var getAllowedEndingsInPrefererredOrder = _a.getAllowedEndingsInPreferredOrder, relativePreference = _a.relativePreference;
    var baseUrl = compilerOptions.baseUrl, paths = compilerOptions.paths, rootDirs = compilerOptions.rootDirs;
    if (pathsOnly && !paths) {
        return undefined;
    }
    var sourceDirectory = info.sourceDirectory, getCanonicalFileName = info.getCanonicalFileName;
    var allowedEndings = getAllowedEndingsInPrefererredOrder(importMode);
    var relativePath = rootDirs && tryGetModuleNameFromRootDirs(rootDirs, moduleFileName, sourceDirectory, getCanonicalFileName, allowedEndings, compilerOptions) ||
        processEnding((0, ts_1.ensurePathIsNonModuleName)((0, ts_1.getRelativePathFromDirectory)(sourceDirectory, moduleFileName, getCanonicalFileName)), allowedEndings, compilerOptions);
    if (!baseUrl && !paths || relativePreference === 0 /* RelativePreference.Relative */) {
        return pathsOnly ? undefined : relativePath;
    }
    var baseDirectory = (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getPathsBasePath)(compilerOptions, host) || baseUrl, host.getCurrentDirectory());
    var relativeToBaseUrl = getRelativePathIfInSameVolume(moduleFileName, baseDirectory, getCanonicalFileName);
    if (!relativeToBaseUrl) {
        return pathsOnly ? undefined : relativePath;
    }
    var fromPaths = paths && tryGetModuleNameFromPaths(relativeToBaseUrl, paths, allowedEndings, host, compilerOptions);
    if (pathsOnly) {
        return fromPaths;
    }
    var maybeNonRelative = fromPaths === undefined && baseUrl !== undefined ? processEnding(relativeToBaseUrl, allowedEndings, compilerOptions) : fromPaths;
    if (!maybeNonRelative) {
        return relativePath;
    }
    if (relativePreference === 1 /* RelativePreference.NonRelative */ && !(0, ts_1.pathIsRelative)(maybeNonRelative)) {
        return maybeNonRelative;
    }
    if (relativePreference === 3 /* RelativePreference.ExternalNonRelative */ && !(0, ts_1.pathIsRelative)(maybeNonRelative)) {
        var projectDirectory = compilerOptions.configFilePath ?
            (0, ts_1.toPath)((0, ts_1.getDirectoryPath)(compilerOptions.configFilePath), host.getCurrentDirectory(), info.getCanonicalFileName) :
            info.getCanonicalFileName(host.getCurrentDirectory());
        var modulePath = (0, ts_1.toPath)(moduleFileName, projectDirectory, getCanonicalFileName);
        var sourceIsInternal = (0, ts_1.startsWith)(sourceDirectory, projectDirectory);
        var targetIsInternal = (0, ts_1.startsWith)(modulePath, projectDirectory);
        if (sourceIsInternal && !targetIsInternal || !sourceIsInternal && targetIsInternal) {
            // 1. The import path crosses the boundary of the tsconfig.json-containing directory.
            //
            //      src/
            //        tsconfig.json
            //        index.ts -------
            //      lib/              | (path crosses tsconfig.json)
            //        imported.ts <---
            //
            return maybeNonRelative;
        }
        var nearestTargetPackageJson = getNearestAncestorDirectoryWithPackageJson(host, (0, ts_1.getDirectoryPath)(modulePath));
        var nearestSourcePackageJson = getNearestAncestorDirectoryWithPackageJson(host, sourceDirectory);
        if (nearestSourcePackageJson !== nearestTargetPackageJson) {
            // 2. The importing and imported files are part of different packages.
            //
            //      packages/a/
            //        package.json
            //        index.ts --------
            //      packages/b/        | (path crosses package.json)
            //        package.json     |
            //        component.ts <---
            //
            return maybeNonRelative;
        }
        return relativePath;
    }
    // Prefer a relative import over a baseUrl import if it has fewer components.
    return isPathRelativeToParent(maybeNonRelative) || countPathComponents(relativePath) < countPathComponents(maybeNonRelative) ? relativePath : maybeNonRelative;
}
/** @internal */
function countPathComponents(path) {
    var count = 0;
    for (var i = (0, ts_1.startsWith)(path, "./") ? 2 : 0; i < path.length; i++) {
        if (path.charCodeAt(i) === 47 /* CharacterCodes.slash */)
            count++;
    }
    return count;
}
exports.countPathComponents = countPathComponents;
function comparePathsByRedirectAndNumberOfDirectorySeparators(a, b) {
    return (0, ts_1.compareBooleans)(b.isRedirect, a.isRedirect) || (0, ts_1.compareNumberOfDirectorySeparators)(a.path, b.path);
}
function getNearestAncestorDirectoryWithPackageJson(host, fileName) {
    if (host.getNearestAncestorDirectoryWithPackageJson) {
        return host.getNearestAncestorDirectoryWithPackageJson(fileName);
    }
    return !!(0, ts_1.forEachAncestorDirectory)(fileName, function (directory) {
        return host.fileExists((0, ts_1.combinePaths)(directory, "package.json")) ? true : undefined;
    });
}
/** @internal */
function forEachFileNameOfModule(importingFileName, importedFileName, host, preferSymlinks, cb) {
    var _a;
    var getCanonicalFileName = (0, ts_1.hostGetCanonicalFileName)(host);
    var cwd = host.getCurrentDirectory();
    var referenceRedirect = host.isSourceOfProjectReferenceRedirect(importedFileName) ? host.getProjectReferenceRedirect(importedFileName) : undefined;
    var importedPath = (0, ts_1.toPath)(importedFileName, cwd, getCanonicalFileName);
    var redirects = host.redirectTargetsMap.get(importedPath) || ts_1.emptyArray;
    var importedFileNames = __spreadArray(__spreadArray(__spreadArray([], (referenceRedirect ? [referenceRedirect] : ts_1.emptyArray), true), [importedFileName], false), redirects, true);
    var targets = importedFileNames.map(function (f) { return (0, ts_1.getNormalizedAbsolutePath)(f, cwd); });
    var shouldFilterIgnoredPaths = !(0, ts_1.every)(targets, ts_1.containsIgnoredPath);
    if (!preferSymlinks) {
        // Symlinks inside ignored paths are already filtered out of the symlink cache,
        // so we only need to remove them from the realpath filenames.
        var result_1 = (0, ts_1.forEach)(targets, function (p) { return !(shouldFilterIgnoredPaths && (0, ts_1.containsIgnoredPath)(p)) && cb(p, referenceRedirect === p); });
        if (result_1)
            return result_1;
    }
    var symlinkedDirectories = (_a = host.getSymlinkCache) === null || _a === void 0 ? void 0 : _a.call(host).getSymlinkedDirectoriesByRealpath();
    var fullImportedFileName = (0, ts_1.getNormalizedAbsolutePath)(importedFileName, cwd);
    var result = symlinkedDirectories && (0, ts_1.forEachAncestorDirectory)((0, ts_1.getDirectoryPath)(fullImportedFileName), function (realPathDirectory) {
        var symlinkDirectories = symlinkedDirectories.get((0, ts_1.ensureTrailingDirectorySeparator)((0, ts_1.toPath)(realPathDirectory, cwd, getCanonicalFileName)));
        if (!symlinkDirectories)
            return undefined; // Continue to ancestor directory
        // Don't want to a package to globally import from itself (importNameCodeFix_symlink_own_package.ts)
        if ((0, ts_1.startsWithDirectory)(importingFileName, realPathDirectory, getCanonicalFileName)) {
            return false; // Stop search, each ancestor directory will also hit this condition
        }
        return (0, ts_1.forEach)(targets, function (target) {
            if (!(0, ts_1.startsWithDirectory)(target, realPathDirectory, getCanonicalFileName)) {
                return;
            }
            var relative = (0, ts_1.getRelativePathFromDirectory)(realPathDirectory, target, getCanonicalFileName);
            for (var _i = 0, symlinkDirectories_1 = symlinkDirectories; _i < symlinkDirectories_1.length; _i++) {
                var symlinkDirectory = symlinkDirectories_1[_i];
                var option = (0, ts_1.resolvePath)(symlinkDirectory, relative);
                var result_2 = cb(option, target === referenceRedirect);
                shouldFilterIgnoredPaths = true; // We found a non-ignored path in symlinks, so we can reject ignored-path realpaths
                if (result_2)
                    return result_2;
            }
        });
    });
    return result || (preferSymlinks
        ? (0, ts_1.forEach)(targets, function (p) { return shouldFilterIgnoredPaths && (0, ts_1.containsIgnoredPath)(p) ? undefined : cb(p, p === referenceRedirect); })
        : undefined);
}
exports.forEachFileNameOfModule = forEachFileNameOfModule;
/**
 * Looks for existing imports that use symlinks to this module.
 * Symlinks will be returned first so they are preferred over the real path.
 */
function getAllModulePaths(importingFilePath, importedFileName, host, preferences, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var importedFilePath = (0, ts_1.toPath)(importedFileName, host.getCurrentDirectory(), (0, ts_1.hostGetCanonicalFileName)(host));
    var cache = (_a = host.getModuleSpecifierCache) === null || _a === void 0 ? void 0 : _a.call(host);
    if (cache) {
        var cached = cache.get(importingFilePath, importedFilePath, preferences, options);
        if (cached === null || cached === void 0 ? void 0 : cached.modulePaths)
            return cached.modulePaths;
    }
    var modulePaths = getAllModulePathsWorker(importingFilePath, importedFileName, host);
    if (cache) {
        cache.setModulePaths(importingFilePath, importedFilePath, preferences, options, modulePaths);
    }
    return modulePaths;
}
function getAllModulePathsWorker(importingFileName, importedFileName, host) {
    var getCanonicalFileName = (0, ts_1.hostGetCanonicalFileName)(host);
    var allFileNames = new Map();
    var importedFileFromNodeModules = false;
    forEachFileNameOfModule(importingFileName, importedFileName, host, 
    /*preferSymlinks*/ true, function (path, isRedirect) {
        var isInNodeModules = (0, ts_1.pathContainsNodeModules)(path);
        allFileNames.set(path, { path: getCanonicalFileName(path), isRedirect: isRedirect, isInNodeModules: isInNodeModules });
        importedFileFromNodeModules = importedFileFromNodeModules || isInNodeModules;
        // don't return value, so we collect everything
    });
    // Sort by paths closest to importing file Name directory
    var sortedPaths = [];
    var _loop_1 = function (directory) {
        var directoryStart = (0, ts_1.ensureTrailingDirectorySeparator)(directory);
        var pathsInDirectory;
        allFileNames.forEach(function (_a, fileName) {
            var path = _a.path, isRedirect = _a.isRedirect, isInNodeModules = _a.isInNodeModules;
            if ((0, ts_1.startsWith)(path, directoryStart)) {
                (pathsInDirectory || (pathsInDirectory = [])).push({ path: fileName, isRedirect: isRedirect, isInNodeModules: isInNodeModules });
                allFileNames.delete(fileName);
            }
        });
        if (pathsInDirectory) {
            if (pathsInDirectory.length > 1) {
                pathsInDirectory.sort(comparePathsByRedirectAndNumberOfDirectorySeparators);
            }
            sortedPaths.push.apply(sortedPaths, pathsInDirectory);
        }
        var newDirectory = (0, ts_1.getDirectoryPath)(directory);
        if (newDirectory === directory)
            return out_directory_1 = directory, "break";
        directory = newDirectory;
        out_directory_1 = directory;
    };
    var out_directory_1;
    for (var directory = (0, ts_1.getDirectoryPath)(importingFileName); allFileNames.size !== 0;) {
        var state_1 = _loop_1(directory);
        directory = out_directory_1;
        if (state_1 === "break")
            break;
    }
    if (allFileNames.size) {
        var remainingPaths = (0, ts_1.arrayFrom)(allFileNames.values());
        if (remainingPaths.length > 1)
            remainingPaths.sort(comparePathsByRedirectAndNumberOfDirectorySeparators);
        sortedPaths.push.apply(sortedPaths, remainingPaths);
    }
    return sortedPaths;
}
function tryGetModuleNameFromAmbientModule(moduleSymbol, checker) {
    var _a;
    var decl = (_a = moduleSymbol.declarations) === null || _a === void 0 ? void 0 : _a.find(function (d) { return (0, ts_1.isNonGlobalAmbientModule)(d) && (!(0, ts_1.isExternalModuleAugmentation)(d) || !(0, ts_1.isExternalModuleNameRelative)((0, ts_1.getTextOfIdentifierOrLiteral)(d.name))); });
    if (decl) {
        return decl.name.text;
    }
    // the module could be a namespace, which is export through "export=" from an ambient module.
    /**
     * declare module "m" {
     *     namespace ns {
     *         class c {}
     *     }
     *     export = ns;
     * }
     */
    // `import {c} from "m";` is valid, in which case, `moduleSymbol` is "ns", but the module name should be "m"
    var ambientModuleDeclareCandidates = (0, ts_1.mapDefined)(moduleSymbol.declarations, function (d) {
        var _a, _b, _c, _d;
        if (!(0, ts_1.isModuleDeclaration)(d))
            return;
        var topNamespace = getTopNamespace(d);
        if (!(((_a = topNamespace === null || topNamespace === void 0 ? void 0 : topNamespace.parent) === null || _a === void 0 ? void 0 : _a.parent)
            && (0, ts_1.isModuleBlock)(topNamespace.parent) && (0, ts_1.isAmbientModule)(topNamespace.parent.parent) && (0, ts_1.isSourceFile)(topNamespace.parent.parent.parent)))
            return;
        var exportAssignment = (_d = (_c = (_b = topNamespace.parent.parent.symbol.exports) === null || _b === void 0 ? void 0 : _b.get("export=")) === null || _c === void 0 ? void 0 : _c.valueDeclaration) === null || _d === void 0 ? void 0 : _d.expression;
        if (!exportAssignment)
            return;
        var exportSymbol = checker.getSymbolAtLocation(exportAssignment);
        if (!exportSymbol)
            return;
        var originalExportSymbol = (exportSymbol === null || exportSymbol === void 0 ? void 0 : exportSymbol.flags) & 2097152 /* SymbolFlags.Alias */ ? checker.getAliasedSymbol(exportSymbol) : exportSymbol;
        if (originalExportSymbol === d.symbol)
            return topNamespace.parent.parent;
        function getTopNamespace(namespaceDeclaration) {
            while (namespaceDeclaration.flags & 4 /* NodeFlags.NestedNamespace */) {
                namespaceDeclaration = namespaceDeclaration.parent;
            }
            return namespaceDeclaration;
        }
    });
    var ambientModuleDeclare = ambientModuleDeclareCandidates[0];
    if (ambientModuleDeclare) {
        return ambientModuleDeclare.name.text;
    }
}
function tryGetModuleNameFromPaths(relativeToBaseUrl, paths, allowedEndings, host, compilerOptions) {
    for (var key in paths) {
        var _loop_2 = function (patternText) {
            var pattern = (0, ts_1.normalizePath)(patternText);
            var indexOfStar = pattern.indexOf("*");
            // In module resolution, if `pattern` itself has an extension, a file with that extension is looked up directly,
            // meaning a '.ts' or '.d.ts' extension is allowed to resolve. This is distinct from the case where a '*' substitution
            // causes a module specifier to have an extension, i.e. the extension comes from the module specifier in a JS/TS file
            // and matches the '*'. For example:
            //
            // Module Specifier      | Path Mapping (key: [pattern]) | Interpolation       | Resolution Action
            // ---------------------->------------------------------->--------------------->---------------------------------------------------------------
            // import "@app/foo"    -> "@app/*": ["./src/app/*.ts"] -> "./src/app/foo.ts" -> tryFile("./src/app/foo.ts") || [continue resolution algorithm]
            // import "@app/foo.ts" -> "@app/*": ["./src/app/*"]    -> "./src/app/foo.ts" -> [continue resolution algorithm]
            //
            // (https://github.com/microsoft/TypeScript/blob/ad4ded80e1d58f0bf36ac16bea71bc10d9f09895/src/compiler/moduleNameResolver.ts#L2509-L2516)
            //
            // The interpolation produced by both scenarios is identical, but only in the former, where the extension is encoded in
            // the path mapping rather than in the module specifier, will we prioritize a file lookup on the interpolation result.
            // (In fact, currently, the latter scenario will necessarily fail since no resolution mode recognizes '.ts' as a valid
            // extension for a module specifier.)
            //
            // Here, this means we need to be careful about whether we generate a match from the target filename (typically with a
            // .ts extension) or the possible relative module specifiers representing that file:
            //
            // Filename            | Relative Module Specifier Candidates         | Path Mapping                 | Filename Result    | Module Specifier Results
            // --------------------<----------------------------------------------<------------------------------<-------------------||----------------------------
            // dist/haha.d.ts      <- dist/haha, dist/haha.js                     <- "@app/*": ["./dist/*.d.ts"] <- @app/haha        || (none)
            // dist/haha.d.ts      <- dist/haha, dist/haha.js                     <- "@app/*": ["./dist/*"]      <- (none)           || @app/haha, @app/haha.js
            // dist/foo/index.d.ts <- dist/foo, dist/foo/index, dist/foo/index.js <- "@app/*": ["./dist/*.d.ts"] <- @app/foo/index   || (none)
            // dist/foo/index.d.ts <- dist/foo, dist/foo/index, dist/foo/index.js <- "@app/*": ["./dist/*"]      <- (none)           || @app/foo, @app/foo/index, @app/foo/index.js
            // dist/wow.js.js      <- dist/wow.js, dist/wow.js.js                 <- "@app/*": ["./dist/*.js"]   <- @app/wow.js      || @app/wow, @app/wow.js
            //
            // The "Filename Result" can be generated only if `pattern` has an extension. Care must be taken that the list of
            // relative module specifiers to run the interpolation (a) is actually valid for the module resolution mode, (b) takes
            // into account the existence of other files (e.g. 'dist/wow.js' cannot refer to 'dist/wow.js.js' if 'dist/wow.js'
            // exists) and (c) that they are ordered by preference. The last row shows that the filename result and module
            // specifier results are not mutually exclusive. Note that the filename result is a higher priority in module
            // resolution, but as long criteria (b) above is met, I don't think its result needs to be the highest priority result
            // in module specifier generation. I have included it last, as it's difficult to tell exactly where it should be
            // sorted among the others for a particular value of `importModuleSpecifierEnding`.
            var candidates = allowedEndings.map(function (ending) { return ({
                ending: ending,
                value: processEnding(relativeToBaseUrl, [ending], compilerOptions)
            }); });
            if ((0, ts_1.tryGetExtensionFromPath)(pattern)) {
                candidates.push({ ending: undefined, value: relativeToBaseUrl });
            }
            if (indexOfStar !== -1) {
                var prefix = pattern.substring(0, indexOfStar);
                var suffix = pattern.substring(indexOfStar + 1);
                for (var _b = 0, candidates_1 = candidates; _b < candidates_1.length; _b++) {
                    var _c = candidates_1[_b], ending = _c.ending, value = _c.value;
                    if (value.length >= prefix.length + suffix.length &&
                        (0, ts_1.startsWith)(value, prefix) &&
                        (0, ts_1.endsWith)(value, suffix) &&
                        validateEnding({ ending: ending, value: value })) {
                        var matchedStar = value.substring(prefix.length, value.length - suffix.length);
                        return { value: (0, ts_1.pathIsRelative)(matchedStar) ? undefined : key.replace("*", matchedStar) };
                    }
                }
            }
            else if ((0, ts_1.some)(candidates, function (c) { return c.ending !== 0 /* ModuleSpecifierEnding.Minimal */ && pattern === c.value; }) ||
                (0, ts_1.some)(candidates, function (c) { return c.ending === 0 /* ModuleSpecifierEnding.Minimal */ && pattern === c.value && validateEnding(c); })) {
                return { value: key };
            }
        };
        for (var _i = 0, _a = paths[key]; _i < _a.length; _i++) {
            var patternText = _a[_i];
            var state_2 = _loop_2(patternText);
            if (typeof state_2 === "object")
                return state_2.value;
        }
    }
    function validateEnding(_a) {
        var ending = _a.ending, value = _a.value;
        // Optimization: `removeExtensionAndIndexPostFix` can query the file system (a good bit) if `ending` is `Minimal`, the basename
        // is 'index', and a `host` is provided. To avoid that until it's unavoidable, we ran the function with no `host` above. Only
        // here, after we've checked that the minimal ending is indeed a match (via the length and prefix/suffix checks / `some` calls),
        // do we check that the host-validated result is consistent with the answer we got before. If it's not, it falls back to the
        // `ModuleSpecifierEnding.Index` result, which should already be in the list of candidates if `Minimal` was. (Note: the assumption here is
        // that every module resolution mode that supports dropping extensions also supports dropping `/index`. Like literally
        // everything else in this file, this logic needs to be updated if that's not true in some future module resolution mode.)
        return ending !== 0 /* ModuleSpecifierEnding.Minimal */ || value === processEnding(relativeToBaseUrl, [ending], compilerOptions, host);
    }
}
function tryGetModuleNameFromExports(options, targetFilePath, packageDirectory, packageName, exports, conditions, mode) {
    if (mode === void 0) { mode = 0 /* MatchingMode.Exact */; }
    if (typeof exports === "string") {
        var pathOrPattern = (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.combinePaths)(packageDirectory, exports), /*currentDirectory*/ undefined);
        var extensionSwappedTarget = (0, ts_1.hasTSFileExtension)(targetFilePath) ? (0, ts_1.removeFileExtension)(targetFilePath) + tryGetJSExtensionForFile(targetFilePath, options) : undefined;
        switch (mode) {
            case 0 /* MatchingMode.Exact */:
                if ((0, ts_1.comparePaths)(targetFilePath, pathOrPattern) === 0 /* Comparison.EqualTo */ || (extensionSwappedTarget && (0, ts_1.comparePaths)(extensionSwappedTarget, pathOrPattern) === 0 /* Comparison.EqualTo */)) {
                    return { moduleFileToTry: packageName };
                }
                break;
            case 1 /* MatchingMode.Directory */:
                if ((0, ts_1.containsPath)(pathOrPattern, targetFilePath)) {
                    var fragment = (0, ts_1.getRelativePathFromDirectory)(pathOrPattern, targetFilePath, /*ignoreCase*/ false);
                    return { moduleFileToTry: (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.combinePaths)((0, ts_1.combinePaths)(packageName, exports), fragment), /*currentDirectory*/ undefined) };
                }
                break;
            case 2 /* MatchingMode.Pattern */:
                var starPos = pathOrPattern.indexOf("*");
                var leadingSlice = pathOrPattern.slice(0, starPos);
                var trailingSlice = pathOrPattern.slice(starPos + 1);
                if ((0, ts_1.startsWith)(targetFilePath, leadingSlice) && (0, ts_1.endsWith)(targetFilePath, trailingSlice)) {
                    var starReplacement = targetFilePath.slice(leadingSlice.length, targetFilePath.length - trailingSlice.length);
                    return { moduleFileToTry: packageName.replace("*", starReplacement) };
                }
                if (extensionSwappedTarget && (0, ts_1.startsWith)(extensionSwappedTarget, leadingSlice) && (0, ts_1.endsWith)(extensionSwappedTarget, trailingSlice)) {
                    var starReplacement = extensionSwappedTarget.slice(leadingSlice.length, extensionSwappedTarget.length - trailingSlice.length);
                    return { moduleFileToTry: packageName.replace("*", starReplacement) };
                }
                break;
        }
    }
    else if (Array.isArray(exports)) {
        return (0, ts_1.forEach)(exports, function (e) { return tryGetModuleNameFromExports(options, targetFilePath, packageDirectory, packageName, e, conditions); });
    }
    else if (typeof exports === "object" && exports !== null) { // eslint-disable-line no-null/no-null
        if ((0, ts_1.allKeysStartWithDot)(exports)) {
            // sub-mappings
            // 3 cases:
            // * directory mappings (legacyish, key ends with / (technically allows index/extension resolution under cjs mode))
            // * pattern mappings (contains a *)
            // * exact mappings (no *, does not end with /)
            return (0, ts_1.forEach)((0, ts_1.getOwnKeys)(exports), function (k) {
                var subPackageName = (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.combinePaths)(packageName, k), /*currentDirectory*/ undefined);
                var mode = (0, ts_1.endsWith)(k, "/") ? 1 /* MatchingMode.Directory */
                    : (0, ts_1.stringContains)(k, "*") ? 2 /* MatchingMode.Pattern */
                        : 0 /* MatchingMode.Exact */;
                return tryGetModuleNameFromExports(options, targetFilePath, packageDirectory, subPackageName, exports[k], conditions, mode);
            });
        }
        else {
            // conditional mapping
            for (var _i = 0, _a = (0, ts_1.getOwnKeys)(exports); _i < _a.length; _i++) {
                var key = _a[_i];
                if (key === "default" || conditions.indexOf(key) >= 0 || (0, ts_1.isApplicableVersionedTypesKey)(conditions, key)) {
                    var subTarget = exports[key];
                    var result = tryGetModuleNameFromExports(options, targetFilePath, packageDirectory, packageName, subTarget, conditions);
                    if (result) {
                        return result;
                    }
                }
            }
        }
    }
    return undefined;
}
function tryGetModuleNameFromRootDirs(rootDirs, moduleFileName, sourceDirectory, getCanonicalFileName, allowedEndings, compilerOptions) {
    var normalizedTargetPaths = getPathsRelativeToRootDirs(moduleFileName, rootDirs, getCanonicalFileName);
    if (normalizedTargetPaths === undefined) {
        return undefined;
    }
    var normalizedSourcePaths = getPathsRelativeToRootDirs(sourceDirectory, rootDirs, getCanonicalFileName);
    var relativePaths = (0, ts_1.flatMap)(normalizedSourcePaths, function (sourcePath) {
        return (0, ts_1.map)(normalizedTargetPaths, function (targetPath) { return (0, ts_1.ensurePathIsNonModuleName)((0, ts_1.getRelativePathFromDirectory)(sourcePath, targetPath, getCanonicalFileName)); });
    });
    var shortest = (0, ts_1.min)(relativePaths, ts_1.compareNumberOfDirectorySeparators);
    if (!shortest) {
        return undefined;
    }
    return processEnding(shortest, allowedEndings, compilerOptions);
}
function tryGetModuleNameAsNodeModule(_a, _b, importingSourceFile, host, options, userPreferences, packageNameOnly, overrideMode) {
    var path = _a.path, isRedirect = _a.isRedirect;
    var getCanonicalFileName = _b.getCanonicalFileName, sourceDirectory = _b.sourceDirectory;
    if (!host.fileExists || !host.readFile) {
        return undefined;
    }
    var parts = (0, ts_1.getNodeModulePathParts)(path);
    if (!parts) {
        return undefined;
    }
    // Simplify the full file path to something that can be resolved by Node.
    var preferences = getPreferences(userPreferences, options, importingSourceFile);
    var allowedEndings = preferences.getAllowedEndingsInPreferredOrder();
    var moduleSpecifier = path;
    var isPackageRootPath = false;
    if (!packageNameOnly) {
        var packageRootIndex = parts.packageRootIndex;
        var moduleFileName = void 0;
        while (true) {
            // If the module could be imported by a directory name, use that directory's name
            var _c = tryDirectoryWithPackageJson(packageRootIndex), moduleFileToTry = _c.moduleFileToTry, packageRootPath = _c.packageRootPath, blockedByExports = _c.blockedByExports, verbatimFromExports = _c.verbatimFromExports;
            if ((0, ts_1.getEmitModuleResolutionKind)(options) !== ts_1.ModuleResolutionKind.Classic) {
                if (blockedByExports) {
                    return undefined; // File is under this package.json, but is not publicly exported - there's no way to name it via `node_modules` resolution
                }
                if (verbatimFromExports) {
                    return moduleFileToTry;
                }
            }
            if (packageRootPath) {
                moduleSpecifier = packageRootPath;
                isPackageRootPath = true;
                break;
            }
            if (!moduleFileName)
                moduleFileName = moduleFileToTry;
            // try with next level of directory
            packageRootIndex = path.indexOf(ts_1.directorySeparator, packageRootIndex + 1);
            if (packageRootIndex === -1) {
                moduleSpecifier = processEnding(moduleFileName, allowedEndings, options, host);
                break;
            }
        }
    }
    if (isRedirect && !isPackageRootPath) {
        return undefined;
    }
    var globalTypingsCacheLocation = host.getGlobalTypingsCacheLocation && host.getGlobalTypingsCacheLocation();
    // Get a path that's relative to node_modules or the importing file's path
    // if node_modules folder is in this folder or any of its parent folders, no need to keep it.
    var pathToTopLevelNodeModules = getCanonicalFileName(moduleSpecifier.substring(0, parts.topLevelNodeModulesIndex));
    if (!((0, ts_1.startsWith)(sourceDirectory, pathToTopLevelNodeModules) || globalTypingsCacheLocation && (0, ts_1.startsWith)(getCanonicalFileName(globalTypingsCacheLocation), pathToTopLevelNodeModules))) {
        return undefined;
    }
    // If the module was found in @types, get the actual Node package name
    var nodeModulesDirectoryName = moduleSpecifier.substring(parts.topLevelPackageNameIndex + 1);
    var packageName = (0, ts_1.getPackageNameFromTypesPackageName)(nodeModulesDirectoryName);
    // For classic resolution, only allow importing from node_modules/@types, not other node_modules
    return (0, ts_1.getEmitModuleResolutionKind)(options) === ts_1.ModuleResolutionKind.Classic && packageName === nodeModulesDirectoryName ? undefined : packageName;
    function tryDirectoryWithPackageJson(packageRootIndex) {
        var _a, _b;
        var packageRootPath = path.substring(0, packageRootIndex);
        var packageJsonPath = (0, ts_1.combinePaths)(packageRootPath, "package.json");
        var moduleFileToTry = path;
        var maybeBlockedByTypesVersions = false;
        var cachedPackageJson = (_b = (_a = host.getPackageJsonInfoCache) === null || _a === void 0 ? void 0 : _a.call(host)) === null || _b === void 0 ? void 0 : _b.getPackageJsonInfo(packageJsonPath);
        if (typeof cachedPackageJson === "object" || cachedPackageJson === undefined && host.fileExists(packageJsonPath)) {
            var packageJsonContent = (cachedPackageJson === null || cachedPackageJson === void 0 ? void 0 : cachedPackageJson.contents.packageJsonContent) || JSON.parse(host.readFile(packageJsonPath));
            var importMode = overrideMode || importingSourceFile.impliedNodeFormat;
            if ((0, ts_1.getResolvePackageJsonExports)(options)) {
                // The package name that we found in node_modules could be different from the package
                // name in the package.json content via url/filepath dependency specifiers. We need to
                // use the actual directory name, so don't look at `packageJsonContent.name` here.
                var nodeModulesDirectoryName_1 = packageRootPath.substring(parts.topLevelPackageNameIndex + 1);
                var packageName_1 = (0, ts_1.getPackageNameFromTypesPackageName)(nodeModulesDirectoryName_1);
                var conditions = (0, ts_1.getConditions)(options, importMode === ts_1.ModuleKind.ESNext);
                var fromExports = packageJsonContent.exports
                    ? tryGetModuleNameFromExports(options, path, packageRootPath, packageName_1, packageJsonContent.exports, conditions)
                    : undefined;
                if (fromExports) {
                    var withJsExtension = !(0, ts_1.hasTSFileExtension)(fromExports.moduleFileToTry)
                        ? fromExports
                        : { moduleFileToTry: (0, ts_1.removeFileExtension)(fromExports.moduleFileToTry) + tryGetJSExtensionForFile(fromExports.moduleFileToTry, options) };
                    return __assign(__assign({}, withJsExtension), { verbatimFromExports: true });
                }
                if (packageJsonContent.exports) {
                    return { moduleFileToTry: path, blockedByExports: true };
                }
            }
            var versionPaths = packageJsonContent.typesVersions
                ? (0, ts_1.getPackageJsonTypesVersionsPaths)(packageJsonContent.typesVersions)
                : undefined;
            if (versionPaths) {
                var subModuleName = path.slice(packageRootPath.length + 1);
                var fromPaths = tryGetModuleNameFromPaths(subModuleName, versionPaths.paths, allowedEndings, host, options);
                if (fromPaths === undefined) {
                    maybeBlockedByTypesVersions = true;
                }
                else {
                    moduleFileToTry = (0, ts_1.combinePaths)(packageRootPath, fromPaths);
                }
            }
            // If the file is the main module, it can be imported by the package name
            var mainFileRelative = packageJsonContent.typings || packageJsonContent.types || packageJsonContent.main || "index.js";
            if ((0, ts_1.isString)(mainFileRelative) && !(maybeBlockedByTypesVersions && (0, ts_1.matchPatternOrExact)((0, ts_1.tryParsePatterns)(versionPaths.paths), mainFileRelative))) {
                // The 'main' file is also subject to mapping through typesVersions, and we couldn't come up with a path
                // explicitly through typesVersions, so if it matches a key in typesVersions now, it's not reachable.
                // (The only way this can happen is if some file in a package that's not resolvable from outside the
                // package got pulled into the program anyway, e.g. transitively through a file that *is* reachable. It
                // happens very easily in fourslash tests though, since every test file listed gets included. See
                // importNameCodeFix_typesVersions.ts for an example.)
                var mainExportFile = (0, ts_1.toPath)(mainFileRelative, packageRootPath, getCanonicalFileName);
                var canonicalModuleFileToTry = getCanonicalFileName(moduleFileToTry);
                if ((0, ts_1.removeFileExtension)(mainExportFile) === (0, ts_1.removeFileExtension)(canonicalModuleFileToTry)) {
                    // ^ An arbitrary removal of file extension for this comparison is almost certainly wrong
                    return { packageRootPath: packageRootPath, moduleFileToTry: moduleFileToTry };
                }
                else if (packageJsonContent.type !== "module" &&
                    !(0, ts_1.fileExtensionIsOneOf)(canonicalModuleFileToTry, ts_1.extensionsNotSupportingExtensionlessResolution) &&
                    (0, ts_1.startsWith)(canonicalModuleFileToTry, mainExportFile) &&
                    (0, ts_1.getDirectoryPath)(canonicalModuleFileToTry) === (0, ts_1.removeTrailingDirectorySeparator)(mainExportFile) &&
                    (0, ts_1.removeFileExtension)((0, ts_1.getBaseFileName)(canonicalModuleFileToTry)) === "index") {
                    // if mainExportFile is a directory, which contains moduleFileToTry, we just try index file
                    // example mainExportFile: `pkg/lib` and moduleFileToTry: `pkg/lib/index`, we can use packageRootPath
                    // but this behavior is deprecated for packages with "type": "module", so we only do this for packages without "type": "module"
                    // and make sure that the extension on index.{???} is something that supports omitting the extension
                    return { packageRootPath: packageRootPath, moduleFileToTry: moduleFileToTry };
                }
            }
        }
        else {
            // No package.json exists; an index.js will still resolve as the package name
            var fileName = getCanonicalFileName(moduleFileToTry.substring(parts.packageRootIndex + 1));
            if (fileName === "index.d.ts" || fileName === "index.js" || fileName === "index.ts" || fileName === "index.tsx") {
                return { moduleFileToTry: moduleFileToTry, packageRootPath: packageRootPath };
            }
        }
        return { moduleFileToTry: moduleFileToTry };
    }
}
function tryGetAnyFileFromPath(host, path) {
    if (!host.fileExists)
        return;
    // We check all js, `node` and `json` extensions in addition to TS, since node module resolution would also choose those over the directory
    var extensions = (0, ts_1.flatten)((0, ts_1.getSupportedExtensions)({ allowJs: true }, [{ extension: "node", isMixedContent: false }, { extension: "json", isMixedContent: false, scriptKind: 6 /* ScriptKind.JSON */ }]));
    for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
        var e = extensions_1[_i];
        var fullPath = path + e;
        if (host.fileExists(fullPath)) {
            return fullPath;
        }
    }
}
function getPathsRelativeToRootDirs(path, rootDirs, getCanonicalFileName) {
    return (0, ts_1.mapDefined)(rootDirs, function (rootDir) {
        var relativePath = getRelativePathIfInSameVolume(path, rootDir, getCanonicalFileName);
        return relativePath !== undefined && isPathRelativeToParent(relativePath) ? undefined : relativePath;
    });
}
function processEnding(fileName, allowedEndings, options, host) {
    if ((0, ts_1.fileExtensionIsOneOf)(fileName, [".json" /* Extension.Json */, ".mjs" /* Extension.Mjs */, ".cjs" /* Extension.Cjs */])) {
        return fileName;
    }
    var noExtension = (0, ts_1.removeFileExtension)(fileName);
    if (fileName === noExtension) {
        return fileName;
    }
    var jsPriority = allowedEndings.indexOf(2 /* ModuleSpecifierEnding.JsExtension */);
    var tsPriority = allowedEndings.indexOf(3 /* ModuleSpecifierEnding.TsExtension */);
    if ((0, ts_1.fileExtensionIsOneOf)(fileName, [".mts" /* Extension.Mts */, ".cts" /* Extension.Cts */]) && tsPriority !== -1 && tsPriority < jsPriority) {
        return fileName;
    }
    else if ((0, ts_1.fileExtensionIsOneOf)(fileName, [".d.mts" /* Extension.Dmts */, ".mts" /* Extension.Mts */, ".d.cts" /* Extension.Dcts */, ".cts" /* Extension.Cts */])) {
        return noExtension + getJSExtensionForFile(fileName, options);
    }
    else if (!(0, ts_1.fileExtensionIsOneOf)(fileName, [".d.ts" /* Extension.Dts */]) && (0, ts_1.fileExtensionIsOneOf)(fileName, [".ts" /* Extension.Ts */]) && (0, ts_1.stringContains)(fileName, ".d.")) {
        // `foo.d.json.ts` and the like - remap back to `foo.json`
        return tryGetRealFileNameForNonJsDeclarationFileName(fileName);
    }
    switch (allowedEndings[0]) {
        case 0 /* ModuleSpecifierEnding.Minimal */:
            var withoutIndex = (0, ts_1.removeSuffix)(noExtension, "/index");
            if (host && withoutIndex !== noExtension && tryGetAnyFileFromPath(host, withoutIndex)) {
                // Can't remove index if there's a file by the same name as the directory.
                // Probably more callers should pass `host` so we can determine this?
                return noExtension;
            }
            return withoutIndex;
        case 1 /* ModuleSpecifierEnding.Index */:
            return noExtension;
        case 2 /* ModuleSpecifierEnding.JsExtension */:
            return noExtension + getJSExtensionForFile(fileName, options);
        case 3 /* ModuleSpecifierEnding.TsExtension */:
            // For now, we don't know if this import is going to be type-only, which means we don't
            // know if a .d.ts extension is valid, so use no extension or a .js extension
            if ((0, ts_1.isDeclarationFileName)(fileName)) {
                var extensionlessPriority = allowedEndings.findIndex(function (e) { return e === 0 /* ModuleSpecifierEnding.Minimal */ || e === 1 /* ModuleSpecifierEnding.Index */; });
                return extensionlessPriority !== -1 && extensionlessPriority < jsPriority
                    ? noExtension
                    : noExtension + getJSExtensionForFile(fileName, options);
            }
            return fileName;
        default:
            return ts_1.Debug.assertNever(allowedEndings[0]);
    }
}
/** @internal */
function tryGetRealFileNameForNonJsDeclarationFileName(fileName) {
    var baseName = (0, ts_1.getBaseFileName)(fileName);
    if (!(0, ts_1.endsWith)(fileName, ".ts" /* Extension.Ts */) || !(0, ts_1.stringContains)(baseName, ".d.") || (0, ts_1.fileExtensionIsOneOf)(baseName, [".d.ts" /* Extension.Dts */]))
        return undefined;
    var noExtension = (0, ts_1.removeExtension)(fileName, ".ts" /* Extension.Ts */);
    var ext = noExtension.substring(noExtension.lastIndexOf("."));
    return noExtension.substring(0, noExtension.indexOf(".d.")) + ext;
}
exports.tryGetRealFileNameForNonJsDeclarationFileName = tryGetRealFileNameForNonJsDeclarationFileName;
function getJSExtensionForFile(fileName, options) {
    var _a;
    return (_a = tryGetJSExtensionForFile(fileName, options)) !== null && _a !== void 0 ? _a : ts_1.Debug.fail("Extension ".concat((0, ts_1.extensionFromPath)(fileName), " is unsupported:: FileName:: ").concat(fileName));
}
/** @internal */
function tryGetJSExtensionForFile(fileName, options) {
    var ext = (0, ts_1.tryGetExtensionFromPath)(fileName);
    switch (ext) {
        case ".ts" /* Extension.Ts */:
        case ".d.ts" /* Extension.Dts */:
            return ".js" /* Extension.Js */;
        case ".tsx" /* Extension.Tsx */:
            return options.jsx === 1 /* JsxEmit.Preserve */ ? ".jsx" /* Extension.Jsx */ : ".js" /* Extension.Js */;
        case ".js" /* Extension.Js */:
        case ".jsx" /* Extension.Jsx */:
        case ".json" /* Extension.Json */:
            return ext;
        case ".d.mts" /* Extension.Dmts */:
        case ".mts" /* Extension.Mts */:
        case ".mjs" /* Extension.Mjs */:
            return ".mjs" /* Extension.Mjs */;
        case ".d.cts" /* Extension.Dcts */:
        case ".cts" /* Extension.Cts */:
        case ".cjs" /* Extension.Cjs */:
            return ".cjs" /* Extension.Cjs */;
        default:
            return undefined;
    }
}
exports.tryGetJSExtensionForFile = tryGetJSExtensionForFile;
function getRelativePathIfInSameVolume(path, directoryPath, getCanonicalFileName) {
    var relativePath = (0, ts_1.getRelativePathToDirectoryOrUrl)(directoryPath, path, directoryPath, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
    return (0, ts_1.isRootedDiskPath)(relativePath) ? undefined : relativePath;
}
function isPathRelativeToParent(path) {
    return (0, ts_1.startsWith)(path, "..");
}
