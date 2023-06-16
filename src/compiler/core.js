"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayIsSorted = exports.sortAndDeduplicate = exports.insertSorted = exports.createSortedArray = exports.deduplicate = exports.indicesOf = exports.concatenate = exports.getRangesWhere = exports.some = exports.mapEntries = exports.spanMap = exports.singleIterator = exports.tryAddToSet = exports.getOrUpdate = exports.mapDefinedEntries = exports.mapDefinedIterator = exports.mapDefined = exports.mapAllOrFail = exports.sameFlatMap = exports.flatMapIterator = exports.flatMapToMutable = exports.flatMap = exports.flatten = exports.sameMap = exports.mapIterator = exports.map = exports.clear = exports.filterMutate = exports.filter = exports.countWhere = exports.indexOfAnyCharCode = exports.arraysEqual = exports.contains = exports.findMap = exports.findLastIndex = exports.findIndex = exports.findLast = exports.find = exports.every = exports.intersperse = exports.zipWith = exports.reduceLeftIterator = exports.firstDefinedIterator = exports.firstDefined = exports.forEachRight = exports.forEach = exports.length = exports.emptySet = exports.emptyMap = exports.emptyArray = void 0;
exports.toArray = exports.isArray = exports.createSet = exports.createQueue = exports.createMultiMap = exports.maybeBind = exports.copyProperties = exports.extend = exports.clone = exports.groupBy = exports.group = exports.arrayToMultiMap = exports.arrayToNumericMap = exports.arrayToMap = exports.equalOwnProperties = exports.assign = exports.arrayFrom = exports.arrayOf = exports.getOwnValues = exports.getAllKeys = exports.getOwnKeys = exports.getProperty = exports.hasProperty = exports.reduceLeft = exports.binarySearchKey = exports.binarySearch = exports.replaceElement = exports.singleOrMany = exports.single = exports.singleOrUndefined = exports.last = exports.lastOrUndefined = exports.firstIterator = exports.first = exports.firstOrUndefinedIterator = exports.firstOrUndefined = exports.elementAt = exports.rangeEquals = exports.stableSort = exports.arrayReverseIterator = exports.sort = exports.appendIfUnique = exports.pushIfUnique = exports.addRange = exports.combine = exports.append = exports.relativeComplement = exports.compact = exports.arrayIsEqualTo = exports.detectSortCaseSensitivity = void 0;
exports.isPatternMatch = exports.tryRemovePrefix = exports.removePrefix = exports.startsWith = exports.findBestPatternMatch = exports.matchedText = exports.patternText = exports.createGetCanonicalFileName = exports.unorderedRemoveItem = exports.unorderedRemoveItemAt = exports.orderedRemoveItemAt = exports.orderedRemoveItem = exports.removeMinAndVersionNumbers = exports.stringContains = exports.tryRemoveSuffix = exports.removeSuffix = exports.endsWith = exports.getSpellingSuggestion = exports.compareBooleans = exports.compareProperties = exports.compareStringsCaseSensitiveUI = exports.setUILocale = exports.getUILocale = exports.getStringComparer = exports.compareStringsCaseSensitive = exports.compareStringsCaseInsensitiveEslintCompatible = exports.compareStringsCaseInsensitive = exports.min = exports.compareTextSpans = exports.compareValues = exports.equateStringsCaseSensitive = exports.equateStringsCaseInsensitive = exports.equateValues = exports.compose = exports.memoizeCached = exports.memoizeWeak = exports.memoizeOne = exports.memoize = exports.notImplemented = exports.toFileNameLowerCase = exports.toLowerCase = exports.identity = exports.returnUndefined = exports.returnTrue = exports.returnFalse = exports.noop = exports.cast = exports.tryCast = exports.isNumber = exports.isString = void 0;
exports.isNodeLikeSystem = exports.trimStringStart = exports.trimStringEnd = exports.trimString = exports.skipWhile = exports.takeWhile = exports.padRight = exports.padLeft = exports.cartesianProduct = exports.enumerateInsertsAndDeletes = exports.singleElementArray = exports.assertType = exports.not = exports.or = exports.and = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
exports.emptyArray = [];
/** @internal */
exports.emptyMap = new Map();
/** @internal */
exports.emptySet = new Set();
/** @internal */
function length(array) {
    return array ? array.length : 0;
}
exports.length = length;
/**
 * Iterates through 'array' by index and performs the callback on each element of array until the callback
 * returns a truthy value, then returns that value.
 * If no such value is found, the callback is applied to each element of array and undefined is returned.
 *
 * @internal
 */
function forEach(array, callback) {
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var result = callback(array[i], i);
            if (result) {
                return result;
            }
        }
    }
    return undefined;
}
exports.forEach = forEach;
/**
 * Like `forEach`, but iterates in reverse order.
 *
 * @internal
 */
function forEachRight(array, callback) {
    if (array) {
        for (var i = array.length - 1; i >= 0; i--) {
            var result = callback(array[i], i);
            if (result) {
                return result;
            }
        }
    }
    return undefined;
}
exports.forEachRight = forEachRight;
/**
 * Like `forEach`, but suitable for use with numbers and strings (which may be falsy).
 *
 * @internal
 */
function firstDefined(array, callback) {
    if (array === undefined) {
        return undefined;
    }
    for (var i = 0; i < array.length; i++) {
        var result = callback(array[i], i);
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
exports.firstDefined = firstDefined;
/** @internal */
function firstDefinedIterator(iter, callback) {
    for (var _i = 0, iter_1 = iter; _i < iter_1.length; _i++) {
        var value = iter_1[_i];
        var result = callback(value);
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
exports.firstDefinedIterator = firstDefinedIterator;
/** @internal */
function reduceLeftIterator(iterator, f, initial) {
    var result = initial;
    if (iterator) {
        var pos = 0;
        for (var _i = 0, iterator_1 = iterator; _i < iterator_1.length; _i++) {
            var value = iterator_1[_i];
            result = f(result, value, pos);
            pos++;
        }
    }
    return result;
}
exports.reduceLeftIterator = reduceLeftIterator;
/** @internal */
function zipWith(arrayA, arrayB, callback) {
    var result = [];
    ts_1.Debug.assertEqual(arrayA.length, arrayB.length);
    for (var i = 0; i < arrayA.length; i++) {
        result.push(callback(arrayA[i], arrayB[i], i));
    }
    return result;
}
exports.zipWith = zipWith;
/**
 * Creates a new array with `element` interspersed in between each element of `input`
 * if there is more than 1 value in `input`. Otherwise, returns the existing array.
 *
 * @internal
 */
function intersperse(input, element) {
    if (input.length <= 1) {
        return input;
    }
    var result = [];
    for (var i = 0, n = input.length; i < n; i++) {
        if (i)
            result.push(element);
        result.push(input[i]);
    }
    return result;
}
exports.intersperse = intersperse;
function every(array, callback) {
    if (array) {
        for (var i = 0; i < array.length; i++) {
            if (!callback(array[i], i)) {
                return false;
            }
        }
    }
    return true;
}
exports.every = every;
/** @internal */
function find(array, predicate, startIndex) {
    if (array === undefined)
        return undefined;
    for (var i = startIndex !== null && startIndex !== void 0 ? startIndex : 0; i < array.length; i++) {
        var value = array[i];
        if (predicate(value, i)) {
            return value;
        }
    }
    return undefined;
}
exports.find = find;
/** @internal */
function findLast(array, predicate, startIndex) {
    if (array === undefined)
        return undefined;
    for (var i = startIndex !== null && startIndex !== void 0 ? startIndex : array.length - 1; i >= 0; i--) {
        var value = array[i];
        if (predicate(value, i)) {
            return value;
        }
    }
    return undefined;
}
exports.findLast = findLast;
/**
 * Works like Array.prototype.findIndex, returning `-1` if no element satisfying the predicate is found.
 *
 * @internal
 */
function findIndex(array, predicate, startIndex) {
    if (array === undefined)
        return -1;
    for (var i = startIndex !== null && startIndex !== void 0 ? startIndex : 0; i < array.length; i++) {
        if (predicate(array[i], i)) {
            return i;
        }
    }
    return -1;
}
exports.findIndex = findIndex;
/** @internal */
function findLastIndex(array, predicate, startIndex) {
    if (array === undefined)
        return -1;
    for (var i = startIndex !== null && startIndex !== void 0 ? startIndex : array.length - 1; i >= 0; i--) {
        if (predicate(array[i], i)) {
            return i;
        }
    }
    return -1;
}
exports.findLastIndex = findLastIndex;
/**
 * Returns the first truthy result of `callback`, or else fails.
 * This is like `forEach`, but never returns undefined.
 *
 * @internal
 */
function findMap(array, callback) {
    for (var i = 0; i < array.length; i++) {
        var result = callback(array[i], i);
        if (result) {
            return result;
        }
    }
    return ts_1.Debug.fail();
}
exports.findMap = findMap;
/** @internal */
function contains(array, value, equalityComparer) {
    if (equalityComparer === void 0) { equalityComparer = equateValues; }
    if (array) {
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var v = array_1[_i];
            if (equalityComparer(v, value)) {
                return true;
            }
        }
    }
    return false;
}
exports.contains = contains;
/** @internal */
function arraysEqual(a, b, equalityComparer) {
    if (equalityComparer === void 0) { equalityComparer = equateValues; }
    return a.length === b.length && a.every(function (x, i) { return equalityComparer(x, b[i]); });
}
exports.arraysEqual = arraysEqual;
/** @internal */
function indexOfAnyCharCode(text, charCodes, start) {
    for (var i = start || 0; i < text.length; i++) {
        if (contains(charCodes, text.charCodeAt(i))) {
            return i;
        }
    }
    return -1;
}
exports.indexOfAnyCharCode = indexOfAnyCharCode;
/** @internal */
function countWhere(array, predicate) {
    var count = 0;
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var v = array[i];
            if (predicate(v, i)) {
                count++;
            }
        }
    }
    return count;
}
exports.countWhere = countWhere;
/** @internal */
function filter(array, f) {
    if (array) {
        var len = array.length;
        var i = 0;
        while (i < len && f(array[i]))
            i++;
        if (i < len) {
            var result = array.slice(0, i);
            i++;
            while (i < len) {
                var item = array[i];
                if (f(item)) {
                    result.push(item);
                }
                i++;
            }
            return result;
        }
    }
    return array;
}
exports.filter = filter;
/** @internal */
function filterMutate(array, f) {
    var outIndex = 0;
    for (var i = 0; i < array.length; i++) {
        if (f(array[i], i, array)) {
            array[outIndex] = array[i];
            outIndex++;
        }
    }
    array.length = outIndex;
}
exports.filterMutate = filterMutate;
/** @internal */
function clear(array) {
    array.length = 0;
}
exports.clear = clear;
/** @internal */
function map(array, f) {
    var result;
    if (array) {
        result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(f(array[i], i));
        }
    }
    return result;
}
exports.map = map;
/** @internal */
function mapIterator(iter, mapFn) {
    var _i, iter_2, x;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, iter_2 = iter;
                _a.label = 1;
            case 1:
                if (!(_i < iter_2.length)) return [3 /*break*/, 4];
                x = iter_2[_i];
                return [4 /*yield*/, mapFn(x)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.mapIterator = mapIterator;
/** @internal */
function sameMap(array, f) {
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var mapped = f(item, i);
            if (item !== mapped) {
                var result = array.slice(0, i);
                result.push(mapped);
                for (i++; i < array.length; i++) {
                    result.push(f(array[i], i));
                }
                return result;
            }
        }
    }
    return array;
}
exports.sameMap = sameMap;
/**
 * Flattens an array containing a mix of array or non-array elements.
 *
 * @param array The array to flatten.
 *
 * @internal
 */
