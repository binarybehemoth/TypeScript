"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfLogger = void 0;
// Load optional module to enable Event Tracing for Windows
// See https://github.com/microsoft/typescript-etw for more information
var etwModule;
try {
    var etwModulePath = (_a = process.env.TS_ETW_MODULE_PATH) !== null && _a !== void 0 ? _a : "./node_modules/@microsoft/typescript-etw";
    // require() will throw an exception if the module is not found
    // It may also return undefined if not installed properly
    etwModule = require(etwModulePath);
}
catch (e) {
    etwModule = undefined;
}
/**
 * Performance logger that will generate ETW events if possible - check for `logEvent` member, as `etwModule` will be `{}` when browserified
 *
 * @internal
 */
exports.perfLogger = (etwModule === null || etwModule === void 0 ? void 0 : etwModule.logEvent) ? etwModule : undefined;
