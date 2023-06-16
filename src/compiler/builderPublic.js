"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAbstractBuilder = exports.createEmitAndSemanticDiagnosticsBuilderProgram = exports.createSemanticDiagnosticsBuilderProgram = void 0;
var ts_1 = require("./_namespaces/ts");
function createSemanticDiagnosticsBuilderProgram(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences) {
    return (0, ts_1.createBuilderProgram)(ts_1.BuilderProgramKind.SemanticDiagnosticsBuilderProgram, (0, ts_1.getBuilderCreationParameters)(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences));
}
exports.createSemanticDiagnosticsBuilderProgram = createSemanticDiagnosticsBuilderProgram;
function createEmitAndSemanticDiagnosticsBuilderProgram(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences) {
    return (0, ts_1.createBuilderProgram)(ts_1.BuilderProgramKind.EmitAndSemanticDiagnosticsBuilderProgram, (0, ts_1.getBuilderCreationParameters)(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences));
}
exports.createEmitAndSemanticDiagnosticsBuilderProgram = createEmitAndSemanticDiagnosticsBuilderProgram;
function createAbstractBuilder(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences) {
    var _a = (0, ts_1.getBuilderCreationParameters)(newProgramOrRootNames, hostOrOptions, oldProgramOrHost, configFileParsingDiagnosticsOrOldProgram, configFileParsingDiagnostics, projectReferences), newProgram = _a.newProgram, newConfigFileParsingDiagnostics = _a.configFileParsingDiagnostics;
    return (0, ts_1.createRedirectedBuilderProgram)(function () { return ({ program: newProgram, compilerOptions: newProgram.getCompilerOptions() }); }, newConfigFileParsingDiagnostics);
}
exports.createAbstractBuilder = createAbstractBuilder;
