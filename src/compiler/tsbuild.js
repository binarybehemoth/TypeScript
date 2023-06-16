"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConfigFileProjectName = exports.UpToDateStatusType = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
var UpToDateStatusType;
(function (UpToDateStatusType) {
    UpToDateStatusType[UpToDateStatusType["Unbuildable"] = 0] = "Unbuildable";
    UpToDateStatusType[UpToDateStatusType["UpToDate"] = 1] = "UpToDate";
    /**
     * The project appears out of date because its upstream inputs are newer than its outputs,
     * but all of its outputs are actually newer than the previous identical outputs of its (.d.ts) inputs.
     * This means we can Pseudo-build (just touch timestamps), as if we had actually built this project.
     */
    UpToDateStatusType[UpToDateStatusType["UpToDateWithUpstreamTypes"] = 2] = "UpToDateWithUpstreamTypes";
    /**
     * @deprecated
     * The project appears out of date because its upstream inputs are newer than its outputs,
     * but all of its outputs are actually newer than the previous identical outputs of its (.d.ts) inputs.
     * This means we can Pseudo-build (just manipulate outputs), as if we had actually built this project.
     */
    UpToDateStatusType[UpToDateStatusType["OutOfDateWithPrepend"] = 3] = "OutOfDateWithPrepend";
    UpToDateStatusType[UpToDateStatusType["OutputMissing"] = 4] = "OutputMissing";
    UpToDateStatusType[UpToDateStatusType["ErrorReadingFile"] = 5] = "ErrorReadingFile";
    UpToDateStatusType[UpToDateStatusType["OutOfDateWithSelf"] = 6] = "OutOfDateWithSelf";
    UpToDateStatusType[UpToDateStatusType["OutOfDateWithUpstream"] = 7] = "OutOfDateWithUpstream";
    UpToDateStatusType[UpToDateStatusType["OutOfDateBuildInfo"] = 8] = "OutOfDateBuildInfo";
    UpToDateStatusType[UpToDateStatusType["OutOfDateOptions"] = 9] = "OutOfDateOptions";
    UpToDateStatusType[UpToDateStatusType["OutOfDateRoots"] = 10] = "OutOfDateRoots";
    UpToDateStatusType[UpToDateStatusType["UpstreamOutOfDate"] = 11] = "UpstreamOutOfDate";
    UpToDateStatusType[UpToDateStatusType["UpstreamBlocked"] = 12] = "UpstreamBlocked";
    UpToDateStatusType[UpToDateStatusType["ComputingUpstream"] = 13] = "ComputingUpstream";
    UpToDateStatusType[UpToDateStatusType["TsVersionOutputOfDate"] = 14] = "TsVersionOutputOfDate";
    UpToDateStatusType[UpToDateStatusType["UpToDateWithInputFileText"] = 15] = "UpToDateWithInputFileText";
    /**
     * Projects with no outputs (i.e. "solution" files)
     */
    UpToDateStatusType[UpToDateStatusType["ContainerOnly"] = 16] = "ContainerOnly";
    UpToDateStatusType[UpToDateStatusType["ForceBuild"] = 17] = "ForceBuild";
})(UpToDateStatusType || (exports.UpToDateStatusType = UpToDateStatusType = {}));
/** @internal */
function resolveConfigFileProjectName(project) {
    if ((0, ts_1.fileExtensionIs)(project, ".json" /* Extension.Json */)) {
        return project;
    }
    return (0, ts_1.combinePaths)(project, "tsconfig.json");
}
exports.resolveConfigFileProjectName = resolveConfigFileProjectName;
