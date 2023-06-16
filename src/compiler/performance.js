"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable = exports.enable = exports.isEnabled = exports.clearMarks = exports.clearMeasures = exports.forEachMark = exports.forEachMeasure = exports.getDuration = exports.getCount = exports.measure = exports.mark = exports.nullTimer = exports.createTimer = exports.createTimerIf = void 0;
var ts_1 = require("./_namespaces/ts");
var perfHooks;
// when set, indicates the implementation of `Performance` to use for user timing.
// when unset, indicates user timing is unavailable or disabled.
var performanceImpl;
/** @internal */
function createTimerIf(condition, measureName, startMarkName, endMarkName) {
    return condition ? createTimer(measureName, startMarkName, endMarkName) : exports.nullTimer;
}
exports.createTimerIf = createTimerIf;
/** @internal */
function createTimer(measureName, startMarkName, endMarkName) {
    var enterCount = 0;
    return {
        enter: enter,
        exit: exit
    };
    function enter() {
        if (++enterCount === 1) {
            mark(startMarkName);
        }
    }
    function exit() {
        if (--enterCount === 0) {
            mark(endMarkName);
            measure(measureName, startMarkName, endMarkName);
        }
        else if (enterCount < 0) {
            ts_1.Debug.fail("enter/exit count does not match.");
        }
    }
}
exports.createTimer = createTimer;
/** @internal */
exports.nullTimer = { enter: ts_1.noop, exit: ts_1.noop };
var enabled = false;
var timeorigin = (0, ts_1.timestamp)();
var marks = new Map();
var counts = new Map();
var durations = new Map();
/**
 * Marks a performance event.
 *
 * @param markName The name of the mark.
 *
 * @internal
 */
function mark(markName) {
    var _a;
    if (enabled) {
        var count = (_a = counts.get(markName)) !== null && _a !== void 0 ? _a : 0;
        counts.set(markName, count + 1);
        marks.set(markName, (0, ts_1.timestamp)());
        performanceImpl === null || performanceImpl === void 0 ? void 0 : performanceImpl.mark(markName);
        if (typeof onProfilerEvent === "function") {
            onProfilerEvent(markName);
        }
    }
}
exports.mark = mark;
/**
 * Adds a performance measurement with the specified name.
 *
 * @param measureName The name of the performance measurement.
 * @param startMarkName The name of the starting mark. If not supplied, the point at which the
 *      profiler was enabled is used.
 * @param endMarkName The name of the ending mark. If not supplied, the current timestamp is
 *      used.
 *
 * @internal
 */
function measure(measureName, startMarkName, endMarkName) {
    var _a, _b;
    if (enabled) {
        var end = (_a = (endMarkName !== undefined ? marks.get(endMarkName) : undefined)) !== null && _a !== void 0 ? _a : (0, ts_1.timestamp)();
        var start = (_b = (startMarkName !== undefined ? marks.get(startMarkName) : undefined)) !== null && _b !== void 0 ? _b : timeorigin;
        var previousDuration = durations.get(measureName) || 0;
        durations.set(measureName, previousDuration + (end - start));
        performanceImpl === null || performanceImpl === void 0 ? void 0 : performanceImpl.measure(measureName, startMarkName, endMarkName);
    }
}
exports.measure = measure;
/**
 * Gets the number of times a marker was encountered.
 *
 * @param markName The name of the mark.
 *
 * @internal
 */
function getCount(markName) {
    return counts.get(markName) || 0;
}
exports.getCount = getCount;
/**
 * Gets the total duration of all measurements with the supplied name.
 *
 * @param measureName The name of the measure whose durations should be accumulated.
 *
 * @internal
 */
function getDuration(measureName) {
    return durations.get(measureName) || 0;
}
exports.getDuration = getDuration;
/**
 * Iterate over each measure, performing some action
 *
 * @param cb The action to perform for each measure
 *
 * @internal
 */
function forEachMeasure(cb) {
    durations.forEach(function (duration, measureName) { return cb(measureName, duration); });
}
exports.forEachMeasure = forEachMeasure;
/** @internal */
function forEachMark(cb) {
    marks.forEach(function (_time, markName) { return cb(markName); });
}
exports.forEachMark = forEachMark;
/** @internal */
function clearMeasures(name) {
    if (name !== undefined)
        durations.delete(name);
    else
        durations.clear();
    performanceImpl === null || performanceImpl === void 0 ? void 0 : performanceImpl.clearMeasures(name);
}
exports.clearMeasures = clearMeasures;
/** @internal */
function clearMarks(name) {
    if (name !== undefined) {
        counts.delete(name);
        marks.delete(name);
    }
    else {
        counts.clear();
        marks.clear();
    }
    performanceImpl === null || performanceImpl === void 0 ? void 0 : performanceImpl.clearMarks(name);
}
exports.clearMarks = clearMarks;
/**
 * Indicates whether the performance API is enabled.
 *
 * @internal
 */
function isEnabled() {
    return enabled;
}
exports.isEnabled = isEnabled;
/**
 * Enables (and resets) performance measurements for the compiler.
 *
 * @internal
 */
function enable(system) {
    var _a;
    if (system === void 0) { system = ts_1.sys; }
    if (!enabled) {
        enabled = true;
        perfHooks || (perfHooks = (0, ts_1.tryGetNativePerformanceHooks)());
        if (perfHooks) {
            timeorigin = perfHooks.performance.timeOrigin;
            // NodeJS's Web Performance API is currently slower than expected, but we'd still like
            // to be able to leverage native trace events when node is run with either `--cpu-prof`
            // or `--prof`, if we're running with our own `--generateCpuProfile` flag, or when
            // running in debug mode (since its possible to generate a cpu profile while debugging).
            if (perfHooks.shouldWriteNativeEvents || ((_a = system === null || system === void 0 ? void 0 : system.cpuProfilingEnabled) === null || _a === void 0 ? void 0 : _a.call(system)) || (system === null || system === void 0 ? void 0 : system.debugMode)) {
                performanceImpl = perfHooks.performance;
            }
        }
    }
    return true;
}
exports.enable = enable;
/**
 * Disables performance measurements for the compiler.
 *
 * @internal
 */
function disable() {
    if (enabled) {
        marks.clear();
        counts.clear();
        durations.clear();
        performanceImpl = undefined;
        enabled = false;
    }
}
exports.disable = disable;