function flatten(array) {
    var result = [];
    for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
        var v = array_2[_i];
        if (v) {
            if (isArray(v)) {
                addRange(result, v);
            }
            else {
                result.push(v);
            }
        }
    }
    return result;
}
exports.flatten = flatten;
/**
 * Maps an array. If the mapped value is an array, it is spread into the result.
 *
 * @param array The array to map.
 * @param mapfn The callback used to map the result into one or more values.
 *
 * @internal
 */
function flatMap(array, mapfn) {
    var result;
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var v = mapfn(array[i], i);
            if (v) {
                if (isArray(v)) {
                    result = addRange(result, v);
                }
                else {
                    result = append(result, v);
                }
            }
        }
    }
    return result || exports.emptyArray;
}
exports.flatMap = flatMap;
/** @internal */
function flatMapToMutable(array, mapfn) {
    var result = [];
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var v = mapfn(array[i], i);
            if (v) {
                if (isArray(v)) {
                    addRange(result, v);
                }
                else {
                    result.push(v);
                }
            }
        }
    }
    return result;
}
exports.flatMapToMutable = flatMapToMutable;
/** @internal */
function flatMapIterator(iter, mapfn) {
    var _i, iter_3, x, iter2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, iter_3 = iter;
                _a.label = 1;
            case 1:
                if (!(_i < iter_3.length)) return [3 /*break*/, 4];
                x = iter_3[_i];
                iter2 = mapfn(x);
                if (!iter2)
                    return [3 /*break*/, 3];
                return [5 /*yield**/, __values(iter2)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.flatMapIterator = flatMapIterator;
/** @internal */
function sameFlatMap(array, mapfn) {
    var result;
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var mapped = mapfn(item, i);
            if (result || item !== mapped || isArray(mapped)) {
                if (!result) {
                    result = array.slice(0, i);
                }
                if (isArray(mapped)) {
                    addRange(result, mapped);
                }
                else {
                    result.push(mapped);
                }
            }
        }
    }
    return result || array;
}
exports.sameFlatMap = sameFlatMap;
/** @internal */
function mapAllOrFail(array, mapFn) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        var mapped = mapFn(array[i], i);
        if (mapped === undefined) {
            return undefined;
        }
        result.push(mapped);
    }
    return result;
}
exports.mapAllOrFail = mapAllOrFail;
/** @internal */
function mapDefined(array, mapFn) {
    var result = [];
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var mapped = mapFn(array[i], i);
            if (mapped !== undefined) {
                result.push(mapped);
            }
        }
    }
    return result;
}
exports.mapDefined = mapDefined;
/** @internal */
function mapDefinedIterator(iter, mapFn) {
    var _i, iter_4, x, value;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, iter_4 = iter;
                _a.label = 1;
            case 1:
                if (!(_i < iter_4.length)) return [3 /*break*/, 4];
                x = iter_4[_i];
                value = mapFn(x);
                if (!(value !== undefined)) return [3 /*break*/, 3];
                return [4 /*yield*/, value];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.mapDefinedIterator = mapDefinedIterator;
/** @internal */
function mapDefinedEntries(map, f) {
    if (!map) {
        return undefined;
    }
    var result = new Map();
    map.forEach(function (value, key) {
        var entry = f(key, value);
        if (entry !== undefined) {
            var newKey = entry[0], newValue = entry[1];
            if (newKey !== undefined && newValue !== undefined) {
                result.set(newKey, newValue);
            }
        }
    });
    return result;
}
exports.mapDefinedEntries = mapDefinedEntries;
/** @internal */
function getOrUpdate(map, key, callback) {
    if (map.has(key)) {
        return map.get(key);
    }
    var value = callback();
    map.set(key, value);
    return value;
}
exports.getOrUpdate = getOrUpdate;
/** @internal */
function tryAddToSet(set, value) {
    if (!set.has(value)) {
        set.add(value);
        return true;
    }
    return false;
}
exports.tryAddToSet = tryAddToSet;
/** @internal */
function singleIterator(value) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, value];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.singleIterator = singleIterator;
/** @internal */
function spanMap(array, keyfn, mapfn) {
    var result;
    if (array) {
        result = [];
        var len = array.length;
        var previousKey = void 0;
        var key = void 0;
        var start = 0;
        var pos = 0;
        while (start < len) {
            while (pos < len) {
                var value = array[pos];
                key = keyfn(value, pos);
                if (pos === 0) {
                    previousKey = key;
                }
                else if (key !== previousKey) {
                    break;
                }
                pos++;
            }
            if (start < pos) {
                var v = mapfn(array.slice(start, pos), previousKey, start, pos);
                if (v) {
                    result.push(v);
                }
                start = pos;
            }
            previousKey = key;
            pos++;
        }
    }
    return result;
}
exports.spanMap = spanMap;
/** @internal */
function mapEntries(map, f) {
    if (!map) {
        return undefined;
    }
    var result = new Map();
    map.forEach(function (value, key) {
        var _a = f(key, value), newKey = _a[0], newValue = _a[1];
        result.set(newKey, newValue);
    });
    return result;
}
exports.mapEntries = mapEntries;
/** @internal */
function some(array, predicate) {
    if (array) {
        if (predicate) {
            for (var _i = 0, array_3 = array; _i < array_3.length; _i++) {
                var v = array_3[_i];
                if (predicate(v)) {
                    return true;
                }
            }
        }
        else {
            return array.length > 0;
        }
    }
    return false;
}
exports.some = some;
/**
 * Calls the callback with (start, afterEnd) index pairs for each range where 'pred' is true.
 *
 * @internal
 */
function getRangesWhere(arr, pred, cb) {
    var start;
    for (var i = 0; i < arr.length; i++) {
        if (pred(arr[i])) {
            start = start === undefined ? i : start;
        }
        else {
            if (start !== undefined) {
                cb(start, i);
                start = undefined;
            }
        }
    }
    if (start !== undefined)
        cb(start, arr.length);
}
exports.getRangesWhere = getRangesWhere;
/** @internal */
function concatenate(array1, array2) {
    if (!some(array2))
        return array1;
    if (!some(array1))
        return array2;
    return __spreadArray(__spreadArray([], array1, true), array2, true);
}
exports.concatenate = concatenate;
function selectIndex(_, i) {
    return i;
}
/** @internal */
function indicesOf(array) {
    return array.map(selectIndex);
}
exports.indicesOf = indicesOf;
function deduplicateRelational(array, equalityComparer, comparer) {
    // Perform a stable sort of the array. This ensures the first entry in a list of
    // duplicates remains the first entry in the result.
    var indices = indicesOf(array);
    stableSortIndices(array, indices, comparer);
    var last = array[indices[0]];
    var deduplicated = [indices[0]];
    for (var i = 1; i < indices.length; i++) {
        var index = indices[i];
        var item = array[index];
        if (!equalityComparer(last, item)) {
            deduplicated.push(index);
            last = item;
        }
    }
    // restore original order
    deduplicated.sort();
    return deduplicated.map(function (i) { return array[i]; });
}
function deduplicateEquality(array, equalityComparer) {
    var result = [];
    for (var _i = 0, array_4 = array; _i < array_4.length; _i++) {
        var item = array_4[_i];
        pushIfUnique(result, item, equalityComparer);
    }
    return result;
}
/**
 * Deduplicates an unsorted array.
 * @param equalityComparer An `EqualityComparer` used to determine if two values are duplicates.
 * @param comparer An optional `Comparer` used to sort entries before comparison, though the
 * result will remain in the original order in `array`.
 *
 * @internal
 */
function deduplicate(array, equalityComparer, comparer) {
    return array.length === 0 ? [] :
        array.length === 1 ? array.slice() :
            comparer ? deduplicateRelational(array, equalityComparer, comparer) :
                deduplicateEquality(array, equalityComparer);
}
exports.deduplicate = deduplicate;
/**
 * Deduplicates an array that has already been sorted.
 */
