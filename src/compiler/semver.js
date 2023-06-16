"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionRange = exports.Version = void 0;
var ts_1 = require("./_namespaces/ts");
// https://semver.org/#spec-item-2
// > A normal version number MUST take the form X.Y.Z where X, Y, and Z are non-negative
// > integers, and MUST NOT contain leading zeroes. X is the major version, Y is the minor
// > version, and Z is the patch version. Each element MUST increase numerically.
//
// NOTE: We differ here in that we allow X and X.Y, with missing parts having the default
// value of `0`.
var versionRegExp = /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:\-([a-z0-9-.]+))?(?:\+([a-z0-9-.]+))?)?)?$/i;
// https://semver.org/#spec-item-9
// > A pre-release version MAY be denoted by appending a hyphen and a series of dot separated
// > identifiers immediately following the patch version. Identifiers MUST comprise only ASCII
// > alphanumerics and hyphen [0-9A-Za-z-]. Identifiers MUST NOT be empty. Numeric identifiers
// > MUST NOT include leading zeroes.
var prereleaseRegExp = /^(?:0|[1-9]\d*|[a-z-][a-z0-9-]*)(?:\.(?:0|[1-9]\d*|[a-z-][a-z0-9-]*))*$/i;
var prereleasePartRegExp = /^(?:0|[1-9]\d*|[a-z-][a-z0-9-]*)$/i;
// https://semver.org/#spec-item-10
// > Build metadata MAY be denoted by appending a plus sign and a series of dot separated
// > identifiers immediately following the patch or pre-release version. Identifiers MUST
// > comprise only ASCII alphanumerics and hyphen [0-9A-Za-z-]. Identifiers MUST NOT be empty.
var buildRegExp = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i;
var buildPartRegExp = /^[a-z0-9-]+$/i;
// https://semver.org/#spec-item-9
// > Numeric identifiers MUST NOT include leading zeroes.
var numericIdentifierRegExp = /^(0|[1-9]\d*)$/;
/**
 * Describes a precise semantic version number, https://semver.org
 *
 * @internal
 */
