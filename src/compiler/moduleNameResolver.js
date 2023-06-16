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
exports.loadModuleFromGlobalCache = exports.shouldAllowImportingTsExtension = exports.classicNameResolver = exports.unmangleScopedPackageName = exports.getPackageNameFromTypesPackageName = exports.mangleScopedPackageName = exports.getTypesPackageName = exports.isApplicableVersionedTypesKey = exports.comparePatternKeys = exports.allKeysStartWithDot = exports.parsePackageName = exports.getPackageJsonInfo = exports.getPackageScopeForPath = exports.getTemporaryModuleResolutionState = exports.getEntrypointsFromPackageJsonInfo = exports.parseNodeModuleFromPath = exports.pathContainsNodeModules = exports.nodeModulesPathPart = exports.nodeNextJsonConfigResolver = exports.nodeModuleNameResolver = exports.bundlerModuleNameResolver = exports.NodeResolutionFeatures = exports.resolveJSModule = exports.resolveModuleName = exports.resolveModuleNameFromCache = exports.resolveLibrary = exports.getOptionsForLibraryResolution = exports.createTypeReferenceDirectiveResolutionCache = exports.createModuleResolutionCache = exports.zipToModeAwareCache = exports.createModeAwareCache = exports.createModeAwareCacheKey = exports.createCacheWithRedirects = exports.getKeyForCompilerOptions = exports.getAutomaticTypeDirectiveNames = exports.resolvePackageNameToPackageJson = exports.getConditions = exports.resolveTypeReferenceDirective = exports.getEffectiveTypeRoots = exports.getPackageJsonTypesVersionsPaths = exports.updateResolutionField = exports.isTraceEnabled = exports.trace = void 0;
var ts_1 = require("./_namespaces/ts");
function trace(host) {
    host.trace(ts_1.formatMessage.apply(undefined, arguments));
}
exports.trace = trace;
/** @internal */
function isTraceEnabled(compilerOptions, host) {
    return !!compilerOptions.traceResolution && host.trace !== undefined;
}
exports.isTraceEnabled = isTraceEnabled;
function withPackageId(packageInfo, r) {
    var packageId;
    if (r && packageInfo) {
        var packageJsonContent = packageInfo.contents.packageJsonContent;
        if (typeof packageJsonContent.name === "string" && typeof packageJsonContent.version === "string") {
            packageId = {
                name: packageJsonContent.name,
                subModuleName: r.path.slice(packageInfo.packageDirectory.length + ts_1.directorySeparator.length),
                version: packageJsonContent.version
            };
        }
    }
    return r && { path: r.path, extension: r.ext, packageId: packageId, resolvedUsingTsExtension: r.resolvedUsingTsExtension };
}
function noPackageId(r) {
    return withPackageId(/*packageInfo*/ undefined, r);
}
function removeIgnoredPackageId(r) {
    if (r) {
        ts_1.Debug.assert(r.packageId === undefined);
        return { path: r.path, ext: r.extension, resolvedUsingTsExtension: r.resolvedUsingTsExtension };
    }
}
function formatExtensions(extensions) {
    var result = [];
    if (extensions & 1 /* Extensions.TypeScript */)
        result.push("TypeScript");
    if (extensions & 2 /* Extensions.JavaScript */)
        result.push("JavaScript");
    if (extensions & 4 /* Extensions.Declaration */)
        result.push("Declaration");
    if (extensions & 8 /* Extensions.Json */)
        result.push("JSON");
    return result.join(", ");
}
/** Used with `Extensions.DtsOnly` to extract the path from TypeScript results. */
function resolvedTypeScriptOnly(resolved) {
    if (!resolved) {
        return undefined;
    }
    ts_1.Debug.assert((0, ts_1.extensionIsTS)(resolved.extension));
    return { fileName: resolved.path, packageId: resolved.packageId };
}
function createResolvedModuleWithFailedLookupLocationsHandlingSymlink(moduleName, resolved, isExternalLibraryImport, failedLookupLocations, affectingLocations, diagnostics, state, legacyResult) {
    // If this is from node_modules for non relative name, always respect preserveSymlinks
    if (!state.resultFromCache &&
        !state.compilerOptions.preserveSymlinks &&
        resolved &&
        isExternalLibraryImport &&
        !resolved.originalPath &&
        !(0, ts_1.isExternalModuleNameRelative)(moduleName)) {
        var _a = getOriginalAndResolvedFileName(resolved.path, state.host, state.traceEnabled), resolvedFileName = _a.resolvedFileName, originalPath = _a.originalPath;
        if (originalPath)
            resolved = __assign(__assign({}, resolved), { path: resolvedFileName, originalPath: originalPath });
    }
    return createResolvedModuleWithFailedLookupLocations(resolved, isExternalLibraryImport, failedLookupLocations, affectingLocations, diagnostics, state.resultFromCache, legacyResult);
}
function createResolvedModuleWithFailedLookupLocations(resolved, isExternalLibraryImport, failedLookupLocations, affectingLocations, diagnostics, resultFromCache, legacyResult) {
    if (resultFromCache) {
        resultFromCache.failedLookupLocations = updateResolutionField(resultFromCache.failedLookupLocations, failedLookupLocations);
        resultFromCache.affectingLocations = updateResolutionField(resultFromCache.affectingLocations, affectingLocations);
        resultFromCache.resolutionDiagnostics = updateResolutionField(resultFromCache.resolutionDiagnostics, diagnostics);
        return resultFromCache;
    }
    return {
        resolvedModule: resolved && {
            resolvedFileName: resolved.path,
            originalPath: resolved.originalPath === true ? undefined : resolved.originalPath,
            extension: resolved.extension,
            isExternalLibraryImport: isExternalLibraryImport,
            packageId: resolved.packageId,
            resolvedUsingTsExtension: !!resolved.resolvedUsingTsExtension,
        },
        failedLookupLocations: initializeResolutionField(failedLookupLocations),
        affectingLocations: initializeResolutionField(affectingLocations),
        resolutionDiagnostics: initializeResolutionField(diagnostics),
        node10Result: legacyResult,
    };
}
function initializeResolutionField(value) {
    return value.length ? value : undefined;
}
/** @internal */
function updateResolutionField(to, value) {
    if (!(value === null || value === void 0 ? void 0 : value.length))
        return to;
    if (!(to === null || to === void 0 ? void 0 : to.length))
        return value;
    to.push.apply(to, value);
    return to;
}
exports.updateResolutionField = updateResolutionField;
function readPackageJsonField(jsonContent, fieldName, typeOfTag, state) {
    if (!(0, ts_1.hasProperty)(jsonContent, fieldName)) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_does_not_have_a_0_field, fieldName);
        }
        return;
    }
    var value = jsonContent[fieldName];
    if (typeof value !== typeOfTag || value === null) { // eslint-disable-line no-null/no-null
        if (state.traceEnabled) {
            // eslint-disable-next-line no-null/no-null
            trace(state.host, ts_1.Diagnostics.Expected_type_of_0_field_in_package_json_to_be_1_got_2, fieldName, typeOfTag, value === null ? "null" : typeof value);
        }
        return;
    }
    return value;
}
function readPackageJsonPathField(jsonContent, fieldName, baseDirectory, state) {
    var fileName = readPackageJsonField(jsonContent, fieldName, "string", state);
    if (fileName === undefined) {
        return;
    }
    if (!fileName) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_had_a_falsy_0_field, fieldName);
        }
        return;
    }
    var path = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(baseDirectory, fileName));
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.package_json_has_0_field_1_that_references_2, fieldName, fileName, path);
    }
    return path;
}
function readPackageJsonTypesFields(jsonContent, baseDirectory, state) {
    return readPackageJsonPathField(jsonContent, "typings", baseDirectory, state)
        || readPackageJsonPathField(jsonContent, "types", baseDirectory, state);
}
function readPackageJsonTSConfigField(jsonContent, baseDirectory, state) {
    return readPackageJsonPathField(jsonContent, "tsconfig", baseDirectory, state);
}
function readPackageJsonMainField(jsonContent, baseDirectory, state) {
    return readPackageJsonPathField(jsonContent, "main", baseDirectory, state);
}
function readPackageJsonTypesVersionsField(jsonContent, state) {
    var typesVersions = readPackageJsonField(jsonContent, "typesVersions", "object", state);
    if (typesVersions === undefined)
        return;
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.package_json_has_a_typesVersions_field_with_version_specific_path_mappings);
    }
    return typesVersions;
}
function readPackageJsonTypesVersionPaths(jsonContent, state) {
    var typesVersions = readPackageJsonTypesVersionsField(jsonContent, state);
    if (typesVersions === undefined)
        return;
    if (state.traceEnabled) {
        for (var key in typesVersions) {
            if ((0, ts_1.hasProperty)(typesVersions, key) && !ts_1.VersionRange.tryParse(key)) {
                trace(state.host, ts_1.Diagnostics.package_json_has_a_typesVersions_entry_0_that_is_not_a_valid_semver_range, key);
            }
        }
    }
    var result = getPackageJsonTypesVersionsPaths(typesVersions);
    if (!result) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_does_not_have_a_typesVersions_entry_that_matches_version_0, ts_1.versionMajorMinor);
        }
        return;
    }
    var bestVersionKey = result.version, bestVersionPaths = result.paths;
    if (typeof bestVersionPaths !== "object") {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Expected_type_of_0_field_in_package_json_to_be_1_got_2, "typesVersions['".concat(bestVersionKey, "']"), "object", typeof bestVersionPaths);
        }
        return;
    }
    return result;
}
var typeScriptVersion;
/** @internal */
function getPackageJsonTypesVersionsPaths(typesVersions) {
    if (!typeScriptVersion)
        typeScriptVersion = new ts_1.Version(ts_1.version);
    for (var key in typesVersions) {
        if (!(0, ts_1.hasProperty)(typesVersions, key))
            continue;
        var keyRange = ts_1.VersionRange.tryParse(key);
        if (keyRange === undefined) {
            continue;
        }
        // return the first entry whose range matches the current compiler version.
        if (keyRange.test(typeScriptVersion)) {
            return { version: key, paths: typesVersions[key] };
        }
    }
}
exports.getPackageJsonTypesVersionsPaths = getPackageJsonTypesVersionsPaths;
function getEffectiveTypeRoots(options, host) {
    if (options.typeRoots) {
        return options.typeRoots;
    }
    var currentDirectory;
    if (options.configFilePath) {
        currentDirectory = (0, ts_1.getDirectoryPath)(options.configFilePath);
    }
    else if (host.getCurrentDirectory) {
        currentDirectory = host.getCurrentDirectory();
    }
    if (currentDirectory !== undefined) {
        return getDefaultTypeRoots(currentDirectory);
    }
}
exports.getEffectiveTypeRoots = getEffectiveTypeRoots;
/**
 * Returns the path to every node_modules/@types directory from some ancestor directory.
 * Returns undefined if there are none.
 */
function getDefaultTypeRoots(currentDirectory) {
    var typeRoots;
    (0, ts_1.forEachAncestorDirectory)((0, ts_1.normalizePath)(currentDirectory), function (directory) {
        var atTypes = (0, ts_1.combinePaths)(directory, nodeModulesAtTypes);
        (typeRoots !== null && typeRoots !== void 0 ? typeRoots : (typeRoots = [])).push(atTypes);
    });
    return typeRoots;
}
var nodeModulesAtTypes = (0, ts_1.combinePaths)("node_modules", "@types");
function arePathsEqual(path1, path2, host) {
    var useCaseSensitiveFileNames = typeof host.useCaseSensitiveFileNames === "function" ? host.useCaseSensitiveFileNames() : host.useCaseSensitiveFileNames;
    return (0, ts_1.comparePaths)(path1, path2, !useCaseSensitiveFileNames) === 0 /* Comparison.EqualTo */;
}
function getOriginalAndResolvedFileName(fileName, host, traceEnabled) {
    var resolvedFileName = realPath(fileName, host, traceEnabled);
    var pathsAreEqual = arePathsEqual(fileName, resolvedFileName, host);
    return {
        // If the fileName and realpath are differing only in casing prefer fileName so that we can issue correct errors for casing under forceConsistentCasingInFileNames
        resolvedFileName: pathsAreEqual ? fileName : resolvedFileName,
        originalPath: pathsAreEqual ? undefined : fileName,
    };
}
function getCandidateFromTypeRoot(typeRoot, typeReferenceDirectiveName, moduleResolutionState) {
    var nameForLookup = (0, ts_1.endsWith)(typeRoot, "/node_modules/@types") || (0, ts_1.endsWith)(typeRoot, "/node_modules/@types/") ?
        mangleScopedPackageNameWithTrace(typeReferenceDirectiveName, moduleResolutionState) :
        typeReferenceDirectiveName;
    return (0, ts_1.combinePaths)(typeRoot, nameForLookup);
}
/**
 * @param {string | undefined} containingFile - file that contains type reference directive, can be undefined if containing file is unknown.
 * This is possible in case if resolution is performed for directives specified via 'types' parameter. In this case initial path for secondary lookups
 * is assumed to be the same as root directory of the project.
 */