function deduplicateSorted(array, comparer) {
    if (array.length === 0)
        return exports.emptyArray;
    var last = array[0];
    var deduplicated = [last];
    for (var i = 1; i < array.length; i++) {
        var next = array[i];
        switch (comparer(next, last)) {
            // equality comparison
            case true:
            // relational comparison
            // falls through
            case 0 /* Comparison.EqualTo */:
                continue;
            case -1 /* Comparison.LessThan */:
                // If `array` is sorted, `next` should **never** be less than `last`.
                return ts_1.Debug.fail("Array is unsorted.");
        }
        deduplicated.push(last = next);
    }
    return deduplicated;
}
/** @internal */
function createSortedArray() {
    return []; // TODO: GH#19873
}
exports.createSortedArray = createSortedArray;
/** @internal */
function insertSorted(array, insert, compare, allowDuplicates) {
    if (array.length === 0) {
        array.push(insert);
        return true;
    }
    var insertIndex = binarySearch(array, insert, identity, compare);
    if (insertIndex < 0) {
        array.splice(~insertIndex, 0, insert);
        return true;
    }
    if (allowDuplicates) {
        array.splice(insertIndex, 0, insert);
        return true;
    }
    return false;
}
exports.insertSorted = insertSorted;
/** @internal */
function sortAndDeduplicate(array, comparer, equalityComparer) {
    return deduplicateSorted(sort(array, comparer), equalityComparer || comparer || compareStringsCaseSensitive);
}
exports.sortAndDeduplicate = sortAndDeduplicate;
/** @internal */
function arrayIsSorted(array, comparer) {
    if (array.length < 2)
        return true;
    for (var i = 1, len = array.length; i < len; i++) {
        if (comparer(array[i - 1], array[i]) === 1 /* Comparison.GreaterThan */) {
            return false;
        }
    }
    return true;
}
exports.arrayIsSorted = arrayIsSorted;
/** @internal */
function detectSortCaseSensitivity(array, getString, compareStringsCaseSensitive, compareStringsCaseInsensitive) {
    var kind = 3 /* SortKind.Both */;
    if (array.length < 2)
        return kind;
    var prevElement = getString(array[0]);
    for (var i = 1, len = array.length; i < len && kind !== 0 /* SortKind.None */; i++) {
        var element = getString(array[i]);
        if (kind & 1 /* SortKind.CaseSensitive */ && compareStringsCaseSensitive(prevElement, element) > 0) {
            kind &= ~1 /* SortKind.CaseSensitive */;
        }
        if (kind & 2 /* SortKind.CaseInsensitive */ && compareStringsCaseInsensitive(prevElement, element) > 0) {
            kind &= ~2 /* SortKind.CaseInsensitive */;
        }
        prevElement = element;
    }
    return kind;
}
exports.detectSortCaseSensitivity = detectSortCaseSensitivity;
/** @internal */
function arrayIsEqualTo(array1, array2, equalityComparer) {
    if (equalityComparer === void 0) { equalityComparer = equateValues; }
    if (!array1 || !array2) {
        return array1 === array2;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        if (!equalityComparer(array1[i], array2[i], i)) {
            return false;
        }
    }
    return true;
}
exports.arrayIsEqualTo = arrayIsEqualTo;
/** @internal */
function compact(array) {
    var result;
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var v = array[i];
            if (result || !v) {
                if (!result) {
                    result = array.slice(0, i);
                }
                if (v) {
                    result.push(v);
                }
            }
        }
    }
    return result || array;
}
exports.compact = compact;
/**
 * Gets the relative complement of `arrayA` with respect to `arrayB`, returning the elements that
 * are not present in `arrayA` but are present in `arrayB`. Assumes both arrays are sorted
 * based on the provided comparer.
 *
 * @internal
 */
function relativeComplement(arrayA, arrayB, comparer) {
    if (!arrayB || !arrayA || arrayB.length === 0 || arrayA.length === 0)
        return arrayB;
    var result = [];
    loopB: for (var offsetA = 0, offsetB = 0; offsetB < arrayB.length; offsetB++) {
        if (offsetB > 0) {
            // Ensure `arrayB` is properly sorted.
            ts_1.Debug.assertGreaterThanOrEqual(comparer(arrayB[offsetB], arrayB[offsetB - 1]), 0 /* Comparison.EqualTo */);
        }
        loopA: for (var startA = offsetA; offsetA < arrayA.length; offsetA++) {
            if (offsetA > startA) {
                // Ensure `arrayA` is properly sorted. We only need to perform this check if
                // `offsetA` has changed since we entered the loop.
                ts_1.Debug.assertGreaterThanOrEqual(comparer(arrayA[offsetA], arrayA[offsetA - 1]), 0 /* Comparison.EqualTo */);
            }
            switch (comparer(arrayB[offsetB], arrayA[offsetA])) {
                case -1 /* Comparison.LessThan */:
                    // If B is less than A, B does not exist in arrayA. Add B to the result and
                    // move to the next element in arrayB without changing the current position
                    // in arrayA.
                    result.push(arrayB[offsetB]);
                    continue loopB;
                case 0 /* Comparison.EqualTo */:
                    // If B is equal to A, B exists in arrayA. Move to the next element in
                    // arrayB without adding B to the result or changing the current position
                    // in arrayA.
                    continue loopB;
                case 1 /* Comparison.GreaterThan */:
                    // If B is greater than A, we need to keep looking for B in arrayA. Move to
                    // the next element in arrayA and recheck.
                    continue loopA;
            }
        }
    }
    return result;
}
exports.relativeComplement = relativeComplement;
/** @internal */
function append(to, value) {
    if (value === undefined)
        return to;
    if (to === undefined)
        return [value];
    to.push(value);
    return to;
}
exports.append = append;
/** @internal */
function combine(xs, ys) {
    if (xs === undefined)
        return ys;
    if (ys === undefined)
        return xs;
    if (isArray(xs))
        return isArray(ys) ? concatenate(xs, ys) : append(xs, ys);
    if (isArray(ys))
        return append(ys, xs);
    return [xs, ys];
}
exports.combine = combine;
/**
 * Gets the actual offset into an array for a relative offset. Negative offsets indicate a
 * position offset from the end of the array.
 */
function toOffset(array, offset) {
    return offset < 0 ? array.length + offset : offset;
}
/** @internal */
function addRange(to, from, start, end) {
    if (from === undefined || from.length === 0)
        return to;
    if (to === undefined)
        return from.slice(start, end);
    start = start === undefined ? 0 : toOffset(from, start);
    end = end === undefined ? from.length : toOffset(from, end);
    for (var i = start; i < end && i < from.length; i++) {
        if (from[i] !== undefined) {
            to.push(from[i]);
        }
    }
    return to;
}
exports.addRange = addRange;
/**
 * @return Whether the value was added.
 *
 * @internal
 */
function pushIfUnique(array, toAdd, equalityComparer) {
    if (contains(array, toAdd, equalityComparer)) {
        return false;
    }
    else {
        array.push(toAdd);
        return true;
    }
}
exports.pushIfUnique = pushIfUnique;
/**
 * Unlike `pushIfUnique`, this can take `undefined` as an input, and returns a new array.
 *
 * @internal
 */
function appendIfUnique(array, toAdd, equalityComparer) {
    if (array) {
        pushIfUnique(array, toAdd, equalityComparer);
        return array;
    }
    else {
        return [toAdd];
    }
}
exports.appendIfUnique = appendIfUnique;
function stableSortIndices(array, indices, comparer) {
    // sort indices by value then position
    indices.sort(function (x, y) { return comparer(array[x], array[y]) || compareValues(x, y); });
}
/**
 * Returns a new sorted array.
 *
 * @internal
 */