var Version = exports.Version = /** @class */ (function () {
    function Version(major, minor, patch, prerelease, build) {
        if (minor === void 0) { minor = 0; }
        if (patch === void 0) { patch = 0; }
        if (prerelease === void 0) { prerelease = ""; }
        if (build === void 0) { build = ""; }
        if (typeof major === "string") {
            var result = ts_1.Debug.checkDefined(tryParseComponents(major), "Invalid version");
            (major = result.major, minor = result.minor, patch = result.patch, prerelease = result.prerelease, build = result.build);
        }
        ts_1.Debug.assert(major >= 0, "Invalid argument: major");
        ts_1.Debug.assert(minor >= 0, "Invalid argument: minor");
        ts_1.Debug.assert(patch >= 0, "Invalid argument: patch");
        var prereleaseArray = prerelease ? (0, ts_1.isArray)(prerelease) ? prerelease : prerelease.split(".") : ts_1.emptyArray;
        var buildArray = build ? (0, ts_1.isArray)(build) ? build : build.split(".") : ts_1.emptyArray;
        ts_1.Debug.assert((0, ts_1.every)(prereleaseArray, function (s) { return prereleasePartRegExp.test(s); }), "Invalid argument: prerelease");
        ts_1.Debug.assert((0, ts_1.every)(buildArray, function (s) { return buildPartRegExp.test(s); }), "Invalid argument: build");
        this.major = major;
        this.minor = minor;
        this.patch = patch;
        this.prerelease = prereleaseArray;
        this.build = buildArray;
    }
    Version.tryParse = function (text) {
        var result = tryParseComponents(text);
        if (!result)
            return undefined;
        var major = result.major, minor = result.minor, patch = result.patch, prerelease = result.prerelease, build = result.build;
        return new Version(major, minor, patch, prerelease, build);
    };
    Version.prototype.compareTo = function (other) {
        // https://semver.org/#spec-item-11
        // > Precedence is determined by the first difference when comparing each of these
        // > identifiers from left to right as follows: Major, minor, and patch versions are
        // > always compared numerically.
        //
        // https://semver.org/#spec-item-11
        // > Precedence for two pre-release versions with the same major, minor, and patch version
        // > MUST be determined by comparing each dot separated identifier from left to right until
        // > a difference is found [...]
        //
        // https://semver.org/#spec-item-11
        // > Build metadata does not figure into precedence
        if (this === other)
            return 0 /* Comparison.EqualTo */;
        if (other === undefined)
            return 1 /* Comparison.GreaterThan */;
        return (0, ts_1.compareValues)(this.major, other.major)
            || (0, ts_1.compareValues)(this.minor, other.minor)
            || (0, ts_1.compareValues)(this.patch, other.patch)
            || comparePrereleaseIdentifiers(this.prerelease, other.prerelease);
    };
    Version.prototype.increment = function (field) {
        switch (field) {
            case "major": return new Version(this.major + 1, 0, 0);
            case "minor": return new Version(this.major, this.minor + 1, 0);
            case "patch": return new Version(this.major, this.minor, this.patch + 1);
            default: return ts_1.Debug.assertNever(field);
        }
    };
    Version.prototype.with = function (fields) {
        var _a, _b, _c, _d, _e;
        var major = (_a = fields.major, _a === void 0 ? this.major : _a), minor = (_b = fields.minor, _b === void 0 ? this.minor : _b), patch = (_c = fields.patch, _c === void 0 ? this.patch : _c), prerelease = (_d = fields.prerelease, _d === void 0 ? this.prerelease : _d), build = (_e = fields.build, _e === void 0 ? this.build : _e);
        return new Version(major, minor, patch, prerelease, build);
    };
    Version.prototype.toString = function () {
        var result = "".concat(this.major, ".").concat(this.minor, ".").concat(this.patch);
        if ((0, ts_1.some)(this.prerelease))
            result += "-".concat(this.prerelease.join("."));
        if ((0, ts_1.some)(this.build))
            result += "+".concat(this.build.join("."));
        return result;
    };
    Version.zero = new Version(0, 0, 0, ["0"]);
    return Version;
}());
function tryParseComponents(text) {
    var match = versionRegExp.exec(text);
    if (!match)
        return undefined;
    var major = match[1], _a = match[2], minor = _a === void 0 ? "0" : _a, _b = match[3], patch = _b === void 0 ? "0" : _b, _c = match[4], prerelease = _c === void 0 ? "" : _c, _d = match[5], build = _d === void 0 ? "" : _d;
    if (prerelease && !prereleaseRegExp.test(prerelease))
        return undefined;
    if (build && !buildRegExp.test(build))
        return undefined;
    return {
        major: parseInt(major, 10),
        minor: parseInt(minor, 10),
        patch: parseInt(patch, 10),
        prerelease: prerelease,
        build: build
    };
}
function comparePrereleaseIdentifiers(left, right) {
    // https://semver.org/#spec-item-11
    // > When major, minor, and patch are equal, a pre-release version has lower precedence
    // > than a normal version.
    if (left === right)
        return 0 /* Comparison.EqualTo */;
    if (left.length === 0)
        return right.length === 0 ? 0 /* Comparison.EqualTo */ : 1 /* Comparison.GreaterThan */;
    if (right.length === 0)
        return -1 /* Comparison.LessThan */;
    // https://semver.org/#spec-item-11
    // > Precedence for two pre-release versions with the same major, minor, and patch version
    // > MUST be determined by comparing each dot separated identifier from left to right until
    // > a difference is found [...]
    var length = Math.min(left.length, right.length);
    for (var i = 0; i < length; i++) {
        var leftIdentifier = left[i];
        var rightIdentifier = right[i];
        if (leftIdentifier === rightIdentifier)
            continue;
        var leftIsNumeric = numericIdentifierRegExp.test(leftIdentifier);
        var rightIsNumeric = numericIdentifierRegExp.test(rightIdentifier);
        if (leftIsNumeric || rightIsNumeric) {
            // https://semver.org/#spec-item-11
            // > Numeric identifiers always have lower precedence than non-numeric identifiers.
            if (leftIsNumeric !== rightIsNumeric)
                return leftIsNumeric ? -1 /* Comparison.LessThan */ : 1 /* Comparison.GreaterThan */;
            // https://semver.org/#spec-item-11
            // > identifiers consisting of only digits are compared numerically
            var result = (0, ts_1.compareValues)(+leftIdentifier, +rightIdentifier);
            if (result)
                return result;
        }
        else {
            // https://semver.org/#spec-item-11
            // > identifiers with letters or hyphens are compared lexically in ASCII sort order.
            var result = (0, ts_1.compareStringsCaseSensitive)(leftIdentifier, rightIdentifier);
            if (result)
                return result;
        }
    }
    // https://semver.org/#spec-item-11
    // > A larger set of pre-release fields has a higher precedence than a smaller set, if all
    // > of the preceding identifiers are equal.
    return (0, ts_1.compareValues)(left.length, right.length);
}
/**
 * Describes a semantic version range, per https://github.com/npm/node-semver#ranges
 *
 * @internal
 */
