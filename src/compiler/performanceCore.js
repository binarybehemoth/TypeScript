"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestamp = exports.tryGetNativePerformanceHooks = void 0;
var ts_1 = require("./_namespaces/ts");
// eslint-disable-next-line @typescript-eslint/naming-convention
function hasRequiredAPI(performance, PerformanceObserver) {
    return typeof performance === "object" &&
        typeof performance.timeOrigin === "number" &&
        typeof performance.mark === "function" &&
        typeof performance.measure === "function" &&
        typeof performance.now === "function" &&
        typeof performance.clearMarks === "function" &&
        typeof performance.clearMeasures === "function" &&
        typeof PerformanceObserver === "function";
}
function tryGetWebPerformanceHooks() {
    if (typeof performance === "object" &&
        typeof PerformanceObserver === "function" &&
        hasRequiredAPI(performance, PerformanceObserver)) {
        return {
            // For now we always write native performance events when running in the browser. We may
            // make this conditional in the future if we find that native web performance hooks
            // in the browser also slow down compilation.
            shouldWriteNativeEvents: true,
            performance: performance,
            PerformanceObserver: PerformanceObserver
        };
    }
}
function tryGetNodePerformanceHooks() {
    if ((0, ts_1.isNodeLikeSystem)()) {
        try {
            var _a = require("perf_hooks"), performance_1 = _a.performance, PerformanceObserver_1 = _a.PerformanceObserver;
            if (hasRequiredAPI(performance_1, PerformanceObserver_1)) {
                return {
                    // By default, only write native events when generating a cpu profile or using the v8 profiler.
                    shouldWriteNativeEvents: false,
                    performance: performance_1,
                    PerformanceObserver: PerformanceObserver_1
                };
            }
        }
        catch (_b) {
            // ignore errors
        }
    }
}
// Unlike with the native Map/Set 'tryGet' functions in corePublic.ts, we eagerly evaluate these
// since we will need them for `timestamp`, below.
var nativePerformanceHooks = tryGetWebPerformanceHooks() || tryGetNodePerformanceHooks();
var nativePerformance = nativePerformanceHooks === null || nativePerformanceHooks === void 0 ? void 0 : nativePerformanceHooks.performance;
/** @internal */
function tryGetNativePerformanceHooks() {
    return nativePerformanceHooks;
}
exports.tryGetNativePerformanceHooks = tryGetNativePerformanceHooks;
/**
 * Gets a timestamp with (at least) ms resolution
 *
 * @internal
 */
exports.timestamp = nativePerformance ? function () { return nativePerformance.now(); } :
    Date.now ? Date.now :
        function () { return +(new Date()); };