function sort(array, comparer) {
    return (array.length === 0 ? array : array.slice().sort(comparer));
}
exports.sort = sort;
/** @internal */
function arrayReverseIterator(array) {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = array.length - 1;
                _a.label = 1;
            case 1:
                if (!(i >= 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, array[i]];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i--;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.arrayReverseIterator = arrayReverseIterator;
/**
 * Stable sort of an array. Elements equal to each other maintain their relative position in the array.
 *
 * @internal
 */
function stableSort(array, comparer) {
    var indices = indicesOf(array);
    stableSortIndices(array, indices, comparer);
    return indices.map(function (i) { return array[i]; });
}
exports.stableSort = stableSort;
/** @internal */
function rangeEquals(array1, array2, pos, end) {
    while (pos < end) {
        if (array1[pos] !== array2[pos]) {
            return false;
        }
        pos++;
    }
    return true;
}
exports.rangeEquals = rangeEquals;
/**
 * Returns the element at a specific offset in an array if non-empty, `undefined` otherwise.
 * A negative offset indicates the element should be retrieved from the end of the array.
 *
 * @internal
 */
exports.elementAt = !!Array.prototype.at
    ? function (array, offset) { return array === null || array === void 0 ? void 0 : array.at(offset); }
    : function (array, offset) {
        if (array) {
            offset = toOffset(array, offset);
            if (offset < array.length) {
                return array[offset];
            }
        }
        return undefined;
    };
/**
 * Returns the first element of an array if non-empty, `undefined` otherwise.
 *
 * @internal
 */
function firstOrUndefined(array) {
    return array === undefined || array.length === 0 ? undefined : array[0];
}
exports.firstOrUndefined = firstOrUndefined;
/** @internal */
function firstOrUndefinedIterator(iter) {
    if (iter) {
        for (var _i = 0, iter_5 = iter; _i < iter_5.length; _i++) {
            var value = iter_5[_i];
            return value;
        }
    }
    return undefined;
}
exports.firstOrUndefinedIterator = firstOrUndefinedIterator;
/** @internal */
function first(array) {
    ts_1.Debug.assert(array.length !== 0);
    return array[0];
}
exports.first = first;
/** @internal */
function firstIterator(iter) {
    for (var _i = 0, iter_6 = iter; _i < iter_6.length; _i++) {
        var value = iter_6[_i];
        return value;
    }
    ts_1.Debug.fail("iterator is empty");
}
exports.firstIterator = firstIterator;
/**
 * Returns the last element of an array if non-empty, `undefined` otherwise.
 *
 * @internal
 */
function lastOrUndefined(array) {
    return array === undefined || array.length === 0 ? undefined : array[array.length - 1];
}
exports.lastOrUndefined = lastOrUndefined;
/** @internal */
function last(array) {
    ts_1.Debug.assert(array.length !== 0);
    return array[array.length - 1];
}
exports.last = last;
/**
 * Returns the only element of an array if it contains only one element, `undefined` otherwise.
 *
 * @internal
 */
function singleOrUndefined(array) {
    return array && array.length === 1
        ? array[0]
        : undefined;
}
exports.singleOrUndefined = singleOrUndefined;
/**
 * Returns the only element of an array if it contains only one element; throws otherwise.
 *
 * @internal
 */
function single(array) {
    return ts_1.Debug.checkDefined(singleOrUndefined(array));
}
exports.single = single;
/** @internal */
function singleOrMany(array) {
    return array && array.length === 1
        ? array[0]
        : array;
}
exports.singleOrMany = singleOrMany;
/** @internal */
function replaceElement(array, index, value) {
    var result = array.slice(0);
    result[index] = value;
    return result;
}
exports.replaceElement = replaceElement;
/**
 * Performs a binary search, finding the index at which `value` occurs in `array`.
 * If no such index is found, returns the 2's-complement of first index at which
 * `array[index]` exceeds `value`.
 * @param array A sorted array whose first element must be no larger than number
 * @param value The value to be searched for in the array.
 * @param keySelector A callback used to select the search key from `value` and each element of
 * `array`.
 * @param keyComparer A callback used to compare two keys in a sorted array.
 * @param offset An offset into `array` at which to start the search.
 *
 * @internal
 */
function binarySearch(array, value, keySelector, keyComparer, offset) {
    return binarySearchKey(array, keySelector(value), keySelector, keyComparer, offset);
}
exports.binarySearch = binarySearch;
/**
 * Performs a binary search, finding the index at which an object with `key` occurs in `array`.
 * If no such index is found, returns the 2's-complement of first index at which
 * `array[index]` exceeds `key`.
 * @param array A sorted array whose first element must be no larger than number
 * @param key The key to be searched for in the array.
 * @param keySelector A callback used to select the search key from each element of `array`.
 * @param keyComparer A callback used to compare two keys in a sorted array.
 * @param offset An offset into `array` at which to start the search.
 *
 * @internal
 */
function binarySearchKey(array, key, keySelector, keyComparer, offset) {
    if (!some(array)) {
        return -1;
    }
    var low = offset || 0;
    var high = array.length - 1;
    while (low <= high) {
        var middle = low + ((high - low) >> 1);
        var midKey = keySelector(array[middle], middle);
        switch (keyComparer(midKey, key)) {
            case -1 /* Comparison.LessThan */:
                low = middle + 1;
                break;
            case 0 /* Comparison.EqualTo */:
                return middle;
            case 1 /* Comparison.GreaterThan */:
                high = middle - 1;
                break;
        }
    }
    return ~low;
}
exports.binarySearchKey = binarySearchKey;
/** @internal */
function reduceLeft(array, f, initial, start, count) {
    if (array && array.length > 0) {
        var size = array.length;
        if (size > 0) {
            var pos = start === undefined || start < 0 ? 0 : start;
            var end = count === undefined || pos + count > size - 1 ? size - 1 : pos + count;
            var result = void 0;
            if (arguments.length <= 2) {
                result = array[pos];
                pos++;
            }
            else {
                result = initial;
            }
            while (pos <= end) {
                result = f(result, array[pos], pos);
                pos++;
            }
            return result;
        }
    }
    return initial;
}
exports.reduceLeft = reduceLeft;
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Indicates whether a map-like contains an own property with the specified key.
 *
 * @param map A map-like.
 * @param key A property key.
 *
 * @internal
 */
function hasProperty(map, key) {
    return hasOwnProperty.call(map, key);
}
exports.hasProperty = hasProperty;
/**
 * Gets the value of an owned property in a map-like.
 *
 * @param map A map-like.
 * @param key A property key.
 *
 * @internal
 */
function getProperty(map, key) {
    return hasOwnProperty.call(map, key) ? map[key] : undefined;
}
exports.getProperty = getProperty;
/**
 * Gets the owned, enumerable property keys of a map-like.
 *
 * @internal
 */
function getOwnKeys(map) {
    var keys = [];
    for (var key in map) {
        if (hasOwnProperty.call(map, key)) {
            keys.push(key);
        }
    }
    return keys;
}
exports.getOwnKeys = getOwnKeys;
/** @internal */
function getAllKeys(obj) {
    var result = [];
    do {
        var names = Object.getOwnPropertyNames(obj);
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            pushIfUnique(result, name_1);
        }
    } while (obj = Object.getPrototypeOf(obj));
    return result;
}
exports.getAllKeys = getAllKeys;
/** @internal */
function getOwnValues(collection) {
    var values = [];
    for (var key in collection) {
        if (hasOwnProperty.call(collection, key)) {
            values.push(collection[key]);
        }
    }
    return values;
}
exports.getOwnValues = getOwnValues;
/** @internal */
function arrayOf(count, f) {
    var result = new Array(count);
    for (var i = 0; i < count; i++) {
        result[i] = f(i);
    }
    return result;
}
exports.arrayOf = arrayOf;
/** @internal */
function arrayFrom(iterator, map) {
    var result = [];
    for (var _i = 0, iterator_2 = iterator; _i < iterator_2.length; _i++) {
        var value = iterator_2[_i];
        result.push(map ? map(value) : value);
    }
    return result;
}
exports.arrayFrom = arrayFrom;
/** @internal */
function assign(t) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var arg = args_1[_a];
        if (arg === undefined)
            continue;
        for (var p in arg) {
            if (hasProperty(arg, p)) {
                t[p] = arg[p];
            }
        }
    }
    return t;
}
exports.assign = assign;
/**
 * Performs a shallow equality comparison of the contents of two map-likes.
 *
 * @param left A map-like whose properties should be compared.
 * @param right A map-like whose properties should be compared.
 *
 * @internal
 */
function equalOwnProperties(left, right, equalityComparer) {
    if (equalityComparer === void 0) { equalityComparer = equateValues; }
    if (left === right)
        return true;
    if (!left || !right)
        return false;
    for (var key in left) {
        if (hasOwnProperty.call(left, key)) {
            if (!hasOwnProperty.call(right, key))
                return false;
            if (!equalityComparer(left[key], right[key]))
                return false;
        }
    }
    for (var key in right) {
        if (hasOwnProperty.call(right, key)) {
            if (!hasOwnProperty.call(left, key))
                return false;
        }
    }
    return true;
}
exports.equalOwnProperties = equalOwnProperties;
/** @internal */
function arrayToMap(array, makeKey, makeValue) {
    if (makeValue === void 0) { makeValue = identity; }
    var result = new Map();
    for (var _i = 0, array_5 = array; _i < array_5.length; _i++) {
        var value = array_5[_i];
        var key = makeKey(value);
        if (key !== undefined)
            result.set(key, makeValue(value));
    }
    return result;
}
exports.arrayToMap = arrayToMap;
/** @internal */
function arrayToNumericMap(array, makeKey, makeValue) {
    if (makeValue === void 0) { makeValue = identity; }
    var result = [];
    for (var _i = 0, array_6 = array; _i < array_6.length; _i++) {
        var value = array_6[_i];
        result[makeKey(value)] = makeValue(value);
    }
    return result;
}
exports.arrayToNumericMap = arrayToNumericMap;
/** @internal */
function arrayToMultiMap(values, makeKey, makeValue) {
    if (makeValue === void 0) { makeValue = identity; }
    var result = createMultiMap();
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        result.add(makeKey(value), makeValue(value));
    }
    return result;
}
exports.arrayToMultiMap = arrayToMultiMap;
/** @internal */
function group(values, getGroupId, resultSelector) {
    if (resultSelector === void 0) { resultSelector = identity; }
    return arrayFrom(arrayToMultiMap(values, getGroupId).values(), resultSelector);
}
exports.group = group;
function groupBy(values, keySelector) {
    var _a;
    var result = {};
    if (values) {
        for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
            var value = values_2[_i];
            var key = "".concat(keySelector(value));
            var array = (_a = result[key]) !== null && _a !== void 0 ? _a : (result[key] = []);
            array.push(value);
        }
    }
    return result;
}
exports.groupBy = groupBy;
/** @internal */
function clone(object) {
    var result = {};
    for (var id in object) {
        if (hasOwnProperty.call(object, id)) {
            result[id] = object[id];
        }
    }
    return result;
}
exports.clone = clone;
/**
 * Creates a new object by adding the own properties of `second`, then the own properties of `first`.
 *
 * NOTE: This means that if a property exists in both `first` and `second`, the property in `first` will be chosen.
 *
 * @internal
 */