function resolveTypeReferenceDirective(typeReferenceDirectiveName, containingFile, options, host, redirectedReference, cache, resolutionMode) {
    var _a;
    ts_1.Debug.assert(typeof typeReferenceDirectiveName === "string", "Non-string value passed to `ts.resolveTypeReferenceDirective`, likely by a wrapping package working with an outdated `resolveTypeReferenceDirectives` signature. This is probably not a problem in TS itself.");
    var traceEnabled = isTraceEnabled(options, host);
    if (redirectedReference) {
        options = redirectedReference.commandLine.options;
    }
    var containingDirectory = containingFile ? (0, ts_1.getDirectoryPath)(containingFile) : undefined;
    var result = containingDirectory ? cache === null || cache === void 0 ? void 0 : cache.getFromDirectoryCache(typeReferenceDirectiveName, resolutionMode, containingDirectory, redirectedReference) : undefined;
    if (!result && containingDirectory && !(0, ts_1.isExternalModuleNameRelative)(typeReferenceDirectiveName)) {
        result = cache === null || cache === void 0 ? void 0 : cache.getFromNonRelativeNameCache(typeReferenceDirectiveName, resolutionMode, containingDirectory, redirectedReference);
    }
    if (result) {
        if (traceEnabled) {
            trace(host, ts_1.Diagnostics.Resolving_type_reference_directive_0_containing_file_1, typeReferenceDirectiveName, containingFile);
            if (redirectedReference)
                trace(host, ts_1.Diagnostics.Using_compiler_options_of_project_reference_redirect_0, redirectedReference.sourceFile.fileName);
            trace(host, ts_1.Diagnostics.Resolution_for_type_reference_directive_0_was_found_in_cache_from_location_1, typeReferenceDirectiveName, containingDirectory);
            traceResult(result);
        }
        return result;
    }
    var typeRoots = getEffectiveTypeRoots(options, host);
    if (traceEnabled) {
        if (containingFile === undefined) {
            if (typeRoots === undefined) {
                trace(host, ts_1.Diagnostics.Resolving_type_reference_directive_0_containing_file_not_set_root_directory_not_set, typeReferenceDirectiveName);
            }
            else {
                trace(host, ts_1.Diagnostics.Resolving_type_reference_directive_0_containing_file_not_set_root_directory_1, typeReferenceDirectiveName, typeRoots);
            }
        }
        else {
            if (typeRoots === undefined) {
                trace(host, ts_1.Diagnostics.Resolving_type_reference_directive_0_containing_file_1_root_directory_not_set, typeReferenceDirectiveName, containingFile);
            }
            else {
                trace(host, ts_1.Diagnostics.Resolving_type_reference_directive_0_containing_file_1_root_directory_2, typeReferenceDirectiveName, containingFile, typeRoots);
            }
        }
        if (redirectedReference) {
            trace(host, ts_1.Diagnostics.Using_compiler_options_of_project_reference_redirect_0, redirectedReference.sourceFile.fileName);
        }
    }
    var failedLookupLocations = [];
    var affectingLocations = [];
    var features = getNodeResolutionFeatures(options);
    // Unlike `import` statements, whose mode-calculating APIs are all guaranteed to return `undefined` if we're in an un-mode-ed module resolution
    // setting, type references will return their target mode regardless of options because of how the parser works, so we guard against the mode being
    // set in a non-modal module resolution setting here. Do note that our behavior is not particularly well defined when these mode-overriding imports
    // are present in a non-modal project; while in theory we'd like to either ignore the mode or provide faithful modern resolution, depending on what we feel is best,
    // in practice, not every cache has the options available to intelligently make the choice to ignore the mode request, and it's unclear how modern "faithful modern
    // resolution" should be (`node16`? `nodenext`?). As such, witnessing a mode-overriding triple-slash reference in a non-modal module resolution
    // context should _probably_ be an error - and that should likely be handled by the `Program` (which is what we do).
    if (resolutionMode === ts_1.ModuleKind.ESNext && ((0, ts_1.getEmitModuleResolutionKind)(options) === ts_1.ModuleResolutionKind.Node16 || (0, ts_1.getEmitModuleResolutionKind)(options) === ts_1.ModuleResolutionKind.NodeNext)) {
        features |= NodeResolutionFeatures.EsmMode;
    }
    var conditions = features & NodeResolutionFeatures.Exports ? getConditions(options, !!(features & NodeResolutionFeatures.EsmMode)) : [];
    var diagnostics = [];
    var moduleResolutionState = {
        compilerOptions: options,
        host: host,
        traceEnabled: traceEnabled,
        failedLookupLocations: failedLookupLocations,
        affectingLocations: affectingLocations,
        packageJsonInfoCache: cache,
        features: features,
        conditions: conditions,
        requestContainingDirectory: containingDirectory,
        reportDiagnostic: function (diag) { return void diagnostics.push(diag); },
        isConfigLookup: false,
        candidateIsFromPackageJsonField: false,
    };
    var resolved = primaryLookup();
    var primary = true;
    if (!resolved) {
        resolved = secondaryLookup();
        primary = false;
    }
    var resolvedTypeReferenceDirective;
    if (resolved) {
        var fileName = resolved.fileName, packageId = resolved.packageId;
        var resolvedFileName = fileName, originalPath = void 0;
        if (!options.preserveSymlinks)
            (_a = getOriginalAndResolvedFileName(fileName, host, traceEnabled), resolvedFileName = _a.resolvedFileName, originalPath = _a.originalPath);
        resolvedTypeReferenceDirective = {
            primary: primary,
            resolvedFileName: resolvedFileName,
            originalPath: originalPath,
            packageId: packageId,
            isExternalLibraryImport: pathContainsNodeModules(fileName),
        };
    }
    result = {
        resolvedTypeReferenceDirective: resolvedTypeReferenceDirective,
        failedLookupLocations: initializeResolutionField(failedLookupLocations),
        affectingLocations: initializeResolutionField(affectingLocations),
        resolutionDiagnostics: initializeResolutionField(diagnostics),
    };
    if (containingDirectory) {
        cache === null || cache === void 0 ? void 0 : cache.getOrCreateCacheForDirectory(containingDirectory, redirectedReference).set(typeReferenceDirectiveName, /*mode*/ resolutionMode, result);
        if (!(0, ts_1.isExternalModuleNameRelative)(typeReferenceDirectiveName)) {
            cache === null || cache === void 0 ? void 0 : cache.getOrCreateCacheForNonRelativeName(typeReferenceDirectiveName, resolutionMode, redirectedReference).set(containingDirectory, result);
        }
    }
    if (traceEnabled)
        traceResult(result);
    return result;
    function traceResult(result) {
        var _a;
        if (!((_a = result.resolvedTypeReferenceDirective) === null || _a === void 0 ? void 0 : _a.resolvedFileName)) {
            trace(host, ts_1.Diagnostics.Type_reference_directive_0_was_not_resolved, typeReferenceDirectiveName);
        }
        else if (result.resolvedTypeReferenceDirective.packageId) {
            trace(host, ts_1.Diagnostics.Type_reference_directive_0_was_successfully_resolved_to_1_with_Package_ID_2_primary_Colon_3, typeReferenceDirectiveName, result.resolvedTypeReferenceDirective.resolvedFileName, (0, ts_1.packageIdToString)(result.resolvedTypeReferenceDirective.packageId), result.resolvedTypeReferenceDirective.primary);
        }
        else {
            trace(host, ts_1.Diagnostics.Type_reference_directive_0_was_successfully_resolved_to_1_primary_Colon_2, typeReferenceDirectiveName, result.resolvedTypeReferenceDirective.resolvedFileName, result.resolvedTypeReferenceDirective.primary);
        }
    }
    function primaryLookup() {
        // Check primary library paths
        if (typeRoots && typeRoots.length) {
            if (traceEnabled) {
                trace(host, ts_1.Diagnostics.Resolving_with_primary_search_path_0, typeRoots.join(", "));
            }
            return (0, ts_1.firstDefined)(typeRoots, function (typeRoot) {
                var candidate = getCandidateFromTypeRoot(typeRoot, typeReferenceDirectiveName, moduleResolutionState);
                var directoryExists = (0, ts_1.directoryProbablyExists)(typeRoot, host);
                if (!directoryExists && traceEnabled) {
                    trace(host, ts_1.Diagnostics.Directory_0_does_not_exist_skipping_all_lookups_in_it, typeRoot);
                }
                if (options.typeRoots) {
                    // Custom typeRoots resolve as file or directory just like we do modules
                    var resolvedFromFile = loadModuleFromFile(4 /* Extensions.Declaration */, candidate, !directoryExists, moduleResolutionState);
                    if (resolvedFromFile) {
                        var packageDirectory = parseNodeModuleFromPath(resolvedFromFile.path);
                        var packageInfo = packageDirectory ? getPackageJsonInfo(packageDirectory, /*onlyRecordFailures*/ false, moduleResolutionState) : undefined;
                        return resolvedTypeScriptOnly(withPackageId(packageInfo, resolvedFromFile));
                    }
                }
                return resolvedTypeScriptOnly(loadNodeModuleFromDirectory(4 /* Extensions.Declaration */, candidate, !directoryExists, moduleResolutionState));
            });
        }
        else {
            if (traceEnabled) {
                trace(host, ts_1.Diagnostics.Root_directory_cannot_be_determined_skipping_primary_search_paths);
            }
        }
    }
    function secondaryLookup() {
        var initialLocationForSecondaryLookup = containingFile && (0, ts_1.getDirectoryPath)(containingFile);
        if (initialLocationForSecondaryLookup !== undefined) {
            var result_1;
            if (!options.typeRoots || !(0, ts_1.endsWith)(containingFile, ts_1.inferredTypesContainingFile)) {
                // check secondary locations
                if (traceEnabled) {
                    trace(host, ts_1.Diagnostics.Looking_up_in_node_modules_folder_initial_location_0, initialLocationForSecondaryLookup);
                }
                if (!(0, ts_1.isExternalModuleNameRelative)(typeReferenceDirectiveName)) {
                    var searchResult = loadModuleFromNearestNodeModulesDirectory(4 /* Extensions.Declaration */, typeReferenceDirectiveName, initialLocationForSecondaryLookup, moduleResolutionState, /*cache*/ undefined, /*redirectedReference*/ undefined);
                    result_1 = searchResult && searchResult.value;
                }
                else {
                    var candidate = normalizePathForCJSResolution(initialLocationForSecondaryLookup, typeReferenceDirectiveName).path;
                    result_1 = nodeLoadModuleByRelativeName(4 /* Extensions.Declaration */, candidate, /*onlyRecordFailures*/ false, moduleResolutionState, /*considerPackageJson*/ true);
                }
            }
            else if (traceEnabled) {
                trace(host, ts_1.Diagnostics.Resolving_type_reference_directive_for_program_that_specifies_custom_typeRoots_skipping_lookup_in_node_modules_folder);
            }
            return resolvedTypeScriptOnly(result_1);
        }
        else {
            if (traceEnabled) {
                trace(host, ts_1.Diagnostics.Containing_file_is_not_specified_and_root_directory_cannot_be_determined_skipping_lookup_in_node_modules_folder);
            }
        }
    }
}
exports.resolveTypeReferenceDirective = resolveTypeReferenceDirective;
function getNodeResolutionFeatures(options) {
    var features = NodeResolutionFeatures.None;
    switch ((0, ts_1.getEmitModuleResolutionKind)(options)) {
        case ts_1.ModuleResolutionKind.Node16:
            features = NodeResolutionFeatures.Node16Default;
            break;
        case ts_1.ModuleResolutionKind.NodeNext:
            features = NodeResolutionFeatures.NodeNextDefault;
            break;
        case ts_1.ModuleResolutionKind.Bundler:
            features = NodeResolutionFeatures.BundlerDefault;
            break;
    }
    if (options.resolvePackageJsonExports) {
        features |= NodeResolutionFeatures.Exports;
    }
    else if (options.resolvePackageJsonExports === false) {
        features &= ~NodeResolutionFeatures.Exports;
    }
    if (options.resolvePackageJsonImports) {
        features |= NodeResolutionFeatures.Imports;
    }
    else if (options.resolvePackageJsonImports === false) {
        features &= ~NodeResolutionFeatures.Imports;
    }
    return features;
}
/** @internal */
function getConditions(options, esmMode) {
    // conditions are only used by the node16/nodenext/bundler resolvers - there's no priority order in the list,
    // it's essentially a set (priority is determined by object insertion order in the object we look at).
    var conditions = esmMode || (0, ts_1.getEmitModuleResolutionKind)(options) === ts_1.ModuleResolutionKind.Bundler
        ? ["import"]
        : ["require"];
    if (!options.noDtsResolution) {
        conditions.push("types");
    }
    if ((0, ts_1.getEmitModuleResolutionKind)(options) !== ts_1.ModuleResolutionKind.Bundler) {
        conditions.push("node");
    }
    return (0, ts_1.concatenate)(conditions, options.customConditions);
}
exports.getConditions = getConditions;
/**
 * @internal
 * Does not try `@types/${packageName}` - use a second pass if needed.
 */
function resolvePackageNameToPackageJson(packageName, containingDirectory, options, host, cache) {
    var moduleResolutionState = getTemporaryModuleResolutionState(cache === null || cache === void 0 ? void 0 : cache.getPackageJsonInfoCache(), host, options);
    return (0, ts_1.forEachAncestorDirectory)(containingDirectory, function (ancestorDirectory) {
        if ((0, ts_1.getBaseFileName)(ancestorDirectory) !== "node_modules") {
            var nodeModulesFolder = (0, ts_1.combinePaths)(ancestorDirectory, "node_modules");
            var candidate = (0, ts_1.combinePaths)(nodeModulesFolder, packageName);
            return getPackageJsonInfo(candidate, /*onlyRecordFailures*/ false, moduleResolutionState);
        }
    });
}
exports.resolvePackageNameToPackageJson = resolvePackageNameToPackageJson;
/**
 * Given a set of options, returns the set of type directive names
 *   that should be included for this program automatically.
 * This list could either come from the config file,
 *   or from enumerating the types root + initial secondary types lookup location.
 * More type directives might appear in the program later as a result of loading actual source files;
 *   this list is only the set of defaults that are implicitly included.
 */
