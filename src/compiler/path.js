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
exports.isNodeModulesDirectory = exports.forEachAncestorDirectory = exports.getRelativePathToDirectoryOrUrl = exports.getRelativePathFromFile = exports.convertToRelativePath = exports.getRelativePathFromDirectory = exports.getPathComponentsRelativeTo = exports.startsWithDirectory = exports.containsPath = exports.comparePaths = exports.comparePathsCaseInsensitive = exports.comparePathsCaseSensitive = exports.changeAnyExtension = exports.ensurePathIsNonModuleName = exports.ensureTrailingDirectorySeparator = exports.removeTrailingDirectorySeparator = exports.toPath = exports.getNormalizedAbsolutePathWithoutRoot = exports.normalizePath = exports.getNormalizedAbsolutePath = exports.getNormalizedPathComponents = exports.resolvePath = exports.combinePaths = exports.reducePathComponents = exports.normalizeSlashes = exports.getPathFromPathComponents = exports.getPathComponents = exports.getAnyExtensionFromPath = exports.getBaseFileName = exports.getDirectoryPath = exports.getRootLength = exports.hasTrailingDirectorySeparator = exports.fileExtensionIsOneOf = exports.fileExtensionIs = exports.hasExtension = exports.pathIsBareSpecifier = exports.pathIsRelative = exports.pathIsAbsolute = exports.isDiskPathRoot = exports.isRootedDiskPath = exports.isUrl = exports.isAnyDirectorySeparator = exports.altDirectorySeparator = exports.directorySeparator = void 0;
var ts_1 = require("./_namespaces/ts");
/**
 * Internally, we represent paths as strings with '/' as the directory separator.
 * When we make system calls (eg: LanguageServiceHost.getDirectory()),
 * we expect the host to correctly handle paths in our specified format.
 *
 * @internal
 */
exports.directorySeparator = "/";
/** @internal */
exports.altDirectorySeparator = "\\";
var urlSchemeSeparator = "://";
var backslashRegExp = /\\/g;
//// Path Tests
/**
 * Determines whether a charCode corresponds to `/` or `\`.
 *
 * @internal
 */
function isAnyDirectorySeparator(charCode) {
    return charCode === 47 /* CharacterCodes.slash */ || charCode === 92 /* CharacterCodes.backslash */;
}
exports.isAnyDirectorySeparator = isAnyDirectorySeparator;
/**
 * Determines whether a path starts with a URL scheme (e.g. starts with `http://`, `ftp://`, `file://`, etc.).
 *
 * @internal
 */
function isUrl(path) {
    return getEncodedRootLength(path) < 0;
}
exports.isUrl = isUrl;
/**
 * Determines whether a path is an absolute disk path (e.g. starts with `/`, or a dos path
 * like `c:`, `c:\` or `c:/`).
 *
 * @internal
 */
function isRootedDiskPath(path) {
    return getEncodedRootLength(path) > 0;
}
exports.isRootedDiskPath = isRootedDiskPath;
/**
 * Determines whether a path consists only of a path root.
 *
 * @internal
 */
function isDiskPathRoot(path) {
    var rootLength = getEncodedRootLength(path);
    return rootLength > 0 && rootLength === path.length;
}
exports.isDiskPathRoot = isDiskPathRoot;
/**
 * Determines whether a path starts with an absolute path component (i.e. `/`, `c:/`, `file://`, etc.).
 *
 * ```ts
 * // POSIX
 * pathIsAbsolute("/path/to/file.ext") === true
 * // DOS
 * pathIsAbsolute("c:/path/to/file.ext") === true
 * // URL
 * pathIsAbsolute("file:///path/to/file.ext") === true
 * // Non-absolute
 * pathIsAbsolute("path/to/file.ext") === false
 * pathIsAbsolute("./path/to/file.ext") === false
 * ```
 *
 * @internal
 */
function pathIsAbsolute(path) {
    return getEncodedRootLength(path) !== 0;
}
exports.pathIsAbsolute = pathIsAbsolute;
/**
 * Determines whether a path starts with a relative path component (i.e. `.` or `..`).
 *
 * @internal
 */