function extend(first, second) {
    var result = {};
    for (var id in second) {
        if (hasOwnProperty.call(second, id)) {
            result[id] = second[id];
        }
    }
    for (var id in first) {
        if (hasOwnProperty.call(first, id)) {
            result[id] = first[id];
        }
    }
    return result;
}
exports.extend = extend;
/** @internal */
function copyProperties(first, second) {
    for (var id in second) {
        if (hasOwnProperty.call(second, id)) {
            first[id] = second[id];
        }
    }
}
exports.copyProperties = copyProperties;
/** @internal */
function maybeBind(obj, fn) {
    return fn ? fn.bind(obj) : undefined;
}
exports.maybeBind = maybeBind;
/** @internal */
function createMultiMap() {
    var map = new Map();
    map.add = multiMapAdd;
    map.remove = multiMapRemove;
    return map;
}
exports.createMultiMap = createMultiMap;
function multiMapAdd(key, value) {
    var values = this.get(key);
    if (values) {
        values.push(value);
    }
    else {
        this.set(key, values = [value]);
    }
    return values;
}
function multiMapRemove(key, value) {
    var values = this.get(key);
    if (values) {
        unorderedRemoveItem(values, value);
        if (!values.length) {
            this.delete(key);
        }
    }
}
/** @internal */
function createQueue(items) {
    var elements = (items === null || items === void 0 ? void 0 : items.slice()) || [];
    var headIndex = 0;
    function isEmpty() {
        return headIndex === elements.length;
    }
    function enqueue() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        elements.push.apply(elements, items);
    }
    function dequeue() {
        if (isEmpty()) {
            throw new Error("Queue is empty");
        }
        var result = elements[headIndex];
        elements[headIndex] = undefined; // Don't keep referencing dequeued item
        headIndex++;
        // If more than half of the queue is empty, copy the remaining elements to the
        // front and shrink the array (unless we'd be saving fewer than 100 slots)
        if (headIndex > 100 && headIndex > (elements.length >> 1)) {
            var newLength = elements.length - headIndex;
            elements.copyWithin(/*target*/ 0, /*start*/ headIndex);
            elements.length = newLength;
            headIndex = 0;
        }
        return result;
    }
    return {
        enqueue: enqueue,
        dequeue: dequeue,
        isEmpty: isEmpty,
    };
}
exports.createQueue = createQueue;
/**
 * Creates a Set with custom equality and hash code functionality.  This is useful when you
 * want to use something looser than object identity - e.g. "has the same span".
 *
 * If `equals(a, b)`, it must be the case that `getHashCode(a) === getHashCode(b)`.
 * The converse is not required.
 *
 * To facilitate a perf optimization (lazy allocation of bucket arrays), `TElement` is
 * assumed not to be an array type.
 *
 * @internal
 */
function createSet(getHashCode, equals) {
    var _a;
    var multiMap = new Map();
    var size = 0;
    function getElementIterator() {
        var _i, _a, value;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = multiMap.values();
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    value = _a[_i];
                    if (!isArray(value)) return [3 /*break*/, 3];
                    return [5 /*yield**/, __values(value)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, value];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    }
    var set = (_a = {
            has: function (element) {
                var hash = getHashCode(element);
                if (!multiMap.has(hash))
                    return false;
                var candidates = multiMap.get(hash);
                if (!isArray(candidates))
                    return equals(candidates, element);
                for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
                    var candidate = candidates_1[_i];
                    if (equals(candidate, element)) {
                        return true;
                    }
                }
                return false;
            },
            add: function (element) {
                var hash = getHashCode(element);
                if (multiMap.has(hash)) {
                    var values = multiMap.get(hash);
                    if (isArray(values)) {
                        if (!contains(values, element, equals)) {
                            values.push(element);
                            size++;
                        }
                    }
                    else {
                        var value = values;
                        if (!equals(value, element)) {
                            multiMap.set(hash, [value, element]);
                            size++;
                        }
                    }
                }
                else {
                    multiMap.set(hash, element);
                    size++;
                }
                return this;
            },
            delete: function (element) {
                var hash = getHashCode(element);
                if (!multiMap.has(hash))
                    return false;
                var candidates = multiMap.get(hash);
                if (isArray(candidates)) {
                    for (var i = 0; i < candidates.length; i++) {
                        if (equals(candidates[i], element)) {
                            if (candidates.length === 1) {
                                multiMap.delete(hash);
                            }
                            else if (candidates.length === 2) {
                                multiMap.set(hash, candidates[1 - i]);
                            }
                            else {
                                unorderedRemoveItemAt(candidates, i);
                            }
                            size--;
                            return true;
                        }
                    }
                }
                else {
                    var candidate = candidates;
                    if (equals(candidate, element)) {
                        multiMap.delete(hash);
                        size--;
                        return true;
                    }
                }
                return false;
            },
            clear: function () {
                multiMap.clear();
                size = 0;
            },
            get size() {
                return size;
            },
            forEach: function (action) {
                for (var _i = 0, _a = arrayFrom(multiMap.values()); _i < _a.length; _i++) {
                    var elements = _a[_i];
                    if (isArray(elements)) {
                        for (var _b = 0, elements_1 = elements; _b < elements_1.length; _b++) {
                            var element = elements_1[_b];
                            action(element, element, set);
                        }
                    }
                    else {
                        var element = elements;
                        action(element, element, set);
                    }
                }
            },
            keys: function () {
                return getElementIterator();
            },
            values: function () {
                return getElementIterator();
            },
            entries: function () {
                var _i, _a, value;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, _a = getElementIterator();
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            value = _a[_i];
                            return [4 /*yield*/, [value, value]];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            }
        },
        _a[Symbol.iterator] = function () {
            return getElementIterator();
        },
        _a[Symbol.toStringTag] = multiMap[Symbol.toStringTag],
        _a);
    return set;
}
exports.createSet = createSet;
/**
 * Tests whether a value is an array.
 *
 * @internal
 */
function isArray(value) {
    // See: https://github.com/microsoft/TypeScript/issues/17002
    return Array.isArray(value);
}
exports.isArray = isArray;
/** @internal */
function toArray(value) {
    return isArray(value) ? value : [value];
}
exports.toArray = toArray;
/**
 * Tests whether a value is string
 *
 * @internal
 */
function isString(text) {
    return typeof text === "string";
}
exports.isString = isString;
/** @internal */
function isNumber(x) {
    return typeof x === "number";
}
exports.isNumber = isNumber;
/** @internal */
function tryCast(value, test) {
    return value !== undefined && test(value) ? value : undefined;
}
exports.tryCast = tryCast;
/** @internal */
function cast(value, test) {
    if (value !== undefined && test(value))
        return value;
    return ts_1.Debug.fail("Invalid cast. The supplied value ".concat(value, " did not pass the test '").concat(ts_1.Debug.getFunctionName(test), "'."));
}
exports.cast = cast;
/**
 * Does nothing.
 *
 * @internal
 */
function noop(_) { }
exports.noop = noop;
/**
 * Do nothing and return false
 *
 * @internal
 */
function returnFalse() {
    return false;
}
exports.returnFalse = returnFalse;
/**
 * Do nothing and return true
 *
 * @internal
 */
function returnTrue() {
    return true;
}
exports.returnTrue = returnTrue;
/**
 * Do nothing and return undefined
 *
 * @internal
 */
function returnUndefined() {
    return undefined;
}
exports.returnUndefined = returnUndefined;
/**
 * Returns its argument.
 *
 * @internal
 */
function identity(x) {
    return x;
}
exports.identity = identity;
/**
 * Returns lower case string
 *
 * @internal
 */
function toLowerCase(x) {
    return x.toLowerCase();
}
exports.toLowerCase = toLowerCase;
// We convert the file names to lower case as key for file name on case insensitive file system
// While doing so we need to handle special characters (eg \u0130) to ensure that we dont convert
// it to lower case, fileName with its lowercase form can exist along side it.
// Handle special characters and make those case sensitive instead
//
// |-#--|-Unicode--|-Char code-|-Desc-------------------------------------------------------------------|
// | 1. | i        | 105       | Ascii i                                                                |
// | 2. | I        | 73        | Ascii I                                                                |
// |-------- Special characters ------------------------------------------------------------------------|
// | 3. | \u0130   | 304       | Upper case I with dot above                                            |
// | 4. | i,\u0307 | 105,775   | i, followed by 775: Lower case of (3rd item)                           |
// | 5. | I,\u0307 | 73,775    | I, followed by 775: Upper case of (4th item), lower case is (4th item) |
// | 6. | \u0131   | 305       | Lower case i without dot, upper case is I (2nd item)                   |
// | 7. | \u00DF   | 223       | Lower case sharp s                                                     |
//
// Because item 3 is special where in its lowercase character has its own
// upper case form we cant convert its case.
// Rest special characters are either already in lower case format or
// they have corresponding upper case character so they dont need special handling
//
// But to avoid having to do string building for most common cases, also ignore
// a-z, 0-9, \u0131, \u00DF, \, /, ., : and space
var fileNameLowerCaseRegExp = /[^\u0130\u0131\u00DFa-z0-9\\/:\-_\. ]+/g;
/**
 * Case insensitive file systems have descripencies in how they handle some characters (eg. turkish Upper case I with dot on top - \u0130)
 * This function is used in places where we want to make file name as a key on these systems
 * It is possible on mac to be able to refer to file name with I with dot on top as a fileName with its lower case form
 * But on windows we cannot. Windows can have fileName with I with dot on top next to its lower case and they can not each be referred with the lowercase forms
 * Technically we would want this function to be platform sepcific as well but
 * our api has till now only taken caseSensitive as the only input and just for some characters we dont want to update API and ensure all customers use those api
 * We could use upper case and we would still need to deal with the descripencies but
 * we want to continue using lower case since in most cases filenames are lowercasewe and wont need any case changes and avoid having to store another string for the key
 * So for this function purpose, we go ahead and assume character I with dot on top it as case sensitive since its very unlikely to use lower case form of that special character
 *
 * @internal
 */