function getAutomaticTypeDirectiveNames(options, host) {
    // Use explicit type list from tsconfig.json
    if (options.types) {
        return options.types;
    }
    // Walk the primary type lookup locations
    var result = [];
    if (host.directoryExists && host.getDirectories) {
        var typeRoots = getEffectiveTypeRoots(options, host);
        if (typeRoots) {
            for (var _i = 0, typeRoots_1 = typeRoots; _i < typeRoots_1.length; _i++) {
                var root = typeRoots_1[_i];
                if (host.directoryExists(root)) {
                    for (var _a = 0, _b = host.getDirectories(root); _a < _b.length; _a++) {
                        var typeDirectivePath = _b[_a];
                        var normalized = (0, ts_1.normalizePath)(typeDirectivePath);
                        var packageJsonPath = (0, ts_1.combinePaths)(root, normalized, "package.json");
                        // `types-publisher` sometimes creates packages with `"typings": null` for packages that don't provide their own types.
                        // See `createNotNeededPackageJSON` in the types-publisher` repo.
                        // eslint-disable-next-line no-null/no-null
                        var isNotNeededPackage = host.fileExists(packageJsonPath) && (0, ts_1.readJson)(packageJsonPath, host).typings === null;
                        if (!isNotNeededPackage) {
                            var baseFileName = (0, ts_1.getBaseFileName)(normalized);
                            // At this stage, skip results with leading dot.
                            if (baseFileName.charCodeAt(0) !== 46 /* CharacterCodes.dot */) {
                                // Return just the type directive names
                                result.push(baseFileName);
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
}
exports.getAutomaticTypeDirectiveNames = getAutomaticTypeDirectiveNames;
function compilerOptionValueToString(value) {
    var _a;
    if (value === null || typeof value !== "object") { // eslint-disable-line no-null/no-null
        return "" + value;
    }
    if ((0, ts_1.isArray)(value)) {
        return "[".concat((_a = value.map(function (e) { return compilerOptionValueToString(e); })) === null || _a === void 0 ? void 0 : _a.join(","), "]");
    }
    var str = "{";
    for (var key in value) {
        if ((0, ts_1.hasProperty)(value, key)) {
            str += "".concat(key, ": ").concat(compilerOptionValueToString(value[key]));
        }
    }
    return str + "}";
}
/** @internal */
function getKeyForCompilerOptions(options, affectingOptionDeclarations) {
    return affectingOptionDeclarations.map(function (option) { return compilerOptionValueToString((0, ts_1.getCompilerOptionValue)(options, option)); }).join("|") + "|".concat(options.pathsBasePath);
}
exports.getKeyForCompilerOptions = getKeyForCompilerOptions;
/** @internal */
function createCacheWithRedirects(ownOptions) {
    var redirectsMap = new Map();
    var optionsToRedirectsKey = new Map();
    var redirectsKeyToMap = new Map();
    var ownMap = new Map();
    if (ownOptions)
        redirectsMap.set(ownOptions, ownMap);
    return {
        getMapOfCacheRedirects: getMapOfCacheRedirects,
        getOrCreateMapOfCacheRedirects: getOrCreateMapOfCacheRedirects,
        update: update,
        clear: clear,
    };
    function getMapOfCacheRedirects(redirectedReference) {
        return redirectedReference ?
            getOrCreateMap(redirectedReference.commandLine.options, /*create*/ false) :
            ownMap;
    }
    function getOrCreateMapOfCacheRedirects(redirectedReference) {
        return redirectedReference ?
            getOrCreateMap(redirectedReference.commandLine.options, /*create*/ true) :
            ownMap;
    }
    function update(newOptions) {
        if (ownOptions !== newOptions) {
            if (ownOptions)
                ownMap = getOrCreateMap(newOptions, /*create*/ true); // set new map for new options as ownMap
            else
                redirectsMap.set(newOptions, ownMap); // Use existing map if oldOptions = undefined
            ownOptions = newOptions;
        }
    }
    function getOrCreateMap(redirectOptions, create) {
        var result = redirectsMap.get(redirectOptions);
        if (result)
            return result;
        var key = getRedirectsCacheKey(redirectOptions);
        result = redirectsKeyToMap.get(key);
        if (!result) {
            if (ownOptions) {
                var ownKey = getRedirectsCacheKey(ownOptions);
                if (ownKey === key)
                    result = ownMap;
                else if (!redirectsKeyToMap.has(ownKey))
                    redirectsKeyToMap.set(ownKey, ownMap);
            }
            if (create)
                result !== null && result !== void 0 ? result : (result = new Map());
            if (result)
                redirectsKeyToMap.set(key, result);
        }
        if (result)
            redirectsMap.set(redirectOptions, result);
        return result;
    }
    function clear() {
        var ownKey = ownOptions && optionsToRedirectsKey.get(ownOptions);
        ownMap.clear();
        redirectsMap.clear();
        optionsToRedirectsKey.clear();
        redirectsKeyToMap.clear();
        if (ownOptions) {
            if (ownKey)
                optionsToRedirectsKey.set(ownOptions, ownKey);
            redirectsMap.set(ownOptions, ownMap);
        }
    }
    function getRedirectsCacheKey(options) {
        var result = optionsToRedirectsKey.get(options);
        if (!result) {
            optionsToRedirectsKey.set(options, result = getKeyForCompilerOptions(options, ts_1.moduleResolutionOptionDeclarations));
        }
        return result;
    }
}
exports.createCacheWithRedirects = createCacheWithRedirects;
function createPackageJsonInfoCache(currentDirectory, getCanonicalFileName) {
    var cache;
    return { getPackageJsonInfo: getPackageJsonInfo, setPackageJsonInfo: setPackageJsonInfo, clear: clear, entries: entries, getInternalMap: getInternalMap };
    function getPackageJsonInfo(packageJsonPath) {
        return cache === null || cache === void 0 ? void 0 : cache.get((0, ts_1.toPath)(packageJsonPath, currentDirectory, getCanonicalFileName));
    }
    function setPackageJsonInfo(packageJsonPath, info) {
        (cache || (cache = new Map())).set((0, ts_1.toPath)(packageJsonPath, currentDirectory, getCanonicalFileName), info);
    }
    function clear() {
        cache = undefined;
    }
    function entries() {
        var iter = cache === null || cache === void 0 ? void 0 : cache.entries();
        return iter ? (0, ts_1.arrayFrom)(iter) : [];
    }
    function getInternalMap() {
        return cache;
    }
}
function getOrCreateCache(cacheWithRedirects, redirectedReference, key, create) {
    var cache = cacheWithRedirects.getOrCreateMapOfCacheRedirects(redirectedReference);
    var result = cache.get(key);
    if (!result) {
        result = create();
        cache.set(key, result);
    }
    return result;
}
function createPerDirectoryResolutionCache(currentDirectory, getCanonicalFileName, options) {
    var directoryToModuleNameMap = createCacheWithRedirects(options);
    return {
        getFromDirectoryCache: getFromDirectoryCache,
        getOrCreateCacheForDirectory: getOrCreateCacheForDirectory,
        clear: clear,
        update: update,
    };
    function clear() {
        directoryToModuleNameMap.clear();
    }
    function update(options) {
        directoryToModuleNameMap.update(options);
    }
    function getOrCreateCacheForDirectory(directoryName, redirectedReference) {
        var path = (0, ts_1.toPath)(directoryName, currentDirectory, getCanonicalFileName);
        return getOrCreateCache(directoryToModuleNameMap, redirectedReference, path, function () { return createModeAwareCache(); });
    }
    function getFromDirectoryCache(name, mode, directoryName, redirectedReference) {
        var _a, _b;
        var path = (0, ts_1.toPath)(directoryName, currentDirectory, getCanonicalFileName);
        return (_b = (_a = directoryToModuleNameMap.getMapOfCacheRedirects(redirectedReference)) === null || _a === void 0 ? void 0 : _a.get(path)) === null || _b === void 0 ? void 0 : _b.get(name, mode);
    }
}
/** @internal */
function createModeAwareCacheKey(specifier, mode) {
    return (mode === undefined ? specifier : "".concat(mode, "|").concat(specifier));
}
exports.createModeAwareCacheKey = createModeAwareCacheKey;
/** @internal */
function createModeAwareCache() {
    var underlying = new Map();
    var memoizedReverseKeys = new Map();
    var cache = {
        get: function (specifier, mode) {
            return underlying.get(getUnderlyingCacheKey(specifier, mode));
        },
        set: function (specifier, mode, value) {
            underlying.set(getUnderlyingCacheKey(specifier, mode), value);
            return cache;
        },
        delete: function (specifier, mode) {
            underlying.delete(getUnderlyingCacheKey(specifier, mode));
            return cache;
        },
        has: function (specifier, mode) {
            return underlying.has(getUnderlyingCacheKey(specifier, mode));
        },
        forEach: function (cb) {
            return underlying.forEach(function (elem, key) {
                var _a = memoizedReverseKeys.get(key), specifier = _a[0], mode = _a[1];
                return cb(elem, specifier, mode);
            });
        },
        size: function () {
            return underlying.size;
        }
    };
    return cache;
    function getUnderlyingCacheKey(specifier, mode) {
        var result = createModeAwareCacheKey(specifier, mode);
        memoizedReverseKeys.set(result, [specifier, mode]);
        return result;
    }
}
exports.createModeAwareCache = createModeAwareCache;
/** @internal */
function zipToModeAwareCache(file, keys, values, nameAndModeGetter) {
    ts_1.Debug.assert(keys.length === values.length);
    var map = createModeAwareCache();
    for (var i = 0; i < keys.length; ++i) {
        var entry = keys[i];
        map.set(nameAndModeGetter.getName(entry), nameAndModeGetter.getMode(entry, file), values[i]);
    }
    return map;
}
exports.zipToModeAwareCache = zipToModeAwareCache;
function getOriginalOrResolvedModuleFileName(result) {
    return result.resolvedModule && (result.resolvedModule.originalPath || result.resolvedModule.resolvedFileName);
}
function getOriginalOrResolvedTypeReferenceFileName(result) {
    return result.resolvedTypeReferenceDirective &&
        (result.resolvedTypeReferenceDirective.originalPath || result.resolvedTypeReferenceDirective.resolvedFileName);
}
function createNonRelativeNameResolutionCache(currentDirectory, getCanonicalFileName, options, getResolvedFileName) {
    var moduleNameToDirectoryMap = createCacheWithRedirects(options);
    return {
        getFromNonRelativeNameCache: getFromNonRelativeNameCache,
        getOrCreateCacheForNonRelativeName: getOrCreateCacheForNonRelativeName,
        clear: clear,
        update: update,
    };
    function clear() {
        moduleNameToDirectoryMap.clear();
    }
    function update(options) {
        moduleNameToDirectoryMap.update(options);
    }
    function getFromNonRelativeNameCache(nonRelativeModuleName, mode, directoryName, redirectedReference) {
        var _a, _b;
        ts_1.Debug.assert(!(0, ts_1.isExternalModuleNameRelative)(nonRelativeModuleName));
        return (_b = (_a = moduleNameToDirectoryMap.getMapOfCacheRedirects(redirectedReference)) === null || _a === void 0 ? void 0 : _a.get(createModeAwareCacheKey(nonRelativeModuleName, mode))) === null || _b === void 0 ? void 0 : _b.get(directoryName);
    }
    function getOrCreateCacheForNonRelativeName(nonRelativeModuleName, mode, redirectedReference) {
        ts_1.Debug.assert(!(0, ts_1.isExternalModuleNameRelative)(nonRelativeModuleName));
        return getOrCreateCache(moduleNameToDirectoryMap, redirectedReference, createModeAwareCacheKey(nonRelativeModuleName, mode), createPerModuleNameCache);
    }
    function createPerModuleNameCache() {
        var directoryPathMap = new Map();
        return { get: get, set: set };
        function get(directory) {
            return directoryPathMap.get((0, ts_1.toPath)(directory, currentDirectory, getCanonicalFileName));
        }
        /**
         * At first this function add entry directory -> module resolution result to the table.
         * Then it computes the set of parent folders for 'directory' that should have the same module resolution result
         * and for every parent folder in set it adds entry: parent -> module resolution. .
         * Lets say we first directory name: /a/b/c/d/e and resolution result is: /a/b/bar.ts.
         * Set of parent folders that should have the same result will be:
         * [
         *     /a/b/c/d, /a/b/c, /a/b
         * ]
         * this means that request for module resolution from file in any of these folder will be immediately found in cache.
         */
        function set(directory, result) {
            var path = (0, ts_1.toPath)(directory, currentDirectory, getCanonicalFileName);
            // if entry is already in cache do nothing
            if (directoryPathMap.has(path)) {
                return;
            }
            directoryPathMap.set(path, result);
            var resolvedFileName = getResolvedFileName(result);
            // find common prefix between directory and resolved file name
            // this common prefix should be the shortest path that has the same resolution
            // directory: /a/b/c/d/e
            // resolvedFileName: /a/b/foo.d.ts
            // commonPrefix: /a/b
            // for failed lookups cache the result for every directory up to root
            var commonPrefix = resolvedFileName && getCommonPrefix(path, resolvedFileName);
            var current = path;
            while (current !== commonPrefix) {
                var parent_1 = (0, ts_1.getDirectoryPath)(current);
                if (parent_1 === current || directoryPathMap.has(parent_1)) {
                    break;
                }
                directoryPathMap.set(parent_1, result);
                current = parent_1;
            }
        }
        function getCommonPrefix(directory, resolution) {
            var resolutionDirectory = (0, ts_1.toPath)((0, ts_1.getDirectoryPath)(resolution), currentDirectory, getCanonicalFileName);
            // find first position where directory and resolution differs
            var i = 0;
            var limit = Math.min(directory.length, resolutionDirectory.length);
            while (i < limit && directory.charCodeAt(i) === resolutionDirectory.charCodeAt(i)) {
                i++;
            }
            if (i === directory.length && (resolutionDirectory.length === i || resolutionDirectory[i] === ts_1.directorySeparator)) {
                return directory;
            }
            var rootLength = (0, ts_1.getRootLength)(directory);
            if (i < rootLength) {
                return undefined;
            }
            var sep = directory.lastIndexOf(ts_1.directorySeparator, i - 1);
            if (sep === -1) {
                return undefined;
            }
            return directory.substr(0, Math.max(sep, rootLength));
        }
    }
}
function createModuleOrTypeReferenceResolutionCache(currentDirectory, getCanonicalFileName, options, packageJsonInfoCache, getResolvedFileName) {
    var perDirectoryResolutionCache = createPerDirectoryResolutionCache(currentDirectory, getCanonicalFileName, options);
    var nonRelativeNameResolutionCache = createNonRelativeNameResolutionCache(currentDirectory, getCanonicalFileName, options, getResolvedFileName);
    packageJsonInfoCache !== null && packageJsonInfoCache !== void 0 ? packageJsonInfoCache : (packageJsonInfoCache = createPackageJsonInfoCache(currentDirectory, getCanonicalFileName));
    return __assign(__assign(__assign(__assign({}, packageJsonInfoCache), perDirectoryResolutionCache), nonRelativeNameResolutionCache), { clear: clear, update: update, getPackageJsonInfoCache: function () { return packageJsonInfoCache; }, clearAllExceptPackageJsonInfoCache: clearAllExceptPackageJsonInfoCache });
    function clear() {
        clearAllExceptPackageJsonInfoCache();
        packageJsonInfoCache.clear();
    }
    function clearAllExceptPackageJsonInfoCache() {
        perDirectoryResolutionCache.clear();
        nonRelativeNameResolutionCache.clear();
    }
    function update(options) {
        perDirectoryResolutionCache.update(options);
        nonRelativeNameResolutionCache.update(options);
    }
}
function createModuleResolutionCache(currentDirectory, getCanonicalFileName, options, packageJsonInfoCache) {
    var result = createModuleOrTypeReferenceResolutionCache(currentDirectory, getCanonicalFileName, options, packageJsonInfoCache, getOriginalOrResolvedModuleFileName);
    result.getOrCreateCacheForModuleName = function (nonRelativeName, mode, redirectedReference) { return result.getOrCreateCacheForNonRelativeName(nonRelativeName, mode, redirectedReference); };
    return result;
}
exports.createModuleResolutionCache = createModuleResolutionCache;
function createTypeReferenceDirectiveResolutionCache(currentDirectory, getCanonicalFileName, options, packageJsonInfoCache) {
    return createModuleOrTypeReferenceResolutionCache(currentDirectory, getCanonicalFileName, options, packageJsonInfoCache, getOriginalOrResolvedTypeReferenceFileName);
}
exports.createTypeReferenceDirectiveResolutionCache = createTypeReferenceDirectiveResolutionCache;
/** @internal */
function getOptionsForLibraryResolution(options) {
    return { moduleResolution: ts_1.ModuleResolutionKind.Node10, traceResolution: options.traceResolution };
}
exports.getOptionsForLibraryResolution = getOptionsForLibraryResolution;
/** @internal */
function resolveLibrary(libraryName, resolveFrom, compilerOptions, host, cache) {
    return resolveModuleName(libraryName, resolveFrom, getOptionsForLibraryResolution(compilerOptions), host, cache);
}
exports.resolveLibrary = resolveLibrary;
function resolveModuleNameFromCache(moduleName, containingFile, cache, mode) {
    var containingDirectory = (0, ts_1.getDirectoryPath)(containingFile);
    return cache.getFromDirectoryCache(moduleName, mode, containingDirectory, /*redirectedReference*/ undefined);
}
exports.resolveModuleNameFromCache = resolveModuleNameFromCache;
function resolveModuleName(moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode) {
    var traceEnabled = isTraceEnabled(compilerOptions, host);
    if (redirectedReference) {
        compilerOptions = redirectedReference.commandLine.options;
    }
    if (traceEnabled) {
        trace(host, ts_1.Diagnostics.Resolving_module_0_from_1, moduleName, containingFile);
        if (redirectedReference) {
            trace(host, ts_1.Diagnostics.Using_compiler_options_of_project_reference_redirect_0, redirectedReference.sourceFile.fileName);
        }
    }
    var containingDirectory = (0, ts_1.getDirectoryPath)(containingFile);
    var result = cache === null || cache === void 0 ? void 0 : cache.getFromDirectoryCache(moduleName, resolutionMode, containingDirectory, redirectedReference);
    if (result) {
        if (traceEnabled) {
            trace(host, ts_1.Diagnostics.Resolution_for_module_0_was_found_in_cache_from_location_1, moduleName, containingDirectory);
        }
    }
    else {
        var moduleResolution = compilerOptions.moduleResolution;
        if (moduleResolution === undefined) {
            switch ((0, ts_1.getEmitModuleKind)(compilerOptions)) {
                case ts_1.ModuleKind.CommonJS:
                    moduleResolution = ts_1.ModuleResolutionKind.Node10;
                    break;
                case ts_1.ModuleKind.Node16:
                    moduleResolution = ts_1.ModuleResolutionKind.Node16;
                    break;
                case ts_1.ModuleKind.NodeNext:
                    moduleResolution = ts_1.ModuleResolutionKind.NodeNext;
                    break;
                default:
                    moduleResolution = ts_1.ModuleResolutionKind.Classic;
                    break;
            }
            if (traceEnabled) {
                trace(host, ts_1.Diagnostics.Module_resolution_kind_is_not_specified_using_0, ts_1.ModuleResolutionKind[moduleResolution]);
            }
        }
        else {
            if (traceEnabled) {
                trace(host, ts_1.Diagnostics.Explicitly_specified_module_resolution_kind_Colon_0, ts_1.ModuleResolutionKind[moduleResolution]);
            }
        }
        ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartResolveModule(moduleName /* , containingFile, ModuleResolutionKind[moduleResolution]*/);
        switch (moduleResolution) {
            case ts_1.ModuleResolutionKind.Node16:
                result = node16ModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode);
                break;
            case ts_1.ModuleResolutionKind.NodeNext:
                result = nodeNextModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode);
                break;
            case ts_1.ModuleResolutionKind.Node10:
                result = nodeModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
                break;
            case ts_1.ModuleResolutionKind.Classic:
                result = classicNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
                break;
            case ts_1.ModuleResolutionKind.Bundler:
                result = bundlerModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
                break;
            default:
                return ts_1.Debug.fail("Unexpected moduleResolution: ".concat(moduleResolution));
        }
        if (result && result.resolvedModule)
            ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logInfoEvent("Module \"".concat(moduleName, "\" resolved to \"").concat(result.resolvedModule.resolvedFileName, "\""));
        ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStopResolveModule((result && result.resolvedModule) ? "" + result.resolvedModule.resolvedFileName : "null");
        cache === null || cache === void 0 ? void 0 : cache.getOrCreateCacheForDirectory(containingDirectory, redirectedReference).set(moduleName, resolutionMode, result);
        if (!(0, ts_1.isExternalModuleNameRelative)(moduleName)) {
            // put result in per-module name cache
            cache === null || cache === void 0 ? void 0 : cache.getOrCreateCacheForNonRelativeName(moduleName, resolutionMode, redirectedReference).set(containingDirectory, result);
        }
    }
    if (traceEnabled) {
        if (result.resolvedModule) {
            if (result.resolvedModule.packageId) {
                trace(host, ts_1.Diagnostics.Module_name_0_was_successfully_resolved_to_1_with_Package_ID_2, moduleName, result.resolvedModule.resolvedFileName, (0, ts_1.packageIdToString)(result.resolvedModule.packageId));
            }
            else {
                trace(host, ts_1.Diagnostics.Module_name_0_was_successfully_resolved_to_1, moduleName, result.resolvedModule.resolvedFileName);
            }
        }
        else {
            trace(host, ts_1.Diagnostics.Module_name_0_was_not_resolved, moduleName);
        }
    }
    return result;
}
exports.resolveModuleName = resolveModuleName;
/**
 * Any module resolution kind can be augmented with optional settings: 'baseUrl', 'paths' and 'rootDirs' - they are used to
 * mitigate differences between design time structure of the project and its runtime counterpart so the same import name
 * can be resolved successfully by TypeScript compiler and runtime module loader.
 * If these settings are set then loading procedure will try to use them to resolve module name and it can of failure it will
 * fallback to standard resolution routine.
 *
 * - baseUrl - this setting controls how non-relative module names are resolved. If this setting is specified then non-relative
 * names will be resolved relative to baseUrl: i.e. if baseUrl is '/a/b' then candidate location to resolve module name 'c/d' will
 * be '/a/b/c/d'
 * - paths - this setting can only be used when baseUrl is specified. allows to tune how non-relative module names
 * will be resolved based on the content of the module name.
 * Structure of 'paths' compiler options
 * 'paths': {
 *    pattern-1: [...substitutions],
 *    pattern-2: [...substitutions],
 *    ...
 *    pattern-n: [...substitutions]
 * }
 * Pattern here is a string that can contain zero or one '*' character. During module resolution module name will be matched against
 * all patterns in the list. Matching for patterns that don't contain '*' means that module name must be equal to pattern respecting the case.
 * If pattern contains '*' then to match pattern "<prefix>*<suffix>" module name must start with the <prefix> and end with <suffix>.
 * <MatchedStar> denotes part of the module name between <prefix> and <suffix>.
 * If module name can be matches with multiple patterns then pattern with the longest prefix will be picked.
 * After selecting pattern we'll use list of substitutions to get candidate locations of the module and the try to load module
 * from the candidate location.
 * Substitution is a string that can contain zero or one '*'. To get candidate location from substitution we'll pick every
 * substitution in the list and replace '*' with <MatchedStar> string. If candidate location is not rooted it
 * will be converted to absolute using baseUrl.
 * For example:
 * baseUrl: /a/b/c
 * "paths": {
 *     // match all module names
 *     "*": [
 *         "*",        // use matched name as is,
 *                     // <matched name> will be looked as /a/b/c/<matched name>
 *
 *         "folder1/*" // substitution will convert matched name to 'folder1/<matched name>',
 *                     // since it is not rooted then final candidate location will be /a/b/c/folder1/<matched name>
 *     ],
 *     // match module names that start with 'components/'
 *     "components/*": [ "/root/components/*" ] // substitution will convert /components/folder1/<matched name> to '/root/components/folder1/<matched name>',
 *                                              // it is rooted so it will be final candidate location
 * }
 *
 * 'rootDirs' allows the project to be spreaded across multiple locations and resolve modules with relative names as if
 * they were in the same location. For example lets say there are two files
 * '/local/src/content/file1.ts'
 * '/shared/components/contracts/src/content/protocols/file2.ts'
 * After bundling content of '/shared/components/contracts/src' will be merged with '/local/src' so
 * if file1 has the following import 'import {x} from "./protocols/file2"' it will be resolved successfully in runtime.
 * 'rootDirs' provides the way to tell compiler that in order to get the whole project it should behave as if content of all
 * root dirs were merged together.
 * I.e. for the example above 'rootDirs' will have two entries: [ '/local/src', '/shared/components/contracts/src' ].
 * Compiler will first convert './protocols/file2' into absolute path relative to the location of containing file:
 * '/local/src/content/protocols/file2' and try to load it - failure.
 * Then it will search 'rootDirs' looking for a longest matching prefix of this absolute path and if such prefix is found - absolute path will
 * be converted to a path relative to found rootDir entry './content/protocols/file2' (*). As a last step compiler will check all remaining
 * entries in 'rootDirs', use them to build absolute path out of (*) and try to resolve module from this location.
 */
function tryLoadModuleUsingOptionalResolutionSettings(extensions, moduleName, containingDirectory, loader, state) {
    var resolved = tryLoadModuleUsingPathsIfEligible(extensions, moduleName, loader, state);
    if (resolved)
        return resolved.value;
    if (!(0, ts_1.isExternalModuleNameRelative)(moduleName)) {
        return tryLoadModuleUsingBaseUrl(extensions, moduleName, loader, state);
    }
    else {
        return tryLoadModuleUsingRootDirs(extensions, moduleName, containingDirectory, loader, state);
    }
}
function tryLoadModuleUsingPathsIfEligible(extensions, moduleName, loader, state) {
    var _a;
    var _b = state.compilerOptions, baseUrl = _b.baseUrl, paths = _b.paths, configFile = _b.configFile;
    if (paths && !(0, ts_1.pathIsRelative)(moduleName)) {
        if (state.traceEnabled) {
            if (baseUrl) {
                trace(state.host, ts_1.Diagnostics.baseUrl_option_is_set_to_0_using_this_value_to_resolve_non_relative_module_name_1, baseUrl, moduleName);
            }
            trace(state.host, ts_1.Diagnostics.paths_option_is_specified_looking_for_a_pattern_to_match_module_name_0, moduleName);
        }
        var baseDirectory = (0, ts_1.getPathsBasePath)(state.compilerOptions, state.host); // Always defined when 'paths' is defined
        var pathPatterns = (configFile === null || configFile === void 0 ? void 0 : configFile.configFileSpecs) ? (_a = configFile.configFileSpecs).pathPatterns || (_a.pathPatterns = (0, ts_1.tryParsePatterns)(paths)) : undefined;
        return tryLoadModuleUsingPaths(extensions, moduleName, baseDirectory, paths, pathPatterns, loader, /*onlyRecordFailures*/ false, state);
    }
}
function tryLoadModuleUsingRootDirs(extensions, moduleName, containingDirectory, loader, state) {
    if (!state.compilerOptions.rootDirs) {
        return undefined;
    }
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.rootDirs_option_is_set_using_it_to_resolve_relative_module_name_0, moduleName);
    }
    var candidate = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(containingDirectory, moduleName));
    var matchedRootDir;
    var matchedNormalizedPrefix;
    for (var _i = 0, _a = state.compilerOptions.rootDirs; _i < _a.length; _i++) {
        var rootDir = _a[_i];
        // rootDirs are expected to be absolute
        // in case of tsconfig.json this will happen automatically - compiler will expand relative names
        // using location of tsconfig.json as base location
        var normalizedRoot = (0, ts_1.normalizePath)(rootDir);
        if (!(0, ts_1.endsWith)(normalizedRoot, ts_1.directorySeparator)) {
            normalizedRoot += ts_1.directorySeparator;
        }
        var isLongestMatchingPrefix = (0, ts_1.startsWith)(candidate, normalizedRoot) &&
            (matchedNormalizedPrefix === undefined || matchedNormalizedPrefix.length < normalizedRoot.length);
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Checking_if_0_is_the_longest_matching_prefix_for_1_2, normalizedRoot, candidate, isLongestMatchingPrefix);
        }
        if (isLongestMatchingPrefix) {
            matchedNormalizedPrefix = normalizedRoot;
            matchedRootDir = rootDir;
        }
    }
    if (matchedNormalizedPrefix) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Longest_matching_prefix_for_0_is_1, candidate, matchedNormalizedPrefix);
        }
        var suffix = candidate.substr(matchedNormalizedPrefix.length);
        // first - try to load from a initial location
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Loading_0_from_the_root_dir_1_candidate_location_2, suffix, matchedNormalizedPrefix, candidate);
        }
        var resolvedFileName = loader(extensions, candidate, !(0, ts_1.directoryProbablyExists)(containingDirectory, state.host), state);
        if (resolvedFileName) {
            return resolvedFileName;
        }
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Trying_other_entries_in_rootDirs);
        }
        // then try to resolve using remaining entries in rootDirs
        for (var _b = 0, _c = state.compilerOptions.rootDirs; _b < _c.length; _b++) {
            var rootDir = _c[_b];
            if (rootDir === matchedRootDir) {
                // skip the initially matched entry
                continue;
            }
            var candidate_1 = (0, ts_1.combinePaths)((0, ts_1.normalizePath)(rootDir), suffix);
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.Loading_0_from_the_root_dir_1_candidate_location_2, suffix, rootDir, candidate_1);
            }
            var baseDirectory = (0, ts_1.getDirectoryPath)(candidate_1);
            var resolvedFileName_1 = loader(extensions, candidate_1, !(0, ts_1.directoryProbablyExists)(baseDirectory, state.host), state);
            if (resolvedFileName_1) {
                return resolvedFileName_1;
            }
        }
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Module_resolution_using_rootDirs_has_failed);
        }
    }
    return undefined;
}
function tryLoadModuleUsingBaseUrl(extensions, moduleName, loader, state) {
    var baseUrl = state.compilerOptions.baseUrl;
    if (!baseUrl) {
        return undefined;
    }
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.baseUrl_option_is_set_to_0_using_this_value_to_resolve_non_relative_module_name_1, baseUrl, moduleName);
    }
    var candidate = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(baseUrl, moduleName));
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.Resolving_module_name_0_relative_to_base_url_1_2, moduleName, baseUrl, candidate);
    }
    return loader(extensions, candidate, !(0, ts_1.directoryProbablyExists)((0, ts_1.getDirectoryPath)(candidate), state.host), state);
}
/**
 * Expose resolution logic to allow us to use Node module resolution logic from arbitrary locations.
 * No way to do this with `require()`: https://github.com/nodejs/node/issues/5963
 * Throws an error if the module can't be resolved.
 *
 * @internal
 */