function pathIsRelative(path) {
    return /^\.\.?($|[\\/])/.test(path);
}
exports.pathIsRelative = pathIsRelative;
/**
 * Determines whether a path is neither relative nor absolute, e.g. "path/to/file".
 * Also known misleadingly as "non-relative".
 *
 * @internal
 */
function pathIsBareSpecifier(path) {
    return !pathIsAbsolute(path) && !pathIsRelative(path);
}
exports.pathIsBareSpecifier = pathIsBareSpecifier;
/** @internal */
function hasExtension(fileName) {
    return (0, ts_1.stringContains)(getBaseFileName(fileName), ".");
}
exports.hasExtension = hasExtension;
/** @internal */
function fileExtensionIs(path, extension) {
    return path.length > extension.length && (0, ts_1.endsWith)(path, extension);
}
exports.fileExtensionIs = fileExtensionIs;
/** @internal */
function fileExtensionIsOneOf(path, extensions) {
    for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
        var extension = extensions_1[_i];
        if (fileExtensionIs(path, extension)) {
            return true;
        }
    }
    return false;
}
exports.fileExtensionIsOneOf = fileExtensionIsOneOf;
/**
 * Determines whether a path has a trailing separator (`/` or `\\`).
 *
 * @internal
 */
function hasTrailingDirectorySeparator(path) {
    return path.length > 0 && isAnyDirectorySeparator(path.charCodeAt(path.length - 1));
}
exports.hasTrailingDirectorySeparator = hasTrailingDirectorySeparator;
//// Path Parsing
function isVolumeCharacter(charCode) {
    return (charCode >= 97 /* CharacterCodes.a */ && charCode <= 122 /* CharacterCodes.z */) ||
        (charCode >= 65 /* CharacterCodes.A */ && charCode <= 90 /* CharacterCodes.Z */);
}
function getFileUrlVolumeSeparatorEnd(url, start) {
    var ch0 = url.charCodeAt(start);
    if (ch0 === 58 /* CharacterCodes.colon */)
        return start + 1;
    if (ch0 === 37 /* CharacterCodes.percent */ && url.charCodeAt(start + 1) === 51 /* CharacterCodes._3 */) {
        var ch2 = url.charCodeAt(start + 2);
        if (ch2 === 97 /* CharacterCodes.a */ || ch2 === 65 /* CharacterCodes.A */)
            return start + 3;
    }
    return -1;
}
/**
 * Returns length of the root part of a path or URL (i.e. length of "/", "x:/", "//server/share/, file:///user/files").
 * If the root is part of a URL, the twos-complement of the root length is returned.
 */