function toFileNameLowerCase(x) {
    return fileNameLowerCaseRegExp.test(x) ?
        x.replace(fileNameLowerCaseRegExp, toLowerCase) :
        x;
}
exports.toFileNameLowerCase = toFileNameLowerCase;
/**
 * Throws an error because a function is not implemented.
 *
 * @internal
 */
function notImplemented() {
    throw new Error("Not implemented");
}
exports.notImplemented = notImplemented;
/** @internal */
function memoize(callback) {
    var value;
    return function () {
        if (callback) {
            value = callback();
            callback = undefined;
        }
        return value;
    };
}
exports.memoize = memoize;
/**
 * A version of `memoize` that supports a single primitive argument
 *
 * @internal
 */
function memoizeOne(callback) {
    var map = new Map();
    return function (arg) {
        var key = "".concat(typeof arg, ":").concat(arg);
        var value = map.get(key);
        if (value === undefined && !map.has(key)) {
            value = callback(arg);
            map.set(key, value);
        }
        return value;
    };
}
exports.memoizeOne = memoizeOne;
/**
 * A version of `memoize` that supports a single non-primitive argument, stored as keys of a WeakMap.
 *
 * @internal
 */
function memoizeWeak(callback) {
    var map = new WeakMap();
    return function (arg) {
        var value = map.get(arg);
        if (value === undefined && !map.has(arg)) {
            value = callback(arg);
            map.set(arg, value);
        }
        return value;
    };
}
exports.memoizeWeak = memoizeWeak;
/**
 * A version of `memoize` that supports multiple arguments, backed by a provided cache.
 *
 * @internal
 */
function memoizeCached(callback, cache) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var value = cache.get(args);
        if (value === undefined && !cache.has(args)) {
            value = callback.apply(void 0, args);
            cache.set(args, value);
        }
        return value;
    };
}
exports.memoizeCached = memoizeCached;
/** @internal */
function compose(a, b, c, d, e) {
    if (!!e) {
        var args_2 = [];
        for (var i = 0; i < arguments.length; i++) {
            args_2[i] = arguments[i];
        }
        return function (t) { return reduceLeft(args_2, function (u, f) { return f(u); }, t); };
    }
    else if (d) {
        return function (t) { return d(c(b(a(t)))); };
    }
    else if (c) {
        return function (t) { return c(b(a(t))); };
    }
    else if (b) {
        return function (t) { return b(a(t)); };
    }
    else if (a) {
        return function (t) { return a(t); };
    }
    else {
        return function (t) { return t; };
    }
}
exports.compose = compose;
/** @internal */
function equateValues(a, b) {
    return a === b;
}
exports.equateValues = equateValues;
/**
 * Compare the equality of two strings using a case-sensitive ordinal comparison.
 *
 * Case-sensitive comparisons compare both strings one code-point at a time using the integer
 * value of each code-point after applying `toUpperCase` to each string. We always map both
 * strings to their upper-case form as some unicode characters do not properly round-trip to
 * lowercase (such as `ẞ` (German sharp capital s)).
 *
 * @internal
 */
function equateStringsCaseInsensitive(a, b) {
    return a === b
        || a !== undefined
            && b !== undefined
            && a.toUpperCase() === b.toUpperCase();
}
exports.equateStringsCaseInsensitive = equateStringsCaseInsensitive;
/**
 * Compare the equality of two strings using a case-sensitive ordinal comparison.
 *
 * Case-sensitive comparisons compare both strings one code-point at a time using the
 * integer value of each code-point.
 *
 * @internal
 */
function equateStringsCaseSensitive(a, b) {
    return equateValues(a, b);
}
exports.equateStringsCaseSensitive = equateStringsCaseSensitive;
function compareComparableValues(a, b) {
    return a === b ? 0 /* Comparison.EqualTo */ :
        a === undefined ? -1 /* Comparison.LessThan */ :
            b === undefined ? 1 /* Comparison.GreaterThan */ :
                a < b ? -1 /* Comparison.LessThan */ :
                    1 /* Comparison.GreaterThan */;
}
/**
 * Compare two numeric values for their order relative to each other.
 * To compare strings, use any of the `compareStrings` functions.
 *
 * @internal
 */
function compareValues(a, b) {
    return compareComparableValues(a, b);
}
exports.compareValues = compareValues;
/**
 * Compare two TextSpans, first by `start`, then by `length`.
 *
 * @internal
 */
function compareTextSpans(a, b) {
    return compareValues(a === null || a === void 0 ? void 0 : a.start, b === null || b === void 0 ? void 0 : b.start) || compareValues(a === null || a === void 0 ? void 0 : a.length, b === null || b === void 0 ? void 0 : b.length);
}
exports.compareTextSpans = compareTextSpans;
/** @internal */
function min(items, compare) {
    return reduceLeft(items, function (x, y) { return compare(x, y) === -1 /* Comparison.LessThan */ ? x : y; });
}
exports.min = min;
/**
 * Compare two strings using a case-insensitive ordinal comparison.
 *
 * Ordinal comparisons are based on the difference between the unicode code points of both
 * strings. Characters with multiple unicode representations are considered unequal. Ordinal
 * comparisons provide predictable ordering, but place "a" after "B".
 *
 * Case-insensitive comparisons compare both strings one code-point at a time using the integer
 * value of each code-point after applying `toUpperCase` to each string. We always map both
 * strings to their upper-case form as some unicode characters do not properly round-trip to
 * lowercase (such as `ẞ` (German sharp capital s)).
 *
 * @internal
 */
function compareStringsCaseInsensitive(a, b) {
    if (a === b)
        return 0 /* Comparison.EqualTo */;
    if (a === undefined)
        return -1 /* Comparison.LessThan */;
    if (b === undefined)
        return 1 /* Comparison.GreaterThan */;
    a = a.toUpperCase();
    b = b.toUpperCase();
    return a < b ? -1 /* Comparison.LessThan */ : a > b ? 1 /* Comparison.GreaterThan */ : 0 /* Comparison.EqualTo */;
}
exports.compareStringsCaseInsensitive = compareStringsCaseInsensitive;
/**
 * `compareStringsCaseInsensitive` transforms letters to uppercase for unicode reasons,
 * while eslint's `sort-imports` rule transforms letters to lowercase. Which one you choose
 * affects the relative order of letters and ASCII characters 91-96, of which `_` is a
 * valid character in an identifier. So if we used `compareStringsCaseInsensitive` for
 * import sorting, TypeScript and eslint would disagree about the correct case-insensitive
 * sort order for `__String` and `Foo`. Since eslint's whole job is to create consistency
 * by enforcing nitpicky details like this, it makes way more sense for us to just adopt
 * their convention so users can have auto-imports without making eslint angry.
 *
 * @internal
 */
function compareStringsCaseInsensitiveEslintCompatible(a, b) {
    if (a === b)
        return 0 /* Comparison.EqualTo */;
    if (a === undefined)
        return -1 /* Comparison.LessThan */;
    if (b === undefined)
        return 1 /* Comparison.GreaterThan */;
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a < b ? -1 /* Comparison.LessThan */ : a > b ? 1 /* Comparison.GreaterThan */ : 0 /* Comparison.EqualTo */;
}
exports.compareStringsCaseInsensitiveEslintCompatible = compareStringsCaseInsensitiveEslintCompatible;
/**
 * Compare two strings using a case-sensitive ordinal comparison.
 *
 * Ordinal comparisons are based on the difference between the unicode code points of both
 * strings. Characters with multiple unicode representations are considered unequal. Ordinal
 * comparisons provide predictable ordering, but place "a" after "B".
 *
 * Case-sensitive comparisons compare both strings one code-point at a time using the integer
 * value of each code-point.
 *
 * @internal
 */
function compareStringsCaseSensitive(a, b) {
    return compareComparableValues(a, b);
}
exports.compareStringsCaseSensitive = compareStringsCaseSensitive;
/** @internal */
function getStringComparer(ignoreCase) {
    return ignoreCase ? compareStringsCaseInsensitive : compareStringsCaseSensitive;
}
exports.getStringComparer = getStringComparer;
/**
 * Creates a string comparer for use with string collation in the UI.
 */
