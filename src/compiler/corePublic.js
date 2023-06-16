"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.versionMajorMinor = void 0;
// WARNING: The script `configurePrerelease.ts` uses a regexp to parse out these values.
// If changing the text in this section, be sure to test `configurePrerelease` too.
exports.versionMajorMinor = "5.2";
// The following is baselined as a literal template type without intervention
/** The version of the TypeScript compiler release */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
exports.version = "".concat(exports.versionMajorMinor, ".0-dev");