function resolveJSModule(moduleName, initialDir, host) {
    var _a = tryResolveJSModuleWorker(moduleName, initialDir, host), resolvedModule = _a.resolvedModule, failedLookupLocations = _a.failedLookupLocations;
    if (!resolvedModule) {
        throw new Error("Could not resolve JS module '".concat(moduleName, "' starting at '").concat(initialDir, "'. Looked in: ").concat(failedLookupLocations === null || failedLookupLocations === void 0 ? void 0 : failedLookupLocations.join(", ")));
    }
    return resolvedModule.resolvedFileName;
}
exports.resolveJSModule = resolveJSModule;
/** @internal */
var NodeResolutionFeatures;
(function (NodeResolutionFeatures) {
    NodeResolutionFeatures[NodeResolutionFeatures["None"] = 0] = "None";
    // resolving `#local` names in your own package.json
    NodeResolutionFeatures[NodeResolutionFeatures["Imports"] = 2] = "Imports";
    // resolving `your-own-name` from your own package.json
    NodeResolutionFeatures[NodeResolutionFeatures["SelfName"] = 4] = "SelfName";
    // respecting the `.exports` member of packages' package.json files and its (conditional) mappings of export names
    NodeResolutionFeatures[NodeResolutionFeatures["Exports"] = 8] = "Exports";
    // allowing `*` in the LHS of an export to be followed by more content, eg `"./whatever/*.js"`
    // not supported in node 12 - https://github.com/nodejs/Release/issues/690
    NodeResolutionFeatures[NodeResolutionFeatures["ExportsPatternTrailers"] = 16] = "ExportsPatternTrailers";
    NodeResolutionFeatures[NodeResolutionFeatures["AllFeatures"] = 30] = "AllFeatures";
    NodeResolutionFeatures[NodeResolutionFeatures["Node16Default"] = 30] = "Node16Default";
    NodeResolutionFeatures[NodeResolutionFeatures["NodeNextDefault"] = 30] = "NodeNextDefault";
    NodeResolutionFeatures[NodeResolutionFeatures["BundlerDefault"] = 30] = "BundlerDefault";
    NodeResolutionFeatures[NodeResolutionFeatures["EsmMode"] = 32] = "EsmMode";
})(NodeResolutionFeatures || (exports.NodeResolutionFeatures = NodeResolutionFeatures = {}));
function node16ModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode) {
    return nodeNextModuleNameResolverWorker(NodeResolutionFeatures.Node16Default, moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode);
}
function nodeNextModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode) {
    return nodeNextModuleNameResolverWorker(NodeResolutionFeatures.NodeNextDefault, moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode);
}
function nodeNextModuleNameResolverWorker(features, moduleName, containingFile, compilerOptions, host, cache, redirectedReference, resolutionMode) {
    var containingDirectory = (0, ts_1.getDirectoryPath)(containingFile);
    // es module file or cjs-like input file, use a variant of the legacy cjs resolver that supports the selected modern features
    var esmMode = resolutionMode === ts_1.ModuleKind.ESNext ? NodeResolutionFeatures.EsmMode : 0;
    var extensions = compilerOptions.noDtsResolution ? 3 /* Extensions.ImplementationFiles */ : 1 /* Extensions.TypeScript */ | 2 /* Extensions.JavaScript */ | 4 /* Extensions.Declaration */;
    if ((0, ts_1.getResolveJsonModule)(compilerOptions)) {
        extensions |= 8 /* Extensions.Json */;
    }
    return nodeModuleNameResolverWorker(features | esmMode, moduleName, containingDirectory, compilerOptions, host, cache, extensions, /*isConfigLookup*/ false, redirectedReference);
}
function tryResolveJSModuleWorker(moduleName, initialDir, host) {
    return nodeModuleNameResolverWorker(NodeResolutionFeatures.None, moduleName, initialDir, { moduleResolution: ts_1.ModuleResolutionKind.Node10, allowJs: true }, host, 
    /*cache*/ undefined, 2 /* Extensions.JavaScript */, 
    /*isConfigLookup*/ false, 
    /*redirectedReference*/ undefined);
}
function bundlerModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference) {
    var containingDirectory = (0, ts_1.getDirectoryPath)(containingFile);
    var extensions = compilerOptions.noDtsResolution ? 3 /* Extensions.ImplementationFiles */ : 1 /* Extensions.TypeScript */ | 2 /* Extensions.JavaScript */ | 4 /* Extensions.Declaration */;
    if ((0, ts_1.getResolveJsonModule)(compilerOptions)) {
        extensions |= 8 /* Extensions.Json */;
    }
    return nodeModuleNameResolverWorker(getNodeResolutionFeatures(compilerOptions), moduleName, containingDirectory, compilerOptions, host, cache, extensions, /*isConfigLookup*/ false, redirectedReference);
}
exports.bundlerModuleNameResolver = bundlerModuleNameResolver;
function nodeModuleNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference, isConfigLookup) {
    var extensions;
    if (isConfigLookup) {
        extensions = 8 /* Extensions.Json */;
    }
    else if (compilerOptions.noDtsResolution) {
        extensions = 3 /* Extensions.ImplementationFiles */;
        if ((0, ts_1.getResolveJsonModule)(compilerOptions))
            extensions |= 8 /* Extensions.Json */;
    }
    else {
        extensions = (0, ts_1.getResolveJsonModule)(compilerOptions)
            ? 1 /* Extensions.TypeScript */ | 2 /* Extensions.JavaScript */ | 4 /* Extensions.Declaration */ | 8 /* Extensions.Json */
            : 1 /* Extensions.TypeScript */ | 2 /* Extensions.JavaScript */ | 4 /* Extensions.Declaration */;
    }
    return nodeModuleNameResolverWorker(NodeResolutionFeatures.None, moduleName, (0, ts_1.getDirectoryPath)(containingFile), compilerOptions, host, cache, extensions, !!isConfigLookup, redirectedReference);
}
exports.nodeModuleNameResolver = nodeModuleNameResolver;
/** @internal */
function nodeNextJsonConfigResolver(moduleName, containingFile, host) {
    return nodeModuleNameResolverWorker(NodeResolutionFeatures.NodeNextDefault, moduleName, (0, ts_1.getDirectoryPath)(containingFile), { moduleResolution: ts_1.ModuleResolutionKind.NodeNext }, host, /*cache*/ undefined, 8 /* Extensions.Json */, /*isConfigLookup*/ true, /*redirectedReference*/ undefined);
}
exports.nodeNextJsonConfigResolver = nodeNextJsonConfigResolver;
function nodeModuleNameResolverWorker(features, moduleName, containingDirectory, compilerOptions, host, cache, extensions, isConfigLookup, redirectedReference) {
    var _a, _b, _c, _d;
    var traceEnabled = isTraceEnabled(compilerOptions, host);
    var failedLookupLocations = [];
    var affectingLocations = [];
    var conditions = getConditions(compilerOptions, !!(features & NodeResolutionFeatures.EsmMode));
    var diagnostics = [];
    var state = {
        compilerOptions: compilerOptions,
        host: host,
        traceEnabled: traceEnabled,
        failedLookupLocations: failedLookupLocations,
        affectingLocations: affectingLocations,
        packageJsonInfoCache: cache,
        features: features,
        conditions: conditions,
        requestContainingDirectory: containingDirectory,
        reportDiagnostic: function (diag) { return void diagnostics.push(diag); },
        isConfigLookup: isConfigLookup,
        candidateIsFromPackageJsonField: false,
    };
    if (traceEnabled && (0, ts_1.moduleResolutionSupportsPackageJsonExportsAndImports)((0, ts_1.getEmitModuleResolutionKind)(compilerOptions))) {
        trace(host, ts_1.Diagnostics.Resolving_in_0_mode_with_conditions_1, features & NodeResolutionFeatures.EsmMode ? "ESM" : "CJS", conditions.map(function (c) { return "'".concat(c, "'"); }).join(", "));
    }
    var result;
    if ((0, ts_1.getEmitModuleResolutionKind)(compilerOptions) === ts_1.ModuleResolutionKind.Node10) {
        var priorityExtensions = extensions & (1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */);
        var secondaryExtensions = extensions & ~(1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */);
        result =
            priorityExtensions && tryResolve(priorityExtensions, state) ||
                secondaryExtensions && tryResolve(secondaryExtensions, state) ||
                undefined;
    }
    else {
        result = tryResolve(extensions, state);
    }
    // For non-relative names that resolved to JS but no types in modes that look up an "import" condition in package.json "exports",
    // try again with "exports" disabled to try to detect if this is likely a configuration error in a dependency's package.json.
    var legacyResult;
    if (((_a = result === null || result === void 0 ? void 0 : result.value) === null || _a === void 0 ? void 0 : _a.isExternalLibraryImport)
        && !isConfigLookup
        && extensions & (1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */)
        && features & NodeResolutionFeatures.Exports
        && !(0, ts_1.isExternalModuleNameRelative)(moduleName)
        && !extensionIsOk(1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */, result.value.resolved.extension)
        && conditions.indexOf("import") > -1) {
        traceIfEnabled(state, ts_1.Diagnostics.Resolution_of_non_relative_name_failed_trying_with_modern_Node_resolution_features_disabled_to_see_if_npm_library_needs_configuration_update);
        var diagnosticState = __assign(__assign({}, state), { features: state.features & ~NodeResolutionFeatures.Exports, reportDiagnostic: ts_1.noop });
        var diagnosticResult = tryResolve(extensions & (1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */), diagnosticState);
        if ((_b = diagnosticResult === null || diagnosticResult === void 0 ? void 0 : diagnosticResult.value) === null || _b === void 0 ? void 0 : _b.isExternalLibraryImport) {
            legacyResult = diagnosticResult.value.resolved.path;
        }
    }
    return createResolvedModuleWithFailedLookupLocationsHandlingSymlink(moduleName, (_c = result === null || result === void 0 ? void 0 : result.value) === null || _c === void 0 ? void 0 : _c.resolved, (_d = result === null || result === void 0 ? void 0 : result.value) === null || _d === void 0 ? void 0 : _d.isExternalLibraryImport, failedLookupLocations, affectingLocations, diagnostics, state, legacyResult);
    function tryResolve(extensions, state) {
        var loader = function (extensions, candidate, onlyRecordFailures, state) { return nodeLoadModuleByRelativeName(extensions, candidate, onlyRecordFailures, state, /*considerPackageJson*/ true); };
        var resolved = tryLoadModuleUsingOptionalResolutionSettings(extensions, moduleName, containingDirectory, loader, state);
        if (resolved) {
            return toSearchResult({ resolved: resolved, isExternalLibraryImport: pathContainsNodeModules(resolved.path) });
        }
        if (!(0, ts_1.isExternalModuleNameRelative)(moduleName)) {
            var resolved_1;
            if (features & NodeResolutionFeatures.Imports && (0, ts_1.startsWith)(moduleName, "#")) {
                resolved_1 = loadModuleFromImports(extensions, moduleName, containingDirectory, state, cache, redirectedReference);
            }
            if (!resolved_1 && features & NodeResolutionFeatures.SelfName) {
                resolved_1 = loadModuleFromSelfNameReference(extensions, moduleName, containingDirectory, state, cache, redirectedReference);
            }
            if (!resolved_1) {
                if (moduleName.indexOf(":") > -1) {
                    if (traceEnabled) {
                        trace(host, ts_1.Diagnostics.Skipping_module_0_that_looks_like_an_absolute_URI_target_file_types_Colon_1, moduleName, formatExtensions(extensions));
                    }
                    return undefined;
                }
                if (traceEnabled) {
                    trace(host, ts_1.Diagnostics.Loading_module_0_from_node_modules_folder_target_file_types_Colon_1, moduleName, formatExtensions(extensions));
                }
                resolved_1 = loadModuleFromNearestNodeModulesDirectory(extensions, moduleName, containingDirectory, state, cache, redirectedReference);
            }
            if (extensions & 4 /* Extensions.Declaration */) {
                resolved_1 !== null && resolved_1 !== void 0 ? resolved_1 : (resolved_1 = resolveFromTypeRoot(moduleName, state));
            }
            // For node_modules lookups, get the real path so that multiple accesses to an `npm link`-ed module do not create duplicate files.
            return resolved_1 && { value: resolved_1.value && { resolved: resolved_1.value, isExternalLibraryImport: true } };
        }
        else {
            var _a = normalizePathForCJSResolution(containingDirectory, moduleName), candidate = _a.path, parts = _a.parts;
            var resolved_2 = nodeLoadModuleByRelativeName(extensions, candidate, /*onlyRecordFailures*/ false, state, /*considerPackageJson*/ true);
            // Treat explicit "node_modules" import as an external library import.
            return resolved_2 && toSearchResult({ resolved: resolved_2, isExternalLibraryImport: (0, ts_1.contains)(parts, "node_modules") });
        }
    }
}
// If you import from "." inside a containing directory "/foo", the result of `normalizePath`
// would be "/foo", but this loses the information that `foo` is a directory and we intended
// to look inside of it. The Node CommonJS resolution algorithm doesn't call this out
// (https://nodejs.org/api/modules.html#all-together), but it seems that module paths ending
// in `.` are actually normalized to `./` before proceeding with the resolution algorithm.
function normalizePathForCJSResolution(containingDirectory, moduleName) {
    var combined = (0, ts_1.combinePaths)(containingDirectory, moduleName);
    var parts = (0, ts_1.getPathComponents)(combined);
    var lastPart = (0, ts_1.lastOrUndefined)(parts);
    var path = lastPart === "." || lastPart === ".." ? (0, ts_1.ensureTrailingDirectorySeparator)((0, ts_1.normalizePath)(combined)) : (0, ts_1.normalizePath)(combined);
    return { path: path, parts: parts };
}
function realPath(path, host, traceEnabled) {
    if (!host.realpath) {
        return path;
    }
    var real = (0, ts_1.normalizePath)(host.realpath(path));
    if (traceEnabled) {
        trace(host, ts_1.Diagnostics.Resolving_real_path_for_0_result_1, path, real);
    }
    ts_1.Debug.assert(host.fileExists(real), "".concat(path, " linked to nonexistent file ").concat(real));
    return real;
}
function nodeLoadModuleByRelativeName(extensions, candidate, onlyRecordFailures, state, considerPackageJson) {
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.Loading_module_as_file_Slash_folder_candidate_module_location_0_target_file_types_Colon_1, candidate, formatExtensions(extensions));
    }
    if (!(0, ts_1.hasTrailingDirectorySeparator)(candidate)) {
        if (!onlyRecordFailures) {
            var parentOfCandidate = (0, ts_1.getDirectoryPath)(candidate);
            if (!(0, ts_1.directoryProbablyExists)(parentOfCandidate, state.host)) {
                if (state.traceEnabled) {
                    trace(state.host, ts_1.Diagnostics.Directory_0_does_not_exist_skipping_all_lookups_in_it, parentOfCandidate);
                }
                onlyRecordFailures = true;
            }
        }
        var resolvedFromFile = loadModuleFromFile(extensions, candidate, onlyRecordFailures, state);
        if (resolvedFromFile) {
            var packageDirectory = considerPackageJson ? parseNodeModuleFromPath(resolvedFromFile.path) : undefined;
            var packageInfo = packageDirectory ? getPackageJsonInfo(packageDirectory, /*onlyRecordFailures*/ false, state) : undefined;
            return withPackageId(packageInfo, resolvedFromFile);
        }
    }
    if (!onlyRecordFailures) {
        var candidateExists = (0, ts_1.directoryProbablyExists)(candidate, state.host);
        if (!candidateExists) {
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.Directory_0_does_not_exist_skipping_all_lookups_in_it, candidate);
            }
            onlyRecordFailures = true;
        }
    }
    // esm mode relative imports shouldn't do any directory lookups (either inside `package.json`
    // files or implicit `index.js`es). This is a notable departure from cjs norms, where `./foo/pkg`
    // could have been redirected by `./foo/pkg/package.json` to an arbitrary location!
    if (!(state.features & NodeResolutionFeatures.EsmMode)) {
        return loadNodeModuleFromDirectory(extensions, candidate, onlyRecordFailures, state, considerPackageJson);
    }
    return undefined;
}
/** @internal */
exports.nodeModulesPathPart = "/node_modules/";
/** @internal */
function pathContainsNodeModules(path) {
    return (0, ts_1.stringContains)(path, exports.nodeModulesPathPart);
}
exports.pathContainsNodeModules = pathContainsNodeModules;
/**
 * This will be called on the successfully resolved path from `loadModuleFromFile`.
 * (Not needed for `loadModuleFromNodeModules` as that looks up the `package.json` as part of resolution.)
 *
 * packageDirectory is the directory of the package itself.
 *   For `blah/node_modules/foo/index.d.ts` this is packageDirectory: "foo"
 *   For `/node_modules/foo/bar.d.ts` this is packageDirectory: "foo"
 *   For `/node_modules/@types/foo/bar/index.d.ts` this is packageDirectory: "@types/foo"
 *   For `/node_modules/foo/bar/index.d.ts` this is packageDirectory: "foo"
 *
 * @internal
 */