var createUIStringComparer = (function () {
    var defaultComparer;
    var enUSComparer;
    var stringComparerFactory = getStringComparerFactory();
    return createStringComparer;
    function compareWithCallback(a, b, comparer) {
        if (a === b)
            return 0 /* Comparison.EqualTo */;
        if (a === undefined)
            return -1 /* Comparison.LessThan */;
        if (b === undefined)
            return 1 /* Comparison.GreaterThan */;
        var value = comparer(a, b);
        return value < 0 ? -1 /* Comparison.LessThan */ : value > 0 ? 1 /* Comparison.GreaterThan */ : 0 /* Comparison.EqualTo */;
    }
    function createIntlCollatorStringComparer(locale) {
        // Intl.Collator.prototype.compare is bound to the collator. See NOTE in
        // http://www.ecma-international.org/ecma-402/2.0/#sec-Intl.Collator.prototype.compare
        var comparer = new Intl.Collator(locale, { usage: "sort", sensitivity: "variant" }).compare;
        return function (a, b) { return compareWithCallback(a, b, comparer); };
    }
    function createLocaleCompareStringComparer(locale) {
        // if the locale is not the default locale (`undefined`), use the fallback comparer.
        if (locale !== undefined)
            return createFallbackStringComparer();
        return function (a, b) { return compareWithCallback(a, b, compareStrings); };
        function compareStrings(a, b) {
            return a.localeCompare(b);
        }
    }
    function createFallbackStringComparer() {
        // An ordinal comparison puts "A" after "b", but for the UI we want "A" before "b".
        // We first sort case insensitively.  So "Aaa" will come before "baa".
        // Then we sort case sensitively, so "aaa" will come before "Aaa".
        //
        // For case insensitive comparisons we always map both strings to their
        // upper-case form as some unicode characters do not properly round-trip to
        // lowercase (such as `Ã¡ÂºÅ¾` (German sharp capital s)).
        return function (a, b) { return compareWithCallback(a, b, compareDictionaryOrder); };
        function compareDictionaryOrder(a, b) {
            return compareStrings(a.toUpperCase(), b.toUpperCase()) || compareStrings(a, b);
        }
        function compareStrings(a, b) {
            return a < b ? -1 /* Comparison.LessThan */ : a > b ? 1 /* Comparison.GreaterThan */ : 0 /* Comparison.EqualTo */;
        }
    }
    function getStringComparerFactory() {
        // If the host supports Intl, we use it for comparisons using the default locale.
        if (typeof Intl === "object" && typeof Intl.Collator === "function") {
            return createIntlCollatorStringComparer;
        }
        // If the host does not support Intl, we fall back to localeCompare.
        // localeCompare in Node v0.10 is just an ordinal comparison, so don't use it.
        if (typeof String.prototype.localeCompare === "function" &&
            typeof String.prototype.toLocaleUpperCase === "function" &&
            "a".localeCompare("B") < 0) {
            return createLocaleCompareStringComparer;
        }
        // Otherwise, fall back to ordinal comparison:
        return createFallbackStringComparer;
    }
    function createStringComparer(locale) {
        // Hold onto common string comparers. This avoids constantly reallocating comparers during
        // tests.
        if (locale === undefined) {
            return defaultComparer || (defaultComparer = stringComparerFactory(locale));
        }
        else if (locale === "en-US") {
            return enUSComparer || (enUSComparer = stringComparerFactory(locale));
        }
        else {
            return stringComparerFactory(locale);
        }
    }
})();
var uiComparerCaseSensitive;
var uiLocale;
/** @internal */
function getUILocale() {
    return uiLocale;
}
exports.getUILocale = getUILocale;
/** @internal */
function setUILocale(value) {
    if (uiLocale !== value) {
        uiLocale = value;
        uiComparerCaseSensitive = undefined;
    }
}
exports.setUILocale = setUILocale;
/**
 * Compare two strings in a using the case-sensitive sort behavior of the UI locale.
 *
 * Ordering is not predictable between different host locales, but is best for displaying
 * ordered data for UI presentation. Characters with multiple unicode representations may
 * be considered equal.
 *
 * Case-sensitive comparisons compare strings that differ in base characters, or
 * accents/diacritic marks, or case as unequal.
 *
 * @internal
 */
function compareStringsCaseSensitiveUI(a, b) {
    var comparer = uiComparerCaseSensitive || (uiComparerCaseSensitive = createUIStringComparer(uiLocale));
    return comparer(a, b);
}
exports.compareStringsCaseSensitiveUI = compareStringsCaseSensitiveUI;
/** @internal */
function compareProperties(a, b, key, comparer) {
    return a === b ? 0 /* Comparison.EqualTo */ :
        a === undefined ? -1 /* Comparison.LessThan */ :
            b === undefined ? 1 /* Comparison.GreaterThan */ :
                comparer(a[key], b[key]);
}
exports.compareProperties = compareProperties;
/**
 * True is greater than false.
 *
 * @internal
 */
function compareBooleans(a, b) {
    return compareValues(a ? 1 : 0, b ? 1 : 0);
}
exports.compareBooleans = compareBooleans;
/**
 * Given a name and a list of names that are *not* equal to the name, return a spelling suggestion if there is one that is close enough.
 * Names less than length 3 only check for case-insensitive equality.
 *
 * find the candidate with the smallest Levenshtein distance,
 *    except for candidates:
 *      * With no name
 *      * Whose length differs from the target name by more than 0.34 of the length of the name.
 *      * Whose levenshtein distance is more than 0.4 of the length of the name
 *        (0.4 allows 1 substitution/transposition for every 5 characters,
 *         and 1 insertion/deletion at 3 characters)
 *
 * @internal
 */
function getSpellingSuggestion(name, candidates, getName) {
    var maximumLengthDifference = Math.max(2, Math.floor(name.length * 0.34));
    var bestDistance = Math.floor(name.length * 0.4) + 1; // If the best result is worse than this, don't bother.
    var bestCandidate;
    for (var _i = 0, candidates_2 = candidates; _i < candidates_2.length; _i++) {
        var candidate = candidates_2[_i];
        var candidateName = getName(candidate);
        if (candidateName !== undefined && Math.abs(candidateName.length - name.length) <= maximumLengthDifference) {
            if (candidateName === name) {
                continue;
            }
            // Only consider candidates less than 3 characters long when they differ by case.
            // Otherwise, don't bother, since a user would usually notice differences of a 2-character name.
            if (candidateName.length < 3 && candidateName.toLowerCase() !== name.toLowerCase()) {
                continue;
            }
            var distance = levenshteinWithMax(name, candidateName, bestDistance - 0.1);
            if (distance === undefined) {
                continue;
            }
            ts_1.Debug.assert(distance < bestDistance); // Else `levenshteinWithMax` should return undefined
            bestDistance = distance;
            bestCandidate = candidate;
        }
    }
    return bestCandidate;
}
exports.getSpellingSuggestion = getSpellingSuggestion;
function levenshteinWithMax(s1, s2, max) {
    var previous = new Array(s2.length + 1);
    var current = new Array(s2.length + 1);
    /** Represents any value > max. We don't care about the particular value. */
    var big = max + 0.01;
    for (var i = 0; i <= s2.length; i++) {
        previous[i] = i;
    }
    for (var i = 1; i <= s1.length; i++) {
        var c1 = s1.charCodeAt(i - 1);
        var minJ = Math.ceil(i > max ? i - max : 1);
        var maxJ = Math.floor(s2.length > max + i ? max + i : s2.length);
        current[0] = i;
        /** Smallest value of the matrix in the ith column. */
        var colMin = i;
        for (var j = 1; j < minJ; j++) {
            current[j] = big;
        }
        for (var j = minJ; j <= maxJ; j++) {
            // case difference should be significantly cheaper than other differences
            var substitutionDistance = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()
                ? (previous[j - 1] + 0.1)
                : (previous[j - 1] + 2);
            var dist = c1 === s2.charCodeAt(j - 1)
                ? previous[j - 1]
                : Math.min(/*delete*/ previous[j] + 1, /*insert*/ current[j - 1] + 1, /*substitute*/ substitutionDistance);
            current[j] = dist;
            colMin = Math.min(colMin, dist);
        }
        for (var j = maxJ + 1; j <= s2.length; j++) {
            current[j] = big;
        }
        if (colMin > max) {
            // Give up -- everything in this column is > max and it can't get better in future columns.
            return undefined;
        }
        var temp = previous;
        previous = current;
        current = temp;
    }
    var res = previous[s2.length];
    return res > max ? undefined : res;
}
/** @internal */
function endsWith(str, suffix) {
    var expectedPos = str.length - suffix.length;
    return expectedPos >= 0 && str.indexOf(suffix, expectedPos) === expectedPos;
}
exports.endsWith = endsWith;
/** @internal */
function removeSuffix(str, suffix) {
    return endsWith(str, suffix) ? str.slice(0, str.length - suffix.length) : str;
}
exports.removeSuffix = removeSuffix;
/** @internal */
function tryRemoveSuffix(str, suffix) {
    return endsWith(str, suffix) ? str.slice(0, str.length - suffix.length) : undefined;
}
exports.tryRemoveSuffix = tryRemoveSuffix;
/** @internal */
function stringContains(str, substring) {
    return str.indexOf(substring) !== -1;
}
exports.stringContains = stringContains;
/**
 * Takes a string like "jquery-min.4.2.3" and returns "jquery"
 *
 * @internal
 */
function removeMinAndVersionNumbers(fileName) {
    // We used to use the regex /[.-]((min)|(\d+(\.\d+)*))$/ and would just .replace it twice.
    // Unfortunately, that regex has O(n^2) performance because v8 doesn't match from the end of the string.
    // Instead, we now essentially scan the filename (backwards) ourselves.
    var end = fileName.length;
    for (var pos = end - 1; pos > 0; pos--) {
        var ch = fileName.charCodeAt(pos);
        if (ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */) {
            // Match a \d+ segment
            do {
                --pos;
                ch = fileName.charCodeAt(pos);
            } while (pos > 0 && ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */);
        }
        else if (pos > 4 && (ch === 110 /* CharacterCodes.n */ || ch === 78 /* CharacterCodes.N */)) {
            // Looking for "min" or "min"
            // Already matched the 'n'
            --pos;
            ch = fileName.charCodeAt(pos);
            if (ch !== 105 /* CharacterCodes.i */ && ch !== 73 /* CharacterCodes.I */) {
                break;
            }
            --pos;
            ch = fileName.charCodeAt(pos);
            if (ch !== 109 /* CharacterCodes.m */ && ch !== 77 /* CharacterCodes.M */) {
                break;
            }
            --pos;
            ch = fileName.charCodeAt(pos);
        }
        else {
            // This character is not part of either suffix pattern
            break;
        }
        if (ch !== 45 /* CharacterCodes.minus */ && ch !== 46 /* CharacterCodes.dot */) {
            break;
        }
        end = pos;
    }
    // end might be fileName.length, in which case this should internally no-op
    return end === fileName.length ? fileName : fileName.slice(0, end);
}
exports.removeMinAndVersionNumbers = removeMinAndVersionNumbers;
/**
 * Remove an item from an array, moving everything to its right one space left.
 *
 * @internal
 */