function getEncodedRootLength(path) {
    if (!path)
        return 0;
    var ch0 = path.charCodeAt(0);
    // POSIX or UNC
    if (ch0 === 47 /* CharacterCodes.slash */ || ch0 === 92 /* CharacterCodes.backslash */) {
        if (path.charCodeAt(1) !== ch0)
            return 1; // POSIX: "/" (or non-normalized "\")
        var p1 = path.indexOf(ch0 === 47 /* CharacterCodes.slash */ ? exports.directorySeparator : exports.altDirectorySeparator, 2);
        if (p1 < 0)
            return path.length; // UNC: "//server" or "\\server"
        return p1 + 1; // UNC: "//server/" or "\\server\"
    }
    // DOS
    if (isVolumeCharacter(ch0) && path.charCodeAt(1) === 58 /* CharacterCodes.colon */) {
        var ch2 = path.charCodeAt(2);
        if (ch2 === 47 /* CharacterCodes.slash */ || ch2 === 92 /* CharacterCodes.backslash */)
            return 3; // DOS: "c:/" or "c:\"
        if (path.length === 2)
            return 2; // DOS: "c:" (but not "c:d")
    }
    // URL
    var schemeEnd = path.indexOf(urlSchemeSeparator);
    if (schemeEnd !== -1) {
        var authorityStart = schemeEnd + urlSchemeSeparator.length;
        var authorityEnd = path.indexOf(exports.directorySeparator, authorityStart);
        if (authorityEnd !== -1) { // URL: "file:///", "file://server/", "file://server/path"
            // For local "file" URLs, include the leading DOS volume (if present).
            // Per https://www.ietf.org/rfc/rfc1738.txt, a host of "" or "localhost" is a
            // special case interpreted as "the machine from which the URL is being interpreted".
            var scheme = path.slice(0, schemeEnd);
            var authority = path.slice(authorityStart, authorityEnd);
            if (scheme === "file" && (authority === "" || authority === "localhost") &&
                isVolumeCharacter(path.charCodeAt(authorityEnd + 1))) {
                var volumeSeparatorEnd = getFileUrlVolumeSeparatorEnd(path, authorityEnd + 2);
                if (volumeSeparatorEnd !== -1) {
                    if (path.charCodeAt(volumeSeparatorEnd) === 47 /* CharacterCodes.slash */) {
                        // URL: "file:///c:/", "file://localhost/c:/", "file:///c%3a/", "file://localhost/c%3a/"
                        return ~(volumeSeparatorEnd + 1);
                    }
                    if (volumeSeparatorEnd === path.length) {
                        // URL: "file:///c:", "file://localhost/c:", "file:///c$3a", "file://localhost/c%3a"
                        // but not "file:///c:d" or "file:///c%3ad"
                        return ~volumeSeparatorEnd;
                    }
                }
            }
            return ~(authorityEnd + 1); // URL: "file://server/", "http://server/"
        }
        return ~path.length; // URL: "file://server", "http://server"
    }
    // relative
    return 0;
}
/**
 * Returns length of the root part of a path or URL (i.e. length of "/", "x:/", "//server/share/, file:///user/files").
 *
 * For example:
 * ```ts
 * getRootLength("a") === 0                   // ""
 * getRootLength("/") === 1                   // "/"
 * getRootLength("c:") === 2                  // "c:"
 * getRootLength("c:d") === 0                 // ""
 * getRootLength("c:/") === 3                 // "c:/"
 * getRootLength("c:\\") === 3                // "c:\\"
 * getRootLength("//server") === 7            // "//server"
 * getRootLength("//server/share") === 8      // "//server/"
 * getRootLength("\\\\server") === 7          // "\\\\server"
 * getRootLength("\\\\server\\share") === 8   // "\\\\server\\"
 * getRootLength("file:///path") === 8        // "file:///"
 * getRootLength("file:///c:") === 10         // "file:///c:"
 * getRootLength("file:///c:d") === 8         // "file:///"
 * getRootLength("file:///c:/path") === 11    // "file:///c:/"
 * getRootLength("file://server") === 13      // "file://server"
 * getRootLength("file://server/path") === 14 // "file://server/"
 * getRootLength("http://server") === 13      // "http://server"
 * getRootLength("http://server/path") === 14 // "http://server/"
 * ```
 *
 * @internal
 */