function parseNodeModuleFromPath(resolved, isFolder) {
    var path = (0, ts_1.normalizePath)(resolved);
    var idx = path.lastIndexOf(exports.nodeModulesPathPart);
    if (idx === -1) {
        return undefined;
    }
    var indexAfterNodeModules = idx + exports.nodeModulesPathPart.length;
    var indexAfterPackageName = moveToNextDirectorySeparatorIfAvailable(path, indexAfterNodeModules, isFolder);
    if (path.charCodeAt(indexAfterNodeModules) === 64 /* CharacterCodes.at */) {
        indexAfterPackageName = moveToNextDirectorySeparatorIfAvailable(path, indexAfterPackageName, isFolder);
    }
    return path.slice(0, indexAfterPackageName);
}
exports.parseNodeModuleFromPath = parseNodeModuleFromPath;
function moveToNextDirectorySeparatorIfAvailable(path, prevSeparatorIndex, isFolder) {
    var nextSeparatorIndex = path.indexOf(ts_1.directorySeparator, prevSeparatorIndex + 1);
    return nextSeparatorIndex === -1 ? isFolder ? path.length : prevSeparatorIndex : nextSeparatorIndex;
}
function loadModuleFromFileNoPackageId(extensions, candidate, onlyRecordFailures, state) {
    return noPackageId(loadModuleFromFile(extensions, candidate, onlyRecordFailures, state));
}
/**
 * @param {boolean} onlyRecordFailures - if true then function won't try to actually load files but instead record all attempts as failures. This flag is necessary
 * in cases when we know upfront that all load attempts will fail (because containing folder does not exists) however we still need to record all failed lookup locations.
 */
function loadModuleFromFile(extensions, candidate, onlyRecordFailures, state) {
    // ./foo.js -> ./foo.ts
    var resolvedByReplacingExtension = loadModuleFromFileNoImplicitExtensions(extensions, candidate, onlyRecordFailures, state);
    if (resolvedByReplacingExtension) {
        return resolvedByReplacingExtension;
    }
    // ./foo -> ./foo.ts
    if (!(state.features & NodeResolutionFeatures.EsmMode)) {
        // First, try adding an extension. An import of "foo" could be matched by a file "foo.ts", or "foo.js" by "foo.js.ts"
        var resolvedByAddingExtension = tryAddingExtensions(candidate, extensions, "", onlyRecordFailures, state);
        if (resolvedByAddingExtension) {
            return resolvedByAddingExtension;
        }
    }
}
function loadModuleFromFileNoImplicitExtensions(extensions, candidate, onlyRecordFailures, state) {
    var filename = (0, ts_1.getBaseFileName)(candidate);
    if (filename.indexOf(".") === -1) {
        return undefined; // extensionless import, no lookups performed, since we don't support extensionless files
    }
    var extensionless = (0, ts_1.removeFileExtension)(candidate);
    if (extensionless === candidate) {
        // Once TS native extensions are handled, handle arbitrary extensions for declaration file mapping
        extensionless = candidate.substring(0, candidate.lastIndexOf("."));
    }
    var extension = candidate.substring(extensionless.length);
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.File_name_0_has_a_1_extension_stripping_it, candidate, extension);
    }
    return tryAddingExtensions(extensionless, extensions, extension, onlyRecordFailures, state);
}
/**
 * This function is only ever called with paths written in package.json files - never
 * module specifiers written in source files - and so it always allows the

 * candidate to end with a TS extension (but will also try substituting a JS extension for a TS extension).
 */