function orderedRemoveItem(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
            orderedRemoveItemAt(array, i);
            return true;
        }
    }
    return false;
}
exports.orderedRemoveItem = orderedRemoveItem;
/**
 * Remove an item by index from an array, moving everything to its right one space left.
 *
 * @internal
 */
function orderedRemoveItemAt(array, index) {
    // This seems to be faster than either `array.splice(i, 1)` or `array.copyWithin(i, i+ 1)`.
    for (var i = index; i < array.length - 1; i++) {
        array[i] = array[i + 1];
    }
    array.pop();
}
exports.orderedRemoveItemAt = orderedRemoveItemAt;
/** @internal */
function unorderedRemoveItemAt(array, index) {
    // Fill in the "hole" left at `index`.
    array[index] = array[array.length - 1];
    array.pop();
}
exports.unorderedRemoveItemAt = unorderedRemoveItemAt;
/**
 * Remove the *first* occurrence of `item` from the array.
 *
 * @internal
 */
function unorderedRemoveItem(array, item) {
    return unorderedRemoveFirstItemWhere(array, function (element) { return element === item; });
}
exports.unorderedRemoveItem = unorderedRemoveItem;
/** Remove the *first* element satisfying `predicate`. */
function unorderedRemoveFirstItemWhere(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            unorderedRemoveItemAt(array, i);
            return true;
        }
    }
    return false;
}
/** @internal */
function createGetCanonicalFileName(useCaseSensitiveFileNames) {
    return useCaseSensitiveFileNames ? identity : toFileNameLowerCase;
}
exports.createGetCanonicalFileName = createGetCanonicalFileName;
/** @internal */
function patternText(_a) {
    var prefix = _a.prefix, suffix = _a.suffix;
    return "".concat(prefix, "*").concat(suffix);
}
exports.patternText = patternText;
/**
 * Given that candidate matches pattern, returns the text matching the '*'.
 * E.g.: matchedText(tryParsePattern("foo*baz"), "foobarbaz") === "bar"
 *
 * @internal
 */
function matchedText(pattern, candidate) {
    ts_1.Debug.assert(isPatternMatch(pattern, candidate));
    return candidate.substring(pattern.prefix.length, candidate.length - pattern.suffix.length);
}
exports.matchedText = matchedText;
/**
 * Return the object corresponding to the best pattern to match `candidate`.
 *
 * @internal
 */
function findBestPatternMatch(values, getPattern, candidate) {
    var matchedValue;
    // use length of prefix as betterness criteria
    var longestMatchPrefixLength = -1;
    for (var _i = 0, values_3 = values; _i < values_3.length; _i++) {
        var v = values_3[_i];
        var pattern = getPattern(v);
        if (isPatternMatch(pattern, candidate) && pattern.prefix.length > longestMatchPrefixLength) {
            longestMatchPrefixLength = pattern.prefix.length;
            matchedValue = v;
        }
    }
    return matchedValue;
}
exports.findBestPatternMatch = findBestPatternMatch;
/** @internal */
function startsWith(str, prefix) {
    return str.lastIndexOf(prefix, 0) === 0;
}
exports.startsWith = startsWith;
/** @internal */
function removePrefix(str, prefix) {
    return startsWith(str, prefix) ? str.substr(prefix.length) : str;
}
exports.removePrefix = removePrefix;
/** @internal */
function tryRemovePrefix(str, prefix, getCanonicalFileName) {
    if (getCanonicalFileName === void 0) { getCanonicalFileName = identity; }
    return startsWith(getCanonicalFileName(str), getCanonicalFileName(prefix)) ? str.substring(prefix.length) : undefined;
}
exports.tryRemovePrefix = tryRemovePrefix;
/** @internal */
function isPatternMatch(_a, candidate) {
    var prefix = _a.prefix, suffix = _a.suffix;
    return candidate.length >= prefix.length + suffix.length &&
        startsWith(candidate, prefix) &&
        endsWith(candidate, suffix);
}
exports.isPatternMatch = isPatternMatch;
/** @internal */
function and(f, g) {
    return function (arg) { return f(arg) && g(arg); };
}
exports.and = and;
/** @internal */
function or() {
    var fs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fs[_i] = arguments[_i];
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var lastResult;
        for (var _a = 0, fs_1 = fs; _a < fs_1.length; _a++) {
            var f = fs_1[_a];
            lastResult = f.apply(void 0, args);
            if (lastResult) {
                return lastResult;
            }
        }
        return lastResult;
    };
}
exports.or = or;
/** @internal */
function not(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return !fn.apply(void 0, args);
    };
}
exports.not = not;
/** @internal */
function assertType(_) { }
exports.assertType = assertType;
/** @internal */
function singleElementArray(t) {
    return t === undefined ? undefined : [t];
}
exports.singleElementArray = singleElementArray;
/** @internal */
function enumerateInsertsAndDeletes(newItems, oldItems, comparer, inserted, deleted, unchanged) {
    unchanged = unchanged || noop;
    var newIndex = 0;
    var oldIndex = 0;
    var newLen = newItems.length;
    var oldLen = oldItems.length;
    var hasChanges = false;
    while (newIndex < newLen && oldIndex < oldLen) {
        var newItem = newItems[newIndex];
        var oldItem = oldItems[oldIndex];
        var compareResult = comparer(newItem, oldItem);
        if (compareResult === -1 /* Comparison.LessThan */) {
            inserted(newItem);
            newIndex++;
            hasChanges = true;
        }
        else if (compareResult === 1 /* Comparison.GreaterThan */) {
            deleted(oldItem);
            oldIndex++;
            hasChanges = true;
        }
        else {
            unchanged(oldItem, newItem);
            newIndex++;
            oldIndex++;
        }
    }
    while (newIndex < newLen) {
        inserted(newItems[newIndex++]);
        hasChanges = true;
    }
    while (oldIndex < oldLen) {
        deleted(oldItems[oldIndex++]);
        hasChanges = true;
    }
    return hasChanges;
}
exports.enumerateInsertsAndDeletes = enumerateInsertsAndDeletes;
/** @internal */
function cartesianProduct(arrays) {
    var result = [];
    cartesianProductWorker(arrays, result, /*outer*/ undefined, 0);
    return result;
}
exports.cartesianProduct = cartesianProduct;
function cartesianProductWorker(arrays, result, outer, index) {
    for (var _i = 0, _a = arrays[index]; _i < _a.length; _i++) {
        var element = _a[_i];
        var inner = void 0;
        if (outer) {
            inner = outer.slice();
            inner.push(element);
        }
        else {
            inner = [element];
        }
        if (index === arrays.length - 1) {
            result.push(inner);
        }
        else {
            cartesianProductWorker(arrays, result, inner, index + 1);
        }
    }
}
/**
 * Returns string left-padded with spaces or zeros until it reaches the given length.
 *
 * @param s String to pad.
 * @param length Final padded length. If less than or equal to 's.length', returns 's' unchanged.
 * @param padString Character to use as padding (default " ").
 *
 * @internal
 */
function padLeft(s, length, padString) {
    if (padString === void 0) { padString = " "; }
    return length <= s.length ? s : padString.repeat(length - s.length) + s;
}
exports.padLeft = padLeft;
/**
 * Returns string right-padded with spaces until it reaches the given length.
 *
 * @param s String to pad.
 * @param length Final padded length. If less than or equal to 's.length', returns 's' unchanged.
 * @param padString Character to use as padding (default " ").
 *
 * @internal
 */
function padRight(s, length, padString) {
    if (padString === void 0) { padString = " "; }
    return length <= s.length ? s : s + padString.repeat(length - s.length);
}
exports.padRight = padRight;
function takeWhile(array, predicate) {
    if (array) {
        var len = array.length;
        var index = 0;
        while (index < len && predicate(array[index])) {
            index++;
        }
        return array.slice(0, index);
    }
}
exports.takeWhile = takeWhile;
/** @internal */
function skipWhile(array, predicate) {
    if (array) {
        var len = array.length;
        var index = 0;
        while (index < len && predicate(array[index])) {
            index++;
        }
        return array.slice(index);
    }
}
exports.skipWhile = skipWhile;
/**
 * Removes the leading and trailing white space and line terminator characters from a string.
 *
 * @internal
 */
exports.trimString = !!String.prototype.trim ? (function (s) { return s.trim(); }) : function (s) { return (0, exports.trimStringEnd)((0, exports.trimStringStart)(s)); };
/**
 * Returns a copy with trailing whitespace removed.
 *
 * @internal
 */
exports.trimStringEnd = !!String.prototype.trimEnd ? (function (s) { return s.trimEnd(); }) : trimEndImpl;
/**
 * Returns a copy with leading whitespace removed.
 *
 * @internal
 */
exports.trimStringStart = !!String.prototype.trimStart ? (function (s) { return s.trimStart(); }) : function (s) { return s.replace(/^\s+/g, ""); };
/**
 * https://jsbench.me/gjkoxld4au/1
 * The simple regex for this, /\s+$/g is O(n^2) in v8.
 * The native .trimEnd method is by far best, but since that's technically ES2019,
 * we provide a (still much faster than the simple regex) fallback.
 */
function trimEndImpl(s) {
    var end = s.length - 1;
    while (end >= 0) {
        if (!(0, ts_1.isWhiteSpaceLike)(s.charCodeAt(end)))
            break;
        end--;
    }
    return s.slice(0, end + 1);
}
/** @internal */
function isNodeLikeSystem() {
    // This is defined here rather than in sys.ts to prevent a cycle from its
    // use in performanceCore.ts.
    //
    // We don't use the presence of `require` to check if we are in Node;
    // when bundled using esbuild, this function will be rewritten to `__require`
    // and definitely exist.
    return typeof process !== "undefined"
        && !!process.nextTick
        && !process.browser
        && typeof module === "object";
}
exports.isNodeLikeSystem = isNodeLikeSystem;