function getRootLength(path) {
    var rootLength = getEncodedRootLength(path);
    return rootLength < 0 ? ~rootLength : rootLength;
}
exports.getRootLength = getRootLength;
/** @internal */
function getDirectoryPath(path) {
    path = normalizeSlashes(path);
    // If the path provided is itself the root, then return it.
    var rootLength = getRootLength(path);
    if (rootLength === path.length)
        return path;
    // return the leading portion of the path up to the last (non-terminal) directory separator
    // but not including any trailing directory separator.
    path = removeTrailingDirectorySeparator(path);
    return path.slice(0, Math.max(rootLength, path.lastIndexOf(exports.directorySeparator)));
}
exports.getDirectoryPath = getDirectoryPath;
/** @internal */
function getBaseFileName(path, extensions, ignoreCase) {
    path = normalizeSlashes(path);
    // if the path provided is itself the root, then it has not file name.
    var rootLength = getRootLength(path);
    if (rootLength === path.length)
        return "";
    // return the trailing portion of the path starting after the last (non-terminal) directory
    // separator but not including any trailing directory separator.
    path = removeTrailingDirectorySeparator(path);
    var name = path.slice(Math.max(getRootLength(path), path.lastIndexOf(exports.directorySeparator) + 1));
    var extension = extensions !== undefined && ignoreCase !== undefined ? getAnyExtensionFromPath(name, extensions, ignoreCase) : undefined;
    return extension ? name.slice(0, name.length - extension.length) : name;
}
exports.getBaseFileName = getBaseFileName;
function tryGetExtensionFromPath(path, extension, stringEqualityComparer) {
    if (!(0, ts_1.startsWith)(extension, "."))
        extension = "." + extension;
    if (path.length >= extension.length && path.charCodeAt(path.length - extension.length) === 46 /* CharacterCodes.dot */) {
        var pathExtension = path.slice(path.length - extension.length);
        if (stringEqualityComparer(pathExtension, extension)) {
            return pathExtension;
        }
    }
}
function getAnyExtensionFromPathWorker(path, extensions, stringEqualityComparer) {
    if (typeof extensions === "string") {
        return tryGetExtensionFromPath(path, extensions, stringEqualityComparer) || "";
    }
    for (var _i = 0, extensions_2 = extensions; _i < extensions_2.length; _i++) {
        var extension = extensions_2[_i];
        var result = tryGetExtensionFromPath(path, extension, stringEqualityComparer);
        if (result)
            return result;
    }
    return "";
}
/** @internal */
function getAnyExtensionFromPath(path, extensions, ignoreCase) {
    // Retrieves any string from the final "." onwards from a base file name.
    // Unlike extensionFromPath, which throws an exception on unrecognized extensions.
    if (extensions) {
        return getAnyExtensionFromPathWorker(removeTrailingDirectorySeparator(path), extensions, ignoreCase ? ts_1.equateStringsCaseInsensitive : ts_1.equateStringsCaseSensitive);
    }
    var baseFileName = getBaseFileName(path);
    var extensionIndex = baseFileName.lastIndexOf(".");
    if (extensionIndex >= 0) {
        return baseFileName.substring(extensionIndex);
    }
    return "";
}
exports.getAnyExtensionFromPath = getAnyExtensionFromPath;
function pathComponents(path, rootLength) {
    var root = path.substring(0, rootLength);
    var rest = path.substring(rootLength).split(exports.directorySeparator);
    if (rest.length && !(0, ts_1.lastOrUndefined)(rest))
        rest.pop();
    return __spreadArray([root], rest, true);
}
function getPathComponents(path, currentDirectory) {
    if (currentDirectory === void 0) { currentDirectory = ""; }
    path = combinePaths(currentDirectory, path);
    return pathComponents(path, getRootLength(path));
}
exports.getPathComponents = getPathComponents;
//// Path Formatting
/**
 * Formats a parsed path consisting of a root component (at index 0) and zero or more path
 * segments (at indices > 0).
 *
 * ```ts
 * getPathFromPathComponents(["/", "path", "to", "file.ext"]) === "/path/to/file.ext"
 * ```
 *
 * @internal
 */
function getPathFromPathComponents(pathComponents, length) {
    if (pathComponents.length === 0)
        return "";
    var root = pathComponents[0] && ensureTrailingDirectorySeparator(pathComponents[0]);
    return root + pathComponents.slice(1, length).join(exports.directorySeparator);
}
exports.getPathFromPathComponents = getPathFromPathComponents;
//// Path Normalization
/**
 * Normalize path separators, converting `\` into `/`.
 *
 * @internal
 */
function normalizeSlashes(path) {
    return path.indexOf("\\") !== -1
        ? path.replace(backslashRegExp, exports.directorySeparator)
        : path;
}
exports.normalizeSlashes = normalizeSlashes;
/**
 * Reduce an array of path components to a more simplified path by navigating any
 * `"."` or `".."` entries in the path.
 *
 * @internal
 */