function loadFileNameFromPackageJsonField(extensions, candidate, onlyRecordFailures, state) {
    if (extensions & 1 /* Extensions.TypeScript */ && (0, ts_1.fileExtensionIsOneOf)(candidate, ts_1.supportedTSImplementationExtensions) ||
        extensions & 4 /* Extensions.Declaration */ && (0, ts_1.fileExtensionIsOneOf)(candidate, ts_1.supportedDeclarationExtensions)) {
        var result = tryFile(candidate, onlyRecordFailures, state);
        return result !== undefined ? { path: candidate, ext: (0, ts_1.tryExtractTSExtension)(candidate), resolvedUsingTsExtension: undefined } : undefined;
    }
    if (state.isConfigLookup && extensions === 8 /* Extensions.Json */ && (0, ts_1.fileExtensionIs)(candidate, ".json" /* Extension.Json */)) {
        var result = tryFile(candidate, onlyRecordFailures, state);
        return result !== undefined ? { path: candidate, ext: ".json" /* Extension.Json */, resolvedUsingTsExtension: undefined } : undefined;
    }
    return loadModuleFromFileNoImplicitExtensions(extensions, candidate, onlyRecordFailures, state);
}
/** Try to return an existing file that adds one of the `extensions` to `candidate`. */
function tryAddingExtensions(candidate, extensions, originalExtension, onlyRecordFailures, state) {
    if (!onlyRecordFailures) {
        // check if containing folder exists - if it doesn't then just record failures for all supported extensions without disk probing
        var directory = (0, ts_1.getDirectoryPath)(candidate);
        if (directory) {
            onlyRecordFailures = !(0, ts_1.directoryProbablyExists)(directory, state.host);
        }
    }
    switch (originalExtension) {
        case ".mjs" /* Extension.Mjs */:
        case ".mts" /* Extension.Mts */:
        case ".d.mts" /* Extension.Dmts */:
            return extensions & 1 /* Extensions.TypeScript */ && tryExtension(".mts" /* Extension.Mts */, originalExtension === ".mts" /* Extension.Mts */ || originalExtension === ".d.mts" /* Extension.Dmts */)
                || extensions & 4 /* Extensions.Declaration */ && tryExtension(".d.mts" /* Extension.Dmts */, originalExtension === ".mts" /* Extension.Mts */ || originalExtension === ".d.mts" /* Extension.Dmts */)
                || extensions & 2 /* Extensions.JavaScript */ && tryExtension(".mjs" /* Extension.Mjs */)
                || undefined;
        case ".cjs" /* Extension.Cjs */:
        case ".cts" /* Extension.Cts */:
        case ".d.cts" /* Extension.Dcts */:
            return extensions & 1 /* Extensions.TypeScript */ && tryExtension(".cts" /* Extension.Cts */, originalExtension === ".cts" /* Extension.Cts */ || originalExtension === ".d.cts" /* Extension.Dcts */)
                || extensions & 4 /* Extensions.Declaration */ && tryExtension(".d.cts" /* Extension.Dcts */, originalExtension === ".cts" /* Extension.Cts */ || originalExtension === ".d.cts" /* Extension.Dcts */)
                || extensions & 2 /* Extensions.JavaScript */ && tryExtension(".cjs" /* Extension.Cjs */)
                || undefined;
        case ".json" /* Extension.Json */:
            return extensions & 4 /* Extensions.Declaration */ && tryExtension(".d.json.ts")
                || extensions & 8 /* Extensions.Json */ && tryExtension(".json" /* Extension.Json */)
                || undefined;
        case ".tsx" /* Extension.Tsx */:
        case ".jsx" /* Extension.Jsx */:
            // basically idendical to the ts/js case below, but prefers matching tsx and jsx files exactly before falling back to the ts or js file path
            // (historically, we disallow having both a a.ts and a.tsx file in the same compilation, since their outputs clash)
            // TODO: We should probably error if `"./a.tsx"` resolved to `"./a.ts"`, right?
            return extensions & 1 /* Extensions.TypeScript */ && (tryExtension(".tsx" /* Extension.Tsx */, originalExtension === ".tsx" /* Extension.Tsx */) || tryExtension(".ts" /* Extension.Ts */, originalExtension === ".tsx" /* Extension.Tsx */))
                || extensions & 4 /* Extensions.Declaration */ && tryExtension(".d.ts" /* Extension.Dts */, originalExtension === ".tsx" /* Extension.Tsx */)
                || extensions & 2 /* Extensions.JavaScript */ && (tryExtension(".jsx" /* Extension.Jsx */) || tryExtension(".js" /* Extension.Js */))
                || undefined;
        case ".ts" /* Extension.Ts */:
        case ".d.ts" /* Extension.Dts */:
        case ".js" /* Extension.Js */:
        case "":
            return extensions & 1 /* Extensions.TypeScript */ && (tryExtension(".ts" /* Extension.Ts */, originalExtension === ".ts" /* Extension.Ts */ || originalExtension === ".d.ts" /* Extension.Dts */) || tryExtension(".tsx" /* Extension.Tsx */, originalExtension === ".ts" /* Extension.Ts */ || originalExtension === ".d.ts" /* Extension.Dts */))
                || extensions & 4 /* Extensions.Declaration */ && tryExtension(".d.ts" /* Extension.Dts */, originalExtension === ".ts" /* Extension.Ts */ || originalExtension === ".d.ts" /* Extension.Dts */)
                || extensions & 2 /* Extensions.JavaScript */ && (tryExtension(".js" /* Extension.Js */) || tryExtension(".jsx" /* Extension.Jsx */))
                || state.isConfigLookup && tryExtension(".json" /* Extension.Json */)
                || undefined;
        default:
            return extensions & 4 /* Extensions.Declaration */ && !(0, ts_1.isDeclarationFileName)(candidate + originalExtension) && tryExtension(".d".concat(originalExtension, ".ts"))
                || undefined;
    }
    function tryExtension(ext, resolvedUsingTsExtension) {
        var path = tryFile(candidate + ext, onlyRecordFailures, state);
        return path === undefined ? undefined : { path: path, ext: ext, resolvedUsingTsExtension: !state.candidateIsFromPackageJsonField && resolvedUsingTsExtension };
    }
}
/** Return the file if it exists. */
function tryFile(fileName, onlyRecordFailures, state) {
    var _a, _b;
    if (!((_a = state.compilerOptions.moduleSuffixes) === null || _a === void 0 ? void 0 : _a.length)) {
        return tryFileLookup(fileName, onlyRecordFailures, state);
    }
    var ext = (_b = (0, ts_1.tryGetExtensionFromPath)(fileName)) !== null && _b !== void 0 ? _b : "";
    var fileNameNoExtension = ext ? (0, ts_1.removeExtension)(fileName, ext) : fileName;
    return (0, ts_1.forEach)(state.compilerOptions.moduleSuffixes, function (suffix) { return tryFileLookup(fileNameNoExtension + suffix + ext, onlyRecordFailures, state); });
}
function tryFileLookup(fileName, onlyRecordFailures, state) {
    var _a;
    if (!onlyRecordFailures) {
        if (state.host.fileExists(fileName)) {
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.File_0_exists_use_it_as_a_name_resolution_result, fileName);
            }
            return fileName;
        }
        else {
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.File_0_does_not_exist, fileName);
            }
        }
    }
    (_a = state.failedLookupLocations) === null || _a === void 0 ? void 0 : _a.push(fileName);
    return undefined;
}
function loadNodeModuleFromDirectory(extensions, candidate, onlyRecordFailures, state, considerPackageJson) {
    if (considerPackageJson === void 0) { considerPackageJson = true; }
    var packageInfo = considerPackageJson ? getPackageJsonInfo(candidate, onlyRecordFailures, state) : undefined;
    var packageJsonContent = packageInfo && packageInfo.contents.packageJsonContent;
    var versionPaths = packageInfo && getVersionPathsOfPackageJsonInfo(packageInfo, state);
    return withPackageId(packageInfo, loadNodeModuleFromDirectoryWorker(extensions, candidate, onlyRecordFailures, state, packageJsonContent, versionPaths));
}
/** @internal */
function getEntrypointsFromPackageJsonInfo(packageJsonInfo, options, host, cache, resolveJs) {
    if (!resolveJs && packageJsonInfo.contents.resolvedEntrypoints !== undefined) {
        // Cached value excludes resolutions to JS files - those could be
        // cached separately, but they're used rarely.
        return packageJsonInfo.contents.resolvedEntrypoints;
    }
    var entrypoints;
    var extensions = 1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */ | (resolveJs ? 2 /* Extensions.JavaScript */ : 0);
    var features = getNodeResolutionFeatures(options);
    var loadPackageJsonMainState = getTemporaryModuleResolutionState(cache === null || cache === void 0 ? void 0 : cache.getPackageJsonInfoCache(), host, options);
    loadPackageJsonMainState.conditions = getConditions(options);
    loadPackageJsonMainState.requestContainingDirectory = packageJsonInfo.packageDirectory;
    var mainResolution = loadNodeModuleFromDirectoryWorker(extensions, packageJsonInfo.packageDirectory, 
    /*onlyRecordFailures*/ false, loadPackageJsonMainState, packageJsonInfo.contents.packageJsonContent, getVersionPathsOfPackageJsonInfo(packageJsonInfo, loadPackageJsonMainState));
    entrypoints = (0, ts_1.append)(entrypoints, mainResolution === null || mainResolution === void 0 ? void 0 : mainResolution.path);
    if (features & NodeResolutionFeatures.Exports && packageJsonInfo.contents.packageJsonContent.exports) {
        var conditionSets = (0, ts_1.deduplicate)([getConditions(options, /*esmMode*/ true), getConditions(options, /*esmMode*/ false)], ts_1.arrayIsEqualTo);
        for (var _i = 0, conditionSets_1 = conditionSets; _i < conditionSets_1.length; _i++) {
            var conditions = conditionSets_1[_i];
            var loadPackageJsonExportsState = __assign(__assign({}, loadPackageJsonMainState), { failedLookupLocations: [], conditions: conditions });
            var exportResolutions = loadEntrypointsFromExportMap(packageJsonInfo, packageJsonInfo.contents.packageJsonContent.exports, loadPackageJsonExportsState, extensions);
            if (exportResolutions) {
                for (var _a = 0, exportResolutions_1 = exportResolutions; _a < exportResolutions_1.length; _a++) {
                    var resolution = exportResolutions_1[_a];
                    entrypoints = (0, ts_1.appendIfUnique)(entrypoints, resolution.path);
                }
            }
        }
    }
    return packageJsonInfo.contents.resolvedEntrypoints = entrypoints || false;
}
exports.getEntrypointsFromPackageJsonInfo = getEntrypointsFromPackageJsonInfo;
function loadEntrypointsFromExportMap(scope, exports, state, extensions) {
    var entrypoints;
    if ((0, ts_1.isArray)(exports)) {
        for (var _i = 0, exports_1 = exports; _i < exports_1.length; _i++) {
            var target = exports_1[_i];
            loadEntrypointsFromTargetExports(target);
        }
    }
    // eslint-disable-next-line no-null/no-null
    else if (typeof exports === "object" && exports !== null && allKeysStartWithDot(exports)) {
        for (var key in exports) {
            loadEntrypointsFromTargetExports(exports[key]);
        }
    }
    else {
        loadEntrypointsFromTargetExports(exports);
    }
    return entrypoints;
    function loadEntrypointsFromTargetExports(target) {
        var _a, _b;
        if (typeof target === "string" && (0, ts_1.startsWith)(target, "./") && target.indexOf("*") === -1) {
            var partsAfterFirst = (0, ts_1.getPathComponents)(target).slice(2);
            if (partsAfterFirst.indexOf("..") >= 0 || partsAfterFirst.indexOf(".") >= 0 || partsAfterFirst.indexOf("node_modules") >= 0) {
                return false;
            }
            var resolvedTarget = (0, ts_1.combinePaths)(scope.packageDirectory, target);
            var finalPath = (0, ts_1.getNormalizedAbsolutePath)(resolvedTarget, (_b = (_a = state.host).getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(_a));
            var result = loadFileNameFromPackageJsonField(extensions, finalPath, /*onlyRecordFailures*/ false, state);
            if (result) {
                entrypoints = (0, ts_1.appendIfUnique)(entrypoints, result, function (a, b) { return a.path === b.path; });
                return true;
            }
        }
        else if (Array.isArray(target)) {
            for (var _i = 0, target_1 = target; _i < target_1.length; _i++) {
                var t = target_1[_i];
                var success = loadEntrypointsFromTargetExports(t);
                if (success) {
                    return true;
                }
            }
        }
        // eslint-disable-next-line no-null/no-null
        else if (typeof target === "object" && target !== null) {
            return (0, ts_1.forEach)((0, ts_1.getOwnKeys)(target), function (key) {
                if (key === "default" || (0, ts_1.contains)(state.conditions, key) || isApplicableVersionedTypesKey(state.conditions, key)) {
                    loadEntrypointsFromTargetExports(target[key]);
                    return true;
                }
            });
        }
    }
}
/** @internal */
function getTemporaryModuleResolutionState(packageJsonInfoCache, host, options) {
    return {
        host: host,
        compilerOptions: options,
        traceEnabled: isTraceEnabled(options, host),
        failedLookupLocations: undefined,
        affectingLocations: undefined,
        packageJsonInfoCache: packageJsonInfoCache,
        features: NodeResolutionFeatures.None,
        conditions: ts_1.emptyArray,
        requestContainingDirectory: undefined,
        reportDiagnostic: ts_1.noop,
        isConfigLookup: false,
        candidateIsFromPackageJsonField: false,
    };
}
exports.getTemporaryModuleResolutionState = getTemporaryModuleResolutionState;
/**
 * A function for locating the package.json scope for a given path
 *
 * @internal
 */
function getPackageScopeForPath(fileName, state) {
    var parts = (0, ts_1.getPathComponents)(fileName);
    parts.pop();
    while (parts.length > 0) {
        var pkg = getPackageJsonInfo((0, ts_1.getPathFromPathComponents)(parts), /*onlyRecordFailures*/ false, state);
        if (pkg) {
            return pkg;
        }
        parts.pop();
    }
    return undefined;
}
exports.getPackageScopeForPath = getPackageScopeForPath;
function getVersionPathsOfPackageJsonInfo(packageJsonInfo, state) {
    if (packageJsonInfo.contents.versionPaths === undefined) {
        packageJsonInfo.contents.versionPaths = readPackageJsonTypesVersionPaths(packageJsonInfo.contents.packageJsonContent, state) || false;
    }
    return packageJsonInfo.contents.versionPaths || undefined;
}
/** @internal */
function getPackageJsonInfo(packageDirectory, onlyRecordFailures, state) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var host = state.host, traceEnabled = state.traceEnabled;
    var packageJsonPath = (0, ts_1.combinePaths)(packageDirectory, "package.json");
    if (onlyRecordFailures) {
        (_a = state.failedLookupLocations) === null || _a === void 0 ? void 0 : _a.push(packageJsonPath);
        return undefined;
    }
    var existing = (_b = state.packageJsonInfoCache) === null || _b === void 0 ? void 0 : _b.getPackageJsonInfo(packageJsonPath);
    if (existing !== undefined) {
        if (typeof existing !== "boolean") {
            if (traceEnabled)
                trace(host, ts_1.Diagnostics.File_0_exists_according_to_earlier_cached_lookups, packageJsonPath);
            (_c = state.affectingLocations) === null || _c === void 0 ? void 0 : _c.push(packageJsonPath);
            return existing.packageDirectory === packageDirectory ?
                existing :
                { packageDirectory: packageDirectory, contents: existing.contents };
        }
        else {
            if (existing && traceEnabled)
                trace(host, ts_1.Diagnostics.File_0_does_not_exist_according_to_earlier_cached_lookups, packageJsonPath);
            (_d = state.failedLookupLocations) === null || _d === void 0 ? void 0 : _d.push(packageJsonPath);
            return undefined;
        }
    }
    var directoryExists = (0, ts_1.directoryProbablyExists)(packageDirectory, host);
    if (directoryExists && host.fileExists(packageJsonPath)) {
        var packageJsonContent = (0, ts_1.readJson)(packageJsonPath, host);
        if (traceEnabled) {
            trace(host, ts_1.Diagnostics.Found_package_json_at_0, packageJsonPath);
        }
        var result = { packageDirectory: packageDirectory, contents: { packageJsonContent: packageJsonContent, versionPaths: undefined, resolvedEntrypoints: undefined } };
        (_e = state.packageJsonInfoCache) === null || _e === void 0 ? void 0 : _e.setPackageJsonInfo(packageJsonPath, result);
        (_f = state.affectingLocations) === null || _f === void 0 ? void 0 : _f.push(packageJsonPath);
        return result;
    }
    else {
        if (directoryExists && traceEnabled) {
            trace(host, ts_1.Diagnostics.File_0_does_not_exist, packageJsonPath);
        }
        (_g = state.packageJsonInfoCache) === null || _g === void 0 ? void 0 : _g.setPackageJsonInfo(packageJsonPath, directoryExists);
        // record package json as one of failed lookup locations - in the future if this file will appear it will invalidate resolution results
        (_h = state.failedLookupLocations) === null || _h === void 0 ? void 0 : _h.push(packageJsonPath);
    }
}
exports.getPackageJsonInfo = getPackageJsonInfo;
function loadNodeModuleFromDirectoryWorker(extensions, candidate, onlyRecordFailures, state, jsonContent, versionPaths) {
    var packageFile;
    if (jsonContent) {
        if (state.isConfigLookup) {
            packageFile = readPackageJsonTSConfigField(jsonContent, candidate, state);
        }
        else {
            packageFile =
                extensions & 4 /* Extensions.Declaration */ && readPackageJsonTypesFields(jsonContent, candidate, state) ||
                    extensions & (3 /* Extensions.ImplementationFiles */ | 4 /* Extensions.Declaration */) && readPackageJsonMainField(jsonContent, candidate, state) ||
                    undefined;
        }
    }
    var loader = function (extensions, candidate, onlyRecordFailures, state) {
        var fromFile = tryFile(candidate, onlyRecordFailures, state);
        if (fromFile) {
            var resolved = resolvedIfExtensionMatches(extensions, fromFile);
            if (resolved) {
                return noPackageId(resolved);
            }
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.File_0_has_an_unsupported_extension_so_skipping_it, fromFile);
            }
        }
        // Even if extensions is DtsOnly, we can still look up a .ts file as a result of package.json "types"
        var expandedExtensions = extensions === 4 /* Extensions.Declaration */ ? 1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */ : extensions;
        // Don't do package.json lookup recursively, because Node.js' package lookup doesn't.
        // Disable `EsmMode` for the resolution of the package path for cjs-mode packages (so the `main` field can omit extensions)
        // (technically it only emits a deprecation warning in esm packages right now, but that's probably
        // enough to mean we don't need to support it)
        var features = state.features;
        var candidateIsFromPackageJsonField = state.candidateIsFromPackageJsonField;
        state.candidateIsFromPackageJsonField = true;
        if ((jsonContent === null || jsonContent === void 0 ? void 0 : jsonContent.type) !== "module") {
            state.features &= ~NodeResolutionFeatures.EsmMode;
        }
        var result = nodeLoadModuleByRelativeName(expandedExtensions, candidate, onlyRecordFailures, state, /*considerPackageJson*/ false);
        state.features = features;
        state.candidateIsFromPackageJsonField = candidateIsFromPackageJsonField;
        return result;
    };
    var onlyRecordFailuresForPackageFile = packageFile ? !(0, ts_1.directoryProbablyExists)((0, ts_1.getDirectoryPath)(packageFile), state.host) : undefined;
    var onlyRecordFailuresForIndex = onlyRecordFailures || !(0, ts_1.directoryProbablyExists)(candidate, state.host);
    var indexPath = (0, ts_1.combinePaths)(candidate, state.isConfigLookup ? "tsconfig" : "index");
    if (versionPaths && (!packageFile || (0, ts_1.containsPath)(candidate, packageFile))) {
        var moduleName = (0, ts_1.getRelativePathFromDirectory)(candidate, packageFile || indexPath, /*ignoreCase*/ false);
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_has_a_typesVersions_entry_0_that_matches_compiler_version_1_looking_for_a_pattern_to_match_module_name_2, versionPaths.version, ts_1.version, moduleName);
        }
        var result = tryLoadModuleUsingPaths(extensions, moduleName, candidate, versionPaths.paths, /*pathPatterns*/ undefined, loader, onlyRecordFailuresForPackageFile || onlyRecordFailuresForIndex, state);
        if (result) {
            return removeIgnoredPackageId(result.value);
        }
    }
    // It won't have a `packageId` set, because we disabled `considerPackageJson`.
    var packageFileResult = packageFile && removeIgnoredPackageId(loader(extensions, packageFile, onlyRecordFailuresForPackageFile, state));
    if (packageFileResult)
        return packageFileResult;
    // esm mode resolutions don't do package `index` lookups
    if (!(state.features & NodeResolutionFeatures.EsmMode)) {
        return loadModuleFromFile(extensions, indexPath, onlyRecordFailuresForIndex, state);
    }
}
/** Resolve from an arbitrarily specified file. Return `undefined` if it has an unsupported extension. */
function resolvedIfExtensionMatches(extensions, path, resolvedUsingTsExtension) {
    var ext = (0, ts_1.tryGetExtensionFromPath)(path);
    return ext !== undefined && extensionIsOk(extensions, ext) ? { path: path, ext: ext, resolvedUsingTsExtension: resolvedUsingTsExtension } : undefined;
}
/** True if `extension` is one of the supported `extensions`. */
function extensionIsOk(extensions, extension) {
    return extensions & 2 /* Extensions.JavaScript */ && (extension === ".js" /* Extension.Js */ || extension === ".jsx" /* Extension.Jsx */ || extension === ".mjs" /* Extension.Mjs */ || extension === ".cjs" /* Extension.Cjs */)
        || extensions & 1 /* Extensions.TypeScript */ && (extension === ".ts" /* Extension.Ts */ || extension === ".tsx" /* Extension.Tsx */ || extension === ".mts" /* Extension.Mts */ || extension === ".cts" /* Extension.Cts */)
        || extensions & 4 /* Extensions.Declaration */ && (extension === ".d.ts" /* Extension.Dts */ || extension === ".d.mts" /* Extension.Dmts */ || extension === ".d.cts" /* Extension.Dcts */)
        || extensions & 8 /* Extensions.Json */ && extension === ".json" /* Extension.Json */
        || false;
}
/** @internal */
function parsePackageName(moduleName) {
    var idx = moduleName.indexOf(ts_1.directorySeparator);
    if (moduleName[0] === "@") {
        idx = moduleName.indexOf(ts_1.directorySeparator, idx + 1);
    }
    return idx === -1 ? { packageName: moduleName, rest: "" } : { packageName: moduleName.slice(0, idx), rest: moduleName.slice(idx + 1) };
}
exports.parsePackageName = parsePackageName;
/** @internal */
function allKeysStartWithDot(obj) {
    return (0, ts_1.every)((0, ts_1.getOwnKeys)(obj), function (k) { return (0, ts_1.startsWith)(k, "."); });
}
exports.allKeysStartWithDot = allKeysStartWithDot;
function noKeyStartsWithDot(obj) {
    return !(0, ts_1.some)((0, ts_1.getOwnKeys)(obj), function (k) { return (0, ts_1.startsWith)(k, "."); });
}
function loadModuleFromSelfNameReference(extensions, moduleName, directory, state, cache, redirectedReference) {
    var _a, _b;
    var directoryPath = (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.combinePaths)(directory, "dummy"), (_b = (_a = state.host).getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(_a));
    var scope = getPackageScopeForPath(directoryPath, state);
    if (!scope || !scope.contents.packageJsonContent.exports) {
        return undefined;
    }
    if (typeof scope.contents.packageJsonContent.name !== "string") {
        return undefined;
    }
    var parts = (0, ts_1.getPathComponents)(moduleName); // unrooted paths should have `""` as their 0th entry
    var nameParts = (0, ts_1.getPathComponents)(scope.contents.packageJsonContent.name);
    if (!(0, ts_1.every)(nameParts, function (p, i) { return parts[i] === p; })) {
        return undefined;
    }
    var trailingParts = parts.slice(nameParts.length);
    var subpath = !(0, ts_1.length)(trailingParts) ? "." : ".".concat(ts_1.directorySeparator).concat(trailingParts.join(ts_1.directorySeparator));
    // Maybe TODO: splitting extensions into two priorities should be unnecessary, except
    // https://github.com/microsoft/TypeScript/issues/50762 makes the behavior different.
    // As long as that bug exists, we need to do two passes here in self-name loading
    // in order to be consistent with (non-self) library-name loading in
    // `loadModuleFromNearestNodeModulesDirectoryWorker`, which uses two passes in order
    // to prioritize `@types` packages higher up the directory tree over untyped
    // implementation packages.
    var priorityExtensions = extensions & (1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */);
    var secondaryExtensions = extensions & ~(1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */);
    return loadModuleFromExports(scope, priorityExtensions, subpath, state, cache, redirectedReference)
        || loadModuleFromExports(scope, secondaryExtensions, subpath, state, cache, redirectedReference);
}
function loadModuleFromExports(scope, extensions, subpath, state, cache, redirectedReference) {
    if (!scope.contents.packageJsonContent.exports) {
        return undefined;
    }
    if (subpath === ".") {
        var mainExport = void 0;
        if (typeof scope.contents.packageJsonContent.exports === "string" || Array.isArray(scope.contents.packageJsonContent.exports) || (typeof scope.contents.packageJsonContent.exports === "object" && noKeyStartsWithDot(scope.contents.packageJsonContent.exports))) {
            mainExport = scope.contents.packageJsonContent.exports;
        }
        else if ((0, ts_1.hasProperty)(scope.contents.packageJsonContent.exports, ".")) {
            mainExport = scope.contents.packageJsonContent.exports["."];
        }
        if (mainExport) {
            var loadModuleFromTargetImportOrExport = getLoadModuleFromTargetImportOrExport(extensions, state, cache, redirectedReference, subpath, scope, /*isImports*/ false);
            return loadModuleFromTargetImportOrExport(mainExport, "", /*pattern*/ false, ".");
        }
    }
    else if (allKeysStartWithDot(scope.contents.packageJsonContent.exports)) {
        if (typeof scope.contents.packageJsonContent.exports !== "object") {
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.Export_specifier_0_does_not_exist_in_package_json_scope_at_path_1, subpath, scope.packageDirectory);
            }
            return toSearchResult(/*value*/ undefined);
        }
        var result = loadModuleFromImportsOrExports(extensions, state, cache, redirectedReference, subpath, scope.contents.packageJsonContent.exports, scope, /*isImports*/ false);
        if (result) {
            return result;
        }
    }
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.Export_specifier_0_does_not_exist_in_package_json_scope_at_path_1, subpath, scope.packageDirectory);
    }
    return toSearchResult(/*value*/ undefined);
}
function loadModuleFromImports(extensions, moduleName, directory, state, cache, redirectedReference) {
    var _a, _b;
    if (moduleName === "#" || (0, ts_1.startsWith)(moduleName, "#/")) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Invalid_import_specifier_0_has_no_possible_resolutions, moduleName);
        }
        return toSearchResult(/*value*/ undefined);
    }
    var directoryPath = (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.combinePaths)(directory, "dummy"), (_b = (_a = state.host).getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(_a));
    var scope = getPackageScopeForPath(directoryPath, state);
    if (!scope) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Directory_0_has_no_containing_package_json_scope_Imports_will_not_resolve, directoryPath);
        }
        return toSearchResult(/*value*/ undefined);
    }
    if (!scope.contents.packageJsonContent.imports) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_no_imports_defined, scope.packageDirectory);
        }
        return toSearchResult(/*value*/ undefined);
    }
    var result = loadModuleFromImportsOrExports(extensions, state, cache, redirectedReference, moduleName, scope.contents.packageJsonContent.imports, scope, /*isImports*/ true);
    if (result) {
        return result;
    }
    if (state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.Import_specifier_0_does_not_exist_in_package_json_scope_at_path_1, moduleName, scope.packageDirectory);
    }
    return toSearchResult(/*value*/ undefined);
}
/**
 * @internal
 * From https://github.com/nodejs/node/blob/8f39f51cbbd3b2de14b9ee896e26421cc5b20121/lib/internal/modules/esm/resolve.js#L722 -
 * "longest" has some nuance as to what "longest" means in the presence of pattern trailers
 */
function comparePatternKeys(a, b) {
    var aPatternIndex = a.indexOf("*");
    var bPatternIndex = b.indexOf("*");
    var baseLenA = aPatternIndex === -1 ? a.length : aPatternIndex + 1;
    var baseLenB = bPatternIndex === -1 ? b.length : bPatternIndex + 1;
    if (baseLenA > baseLenB)
        return -1;
    if (baseLenB > baseLenA)
        return 1;
    if (aPatternIndex === -1)
        return 1;
    if (bPatternIndex === -1)
        return -1;
    if (a.length > b.length)
        return -1;
    if (b.length > a.length)
        return 1;
    return 0;
}
exports.comparePatternKeys = comparePatternKeys;
function loadModuleFromImportsOrExports(extensions, state, cache, redirectedReference, moduleName, lookupTable, scope, isImports) {
    var loadModuleFromTargetImportOrExport = getLoadModuleFromTargetImportOrExport(extensions, state, cache, redirectedReference, moduleName, scope, isImports);
    if (!(0, ts_1.endsWith)(moduleName, ts_1.directorySeparator) && moduleName.indexOf("*") === -1 && (0, ts_1.hasProperty)(lookupTable, moduleName)) {
        var target = lookupTable[moduleName];
        return loadModuleFromTargetImportOrExport(target, /*subpath*/ "", /*pattern*/ false, moduleName);
    }
    var expandingKeys = (0, ts_1.sort)((0, ts_1.filter)((0, ts_1.getOwnKeys)(lookupTable), function (k) { return k.indexOf("*") !== -1 || (0, ts_1.endsWith)(k, "/"); }), comparePatternKeys);
    for (var _i = 0, expandingKeys_1 = expandingKeys; _i < expandingKeys_1.length; _i++) {
        var potentialTarget = expandingKeys_1[_i];
        if (state.features & NodeResolutionFeatures.ExportsPatternTrailers && matchesPatternWithTrailer(potentialTarget, moduleName)) {
            var target = lookupTable[potentialTarget];
            var starPos = potentialTarget.indexOf("*");
            var subpath = moduleName.substring(potentialTarget.substring(0, starPos).length, moduleName.length - (potentialTarget.length - 1 - starPos));
            return loadModuleFromTargetImportOrExport(target, subpath, /*pattern*/ true, potentialTarget);
        }
        else if ((0, ts_1.endsWith)(potentialTarget, "*") && (0, ts_1.startsWith)(moduleName, potentialTarget.substring(0, potentialTarget.length - 1))) {
            var target = lookupTable[potentialTarget];
            var subpath = moduleName.substring(potentialTarget.length - 1);
            return loadModuleFromTargetImportOrExport(target, subpath, /*pattern*/ true, potentialTarget);
        }
        else if ((0, ts_1.startsWith)(moduleName, potentialTarget)) {
            var target = lookupTable[potentialTarget];
            var subpath = moduleName.substring(potentialTarget.length);
            return loadModuleFromTargetImportOrExport(target, subpath, /*pattern*/ false, potentialTarget);
        }
    }
    function matchesPatternWithTrailer(target, name) {
        if ((0, ts_1.endsWith)(target, "*"))
            return false; // handled by next case in loop
        var starPos = target.indexOf("*");
        if (starPos === -1)
            return false; // handled by last case in loop
        return (0, ts_1.startsWith)(name, target.substring(0, starPos)) && (0, ts_1.endsWith)(name, target.substring(starPos + 1));
    }
}
/**
 * Gets the self-recursive function specialized to retrieving the targeted import/export element for the given resolution configuration
 */