var VersionRange = /** @class */ (function () {
    function VersionRange(spec) {
        this._alternatives = spec ? ts_1.Debug.checkDefined(parseRange(spec), "Invalid range spec.") : ts_1.emptyArray;
    }
    VersionRange.tryParse = function (text) {
        var sets = parseRange(text);
        if (sets) {
            var range = new VersionRange("");
            range._alternatives = sets;
            return range;
        }
        return undefined;
    };
    /**
     * Tests whether a version matches the range. This is equivalent to `satisfies(version, range, { includePrerelease: true })`.
     * in `node-semver`.
     */
    VersionRange.prototype.test = function (version) {
        if (typeof version === "string")
            version = new Version(version);
        return testDisjunction(version, this._alternatives);
    };
    VersionRange.prototype.toString = function () {
        return formatDisjunction(this._alternatives);
    };
    return VersionRange;
}());
exports.VersionRange = VersionRange;
// https://github.com/npm/node-semver#range-grammar
//
// range-set    ::= range ( logical-or range ) *
// range        ::= hyphen | simple ( ' ' simple ) * | ''
// logical-or   ::= ( ' ' ) * '||' ( ' ' ) *
var logicalOrRegExp = /\|\|/g;
var whitespaceRegExp = /\s+/g;
// https://github.com/npm/node-semver#range-grammar
//
// partial      ::= xr ( '.' xr ( '.' xr qualifier ? )? )?
// xr           ::= 'x' | 'X' | '*' | nr
// nr           ::= '0' | ['1'-'9'] ( ['0'-'9'] ) *
// qualifier    ::= ( '-' pre )? ( '+' build )?
// pre          ::= parts
// build        ::= parts
// parts        ::= part ( '.' part ) *
// part         ::= nr | [-0-9A-Za-z]+
var partialRegExp = /^([xX*0]|[1-9]\d*)(?:\.([xX*0]|[1-9]\d*)(?:\.([xX*0]|[1-9]\d*)(?:-([a-z0-9-.]+))?(?:\+([a-z0-9-.]+))?)?)?$/i;
// https://github.com/npm/node-semver#range-grammar
//
// hyphen       ::= partial ' - ' partial
var hyphenRegExp = /^\s*([a-z0-9-+.*]+)\s+-\s+([a-z0-9-+.*]+)\s*$/i;
// https://github.com/npm/node-semver#range-grammar
//
// simple       ::= primitive | partial | tilde | caret
// primitive    ::= ( '<' | '>' | '>=' | '<=' | '=' ) partial
// tilde        ::= '~' partial
// caret        ::= '^' partial
var rangeRegExp = /^(~|\^|<|<=|>|>=|=)?\s*([a-z0-9-+.*]+)$/i;
function parseRange(text) {
    var alternatives = [];
    for (var _i = 0, _a = (0, ts_1.trimString)(text).split(logicalOrRegExp); _i < _a.length; _i++) {
        var range = _a[_i];
        if (!range)
            continue;
        var comparators = [];
        range = (0, ts_1.trimString)(range);
        var match = hyphenRegExp.exec(range);
        if (match) {
            if (!parseHyphen(match[1], match[2], comparators))
                return undefined;
        }
        else {
            for (var _b = 0, _c = range.split(whitespaceRegExp); _b < _c.length; _b++) {
                var simple = _c[_b];
                var match_1 = rangeRegExp.exec((0, ts_1.trimString)(simple));
                if (!match_1 || !parseComparator(match_1[1], match_1[2], comparators))
                    return undefined;
            }
        }
        alternatives.push(comparators);
    }
    return alternatives;
}
function parsePartial(text) {
    var match = partialRegExp.exec(text);
    if (!match)
        return undefined;
    var major = match[1], _a = match[2], minor = _a === void 0 ? "*" : _a, _b = match[3], patch = _b === void 0 ? "*" : _b, prerelease = match[4], build = match[5];
    var version = new Version(isWildcard(major) ? 0 : parseInt(major, 10), isWildcard(major) || isWildcard(minor) ? 0 : parseInt(minor, 10), isWildcard(major) || isWildcard(minor) || isWildcard(patch) ? 0 : parseInt(patch, 10), prerelease, build);
    return { version: version, major: major, minor: minor, patch: patch };
}
function parseHyphen(left, right, comparators) {
    var leftResult = parsePartial(left);
    if (!leftResult)
        return false;
    var rightResult = parsePartial(right);
    if (!rightResult)
        return false;
    if (!isWildcard(leftResult.major)) {
        comparators.push(createComparator(">=", leftResult.version));
    }
    if (!isWildcard(rightResult.major)) {
        comparators.push(isWildcard(rightResult.minor) ? createComparator("<", rightResult.version.increment("major")) :
            isWildcard(rightResult.patch) ? createComparator("<", rightResult.version.increment("minor")) :
                createComparator("<=", rightResult.version));
    }
    return true;
}
function parseComparator(operator, text, comparators) {
    var result = parsePartial(text);
    if (!result)
        return false;
    var version = result.version, major = result.major, minor = result.minor, patch = result.patch;
    if (!isWildcard(major)) {
        switch (operator) {
            case "~":
                comparators.push(createComparator(">=", version));
                comparators.push(createComparator("<", version.increment(isWildcard(minor) ? "major" :
                    "minor")));
                break;
            case "^":
                comparators.push(createComparator(">=", version));
                comparators.push(createComparator("<", version.increment(version.major > 0 || isWildcard(minor) ? "major" :
                    version.minor > 0 || isWildcard(patch) ? "minor" :
                        "patch")));
                break;
            case "<":
            case ">=":
                comparators.push(isWildcard(minor) || isWildcard(patch) ? createComparator(operator, version.with({ prerelease: "0" })) :
                    createComparator(operator, version));
                break;
            case "<=":
            case ">":
                comparators.push(isWildcard(minor) ? createComparator(operator === "<=" ? "<" : ">=", version.increment("major").with({ prerelease: "0" })) :
                    isWildcard(patch) ? createComparator(operator === "<=" ? "<" : ">=", version.increment("minor").with({ prerelease: "0" })) :
                        createComparator(operator, version));
                break;
            case "=":
            case undefined:
                if (isWildcard(minor) || isWildcard(patch)) {
                    comparators.push(createComparator(">=", version.with({ prerelease: "0" })));
                    comparators.push(createComparator("<", version.increment(isWildcard(minor) ? "major" : "minor").with({ prerelease: "0" })));
                }
                else {
                    comparators.push(createComparator("=", version));
                }
                break;
            default:
                // unrecognized
                return false;
        }
    }
    else if (operator === "<" || operator === ">") {
        comparators.push(createComparator("<", Version.zero));
    }
    return true;
}
function isWildcard(part) {
    return part === "*" || part === "x" || part === "X";
}
function createComparator(operator, operand) {
    return { operator: operator, operand: operand };
}
function testDisjunction(version, alternatives) {
    // an empty disjunction is treated as "*" (all versions)
    if (alternatives.length === 0)
        return true;
    for (var _i = 0, alternatives_1 = alternatives; _i < alternatives_1.length; _i++) {
        var alternative = alternatives_1[_i];
        if (testAlternative(version, alternative))
            return true;
    }
    return false;
}
function testAlternative(version, comparators) {
    for (var _i = 0, comparators_1 = comparators; _i < comparators_1.length; _i++) {
        var comparator = comparators_1[_i];
        if (!testComparator(version, comparator.operator, comparator.operand))
            return false;
    }
    return true;
}
function testComparator(version, operator, operand) {
    var cmp = version.compareTo(operand);
    switch (operator) {
        case "<": return cmp < 0;
        case "<=": return cmp <= 0;
        case ">": return cmp > 0;
        case ">=": return cmp >= 0;
        case "=": return cmp === 0;
        default: return ts_1.Debug.assertNever(operator);
    }
}
function formatDisjunction(alternatives) {
    return (0, ts_1.map)(alternatives, formatAlternative).join(" || ") || "*";
}
function formatAlternative(comparators) {
    return (0, ts_1.map)(comparators, formatComparator).join(" ");
}
function formatComparator(comparator) {
    return "".concat(comparator.operator).concat(comparator.operand);
}