function reducePathComponents(components) {
    if (!(0, ts_1.some)(components))
        return [];
    var reduced = [components[0]];
    for (var i = 1; i < components.length; i++) {
        var component = components[i];
        if (!component)
            continue;
        if (component === ".")
            continue;
        if (component === "..") {
            if (reduced.length > 1) {
                if (reduced[reduced.length - 1] !== "..") {
                    reduced.pop();
                    continue;
                }
            }
            else if (reduced[0])
                continue;
        }
        reduced.push(component);
    }
    return reduced;
}
exports.reducePathComponents = reducePathComponents;
/**
 * Combines paths. If a path is absolute, it replaces any previous path. Relative paths are not simplified.
 *
 * ```ts
 * // Non-rooted
 * combinePaths("path", "to", "file.ext") === "path/to/file.ext"
 * combinePaths("path", "dir", "..", "to", "file.ext") === "path/dir/../to/file.ext"
 * // POSIX
 * combinePaths("/path", "to", "file.ext") === "/path/to/file.ext"
 * combinePaths("/path", "/to", "file.ext") === "/to/file.ext"
 * // DOS
 * combinePaths("c:/path", "to", "file.ext") === "c:/path/to/file.ext"
 * combinePaths("c:/path", "c:/to", "file.ext") === "c:/to/file.ext"
 * // URL
 * combinePaths("file:///path", "to", "file.ext") === "file:///path/to/file.ext"
 * combinePaths("file:///path", "file:///to", "file.ext") === "file:///to/file.ext"
 * ```
 *
 * @internal
 */
function combinePaths(path) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    if (path)
        path = normalizeSlashes(path);
    for (var _a = 0, paths_1 = paths; _a < paths_1.length; _a++) {
        var relativePath = paths_1[_a];
        if (!relativePath)
            continue;
        relativePath = normalizeSlashes(relativePath);
        if (!path || getRootLength(relativePath) !== 0) {
            path = relativePath;
        }
        else {
            path = ensureTrailingDirectorySeparator(path) + relativePath;
        }
    }
    return path;
}
exports.combinePaths = combinePaths;
/**
 * Combines and resolves paths. If a path is absolute, it replaces any previous path. Any
 * `.` and `..` path components are resolved. Trailing directory separators are preserved.
 *
 * ```ts
 * resolvePath("/path", "to", "file.ext") === "path/to/file.ext"
 * resolvePath("/path", "to", "file.ext/") === "path/to/file.ext/"
 * resolvePath("/path", "dir", "..", "to", "file.ext") === "path/to/file.ext"
 * ```
 *
 * @internal
 */
function resolvePath(path) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    return normalizePath((0, ts_1.some)(paths) ? combinePaths.apply(void 0, __spreadArray([path], paths, false)) : normalizeSlashes(path));
}
exports.resolvePath = resolvePath;
/**
 * Parse a path into an array containing a root component (at index 0) and zero or more path
 * components (at indices > 0). The result is normalized.
 * If the path is relative, the root component is `""`.
 * If the path is absolute, the root component includes the first path separator (`/`).
 *
 * ```ts
 * getNormalizedPathComponents("to/dir/../file.ext", "/path/") === ["/", "path", "to", "file.ext"]
 * ```
 *
 * @internal
 */