function getLoadModuleFromTargetImportOrExport(extensions, state, cache, redirectedReference, moduleName, scope, isImports) {
    return loadModuleFromTargetImportOrExport;
    function loadModuleFromTargetImportOrExport(target, subpath, pattern, key) {
        if (typeof target === "string") {
            if (!pattern && subpath.length > 0 && !(0, ts_1.endsWith)(target, "/")) {
                if (state.traceEnabled) {
                    trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_invalid_type_for_target_of_specifier_1, scope.packageDirectory, moduleName);
                }
                return toSearchResult(/*value*/ undefined);
            }
            if (!(0, ts_1.startsWith)(target, "./")) {
                if (isImports && !(0, ts_1.startsWith)(target, "../") && !(0, ts_1.startsWith)(target, "/") && !(0, ts_1.isRootedDiskPath)(target)) {
                    var combinedLookup = pattern ? target.replace(/\*/g, subpath) : target + subpath;
                    traceIfEnabled(state, ts_1.Diagnostics.Using_0_subpath_1_with_target_2, "imports", key, combinedLookup);
                    traceIfEnabled(state, ts_1.Diagnostics.Resolving_module_0_from_1, combinedLookup, scope.packageDirectory + "/");
                    var result = nodeModuleNameResolverWorker(state.features, combinedLookup, scope.packageDirectory + "/", state.compilerOptions, state.host, cache, extensions, /*isConfigLookup*/ false, redirectedReference);
                    return toSearchResult(result.resolvedModule ? {
                        path: result.resolvedModule.resolvedFileName,
                        extension: result.resolvedModule.extension,
                        packageId: result.resolvedModule.packageId,
                        originalPath: result.resolvedModule.originalPath,
                        resolvedUsingTsExtension: result.resolvedModule.resolvedUsingTsExtension
                    } : undefined);
                }
                if (state.traceEnabled) {
                    trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_invalid_type_for_target_of_specifier_1, scope.packageDirectory, moduleName);
                }
                return toSearchResult(/*value*/ undefined);
            }
            var parts = (0, ts_1.pathIsRelative)(target) ? (0, ts_1.getPathComponents)(target).slice(1) : (0, ts_1.getPathComponents)(target);
            var partsAfterFirst = parts.slice(1);
            if (partsAfterFirst.indexOf("..") >= 0 || partsAfterFirst.indexOf(".") >= 0 || partsAfterFirst.indexOf("node_modules") >= 0) {
                if (state.traceEnabled) {
                    trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_invalid_type_for_target_of_specifier_1, scope.packageDirectory, moduleName);
                }
                return toSearchResult(/*value*/ undefined);
            }
            var resolvedTarget = (0, ts_1.combinePaths)(scope.packageDirectory, target);
            // TODO: Assert that `resolvedTarget` is actually within the package directory? That's what the spec says.... but I'm not sure we need
            // to be in the business of validating everyone's import and export map correctness.
            var subpathParts = (0, ts_1.getPathComponents)(subpath);
            if (subpathParts.indexOf("..") >= 0 || subpathParts.indexOf(".") >= 0 || subpathParts.indexOf("node_modules") >= 0) {
                if (state.traceEnabled) {
                    trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_invalid_type_for_target_of_specifier_1, scope.packageDirectory, moduleName);
                }
                return toSearchResult(/*value*/ undefined);
            }
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.Using_0_subpath_1_with_target_2, isImports ? "imports" : "exports", key, pattern ? target.replace(/\*/g, subpath) : target + subpath);
            }
            var finalPath = toAbsolutePath(pattern ? resolvedTarget.replace(/\*/g, subpath) : resolvedTarget + subpath);
            var inputLink = tryLoadInputFileForPath(finalPath, subpath, (0, ts_1.combinePaths)(scope.packageDirectory, "package.json"), isImports);
            if (inputLink)
                return inputLink;
            return toSearchResult(withPackageId(scope, loadFileNameFromPackageJsonField(extensions, finalPath, /*onlyRecordFailures*/ false, state)));
        }
        else if (typeof target === "object" && target !== null) { // eslint-disable-line no-null/no-null
            if (!Array.isArray(target)) {
                traceIfEnabled(state, ts_1.Diagnostics.Entering_conditional_exports);
                for (var _i = 0, _a = (0, ts_1.getOwnKeys)(target); _i < _a.length; _i++) {
                    var condition = _a[_i];
                    if (condition === "default" || state.conditions.indexOf(condition) >= 0 || isApplicableVersionedTypesKey(state.conditions, condition)) {
                        traceIfEnabled(state, ts_1.Diagnostics.Matched_0_condition_1, isImports ? "imports" : "exports", condition);
                        var subTarget = target[condition];
                        var result = loadModuleFromTargetImportOrExport(subTarget, subpath, pattern, key);
                        if (result) {
                            traceIfEnabled(state, ts_1.Diagnostics.Resolved_under_condition_0, condition);
                            traceIfEnabled(state, ts_1.Diagnostics.Exiting_conditional_exports);
                            return result;
                        }
                        else {
                            traceIfEnabled(state, ts_1.Diagnostics.Failed_to_resolve_under_condition_0, condition);
                        }
                    }
                    else {
                        traceIfEnabled(state, ts_1.Diagnostics.Saw_non_matching_condition_0, condition);
                    }
                }
                traceIfEnabled(state, ts_1.Diagnostics.Exiting_conditional_exports);
                return undefined;
            }
            else {
                if (!(0, ts_1.length)(target)) {
                    if (state.traceEnabled) {
                        trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_invalid_type_for_target_of_specifier_1, scope.packageDirectory, moduleName);
                    }
                    return toSearchResult(/*value*/ undefined);
                }
                for (var _b = 0, target_2 = target; _b < target_2.length; _b++) {
                    var elem = target_2[_b];
                    var result = loadModuleFromTargetImportOrExport(elem, subpath, pattern, key);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        else if (target === null) { // eslint-disable-line no-null/no-null
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.package_json_scope_0_explicitly_maps_specifier_1_to_null, scope.packageDirectory, moduleName);
            }
            return toSearchResult(/*value*/ undefined);
        }
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_scope_0_has_invalid_type_for_target_of_specifier_1, scope.packageDirectory, moduleName);
        }
        return toSearchResult(/*value*/ undefined);
        function toAbsolutePath(path) {
            var _a, _b;
            if (path === undefined)
                return path;
            return (0, ts_1.getNormalizedAbsolutePath)(path, (_b = (_a = state.host).getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(_a));
        }
        function combineDirectoryPath(root, dir) {
            return (0, ts_1.ensureTrailingDirectorySeparator)((0, ts_1.combinePaths)(root, dir));
        }
        function useCaseSensitiveFileNames() {
            return !state.host.useCaseSensitiveFileNames ? true :
                typeof state.host.useCaseSensitiveFileNames === "boolean" ? state.host.useCaseSensitiveFileNames :
                    state.host.useCaseSensitiveFileNames();
        }
        function tryLoadInputFileForPath(finalPath, entry, packagePath, isImports) {
            var _a, _b, _c, _d;
            // Replace any references to outputs for files in the program with the input files to support package self-names used with outDir
            // PROBLEM: We don't know how to calculate the output paths yet, because the "common source directory" we use as the base of the file structure
            // we reproduce into the output directory is based on the set of input files, which we're still in the process of traversing and resolving!
            // _Given that_, we have to guess what the base of the output directory is (obviously the user wrote the export map, so has some idea what it is!).
            // We are going to probe _so many_ possible paths. We limit where we'll do this to try to reduce the possibilities of false positive lookups.
            if (!state.isConfigLookup
                && (state.compilerOptions.declarationDir || state.compilerOptions.outDir)
                && finalPath.indexOf("/node_modules/") === -1
                && (state.compilerOptions.configFile ? (0, ts_1.containsPath)(scope.packageDirectory, toAbsolutePath(state.compilerOptions.configFile.fileName), !useCaseSensitiveFileNames()) : true)) {
                // So that all means we'll only try these guesses for files outside `node_modules` in a directory where the `package.json` and `tsconfig.json` are siblings.
                // Even with all that, we still don't know if the root of the output file structure will be (relative to the package file)
                // `.`, `./src` or any other deeper directory structure. (If project references are used, it's definitely `.` by fiat, so that should be pretty common.)
                var getCanonicalFileName = (0, ts_1.hostGetCanonicalFileName)({ useCaseSensitiveFileNames: useCaseSensitiveFileNames });
                var commonSourceDirGuesses = [];
                // A `rootDir` compiler option strongly indicates the root location
                // A `composite` project is using project references and has it's common src dir set to `.`, so it shouldn't need to check any other locations
                if (state.compilerOptions.rootDir || (state.compilerOptions.composite && state.compilerOptions.configFilePath)) {
                    var commonDir = toAbsolutePath((0, ts_1.getCommonSourceDirectory)(state.compilerOptions, function () { return []; }, ((_b = (_a = state.host).getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(_a)) || "", getCanonicalFileName));
                    commonSourceDirGuesses.push(commonDir);
                }
                else if (state.requestContainingDirectory) {
                    // However without either of those set we're in the dark. Let's say you have
                    //
                    // ./tools/index.ts
                    // ./src/index.ts
                    // ./dist/index.js
                    // ./package.json <-- references ./dist/index.js
                    // ./tsconfig.json <-- loads ./src/index.ts
                    //
                    // How do we know `./src` is the common src dir, and not `./tools`, given only the `./dist` out dir and `./dist/index.js` filename?
                    // Answer: We... don't. We know we're looking for an `index.ts` input file, but we have _no clue_ which subfolder it's supposed to be loaded from
                    // without more context.
                    // But we do have more context! Just a tiny bit more! We're resolving an import _for some other input file_! And that input file, too
                    // must be inside the common source directory! So we propagate that tidbit of info all the way to here via state.requestContainingDirectory
                    var requestingFile_1 = toAbsolutePath((0, ts_1.combinePaths)(state.requestContainingDirectory, "index.ts"));
                    // And we can try every folder above the common folder for the request folder and the config/package base directory
                    // This technically can be wrong - we may load ./src/index.ts when ./src/sub/index.ts was right because we don't
                    // know if only `./src/sub` files were loaded by the program; but this has the best chance to be right of just about anything
                    // else we have. And, given that we're about to load `./src/index.ts` because we choose it as likely correct, there will then
                    // be a file outside of `./src/sub` in the program (the file we resolved to), making us de-facto right. So this fallback lookup
                    // logic may influence what files are pulled in by self-names, which in turn influences the output path shape, but it's all
                    // internally consistent so the paths should be stable so long as we prefer the "most general" (meaning: top-most-level directory) possible results first.
                    var commonDir = toAbsolutePath((0, ts_1.getCommonSourceDirectory)(state.compilerOptions, function () { return [requestingFile_1, toAbsolutePath(packagePath)]; }, ((_d = (_c = state.host).getCurrentDirectory) === null || _d === void 0 ? void 0 : _d.call(_c)) || "", getCanonicalFileName));
                    commonSourceDirGuesses.push(commonDir);
                    var fragment = (0, ts_1.ensureTrailingDirectorySeparator)(commonDir);
                    while (fragment && fragment.length > 1) {
                        var parts = (0, ts_1.getPathComponents)(fragment);
                        parts.pop(); // remove a directory
                        var commonDir_1 = (0, ts_1.getPathFromPathComponents)(parts);
                        commonSourceDirGuesses.unshift(commonDir_1);
                        fragment = (0, ts_1.ensureTrailingDirectorySeparator)(commonDir_1);
                    }
                }
                if (commonSourceDirGuesses.length > 1) {
                    state.reportDiagnostic((0, ts_1.createCompilerDiagnostic)(isImports
                        ? ts_1.Diagnostics.The_project_root_is_ambiguous_but_is_required_to_resolve_import_map_entry_0_in_file_1_Supply_the_rootDir_compiler_option_to_disambiguate
                        : ts_1.Diagnostics.The_project_root_is_ambiguous_but_is_required_to_resolve_export_map_entry_0_in_file_1_Supply_the_rootDir_compiler_option_to_disambiguate, entry === "" ? "." : entry, // replace empty string with `.` - the reverse of the operation done when entries are built - so main entrypoint errors don't look weird
                    packagePath));
                }
                for (var _i = 0, commonSourceDirGuesses_1 = commonSourceDirGuesses; _i < commonSourceDirGuesses_1.length; _i++) {
                    var commonSourceDirGuess = commonSourceDirGuesses_1[_i];
                    var candidateDirectories = getOutputDirectoriesForBaseDirectory(commonSourceDirGuess);
                    for (var _e = 0, candidateDirectories_1 = candidateDirectories; _e < candidateDirectories_1.length; _e++) {
                        var candidateDir = candidateDirectories_1[_e];
                        if ((0, ts_1.containsPath)(candidateDir, finalPath, !useCaseSensitiveFileNames())) {
                            // The matched export is looking up something in either the out declaration or js dir, now map the written path back into the source dir and source extension
                            var pathFragment = finalPath.slice(candidateDir.length + 1); // +1 to also remove directory seperator
                            var possibleInputBase = (0, ts_1.combinePaths)(commonSourceDirGuess, pathFragment);
                            var jsAndDtsExtensions = [".mjs" /* Extension.Mjs */, ".cjs" /* Extension.Cjs */, ".js" /* Extension.Js */, ".json" /* Extension.Json */, ".d.mts" /* Extension.Dmts */, ".d.cts" /* Extension.Dcts */, ".d.ts" /* Extension.Dts */];
                            for (var _f = 0, jsAndDtsExtensions_1 = jsAndDtsExtensions; _f < jsAndDtsExtensions_1.length; _f++) {
                                var ext = jsAndDtsExtensions_1[_f];
                                if ((0, ts_1.fileExtensionIs)(possibleInputBase, ext)) {
                                    var inputExts = (0, ts_1.getPossibleOriginalInputExtensionForExtension)(possibleInputBase);
                                    for (var _g = 0, inputExts_1 = inputExts; _g < inputExts_1.length; _g++) {
                                        var possibleExt = inputExts_1[_g];
                                        if (!extensionIsOk(extensions, possibleExt))
                                            continue;
                                        var possibleInputWithInputExtension = (0, ts_1.changeAnyExtension)(possibleInputBase, possibleExt, ext, !useCaseSensitiveFileNames());
                                        if (state.host.fileExists(possibleInputWithInputExtension)) {
                                            return toSearchResult(withPackageId(scope, loadFileNameFromPackageJsonField(extensions, possibleInputWithInputExtension, /*onlyRecordFailures*/ false, state)));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return undefined;
            function getOutputDirectoriesForBaseDirectory(commonSourceDirGuess) {
                var _a, _b;
                // Config file ouput paths are processed to be relative to the host's current directory, while
                // otherwise the paths are resolved relative to the common source dir the compiler puts together
                var currentDir = state.compilerOptions.configFile ? ((_b = (_a = state.host).getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(_a)) || "" : commonSourceDirGuess;
                var candidateDirectories = [];
                if (state.compilerOptions.declarationDir) {
                    candidateDirectories.push(toAbsolutePath(combineDirectoryPath(currentDir, state.compilerOptions.declarationDir)));
                }
                if (state.compilerOptions.outDir && state.compilerOptions.outDir !== state.compilerOptions.declarationDir) {
                    candidateDirectories.push(toAbsolutePath(combineDirectoryPath(currentDir, state.compilerOptions.outDir)));
                }
                return candidateDirectories;
            }
        }
    }
}
/** @internal */
function isApplicableVersionedTypesKey(conditions, key) {
    if (conditions.indexOf("types") === -1)
        return false; // only apply versioned types conditions if the types condition is applied
    if (!(0, ts_1.startsWith)(key, "types@"))
        return false;
    var range = ts_1.VersionRange.tryParse(key.substring("types@".length));
    if (!range)
        return false;
    return range.test(ts_1.version);
}
exports.isApplicableVersionedTypesKey = isApplicableVersionedTypesKey;
function loadModuleFromNearestNodeModulesDirectory(extensions, moduleName, directory, state, cache, redirectedReference) {
    return loadModuleFromNearestNodeModulesDirectoryWorker(extensions, moduleName, directory, state, /*typesScopeOnly*/ false, cache, redirectedReference);
}
function loadModuleFromNearestNodeModulesDirectoryTypesScope(moduleName, directory, state) {
    // Extensions parameter here doesn't actually matter, because typesOnly ensures we're just doing @types lookup, which is always DtsOnly.
    return loadModuleFromNearestNodeModulesDirectoryWorker(4 /* Extensions.Declaration */, moduleName, directory, state, /*typesScopeOnly*/ true, /*cache*/ undefined, /*redirectedReference*/ undefined);
}
function loadModuleFromNearestNodeModulesDirectoryWorker(extensions, moduleName, directory, state, typesScopeOnly, cache, redirectedReference) {
    var mode = state.features === 0 ? undefined : state.features & NodeResolutionFeatures.EsmMode ? ts_1.ModuleKind.ESNext : ts_1.ModuleKind.CommonJS;
    // Do (up to) two passes through node_modules:
    //   1. For each ancestor node_modules directory, try to find:
    //      i.  TS/DTS files in the implementation package
    //      ii. DTS files in the @types package
    //   2. For each ancestor node_modules directory, try to find:
    //      i.  JS files in the implementation package
    var priorityExtensions = extensions & (1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */);
    var secondaryExtensions = extensions & ~(1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */);
    // (1)
    if (priorityExtensions) {
        traceIfEnabled(state, ts_1.Diagnostics.Searching_all_ancestor_node_modules_directories_for_preferred_extensions_Colon_0, formatExtensions(priorityExtensions));
        var result = lookup(priorityExtensions);
        if (result)
            return result;
    }
    // (2)
    if (secondaryExtensions && !typesScopeOnly) {
        traceIfEnabled(state, ts_1.Diagnostics.Searching_all_ancestor_node_modules_directories_for_fallback_extensions_Colon_0, formatExtensions(secondaryExtensions));
        return lookup(secondaryExtensions);
    }
    function lookup(extensions) {
        return (0, ts_1.forEachAncestorDirectory)((0, ts_1.normalizeSlashes)(directory), function (ancestorDirectory) {
            if ((0, ts_1.getBaseFileName)(ancestorDirectory) !== "node_modules") {
                var resolutionFromCache = tryFindNonRelativeModuleNameInCache(cache, moduleName, mode, ancestorDirectory, redirectedReference, state);
                if (resolutionFromCache) {
                    return resolutionFromCache;
                }
                return toSearchResult(loadModuleFromImmediateNodeModulesDirectory(extensions, moduleName, ancestorDirectory, state, typesScopeOnly, cache, redirectedReference));
            }
        });
    }
}
function loadModuleFromImmediateNodeModulesDirectory(extensions, moduleName, directory, state, typesScopeOnly, cache, redirectedReference) {
    var nodeModulesFolder = (0, ts_1.combinePaths)(directory, "node_modules");
    var nodeModulesFolderExists = (0, ts_1.directoryProbablyExists)(nodeModulesFolder, state.host);
    if (!nodeModulesFolderExists && state.traceEnabled) {
        trace(state.host, ts_1.Diagnostics.Directory_0_does_not_exist_skipping_all_lookups_in_it, nodeModulesFolder);
    }
    if (!typesScopeOnly) {
        var packageResult = loadModuleFromSpecificNodeModulesDirectory(extensions, moduleName, nodeModulesFolder, nodeModulesFolderExists, state, cache, redirectedReference);
        if (packageResult) {
            return packageResult;
        }
    }
    if (extensions & 4 /* Extensions.Declaration */) {
        var nodeModulesAtTypes_1 = (0, ts_1.combinePaths)(nodeModulesFolder, "@types");
        var nodeModulesAtTypesExists = nodeModulesFolderExists;
        if (nodeModulesFolderExists && !(0, ts_1.directoryProbablyExists)(nodeModulesAtTypes_1, state.host)) {
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.Directory_0_does_not_exist_skipping_all_lookups_in_it, nodeModulesAtTypes_1);
            }
            nodeModulesAtTypesExists = false;
        }
        return loadModuleFromSpecificNodeModulesDirectory(4 /* Extensions.Declaration */, mangleScopedPackageNameWithTrace(moduleName, state), nodeModulesAtTypes_1, nodeModulesAtTypesExists, state, cache, redirectedReference);
    }
}
function loadModuleFromSpecificNodeModulesDirectory(extensions, moduleName, nodeModulesDirectory, nodeModulesDirectoryExists, state, cache, redirectedReference) {
    var _a, _b, _c;
    var candidate = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(nodeModulesDirectory, moduleName));
    var _d = parsePackageName(moduleName), packageName = _d.packageName, rest = _d.rest;
    var packageDirectory = (0, ts_1.combinePaths)(nodeModulesDirectory, packageName);
    var rootPackageInfo;
    // First look for a nested package.json, as in `node_modules/foo/bar/package.json`.
    var packageInfo = getPackageJsonInfo(candidate, !nodeModulesDirectoryExists, state);
    // But only if we're not respecting export maps (if we are, we might redirect around this location)
    if (rest !== "" && packageInfo && (!(state.features & NodeResolutionFeatures.Exports) ||
        !(0, ts_1.hasProperty)((_b = (_a = (rootPackageInfo = getPackageJsonInfo(packageDirectory, !nodeModulesDirectoryExists, state))) === null || _a === void 0 ? void 0 : _a.contents.packageJsonContent) !== null && _b !== void 0 ? _b : ts_1.emptyArray, "exports"))) {
        var fromFile = loadModuleFromFile(extensions, candidate, !nodeModulesDirectoryExists, state);
        if (fromFile) {
            return noPackageId(fromFile);
        }
        var fromDirectory = loadNodeModuleFromDirectoryWorker(extensions, candidate, !nodeModulesDirectoryExists, state, packageInfo.contents.packageJsonContent, getVersionPathsOfPackageJsonInfo(packageInfo, state));
        return withPackageId(packageInfo, fromDirectory);
    }
    var loader = function (extensions, candidate, onlyRecordFailures, state) {
        var pathAndExtension = (rest || !(state.features & NodeResolutionFeatures.EsmMode)) && loadModuleFromFile(extensions, candidate, onlyRecordFailures, state) ||
            loadNodeModuleFromDirectoryWorker(extensions, candidate, onlyRecordFailures, state, packageInfo && packageInfo.contents.packageJsonContent, packageInfo && getVersionPathsOfPackageJsonInfo(packageInfo, state));
        if (!pathAndExtension && packageInfo
            // eslint-disable-next-line no-null/no-null
            && (packageInfo.contents.packageJsonContent.exports === undefined || packageInfo.contents.packageJsonContent.exports === null)
            && state.features & NodeResolutionFeatures.EsmMode) {
            // EsmMode disables index lookup in `loadNodeModuleFromDirectoryWorker` generally, however non-relative package resolutions still assume
            // a default `index.js` entrypoint if no `main` or `exports` are present
            pathAndExtension = loadModuleFromFile(extensions, (0, ts_1.combinePaths)(candidate, "index.js"), onlyRecordFailures, state);
        }
        return withPackageId(packageInfo, pathAndExtension);
    };
    if (rest !== "") {
        // Previous `packageInfo` may have been from a nested package.json; ensure we have the one from the package root now.
        packageInfo = rootPackageInfo !== null && rootPackageInfo !== void 0 ? rootPackageInfo : getPackageJsonInfo(packageDirectory, !nodeModulesDirectoryExists, state);
    }
    // package exports are higher priority than file/directory/typesVersions lookups and (and, if there's exports present, blocks them)
    if (packageInfo && packageInfo.contents.packageJsonContent.exports && state.features & NodeResolutionFeatures.Exports) {
        return (_c = loadModuleFromExports(packageInfo, extensions, (0, ts_1.combinePaths)(".", rest), state, cache, redirectedReference)) === null || _c === void 0 ? void 0 : _c.value;
    }
    var versionPaths = rest !== "" && packageInfo ? getVersionPathsOfPackageJsonInfo(packageInfo, state) : undefined;
    if (versionPaths) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.package_json_has_a_typesVersions_entry_0_that_matches_compiler_version_1_looking_for_a_pattern_to_match_module_name_2, versionPaths.version, ts_1.version, rest);
        }
        var packageDirectoryExists = nodeModulesDirectoryExists && (0, ts_1.directoryProbablyExists)(packageDirectory, state.host);
        var fromPaths = tryLoadModuleUsingPaths(extensions, rest, packageDirectory, versionPaths.paths, /*pathPatterns*/ undefined, loader, !packageDirectoryExists, state);
        if (fromPaths) {
            return fromPaths.value;
        }
    }
    return loader(extensions, candidate, !nodeModulesDirectoryExists, state);
}
function tryLoadModuleUsingPaths(extensions, moduleName, baseDirectory, paths, pathPatterns, loader, onlyRecordFailures, state) {
    pathPatterns || (pathPatterns = (0, ts_1.tryParsePatterns)(paths));
    var matchedPattern = (0, ts_1.matchPatternOrExact)(pathPatterns, moduleName);
    if (matchedPattern) {
        var matchedStar_1 = (0, ts_1.isString)(matchedPattern) ? undefined : (0, ts_1.matchedText)(matchedPattern, moduleName);
        var matchedPatternText = (0, ts_1.isString)(matchedPattern) ? matchedPattern : (0, ts_1.patternText)(matchedPattern);
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Module_name_0_matched_pattern_1, moduleName, matchedPatternText);
        }
        var resolved = (0, ts_1.forEach)(paths[matchedPatternText], function (subst) {
            var path = matchedStar_1 ? subst.replace("*", matchedStar_1) : subst;
            // When baseUrl is not specified, the command line parser resolves relative paths to the config file location.
            var candidate = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(baseDirectory, path));
            if (state.traceEnabled) {
                trace(state.host, ts_1.Diagnostics.Trying_substitution_0_candidate_module_location_Colon_1, subst, path);
            }
            // A path mapping may have an extension, in contrast to an import, which should omit it.
            var extension = (0, ts_1.tryGetExtensionFromPath)(subst);
            if (extension !== undefined) {
                var path_1 = tryFile(candidate, onlyRecordFailures, state);
                if (path_1 !== undefined) {
                    return noPackageId({ path: path_1, ext: extension, resolvedUsingTsExtension: undefined });
                }
            }
            return loader(extensions, candidate, onlyRecordFailures || !(0, ts_1.directoryProbablyExists)((0, ts_1.getDirectoryPath)(candidate), state.host), state);
        });
        return { value: resolved };
    }
}
/** Double underscores are used in DefinitelyTyped to delimit scoped packages. */
var mangledScopedPackageSeparator = "__";
/** For a scoped package, we must look in `@types/foo__bar` instead of `@types/@foo/bar`. */
function mangleScopedPackageNameWithTrace(packageName, state) {
    var mangled = mangleScopedPackageName(packageName);
    if (state.traceEnabled && mangled !== packageName) {
        trace(state.host, ts_1.Diagnostics.Scoped_package_detected_looking_in_0, mangled);
    }
    return mangled;
}
/** @internal */
function getTypesPackageName(packageName) {
    return "@types/".concat(mangleScopedPackageName(packageName));
}
exports.getTypesPackageName = getTypesPackageName;
/** @internal */
function mangleScopedPackageName(packageName) {
    if ((0, ts_1.startsWith)(packageName, "@")) {
        var replaceSlash = packageName.replace(ts_1.directorySeparator, mangledScopedPackageSeparator);
        if (replaceSlash !== packageName) {
            return replaceSlash.slice(1); // Take off the "@"
        }
    }
    return packageName;
}
exports.mangleScopedPackageName = mangleScopedPackageName;
/** @internal */
function getPackageNameFromTypesPackageName(mangledName) {
    var withoutAtTypePrefix = (0, ts_1.removePrefix)(mangledName, "@types/");
    if (withoutAtTypePrefix !== mangledName) {
        return unmangleScopedPackageName(withoutAtTypePrefix);
    }
    return mangledName;
}
exports.getPackageNameFromTypesPackageName = getPackageNameFromTypesPackageName;
/** @internal */
function unmangleScopedPackageName(typesPackageName) {
    return (0, ts_1.stringContains)(typesPackageName, mangledScopedPackageSeparator) ?
        "@" + typesPackageName.replace(mangledScopedPackageSeparator, ts_1.directorySeparator) :
        typesPackageName;
}
exports.unmangleScopedPackageName = unmangleScopedPackageName;
function tryFindNonRelativeModuleNameInCache(cache, moduleName, mode, containingDirectory, redirectedReference, state) {
    var result = cache && cache.getFromNonRelativeNameCache(moduleName, mode, containingDirectory, redirectedReference);
    if (result) {
        if (state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Resolution_for_module_0_was_found_in_cache_from_location_1, moduleName, containingDirectory);
        }
        state.resultFromCache = result;
        return {
            value: result.resolvedModule && {
                path: result.resolvedModule.resolvedFileName,
                originalPath: result.resolvedModule.originalPath || true,
                extension: result.resolvedModule.extension,
                packageId: result.resolvedModule.packageId,
                resolvedUsingTsExtension: result.resolvedModule.resolvedUsingTsExtension
            }
        };
    }
}
function classicNameResolver(moduleName, containingFile, compilerOptions, host, cache, redirectedReference) {
    var traceEnabled = isTraceEnabled(compilerOptions, host);
    var failedLookupLocations = [];
    var affectingLocations = [];
    var containingDirectory = (0, ts_1.getDirectoryPath)(containingFile);
    var diagnostics = [];
    var state = {
        compilerOptions: compilerOptions,
        host: host,
        traceEnabled: traceEnabled,
        failedLookupLocations: failedLookupLocations,
        affectingLocations: affectingLocations,
        packageJsonInfoCache: cache,
        features: NodeResolutionFeatures.None,
        conditions: [],
        requestContainingDirectory: containingDirectory,
        reportDiagnostic: function (diag) { return void diagnostics.push(diag); },
        isConfigLookup: false,
        candidateIsFromPackageJsonField: false,
    };
    var resolved = tryResolve(1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */) ||
        tryResolve(2 /* Extensions.JavaScript */ | (compilerOptions.resolveJsonModule ? 8 /* Extensions.Json */ : 0));
    // No originalPath because classic resolution doesn't resolve realPath
    return createResolvedModuleWithFailedLookupLocationsHandlingSymlink(moduleName, resolved && resolved.value, (resolved === null || resolved === void 0 ? void 0 : resolved.value) && pathContainsNodeModules(resolved.value.path), failedLookupLocations, affectingLocations, diagnostics, state);
    function tryResolve(extensions) {
        var resolvedUsingSettings = tryLoadModuleUsingOptionalResolutionSettings(extensions, moduleName, containingDirectory, loadModuleFromFileNoPackageId, state);
        if (resolvedUsingSettings) {
            return { value: resolvedUsingSettings };
        }
        if (!(0, ts_1.isExternalModuleNameRelative)(moduleName)) {
            // Climb up parent directories looking for a module.
            var resolved_3 = (0, ts_1.forEachAncestorDirectory)(containingDirectory, function (directory) {
                var resolutionFromCache = tryFindNonRelativeModuleNameInCache(cache, moduleName, /*mode*/ undefined, directory, redirectedReference, state);
                if (resolutionFromCache) {
                    return resolutionFromCache;
                }
                var searchName = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(directory, moduleName));
                return toSearchResult(loadModuleFromFileNoPackageId(extensions, searchName, /*onlyRecordFailures*/ false, state));
            });
            if (resolved_3)
                return resolved_3;
            if (extensions & (1 /* Extensions.TypeScript */ | 4 /* Extensions.Declaration */)) {
                // If we didn't find the file normally, look it up in @types.
                var resolved_4 = loadModuleFromNearestNodeModulesDirectoryTypesScope(moduleName, containingDirectory, state);
                if (extensions & 4 /* Extensions.Declaration */)
                    resolved_4 !== null && resolved_4 !== void 0 ? resolved_4 : (resolved_4 = resolveFromTypeRoot(moduleName, state));
                return resolved_4;
            }
        }
        else {
            var candidate = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(containingDirectory, moduleName));
            return toSearchResult(loadModuleFromFileNoPackageId(extensions, candidate, /*onlyRecordFailures*/ false, state));
        }
    }
}
exports.classicNameResolver = classicNameResolver;
function resolveFromTypeRoot(moduleName, state) {
    if (!state.compilerOptions.typeRoots)
        return;
    for (var _i = 0, _a = state.compilerOptions.typeRoots; _i < _a.length; _i++) {
        var typeRoot = _a[_i];
        var candidate = getCandidateFromTypeRoot(typeRoot, moduleName, state);
        var directoryExists = (0, ts_1.directoryProbablyExists)(typeRoot, state.host);
        if (!directoryExists && state.traceEnabled) {
            trace(state.host, ts_1.Diagnostics.Directory_0_does_not_exist_skipping_all_lookups_in_it, typeRoot);
        }
        var resolvedFromFile = loadModuleFromFile(4 /* Extensions.Declaration */, candidate, !directoryExists, state);
        if (resolvedFromFile) {
            var packageDirectory = parseNodeModuleFromPath(resolvedFromFile.path);
            var packageInfo = packageDirectory ? getPackageJsonInfo(packageDirectory, /*onlyRecordFailures*/ false, state) : undefined;
            return toSearchResult(withPackageId(packageInfo, resolvedFromFile));
        }
        var resolved = loadNodeModuleFromDirectory(4 /* Extensions.Declaration */, candidate, !directoryExists, state);
        if (resolved)
            return toSearchResult(resolved);
    }
}
// Program errors validate that `noEmit` or `emitDeclarationOnly` is also set,
// so this function doesn't check them to avoid propagating errors.
/** @internal */
function shouldAllowImportingTsExtension(compilerOptions, fromFileName) {
    return !!compilerOptions.allowImportingTsExtensions || fromFileName && (0, ts_1.isDeclarationFileName)(fromFileName);
}
exports.shouldAllowImportingTsExtension = shouldAllowImportingTsExtension;
/**
 * A host may load a module from a global cache of typings.
 * This is the minumum code needed to expose that functionality; the rest is in the host.
 *
 * @internal
 */
