"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identitySourceMapConsumer = exports.createDocumentPositionMapper = exports.isSourceMapping = exports.sameMapping = exports.decodeMappings = exports.tryParseRawSourceMap = exports.isRawSourceMap = exports.tryGetSourceMappingURL = exports.getLineInfo = exports.whitespaceOrMapCommentRegExp = exports.sourceMapCommentRegExp = exports.sourceMapCommentRegExpDontCareLineStart = exports.createSourceMapGenerator = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
/** @internal */
function createSourceMapGenerator(host, file, sourceRoot, sourcesDirectoryPath, generatorOptions) {
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var _a = generatorOptions.extendedDiagnostics
        ? performance.createTimer("Source Map", "beforeSourcemap", "afterSourcemap")
        : performance.nullTimer, enter = _a.enter, exit = _a.exit;
    // Current source map file and its index in the sources list
    var rawSources = [];
    var sources = [];
    var sourceToSourceIndexMap = new Map();
    var sourcesContent;
    var names = [];
    var nameToNameIndexMap;
    var mappingCharCodes = [];
    var mappings = "";
    // Last recorded and encoded mappings
    var lastGeneratedLine = 0;
    var lastGeneratedCharacter = 0;
    var lastSourceIndex = 0;
    var lastSourceLine = 0;
    var lastSourceCharacter = 0;
    var lastNameIndex = 0;
    var hasLast = false;
    var pendingGeneratedLine = 0;
    var pendingGeneratedCharacter = 0;
    var pendingSourceIndex = 0;
    var pendingSourceLine = 0;
    var pendingSourceCharacter = 0;
    var pendingNameIndex = 0;
    var hasPending = false;
    var hasPendingSource = false;
    var hasPendingName = false;
    /* eslint-enable no-var */
    return {
        getSources: function () { return rawSources; },
        addSource: addSource,
        setSourceContent: setSourceContent,
        addName: addName,
        addMapping: addMapping,
        appendSourceMap: appendSourceMap,
        toJSON: toJSON,
        toString: function () { return JSON.stringify(toJSON()); }
    };
    function addSource(fileName) {
        enter();
        var source = (0, ts_1.getRelativePathToDirectoryOrUrl)(sourcesDirectoryPath, fileName, host.getCurrentDirectory(), host.getCanonicalFileName, 
        /*isAbsolutePathAnUrl*/ true);
        var sourceIndex = sourceToSourceIndexMap.get(source);
        if (sourceIndex === undefined) {
            sourceIndex = sources.length;
            sources.push(source);
            rawSources.push(fileName);
            sourceToSourceIndexMap.set(source, sourceIndex);
        }
        exit();
        return sourceIndex;
    }
    /* eslint-disable no-null/no-null */
    function setSourceContent(sourceIndex, content) {
        enter();
        if (content !== null) {
            if (!sourcesContent)
                sourcesContent = [];
            while (sourcesContent.length < sourceIndex) {
                sourcesContent.push(null);
            }
            sourcesContent[sourceIndex] = content;
        }
        exit();
    }
    /* eslint-enable no-null/no-null */
    function addName(name) {
        enter();
        if (!nameToNameIndexMap)
            nameToNameIndexMap = new Map();
        var nameIndex = nameToNameIndexMap.get(name);
        if (nameIndex === undefined) {
            nameIndex = names.length;
            names.push(name);
            nameToNameIndexMap.set(name, nameIndex);
        }
        exit();
        return nameIndex;
    }
    function isNewGeneratedPosition(generatedLine, generatedCharacter) {
        return !hasPending
            || pendingGeneratedLine !== generatedLine
            || pendingGeneratedCharacter !== generatedCharacter;
    }
    function isBacktrackingSourcePosition(sourceIndex, sourceLine, sourceCharacter) {
        return sourceIndex !== undefined
            && sourceLine !== undefined
            && sourceCharacter !== undefined
            && pendingSourceIndex === sourceIndex
            && (pendingSourceLine > sourceLine
                || pendingSourceLine === sourceLine && pendingSourceCharacter > sourceCharacter);
    }
    function addMapping(generatedLine, generatedCharacter, sourceIndex, sourceLine, sourceCharacter, nameIndex) {
        ts_1.Debug.assert(generatedLine >= pendingGeneratedLine, "generatedLine cannot backtrack");
        ts_1.Debug.assert(generatedCharacter >= 0, "generatedCharacter cannot be negative");
        ts_1.Debug.assert(sourceIndex === undefined || sourceIndex >= 0, "sourceIndex cannot be negative");
        ts_1.Debug.assert(sourceLine === undefined || sourceLine >= 0, "sourceLine cannot be negative");
        ts_1.Debug.assert(sourceCharacter === undefined || sourceCharacter >= 0, "sourceCharacter cannot be negative");
        enter();
        // If this location wasn't recorded or the location in source is going backwards, record the mapping
        if (isNewGeneratedPosition(generatedLine, generatedCharacter) ||
            isBacktrackingSourcePosition(sourceIndex, sourceLine, sourceCharacter)) {
            commitPendingMapping();
            pendingGeneratedLine = generatedLine;
            pendingGeneratedCharacter = generatedCharacter;
            hasPendingSource = false;
            hasPendingName = false;
            hasPending = true;
        }
        if (sourceIndex !== undefined && sourceLine !== undefined && sourceCharacter !== undefined) {
            pendingSourceIndex = sourceIndex;
            pendingSourceLine = sourceLine;
            pendingSourceCharacter = sourceCharacter;
            hasPendingSource = true;
            if (nameIndex !== undefined) {
                pendingNameIndex = nameIndex;
                hasPendingName = true;
            }
        }
        exit();
    }
    function appendSourceMap(generatedLine, generatedCharacter, map, sourceMapPath, start, end) {
        ts_1.Debug.assert(generatedLine >= pendingGeneratedLine, "generatedLine cannot backtrack");
        ts_1.Debug.assert(generatedCharacter >= 0, "generatedCharacter cannot be negative");
        enter();
        // First, decode the old component sourcemap
        var sourceIndexToNewSourceIndexMap = [];
        var nameIndexToNewNameIndexMap;
        var mappingIterator = decodeMappings(map.mappings);
        for (var _i = 0, mappingIterator_1 = mappingIterator; _i < mappingIterator_1.length; _i++) {
            var raw = mappingIterator_1[_i];
            if (end && (raw.generatedLine > end.line ||
                (raw.generatedLine === end.line && raw.generatedCharacter > end.character))) {
                break;
            }
            if (start && (raw.generatedLine < start.line ||
                (start.line === raw.generatedLine && raw.generatedCharacter < start.character))) {
                continue;
            }
            // Then reencode all the updated mappings into the overall map
            var newSourceIndex = void 0;
            var newSourceLine = void 0;
            var newSourceCharacter = void 0;
            var newNameIndex = void 0;
            if (raw.sourceIndex !== undefined) {
                newSourceIndex = sourceIndexToNewSourceIndexMap[raw.sourceIndex];
                if (newSourceIndex === undefined) {
                    // Apply offsets to each position and fixup source entries
                    var rawPath = map.sources[raw.sourceIndex];
                    var relativePath = map.sourceRoot ? (0, ts_1.combinePaths)(map.sourceRoot, rawPath) : rawPath;
                    var combinedPath = (0, ts_1.combinePaths)((0, ts_1.getDirectoryPath)(sourceMapPath), relativePath);
                    sourceIndexToNewSourceIndexMap[raw.sourceIndex] = newSourceIndex = addSource(combinedPath);
                    if (map.sourcesContent && typeof map.sourcesContent[raw.sourceIndex] === "string") {
                        setSourceContent(newSourceIndex, map.sourcesContent[raw.sourceIndex]);
                    }
                }
                newSourceLine = raw.sourceLine;
                newSourceCharacter = raw.sourceCharacter;
                if (map.names && raw.nameIndex !== undefined) {
                    if (!nameIndexToNewNameIndexMap)
                        nameIndexToNewNameIndexMap = [];
                    newNameIndex = nameIndexToNewNameIndexMap[raw.nameIndex];
                    if (newNameIndex === undefined) {
                        nameIndexToNewNameIndexMap[raw.nameIndex] = newNameIndex = addName(map.names[raw.nameIndex]);
                    }
                }
            }
            var rawGeneratedLine = raw.generatedLine - (start ? start.line : 0);
            var newGeneratedLine = rawGeneratedLine + generatedLine;
            var rawGeneratedCharacter = start && start.line === raw.generatedLine ? raw.generatedCharacter - start.character : raw.generatedCharacter;
            var newGeneratedCharacter = rawGeneratedLine === 0 ? rawGeneratedCharacter + generatedCharacter : rawGeneratedCharacter;
            addMapping(newGeneratedLine, newGeneratedCharacter, newSourceIndex, newSourceLine, newSourceCharacter, newNameIndex);
        }
        exit();
    }
    function shouldCommitMapping() {
        return !hasLast
            || lastGeneratedLine !== pendingGeneratedLine
            || lastGeneratedCharacter !== pendingGeneratedCharacter
            || lastSourceIndex !== pendingSourceIndex
            || lastSourceLine !== pendingSourceLine
            || lastSourceCharacter !== pendingSourceCharacter
            || lastNameIndex !== pendingNameIndex;
    }
    function appendMappingCharCode(charCode) {
        mappingCharCodes.push(charCode);
        // String.fromCharCode accepts its arguments on the stack, so we have to chunk the input,
        // otherwise we can get stack overflows for large source maps
        if (mappingCharCodes.length >= 1024) {
            flushMappingBuffer();
        }
    }
    function commitPendingMapping() {
        if (!hasPending || !shouldCommitMapping()) {
            return;
        }
        enter();
        // Line/Comma delimiters
        if (lastGeneratedLine < pendingGeneratedLine) {
            // Emit line delimiters
            do {
                appendMappingCharCode(59 /* CharacterCodes.semicolon */);
                lastGeneratedLine++;
            } while (lastGeneratedLine < pendingGeneratedLine);
            // Only need to set this once
            lastGeneratedCharacter = 0;
        }
        else {
            ts_1.Debug.assertEqual(lastGeneratedLine, pendingGeneratedLine, "generatedLine cannot backtrack");
            // Emit comma to separate the entry
            if (hasLast) {
                appendMappingCharCode(44 /* CharacterCodes.comma */);
            }
        }
        // 1. Relative generated character
        appendBase64VLQ(pendingGeneratedCharacter - lastGeneratedCharacter);
        lastGeneratedCharacter = pendingGeneratedCharacter;
        if (hasPendingSource) {
            // 2. Relative sourceIndex
            appendBase64VLQ(pendingSourceIndex - lastSourceIndex);
            lastSourceIndex = pendingSourceIndex;
            // 3. Relative source line
            appendBase64VLQ(pendingSourceLine - lastSourceLine);
            lastSourceLine = pendingSourceLine;
            // 4. Relative source character
            appendBase64VLQ(pendingSourceCharacter - lastSourceCharacter);
            lastSourceCharacter = pendingSourceCharacter;
            if (hasPendingName) {
                // 5. Relative nameIndex
                appendBase64VLQ(pendingNameIndex - lastNameIndex);
                lastNameIndex = pendingNameIndex;
            }
        }
        hasLast = true;
        exit();
    }
    function flushMappingBuffer() {
        if (mappingCharCodes.length > 0) {
            mappings += String.fromCharCode.apply(undefined, mappingCharCodes);
            mappingCharCodes.length = 0;
        }
    }
    function toJSON() {
        commitPendingMapping();
        flushMappingBuffer();
        return {
            version: 3,
            file: file,
            sourceRoot: sourceRoot,
            sources: sources,
            names: names,
            mappings: mappings,
            sourcesContent: sourcesContent,
        };
    }
    function appendBase64VLQ(inValue) {
        // Add a new least significant bit that has the sign of the value.
        // if negative number the least significant bit that gets added to the number has value 1
        // else least significant bit value that gets added is 0
        // eg. -1 changes to binary : 01 [1] => 3
        //     +1 changes to binary : 01 [0] => 2
        if (inValue < 0) {
            inValue = ((-inValue) << 1) + 1;
        }
        else {
            inValue = inValue << 1;
        }
        // Encode 5 bits at a time starting from least significant bits
        do {
            var currentDigit = inValue & 31; // 11111
            inValue = inValue >> 5;
            if (inValue > 0) {
                // There are still more digits to decode, set the msb (6th bit)
                currentDigit = currentDigit | 32;
            }
            appendMappingCharCode(base64FormatEncode(currentDigit));
        } while (inValue > 0);
    }
}
exports.createSourceMapGenerator = createSourceMapGenerator;
// Sometimes tools can see the following line as a source mapping url comment, so we mangle it a bit (the [M])
/** @internal */
exports.sourceMapCommentRegExpDontCareLineStart = /\/\/[@#] source[M]appingURL=(.+)\r?\n?$/;
/** @internal */
exports.sourceMapCommentRegExp = /^\/\/[@#] source[M]appingURL=(.+)\r?\n?$/;
/** @internal */
exports.whitespaceOrMapCommentRegExp = /^\s*(\/\/[@#] .*)?$/;
/** @internal */
function getLineInfo(text, lineStarts) {
    return {
        getLineCount: function () { return lineStarts.length; },
        getLineText: function (line) { return text.substring(lineStarts[line], lineStarts[line + 1]); }
    };
}
exports.getLineInfo = getLineInfo;
/**
 * Tries to find the sourceMappingURL comment at the end of a file.
 *
 * @internal
 */
function tryGetSourceMappingURL(lineInfo) {
    for (var index = lineInfo.getLineCount() - 1; index >= 0; index--) {
        var line = lineInfo.getLineText(index);
        var comment = exports.sourceMapCommentRegExp.exec(line);
        if (comment) {
            return (0, ts_1.trimStringEnd)(comment[1]);
        }
        // If we see a non-whitespace/map comment-like line, break, to avoid scanning up the entire file
        else if (!line.match(exports.whitespaceOrMapCommentRegExp)) {
            break;
        }
    }
}
exports.tryGetSourceMappingURL = tryGetSourceMappingURL;
/* eslint-disable no-null/no-null */
function isStringOrNull(x) {
    return typeof x === "string" || x === null;
}
/** @internal */
function isRawSourceMap(x) {
    return x !== null
        && typeof x === "object"
        && x.version === 3
        && typeof x.file === "string"
        && typeof x.mappings === "string"
        && (0, ts_1.isArray)(x.sources) && (0, ts_1.every)(x.sources, ts_1.isString)
        && (x.sourceRoot === undefined || x.sourceRoot === null || typeof x.sourceRoot === "string")
        && (x.sourcesContent === undefined || x.sourcesContent === null || (0, ts_1.isArray)(x.sourcesContent) && (0, ts_1.every)(x.sourcesContent, isStringOrNull))
        && (x.names === undefined || x.names === null || (0, ts_1.isArray)(x.names) && (0, ts_1.every)(x.names, ts_1.isString));
}
exports.isRawSourceMap = isRawSourceMap;
/* eslint-enable no-null/no-null */
/** @internal */
function tryParseRawSourceMap(text) {
    try {
        var parsed = JSON.parse(text);
        if (isRawSourceMap(parsed)) {
            return parsed;
        }
    }
    catch (_a) {
        // empty
    }
    return undefined;
}
exports.tryParseRawSourceMap = tryParseRawSourceMap;
/** @internal */
function decodeMappings(mappings) {
    var _a;
    var done = false;
    var pos = 0;
    var generatedLine = 0;
    var generatedCharacter = 0;
    var sourceIndex = 0;
    var sourceLine = 0;
    var sourceCharacter = 0;
    var nameIndex = 0;
    var error;
    // TODO(jakebailey): can we implement this without writing next ourselves?
    return _a = {
            get pos() { return pos; },
            get error() { return error; },
            get state() { return captureMapping(/*hasSource*/ true, /*hasName*/ true); },
            next: function () {
                while (!done && pos < mappings.length) {
                    var ch = mappings.charCodeAt(pos);
                    if (ch === 59 /* CharacterCodes.semicolon */) {
                        // new line
                        generatedLine++;
                        generatedCharacter = 0;
                        pos++;
                        continue;
                    }
                    if (ch === 44 /* CharacterCodes.comma */) {
                        // Next entry is on same line - no action needed
                        pos++;
                        continue;
                    }
                    var hasSource = false;
                    var hasName = false;
                    generatedCharacter += base64VLQFormatDecode();
                    if (hasReportedError())
                        return stopIterating();
                    if (generatedCharacter < 0)
                        return setErrorAndStopIterating("Invalid generatedCharacter found");
                    if (!isSourceMappingSegmentEnd()) {
                        hasSource = true;
                        sourceIndex += base64VLQFormatDecode();
                        if (hasReportedError())
                            return stopIterating();
                        if (sourceIndex < 0)
                            return setErrorAndStopIterating("Invalid sourceIndex found");
                        if (isSourceMappingSegmentEnd())
                            return setErrorAndStopIterating("Unsupported Format: No entries after sourceIndex");
                        sourceLine += base64VLQFormatDecode();
                        if (hasReportedError())
                            return stopIterating();
                        if (sourceLine < 0)
                            return setErrorAndStopIterating("Invalid sourceLine found");
                        if (isSourceMappingSegmentEnd())
                            return setErrorAndStopIterating("Unsupported Format: No entries after sourceLine");
                        sourceCharacter += base64VLQFormatDecode();
                        if (hasReportedError())
                            return stopIterating();
                        if (sourceCharacter < 0)
                            return setErrorAndStopIterating("Invalid sourceCharacter found");
                        if (!isSourceMappingSegmentEnd()) {
                            hasName = true;
                            nameIndex += base64VLQFormatDecode();
                            if (hasReportedError())
                                return stopIterating();
                            if (nameIndex < 0)
                                return setErrorAndStopIterating("Invalid nameIndex found");
                            if (!isSourceMappingSegmentEnd())
                                return setErrorAndStopIterating("Unsupported Error Format: Entries after nameIndex");
                        }
                    }
                    return { value: captureMapping(hasSource, hasName), done: done };
                }
                return stopIterating();
            }
        },
        _a[Symbol.iterator] = function () {
            return this;
        },
        _a;
    function captureMapping(hasSource, hasName) {
        return {
            generatedLine: generatedLine,
            generatedCharacter: generatedCharacter,
            sourceIndex: hasSource ? sourceIndex : undefined,
            sourceLine: hasSource ? sourceLine : undefined,
            sourceCharacter: hasSource ? sourceCharacter : undefined,
            nameIndex: hasName ? nameIndex : undefined
        };
    }
    function stopIterating() {
        done = true;
        return { value: undefined, done: true };
    }
    function setError(message) {
        if (error === undefined) {
            error = message;
        }
    }
    function setErrorAndStopIterating(message) {
        setError(message);
        return stopIterating();
    }
    function hasReportedError() {
        return error !== undefined;
    }
    function isSourceMappingSegmentEnd() {
        return (pos === mappings.length ||
            mappings.charCodeAt(pos) === 44 /* CharacterCodes.comma */ ||
            mappings.charCodeAt(pos) === 59 /* CharacterCodes.semicolon */);
    }
    function base64VLQFormatDecode() {
        var moreDigits = true;
        var shiftCount = 0;
        var value = 0;
        for (; moreDigits; pos++) {
            if (pos >= mappings.length)
                return setError("Error in decoding base64VLQFormatDecode, past the mapping string"), -1;
            // 6 digit number
            var currentByte = base64FormatDecode(mappings.charCodeAt(pos));
            if (currentByte === -1)
                return setError("Invalid character in VLQ"), -1;
            // If msb is set, we still have more bits to continue
            moreDigits = (currentByte & 32) !== 0;
            // least significant 5 bits are the next msbs in the final value.
            value = value | ((currentByte & 31) << shiftCount);
            shiftCount += 5;
        }
        // Least significant bit if 1 represents negative and rest of the msb is actual absolute value
        if ((value & 1) === 0) {
            // + number
            value = value >> 1;
        }
        else {
            // - number
            value = value >> 1;
            value = -value;
        }
        return value;
    }
}
exports.decodeMappings = decodeMappings;
/** @internal */
function sameMapping(left, right) {
    return left === right
        || left.generatedLine === right.generatedLine
            && left.generatedCharacter === right.generatedCharacter
            && left.sourceIndex === right.sourceIndex
            && left.sourceLine === right.sourceLine
            && left.sourceCharacter === right.sourceCharacter
            && left.nameIndex === right.nameIndex;
}
exports.sameMapping = sameMapping;
/** @internal */
function isSourceMapping(mapping) {
    return mapping.sourceIndex !== undefined
        && mapping.sourceLine !== undefined
        && mapping.sourceCharacter !== undefined;
}
exports.isSourceMapping = isSourceMapping;
function base64FormatEncode(value) {
    return value >= 0 && value < 26 ? 65 /* CharacterCodes.A */ + value :
        value >= 26 && value < 52 ? 97 /* CharacterCodes.a */ + value - 26 :
            value >= 52 && value < 62 ? 48 /* CharacterCodes._0 */ + value - 52 :
                value === 62 ? 43 /* CharacterCodes.plus */ :
                    value === 63 ? 47 /* CharacterCodes.slash */ :
                        ts_1.Debug.fail("".concat(value, ": not a base64 value"));
}
function base64FormatDecode(ch) {
    return ch >= 65 /* CharacterCodes.A */ && ch <= 90 /* CharacterCodes.Z */ ? ch - 65 /* CharacterCodes.A */ :
        ch >= 97 /* CharacterCodes.a */ && ch <= 122 /* CharacterCodes.z */ ? ch - 97 /* CharacterCodes.a */ + 26 :
            ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */ ? ch - 48 /* CharacterCodes._0 */ + 52 :
                ch === 43 /* CharacterCodes.plus */ ? 62 :
                    ch === 47 /* CharacterCodes.slash */ ? 63 :
                        -1;
}
function isSourceMappedPosition(value) {
    return value.sourceIndex !== undefined
        && value.sourcePosition !== undefined;
}
function sameMappedPosition(left, right) {
    return left.generatedPosition === right.generatedPosition
        && left.sourceIndex === right.sourceIndex
        && left.sourcePosition === right.sourcePosition;
}
function compareSourcePositions(left, right) {
    // Compares sourcePosition without comparing sourceIndex
    // since the mappings are grouped by sourceIndex
    ts_1.Debug.assert(left.sourceIndex === right.sourceIndex);
    return (0, ts_1.compareValues)(left.sourcePosition, right.sourcePosition);
}
function compareGeneratedPositions(left, right) {
    return (0, ts_1.compareValues)(left.generatedPosition, right.generatedPosition);
}
function getSourcePositionOfMapping(value) {
    return value.sourcePosition;
}
function getGeneratedPositionOfMapping(value) {
    return value.generatedPosition;
}
/** @internal */
function createDocumentPositionMapper(host, map, mapPath) {
    var mapDirectory = (0, ts_1.getDirectoryPath)(mapPath);
    var sourceRoot = map.sourceRoot ? (0, ts_1.getNormalizedAbsolutePath)(map.sourceRoot, mapDirectory) : mapDirectory;
    var generatedAbsoluteFilePath = (0, ts_1.getNormalizedAbsolutePath)(map.file, mapDirectory);
    var generatedFile = host.getSourceFileLike(generatedAbsoluteFilePath);
    var sourceFileAbsolutePaths = map.sources.map(function (source) { return (0, ts_1.getNormalizedAbsolutePath)(source, sourceRoot); });
    var sourceToSourceIndexMap = new Map(sourceFileAbsolutePaths.map(function (source, i) { return [host.getCanonicalFileName(source), i]; }));
    var decodedMappings;
    var generatedMappings;
    var sourceMappings;
    return {
        getSourcePosition: getSourcePosition,
        getGeneratedPosition: getGeneratedPosition
    };
    function processMapping(mapping) {
        var generatedPosition = generatedFile !== undefined
            ? (0, ts_1.getPositionOfLineAndCharacter)(generatedFile, mapping.generatedLine, mapping.generatedCharacter, /*allowEdits*/ true)
            : -1;
        var source;
        var sourcePosition;
        if (isSourceMapping(mapping)) {
            var sourceFile = host.getSourceFileLike(sourceFileAbsolutePaths[mapping.sourceIndex]);
            source = map.sources[mapping.sourceIndex];
            sourcePosition = sourceFile !== undefined
                ? (0, ts_1.getPositionOfLineAndCharacter)(sourceFile, mapping.sourceLine, mapping.sourceCharacter, /*allowEdits*/ true)
                : -1;
        }
        return {
            generatedPosition: generatedPosition,
            source: source,
            sourceIndex: mapping.sourceIndex,
            sourcePosition: sourcePosition,
            nameIndex: mapping.nameIndex
        };
    }
    function getDecodedMappings() {
        if (decodedMappings === undefined) {
            var decoder = decodeMappings(map.mappings);
            var mappings = (0, ts_1.arrayFrom)(decoder, processMapping);
            if (decoder.error !== undefined) {
                if (host.log) {
                    host.log("Encountered error while decoding sourcemap: ".concat(decoder.error));
                }
                decodedMappings = ts_1.emptyArray;
            }
            else {
                decodedMappings = mappings;
            }
        }
        return decodedMappings;
    }
    function getSourceMappings(sourceIndex) {
        if (sourceMappings === undefined) {
            var lists = [];
            for (var _i = 0, _a = getDecodedMappings(); _i < _a.length; _i++) {
                var mapping = _a[_i];
                if (!isSourceMappedPosition(mapping))
                    continue;
                var list = lists[mapping.sourceIndex];
                if (!list)
                    lists[mapping.sourceIndex] = list = [];
                list.push(mapping);
            }
            sourceMappings = lists.map(function (list) { return (0, ts_1.sortAndDeduplicate)(list, compareSourcePositions, sameMappedPosition); });
        }
        return sourceMappings[sourceIndex];
    }
    function getGeneratedMappings() {
        if (generatedMappings === undefined) {
            var list = [];
            for (var _i = 0, _a = getDecodedMappings(); _i < _a.length; _i++) {
                var mapping = _a[_i];
                list.push(mapping);
            }
            generatedMappings = (0, ts_1.sortAndDeduplicate)(list, compareGeneratedPositions, sameMappedPosition);
        }
        return generatedMappings;
    }
    function getGeneratedPosition(loc) {
        var sourceIndex = sourceToSourceIndexMap.get(host.getCanonicalFileName(loc.fileName));
        if (sourceIndex === undefined)
            return loc;
        var sourceMappings = getSourceMappings(sourceIndex);
        if (!(0, ts_1.some)(sourceMappings))
            return loc;
        var targetIndex = (0, ts_1.binarySearchKey)(sourceMappings, loc.pos, getSourcePositionOfMapping, ts_1.compareValues);
        if (targetIndex < 0) {
            // if no exact match, closest is 2's complement of result
            targetIndex = ~targetIndex;
        }
        var mapping = sourceMappings[targetIndex];
        if (mapping === undefined || mapping.sourceIndex !== sourceIndex) {
            return loc;
        }
        return { fileName: generatedAbsoluteFilePath, pos: mapping.generatedPosition }; // Closest pos
    }
    function getSourcePosition(loc) {
        var generatedMappings = getGeneratedMappings();
        if (!(0, ts_1.some)(generatedMappings))
            return loc;
        var targetIndex = (0, ts_1.binarySearchKey)(generatedMappings, loc.pos, getGeneratedPositionOfMapping, ts_1.compareValues);
        if (targetIndex < 0) {
            // if no exact match, closest is 2's complement of result
            targetIndex = ~targetIndex;
        }
        var mapping = generatedMappings[targetIndex];
        if (mapping === undefined || !isSourceMappedPosition(mapping)) {
            return loc;
        }
        return { fileName: sourceFileAbsolutePaths[mapping.sourceIndex], pos: mapping.sourcePosition }; // Closest pos
    }
}
exports.createDocumentPositionMapper = createDocumentPositionMapper;
/** @internal */
exports.identitySourceMapConsumer = {
    getSourcePosition: ts_1.identity,
    getGeneratedPosition: ts_1.identity
};