function getNormalizedPathComponents(path, currentDirectory) {
    return reducePathComponents(getPathComponents(path, currentDirectory));
}
exports.getNormalizedPathComponents = getNormalizedPathComponents;
/** @internal */
function getNormalizedAbsolutePath(fileName, currentDirectory) {
    return getPathFromPathComponents(getNormalizedPathComponents(fileName, currentDirectory));
}
exports.getNormalizedAbsolutePath = getNormalizedAbsolutePath;
/** @internal */
function normalizePath(path) {
    path = normalizeSlashes(path);
    // Most paths don't require normalization
    if (!relativePathSegmentRegExp.test(path)) {
        return path;
    }
    // Some paths only require cleanup of `/./` or leading `./`
    var simplified = path.replace(/\/\.\//g, "/").replace(/^\.\//, "");
    if (simplified !== path) {
        path = simplified;
        if (!relativePathSegmentRegExp.test(path)) {
            return path;
        }
    }
    // Other paths require full normalization
    var normalized = getPathFromPathComponents(reducePathComponents(getPathComponents(path)));
    return normalized && hasTrailingDirectorySeparator(path) ? ensureTrailingDirectorySeparator(normalized) : normalized;
}
exports.normalizePath = normalizePath;
function getPathWithoutRoot(pathComponents) {
    if (pathComponents.length === 0)
        return "";
    return pathComponents.slice(1).join(exports.directorySeparator);
}
/** @internal */
function getNormalizedAbsolutePathWithoutRoot(fileName, currentDirectory) {
    return getPathWithoutRoot(getNormalizedPathComponents(fileName, currentDirectory));
}
exports.getNormalizedAbsolutePathWithoutRoot = getNormalizedAbsolutePathWithoutRoot;
/** @internal */
function toPath(fileName, basePath, getCanonicalFileName) {
    var nonCanonicalizedPath = isRootedDiskPath(fileName)
        ? normalizePath(fileName)
        : getNormalizedAbsolutePath(fileName, basePath);
    return getCanonicalFileName(nonCanonicalizedPath);
}
exports.toPath = toPath;
/** @internal */
function removeTrailingDirectorySeparator(path) {
    if (hasTrailingDirectorySeparator(path)) {
        return path.substr(0, path.length - 1);
    }
    return path;
}
exports.removeTrailingDirectorySeparator = removeTrailingDirectorySeparator;
/** @internal */
function ensureTrailingDirectorySeparator(path) {
    if (!hasTrailingDirectorySeparator(path)) {
        return path + exports.directorySeparator;
    }
    return path;
}
exports.ensureTrailingDirectorySeparator = ensureTrailingDirectorySeparator;
/**
 * Ensures a path is either absolute (prefixed with `/` or `c:`) or dot-relative (prefixed
 * with `./` or `../`) so as not to be confused with an unprefixed module name.
 *
 * ```ts
 * ensurePathIsNonModuleName("/path/to/file.ext") === "/path/to/file.ext"
 * ensurePathIsNonModuleName("./path/to/file.ext") === "./path/to/file.ext"
 * ensurePathIsNonModuleName("../path/to/file.ext") === "../path/to/file.ext"
 * ensurePathIsNonModuleName("path/to/file.ext") === "./path/to/file.ext"
 * ```
 *
 * @internal
 */
function ensurePathIsNonModuleName(path) {
    return !pathIsAbsolute(path) && !pathIsRelative(path) ? "./" + path : path;
}
exports.ensurePathIsNonModuleName = ensurePathIsNonModuleName;
/** @internal */
function changeAnyExtension(path, ext, extensions, ignoreCase) {
    var pathext = extensions !== undefined && ignoreCase !== undefined ? getAnyExtensionFromPath(path, extensions, ignoreCase) : getAnyExtensionFromPath(path);
    return pathext ? path.slice(0, path.length - pathext.length) + ((0, ts_1.startsWith)(ext, ".") ? ext : "." + ext) : path;
}
exports.changeAnyExtension = changeAnyExtension;
//// Path Comparisons
// check path for these segments: '', '.'. '..'
var relativePathSegmentRegExp = /(?:\/\/)|(?:^|\/)\.\.?(?:$|\/)/;
function comparePathsWorker(a, b, componentComparer) {
    if (a === b)
        return 0 /* Comparison.EqualTo */;
    if (a === undefined)
        return -1 /* Comparison.LessThan */;
    if (b === undefined)
        return 1 /* Comparison.GreaterThan */;
    // NOTE: Performance optimization - shortcut if the root segments differ as there would be no
    //       need to perform path reduction.
    var aRoot = a.substring(0, getRootLength(a));
    var bRoot = b.substring(0, getRootLength(b));
    var result = (0, ts_1.compareStringsCaseInsensitive)(aRoot, bRoot);
    if (result !== 0 /* Comparison.EqualTo */) {
        return result;
    }
    // NOTE: Performance optimization - shortcut if there are no relative path segments in
    //       the non-root portion of the path
    var aRest = a.substring(aRoot.length);
    var bRest = b.substring(bRoot.length);
    if (!relativePathSegmentRegExp.test(aRest) && !relativePathSegmentRegExp.test(bRest)) {
        return componentComparer(aRest, bRest);
    }
    // The path contains a relative path segment. Normalize the paths and perform a slower component
    // by component comparison.
    var aComponents = reducePathComponents(getPathComponents(a));
    var bComponents = reducePathComponents(getPathComponents(b));
    var sharedLength = Math.min(aComponents.length, bComponents.length);
    for (var i = 1; i < sharedLength; i++) {
        var result_1 = componentComparer(aComponents[i], bComponents[i]);
        if (result_1 !== 0 /* Comparison.EqualTo */) {
            return result_1;
        }
    }
    return (0, ts_1.compareValues)(aComponents.length, bComponents.length);
}
/**
 * Performs a case-sensitive comparison of two paths. Path roots are always compared case-insensitively.
 *
 * @internal
 */
function comparePathsCaseSensitive(a, b) {
    return comparePathsWorker(a, b, ts_1.compareStringsCaseSensitive);
}
exports.comparePathsCaseSensitive = comparePathsCaseSensitive;
/**
 * Performs a case-insensitive comparison of two paths.
 *
 * @internal
 */
function comparePathsCaseInsensitive(a, b) {
    return comparePathsWorker(a, b, ts_1.compareStringsCaseInsensitive);
}
exports.comparePathsCaseInsensitive = comparePathsCaseInsensitive;
/** @internal */
function comparePaths(a, b, currentDirectory, ignoreCase) {
    if (typeof currentDirectory === "string") {
        a = combinePaths(currentDirectory, a);
        b = combinePaths(currentDirectory, b);
    }
    else if (typeof currentDirectory === "boolean") {
        ignoreCase = currentDirectory;
    }
    return comparePathsWorker(a, b, (0, ts_1.getStringComparer)(ignoreCase));
}
exports.comparePaths = comparePaths;
/** @internal */
function containsPath(parent, child, currentDirectory, ignoreCase) {
    if (typeof currentDirectory === "string") {
        parent = combinePaths(currentDirectory, parent);
        child = combinePaths(currentDirectory, child);
    }
    else if (typeof currentDirectory === "boolean") {
        ignoreCase = currentDirectory;
    }
    if (parent === undefined || child === undefined)
        return false;
    if (parent === child)
        return true;
    var parentComponents = reducePathComponents(getPathComponents(parent));
    var childComponents = reducePathComponents(getPathComponents(child));
    if (childComponents.length < parentComponents.length) {
        return false;
    }
    var componentEqualityComparer = ignoreCase ? ts_1.equateStringsCaseInsensitive : ts_1.equateStringsCaseSensitive;
    for (var i = 0; i < parentComponents.length; i++) {
        var equalityComparer = i === 0 ? ts_1.equateStringsCaseInsensitive : componentEqualityComparer;
        if (!equalityComparer(parentComponents[i], childComponents[i])) {
            return false;
        }
    }
    return true;
}
exports.containsPath = containsPath;
/**
 * Determines whether `fileName` starts with the specified `directoryName` using the provided path canonicalization callback.
 * Comparison is case-sensitive between the canonical paths.
 *
 * Use `containsPath` if file names are not already reduced and absolute.
 *
 * @internal
 */
function startsWithDirectory(fileName, directoryName, getCanonicalFileName) {
    var canonicalFileName = getCanonicalFileName(fileName);
    var canonicalDirectoryName = getCanonicalFileName(directoryName);
    return (0, ts_1.startsWith)(canonicalFileName, canonicalDirectoryName + "/") || (0, ts_1.startsWith)(canonicalFileName, canonicalDirectoryName + "\\");
}
exports.startsWithDirectory = startsWithDirectory;
//// Relative Paths
/** @internal */
function getPathComponentsRelativeTo(from, to, stringEqualityComparer, getCanonicalFileName) {
    var fromComponents = reducePathComponents(getPathComponents(from));
    var toComponents = reducePathComponents(getPathComponents(to));
    var start;
    for (start = 0; start < fromComponents.length && start < toComponents.length; start++) {
        var fromComponent = getCanonicalFileName(fromComponents[start]);
        var toComponent = getCanonicalFileName(toComponents[start]);
        var comparer = start === 0 ? ts_1.equateStringsCaseInsensitive : stringEqualityComparer;
        if (!comparer(fromComponent, toComponent))
            break;
    }
    if (start === 0) {
        return toComponents;
    }
    var components = toComponents.slice(start);
    var relative = [];
    for (; start < fromComponents.length; start++) {
        relative.push("..");
    }
    return __spreadArray(__spreadArray([""], relative, true), components, true);
}
exports.getPathComponentsRelativeTo = getPathComponentsRelativeTo;
/** @internal */
function getRelativePathFromDirectory(fromDirectory, to, getCanonicalFileNameOrIgnoreCase) {
    ts_1.Debug.assert((getRootLength(fromDirectory) > 0) === (getRootLength(to) > 0), "Paths must either both be absolute or both be relative");
    var getCanonicalFileName = typeof getCanonicalFileNameOrIgnoreCase === "function" ? getCanonicalFileNameOrIgnoreCase : ts_1.identity;
    var ignoreCase = typeof getCanonicalFileNameOrIgnoreCase === "boolean" ? getCanonicalFileNameOrIgnoreCase : false;
    var pathComponents = getPathComponentsRelativeTo(fromDirectory, to, ignoreCase ? ts_1.equateStringsCaseInsensitive : ts_1.equateStringsCaseSensitive, getCanonicalFileName);
    return getPathFromPathComponents(pathComponents);
}
exports.getRelativePathFromDirectory = getRelativePathFromDirectory;
/** @internal */
function convertToRelativePath(absoluteOrRelativePath, basePath, getCanonicalFileName) {
    return !isRootedDiskPath(absoluteOrRelativePath)
        ? absoluteOrRelativePath
        : getRelativePathToDirectoryOrUrl(basePath, absoluteOrRelativePath, basePath, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
}
exports.convertToRelativePath = convertToRelativePath;
/** @internal */
function getRelativePathFromFile(from, to, getCanonicalFileName) {
    return ensurePathIsNonModuleName(getRelativePathFromDirectory(getDirectoryPath(from), to, getCanonicalFileName));
}
exports.getRelativePathFromFile = getRelativePathFromFile;
/** @internal */
function getRelativePathToDirectoryOrUrl(directoryPathOrUrl, relativeOrAbsolutePath, currentDirectory, getCanonicalFileName, isAbsolutePathAnUrl) {
    var pathComponents = getPathComponentsRelativeTo(resolvePath(currentDirectory, directoryPathOrUrl), resolvePath(currentDirectory, relativeOrAbsolutePath), ts_1.equateStringsCaseSensitive, getCanonicalFileName);
    var firstComponent = pathComponents[0];
    if (isAbsolutePathAnUrl && isRootedDiskPath(firstComponent)) {
        var prefix = firstComponent.charAt(0) === exports.directorySeparator ? "file://" : "file:///";
        pathComponents[0] = prefix + firstComponent;
    }
    return getPathFromPathComponents(pathComponents);
}
exports.getRelativePathToDirectoryOrUrl = getRelativePathToDirectoryOrUrl;
/** @internal */
function forEachAncestorDirectory(directory, callback) {
    while (true) {
        var result = callback(directory);
        if (result !== undefined) {
            return result;
        }
        var parentPath = getDirectoryPath(directory);
        if (parentPath === directory) {
            return undefined;
        }
        directory = parentPath;
    }
}
exports.forEachAncestorDirectory = forEachAncestorDirectory;
/** @internal */
function isNodeModulesDirectory(dirPath) {
    return (0, ts_1.endsWith)(dirPath, "/node_modules");
}
exports.isNodeModulesDirectory = isNodeModulesDirectory;