function loadModuleFromGlobalCache(moduleName, projectName, compilerOptions, host, globalCache, packageJsonInfoCache) {
    var traceEnabled = isTraceEnabled(compilerOptions, host);
    if (traceEnabled) {
        trace(host, ts_1.Diagnostics.Auto_discovery_for_typings_is_enabled_in_project_0_Running_extra_resolution_pass_for_module_1_using_cache_location_2, projectName, moduleName, globalCache);
    }
    var failedLookupLocations = [];
    var affectingLocations = [];
    var diagnostics = [];
    var state = {
        compilerOptions: compilerOptions,
        host: host,
        traceEnabled: traceEnabled,
        failedLookupLocations: failedLookupLocations,
        affectingLocations: affectingLocations,
        packageJsonInfoCache: packageJsonInfoCache,
        features: NodeResolutionFeatures.None,
        conditions: [],
        requestContainingDirectory: undefined,
        reportDiagnostic: function (diag) { return void diagnostics.push(diag); },
        isConfigLookup: false,
        candidateIsFromPackageJsonField: false,
    };
    var resolved = loadModuleFromImmediateNodeModulesDirectory(4 /* Extensions.Declaration */, moduleName, globalCache, state, /*typesScopeOnly*/ false, /*cache*/ undefined, /*redirectedReference*/ undefined);
    return createResolvedModuleWithFailedLookupLocations(resolved, 
    /*isExternalLibraryImport*/ true, failedLookupLocations, affectingLocations, diagnostics, state.resultFromCache);
}
exports.loadModuleFromGlobalCache = loadModuleFromGlobalCache;
/**
 * Wraps value to SearchResult.
 * @returns undefined if value is undefined or { value } otherwise
 */
function toSearchResult(value) {
    return value !== undefined ? { value: value } : undefined;
}
function traceIfEnabled(state, diagnostic) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (state.traceEnabled) {
        trace.apply(void 0, __spreadArray([state.host, diagnostic], args, false));
    }
}
