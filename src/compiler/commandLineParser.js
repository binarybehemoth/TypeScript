"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.canJsonReportNoInputFiles = exports.defaultIncludeSpec = exports.setConfigFileInOptions = exports.parseJsonSourceFileConfigFileContent = exports.parseJsonConfigFileContent = exports.convertToOptionsWithAbsolutePaths = exports.generateTSConfig = exports.getCompilerOptionsDiffValue = exports.serializeCompilerOptions = exports.getNameOfCompilerOptionValue = exports.optionMapToObject = exports.convertToTSConfig = exports.convertToJson = exports.convertToObject = exports.tryReadFile = exports.readJsonConfigFile = exports.parseConfigFileTextToJson = exports.readConfigFile = exports.getParsedCommandLineOfConfigFile = exports.getDiagnosticText = exports.parseBuildCommand = exports.getOptionFromName = exports.parseCommandLine = exports.compilerOptionsDidYouMeanDiagnostics = exports.parseCommandLineWorker = exports.parseListTypeOption = exports.parseCustomTypeOption = exports.createCompilerDiagnosticForInvalidCustomType = exports.defaultInitCompilerOptions = exports.getOptionsNameMap = exports.createOptionNameMap = exports.typeAcquisitionDeclarations = exports.buildOpts = exports.optionsForBuild = exports.transpileOptionValueCompilerOptions = exports.optionsAffectingProgramStructure = exports.sourceFileAffectingCompilerOptions = exports.moduleResolutionOptionDeclarations = exports.affectsDeclarationPathOptionDeclarations = exports.affectsEmitOptionDeclarations = exports.semanticDiagnosticsOptionDeclarations = exports.optionDeclarations = exports.moduleOptionDeclaration = exports.targetOptionDeclaration = exports.commonOptionsWithBuild = exports.optionsForWatch = exports.libMap = exports.libs = exports.inverseJsxOptionMap = exports.compileOnSaveCommandLineOption = void 0;
exports.convertCompilerOptionsForTelemetry = exports.matchesExclude = exports.isExcludedFile = exports.getFileNamesFromConfigSpecs = exports.convertJsonOption = exports.convertTypeAcquisitionFromJson = exports.convertCompilerOptionsFromJson = exports.updateErrorForNoInputFiles = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
exports.compileOnSaveCommandLineOption = {
    name: "compileOnSave",
    type: "boolean",
    defaultValueDescription: false,
};
var jsxOptionMap = new Map(Object.entries({
    "preserve": 1 /* JsxEmit.Preserve */,
    "react-native": 3 /* JsxEmit.ReactNative */,
    "react": 2 /* JsxEmit.React */,
    "react-jsx": 4 /* JsxEmit.ReactJSX */,
    "react-jsxdev": 5 /* JsxEmit.ReactJSXDev */,
}));
/** @internal */
exports.inverseJsxOptionMap = new Map((0, ts_1.mapIterator)(jsxOptionMap.entries(), function (_a) {
    var key = _a[0], value = _a[1];
    return ["" + value, key];
}));
// NOTE: The order here is important to default lib ordering as entries will have the same
//       order in the generated program (see `getDefaultLibPriority` in program.ts). This
//       order also affects overload resolution when a type declared in one lib is
//       augmented in another lib.
var libEntries = [
    // JavaScript only
    ["es5", "lib.es5.d.ts"],
    ["es6", "lib.es2015.d.ts"],
    ["es2015", "lib.es2015.d.ts"],
    ["es7", "lib.es2016.d.ts"],
    ["es2016", "lib.es2016.d.ts"],
    ["es2017", "lib.es2017.d.ts"],
    ["es2018", "lib.es2018.d.ts"],
    ["es2019", "lib.es2019.d.ts"],
    ["es2020", "lib.es2020.d.ts"],
    ["es2021", "lib.es2021.d.ts"],
    ["es2022", "lib.es2022.d.ts"],
    ["es2023", "lib.es2023.d.ts"],
    ["esnext", "lib.esnext.d.ts"],
    // Host only
    ["dom", "lib.dom.d.ts"],
    ["dom.iterable", "lib.dom.iterable.d.ts"],
    ["webworker", "lib.webworker.d.ts"],
    ["webworker.importscripts", "lib.webworker.importscripts.d.ts"],
    ["webworker.iterable", "lib.webworker.iterable.d.ts"],
    ["scripthost", "lib.scripthost.d.ts"],
    // ES2015 Or ESNext By-feature options
    ["es2015.core", "lib.es2015.core.d.ts"],
    ["es2015.collection", "lib.es2015.collection.d.ts"],
    ["es2015.generator", "lib.es2015.generator.d.ts"],
    ["es2015.iterable", "lib.es2015.iterable.d.ts"],
    ["es2015.promise", "lib.es2015.promise.d.ts"],
    ["es2015.proxy", "lib.es2015.proxy.d.ts"],
    ["es2015.reflect", "lib.es2015.reflect.d.ts"],
    ["es2015.symbol", "lib.es2015.symbol.d.ts"],
    ["es2015.symbol.wellknown", "lib.es2015.symbol.wellknown.d.ts"],
    ["es2016.array.include", "lib.es2016.array.include.d.ts"],
    ["es2017.date", "lib.es2017.date.d.ts"],
    ["es2017.object", "lib.es2017.object.d.ts"],
    ["es2017.sharedmemory", "lib.es2017.sharedmemory.d.ts"],
    ["es2017.string", "lib.es2017.string.d.ts"],
    ["es2017.intl", "lib.es2017.intl.d.ts"],
    ["es2017.typedarrays", "lib.es2017.typedarrays.d.ts"],
    ["es2018.asyncgenerator", "lib.es2018.asyncgenerator.d.ts"],
    ["es2018.asynciterable", "lib.es2018.asynciterable.d.ts"],
    ["es2018.intl", "lib.es2018.intl.d.ts"],
    ["es2018.promise", "lib.es2018.promise.d.ts"],
    ["es2018.regexp", "lib.es2018.regexp.d.ts"],
    ["es2019.array", "lib.es2019.array.d.ts"],
    ["es2019.object", "lib.es2019.object.d.ts"],
    ["es2019.string", "lib.es2019.string.d.ts"],
    ["es2019.symbol", "lib.es2019.symbol.d.ts"],
    ["es2019.intl", "lib.es2019.intl.d.ts"],
    ["es2020.bigint", "lib.es2020.bigint.d.ts"],
    ["es2020.date", "lib.es2020.date.d.ts"],
    ["es2020.promise", "lib.es2020.promise.d.ts"],
    ["es2020.sharedmemory", "lib.es2020.sharedmemory.d.ts"],
    ["es2020.string", "lib.es2020.string.d.ts"],
    ["es2020.symbol.wellknown", "lib.es2020.symbol.wellknown.d.ts"],
    ["es2020.intl", "lib.es2020.intl.d.ts"],
    ["es2020.number", "lib.es2020.number.d.ts"],
    ["es2021.promise", "lib.es2021.promise.d.ts"],
    ["es2021.string", "lib.es2021.string.d.ts"],
    ["es2021.weakref", "lib.es2021.weakref.d.ts"],
    ["es2021.intl", "lib.es2021.intl.d.ts"],
    ["es2022.array", "lib.es2022.array.d.ts"],
    ["es2022.error", "lib.es2022.error.d.ts"],
    ["es2022.intl", "lib.es2022.intl.d.ts"],
    ["es2022.object", "lib.es2022.object.d.ts"],
    ["es2022.sharedmemory", "lib.es2022.sharedmemory.d.ts"],
    ["es2022.string", "lib.es2022.string.d.ts"],
    ["es2022.regexp", "lib.es2022.regexp.d.ts"],
    ["es2023.array", "lib.es2023.array.d.ts"],
    ["es2023.collection", "lib.es2023.collection.d.ts"],
    ["esnext.array", "lib.es2023.array.d.ts"],
    ["esnext.collection", "lib.es2023.collection.d.ts"],
    ["esnext.symbol", "lib.es2019.symbol.d.ts"],
    ["esnext.asynciterable", "lib.es2018.asynciterable.d.ts"],
    ["esnext.intl", "lib.esnext.intl.d.ts"],
    ["esnext.bigint", "lib.es2020.bigint.d.ts"],
    ["esnext.string", "lib.es2022.string.d.ts"],
    ["esnext.promise", "lib.es2021.promise.d.ts"],
    ["esnext.weakref", "lib.es2021.weakref.d.ts"],
    ["decorators", "lib.decorators.d.ts"],
    ["decorators.legacy", "lib.decorators.legacy.d.ts"],
];
/**
 * An array of supported "lib" reference file names used to determine the order for inclusion
 * when referenced, as well as for spelling suggestions. This ensures the correct ordering for
 * overload resolution when a type declared in one lib is extended by another.
 *
 * @internal
 */
exports.libs = libEntries.map(function (entry) { return entry[0]; });
/**
 * A map of lib names to lib files. This map is used both for parsing the "lib" command line
 * option as well as for resolving lib reference directives.
 *
 * @internal
 */
exports.libMap = new Map(libEntries);
// Watch related options
/** @internal */
exports.optionsForWatch = [
    {
        name: "watchFile",
        type: new Map(Object.entries({
            fixedpollinginterval: ts_1.WatchFileKind.FixedPollingInterval,
            prioritypollinginterval: ts_1.WatchFileKind.PriorityPollingInterval,
            dynamicprioritypolling: ts_1.WatchFileKind.DynamicPriorityPolling,
            fixedchunksizepolling: ts_1.WatchFileKind.FixedChunkSizePolling,
            usefsevents: ts_1.WatchFileKind.UseFsEvents,
            usefseventsonparentdirectory: ts_1.WatchFileKind.UseFsEventsOnParentDirectory,
        })),
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Specify_how_the_TypeScript_watch_mode_works,
        defaultValueDescription: ts_1.WatchFileKind.UseFsEvents,
    },
    {
        name: "watchDirectory",
        type: new Map(Object.entries({
            usefsevents: ts_1.WatchDirectoryKind.UseFsEvents,
            fixedpollinginterval: ts_1.WatchDirectoryKind.FixedPollingInterval,
            dynamicprioritypolling: ts_1.WatchDirectoryKind.DynamicPriorityPolling,
            fixedchunksizepolling: ts_1.WatchDirectoryKind.FixedChunkSizePolling,
        })),
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Specify_how_directories_are_watched_on_systems_that_lack_recursive_file_watching_functionality,
        defaultValueDescription: ts_1.WatchDirectoryKind.UseFsEvents,
    },
    {
        name: "fallbackPolling",
        type: new Map(Object.entries({
            fixedinterval: ts_1.PollingWatchKind.FixedInterval,
            priorityinterval: ts_1.PollingWatchKind.PriorityInterval,
            dynamicpriority: ts_1.PollingWatchKind.DynamicPriority,
            fixedchunksize: ts_1.PollingWatchKind.FixedChunkSize,
        })),
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Specify_what_approach_the_watcher_should_use_if_the_system_runs_out_of_native_file_watchers,
        defaultValueDescription: ts_1.PollingWatchKind.PriorityInterval,
    },
    {
        name: "synchronousWatchDirectory",
        type: "boolean",
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Synchronously_call_callbacks_and_update_the_state_of_directory_watchers_on_platforms_that_don_t_support_recursive_watching_natively,
        defaultValueDescription: false,
    },
    {
        name: "excludeDirectories",
        type: "list",
        element: {
            name: "excludeDirectory",
            type: "string",
            isFilePath: true,
            extraValidation: specToDiagnostic
        },
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Remove_a_list_of_directories_from_the_watch_process,
    },
    {
        name: "excludeFiles",
        type: "list",
        element: {
            name: "excludeFile",
            type: "string",
            isFilePath: true,
            extraValidation: specToDiagnostic
        },
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Remove_a_list_of_files_from_the_watch_mode_s_processing,
    },
];
/** @internal */
exports.commonOptionsWithBuild = [
    {
        name: "help",
        shortName: "h",
        type: "boolean",
        showInSimplifiedHelpView: true,
        isCommandLineOnly: true,
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Print_this_message,
        defaultValueDescription: false,
    },
    {
        name: "help",
        shortName: "?",
        type: "boolean",
        isCommandLineOnly: true,
        category: ts_1.Diagnostics.Command_line_Options,
        defaultValueDescription: false,
    },
    {
        name: "watch",
        shortName: "w",
        type: "boolean",
        showInSimplifiedHelpView: true,
        isCommandLineOnly: true,
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Watch_input_files,
        defaultValueDescription: false,
    },
    {
        name: "preserveWatchOutput",
        type: "boolean",
        showInSimplifiedHelpView: false,
        category: ts_1.Diagnostics.Output_Formatting,
        description: ts_1.Diagnostics.Disable_wiping_the_console_in_watch_mode,
        defaultValueDescription: false,
    },
    {
        name: "listFiles",
        type: "boolean",
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Print_all_of_the_files_read_during_the_compilation,
        defaultValueDescription: false,
    },
    {
        name: "explainFiles",
        type: "boolean",
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Print_files_read_during_the_compilation_including_why_it_was_included,
        defaultValueDescription: false,
    },
    {
        name: "listEmittedFiles",
        type: "boolean",
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Print_the_names_of_emitted_files_after_a_compilation,
        defaultValueDescription: false,
    },
    {
        name: "pretty",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Output_Formatting,
        description: ts_1.Diagnostics.Enable_color_and_formatting_in_TypeScript_s_output_to_make_compiler_errors_easier_to_read,
        defaultValueDescription: true,
    },
    {
        name: "traceResolution",
        type: "boolean",
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Log_paths_used_during_the_moduleResolution_process,
        defaultValueDescription: false,
    },
    {
        name: "diagnostics",
        type: "boolean",
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Output_compiler_performance_information_after_building,
        defaultValueDescription: false,
    },
    {
        name: "extendedDiagnostics",
        type: "boolean",
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Output_more_detailed_compiler_performance_information_after_building,
        defaultValueDescription: false,
    },
    {
        name: "generateCpuProfile",
        type: "string",
        isFilePath: true,
        paramType: ts_1.Diagnostics.FILE_OR_DIRECTORY,
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Emit_a_v8_CPU_profile_of_the_compiler_run_for_debugging,
        defaultValueDescription: "profile.cpuprofile"
    },
    {
        name: "generateTrace",
        type: "string",
        isFilePath: true,
        isCommandLineOnly: true,
        paramType: ts_1.Diagnostics.DIRECTORY,
        category: ts_1.Diagnostics.Compiler_Diagnostics,
        description: ts_1.Diagnostics.Generates_an_event_trace_and_a_list_of_types
    },
    {
        name: "incremental",
        shortName: "i",
        type: "boolean",
        category: ts_1.Diagnostics.Projects,
        description: ts_1.Diagnostics.Save_tsbuildinfo_files_to_allow_for_incremental_compilation_of_projects,
        transpileOptionValue: undefined,
        defaultValueDescription: ts_1.Diagnostics.false_unless_composite_is_set
    },
    {
        name: "declaration",
        shortName: "d",
        type: "boolean",
        // Not setting affectsEmit because we calculate this flag might not affect full emit
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        transpileOptionValue: undefined,
        description: ts_1.Diagnostics.Generate_d_ts_files_from_TypeScript_and_JavaScript_files_in_your_project,
        defaultValueDescription: ts_1.Diagnostics.false_unless_composite_is_set,
    },
    {
        name: "declarationMap",
        type: "boolean",
        // Not setting affectsEmit because we calculate this flag might not affect full emit
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        transpileOptionValue: undefined,
        defaultValueDescription: false,
        description: ts_1.Diagnostics.Create_sourcemaps_for_d_ts_files
    },
    {
        name: "emitDeclarationOnly",
        type: "boolean",
        // Not setting affectsEmit because we calculate this flag might not affect full emit
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Only_output_d_ts_files_and_not_JavaScript_files,
        transpileOptionValue: undefined,
        defaultValueDescription: false,
    },
    {
        name: "sourceMap",
        type: "boolean",
        // Not setting affectsEmit because we calculate this flag might not affect full emit
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        defaultValueDescription: false,
        description: ts_1.Diagnostics.Create_source_map_files_for_emitted_JavaScript_files,
    },
    {
        name: "inlineSourceMap",
        type: "boolean",
        // Not setting affectsEmit because we calculate this flag might not affect full emit
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Include_sourcemap_files_inside_the_emitted_JavaScript,
        defaultValueDescription: false,
    },
    {
        name: "assumeChangesOnlyAffectDirectDependencies",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Watch_and_Build_Modes,
        description: ts_1.Diagnostics.Have_recompiles_in_projects_that_use_incremental_and_watch_mode_assume_that_changes_within_a_file_will_only_affect_files_directly_depending_on_it,
        defaultValueDescription: false,
    },
    {
        name: "locale",
        type: "string",
        category: ts_1.Diagnostics.Command_line_Options,
        isCommandLineOnly: true,
        description: ts_1.Diagnostics.Set_the_language_of_the_messaging_from_TypeScript_This_does_not_affect_emit,
        defaultValueDescription: ts_1.Diagnostics.Platform_specific
    },
];
/** @internal */
exports.targetOptionDeclaration = {
    name: "target",
    shortName: "t",
    type: new Map(Object.entries({
        es3: 0 /* ScriptTarget.ES3 */,
        es5: 1 /* ScriptTarget.ES5 */,
        es6: 2 /* ScriptTarget.ES2015 */,
        es2015: 2 /* ScriptTarget.ES2015 */,
        es2016: 3 /* ScriptTarget.ES2016 */,
        es2017: 4 /* ScriptTarget.ES2017 */,
        es2018: 5 /* ScriptTarget.ES2018 */,
        es2019: 6 /* ScriptTarget.ES2019 */,
        es2020: 7 /* ScriptTarget.ES2020 */,
        es2021: 8 /* ScriptTarget.ES2021 */,
        es2022: 9 /* ScriptTarget.ES2022 */,
        esnext: 99 /* ScriptTarget.ESNext */,
    })),
    affectsSourceFile: true,
    affectsModuleResolution: true,
    affectsEmit: true,
    affectsBuildInfo: true,
    paramType: ts_1.Diagnostics.VERSION,
    showInSimplifiedHelpView: true,
    category: ts_1.Diagnostics.Language_and_Environment,
    description: ts_1.Diagnostics.Set_the_JavaScript_language_version_for_emitted_JavaScript_and_include_compatible_library_declarations,
    defaultValueDescription: 1 /* ScriptTarget.ES5 */,
};
/** @internal */
exports.moduleOptionDeclaration = {
    name: "module",
    shortName: "m",
    type: new Map(Object.entries({
        none: ts_1.ModuleKind.None,
        commonjs: ts_1.ModuleKind.CommonJS,
        amd: ts_1.ModuleKind.AMD,
        system: ts_1.ModuleKind.System,
        umd: ts_1.ModuleKind.UMD,
        es6: ts_1.ModuleKind.ES2015,
        es2015: ts_1.ModuleKind.ES2015,
        es2020: ts_1.ModuleKind.ES2020,
        es2022: ts_1.ModuleKind.ES2022,
        esnext: ts_1.ModuleKind.ESNext,
        node16: ts_1.ModuleKind.Node16,
        nodenext: ts_1.ModuleKind.NodeNext,
    })),
    affectsModuleResolution: true,
    affectsEmit: true,
    affectsBuildInfo: true,
    paramType: ts_1.Diagnostics.KIND,
    showInSimplifiedHelpView: true,
    category: ts_1.Diagnostics.Modules,
    description: ts_1.Diagnostics.Specify_what_module_code_is_generated,
    defaultValueDescription: undefined,
};
var commandOptionsWithoutBuild = [
    // CommandLine only options
    {
        name: "all",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Show_all_compiler_options,
        defaultValueDescription: false,
    },
    {
        name: "version",
        shortName: "v",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Print_the_compiler_s_version,
        defaultValueDescription: false,
    },
    {
        name: "init",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Initializes_a_TypeScript_project_and_creates_a_tsconfig_json_file,
        defaultValueDescription: false,
    },
    {
        name: "project",
        shortName: "p",
        type: "string",
        isFilePath: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Command_line_Options,
        paramType: ts_1.Diagnostics.FILE_OR_DIRECTORY,
        description: ts_1.Diagnostics.Compile_the_project_given_the_path_to_its_configuration_file_or_to_a_folder_with_a_tsconfig_json,
    },
    {
        name: "build",
        type: "boolean",
        shortName: "b",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Build_one_or_more_projects_and_their_dependencies_if_out_of_date,
        defaultValueDescription: false,
    },
    {
        name: "showConfig",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Command_line_Options,
        isCommandLineOnly: true,
        description: ts_1.Diagnostics.Print_the_final_configuration_instead_of_building,
        defaultValueDescription: false,
    },
    {
        name: "listFilesOnly",
        type: "boolean",
        category: ts_1.Diagnostics.Command_line_Options,
        isCommandLineOnly: true,
        description: ts_1.Diagnostics.Print_names_of_files_that_are_part_of_the_compilation_and_then_stop_processing,
        defaultValueDescription: false,
    },
    // Basic
    exports.targetOptionDeclaration,
    exports.moduleOptionDeclaration,
    {
        name: "lib",
        type: "list",
        element: {
            name: "lib",
            type: exports.libMap,
            defaultValueDescription: undefined,
        },
        affectsProgramStructure: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Specify_a_set_of_bundled_library_declaration_files_that_describe_the_target_runtime_environment,
        transpileOptionValue: undefined
    },
    {
        name: "allowJs",
        type: "boolean",
        affectsModuleResolution: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.JavaScript_Support,
        description: ts_1.Diagnostics.Allow_JavaScript_files_to_be_a_part_of_your_program_Use_the_checkJS_option_to_get_errors_from_these_files,
        defaultValueDescription: false,
    },
    {
        name: "checkJs",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.JavaScript_Support,
        description: ts_1.Diagnostics.Enable_error_reporting_in_type_checked_JavaScript_files,
        defaultValueDescription: false,
    },
    {
        name: "jsx",
        type: jsxOptionMap,
        affectsSourceFile: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsModuleResolution: true,
        paramType: ts_1.Diagnostics.KIND,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Specify_what_JSX_code_is_generated,
        defaultValueDescription: undefined,
    },
    {
        name: "outFile",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsDeclarationPath: true,
        isFilePath: true,
        paramType: ts_1.Diagnostics.FILE,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Specify_a_file_that_bundles_all_outputs_into_one_JavaScript_file_If_declaration_is_true_also_designates_a_file_that_bundles_all_d_ts_output,
        transpileOptionValue: undefined,
    },
    {
        name: "outDir",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsDeclarationPath: true,
        isFilePath: true,
        paramType: ts_1.Diagnostics.DIRECTORY,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Specify_an_output_folder_for_all_emitted_files,
    },
    {
        name: "rootDir",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsDeclarationPath: true,
        isFilePath: true,
        paramType: ts_1.Diagnostics.LOCATION,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Specify_the_root_folder_within_your_source_files,
        defaultValueDescription: ts_1.Diagnostics.Computed_from_the_list_of_input_files
    },
    {
        name: "composite",
        type: "boolean",
        // Not setting affectsEmit because we calculate this flag might not affect full emit
        affectsBuildInfo: true,
        isTSConfigOnly: true,
        category: ts_1.Diagnostics.Projects,
        transpileOptionValue: undefined,
        defaultValueDescription: false,
        description: ts_1.Diagnostics.Enable_constraints_that_allow_a_TypeScript_project_to_be_used_with_project_references,
    },
    {
        name: "tsBuildInfoFile",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        isFilePath: true,
        paramType: ts_1.Diagnostics.FILE,
        category: ts_1.Diagnostics.Projects,
        transpileOptionValue: undefined,
        defaultValueDescription: ".tsbuildinfo",
        description: ts_1.Diagnostics.Specify_the_path_to_tsbuildinfo_incremental_compilation_file,
    },
    {
        name: "removeComments",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        defaultValueDescription: false,
        description: ts_1.Diagnostics.Disable_emitting_comments,
    },
    {
        name: "noEmit",
        type: "boolean",
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Disable_emitting_files_from_a_compilation,
        transpileOptionValue: undefined,
        defaultValueDescription: false,
    },
    {
        name: "importHelpers",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Allow_importing_helper_functions_from_tslib_once_per_project_instead_of_including_them_per_file,
        defaultValueDescription: false,
    },
    {
        name: "importsNotUsedAsValues",
        type: new Map(Object.entries({
            remove: 0 /* ImportsNotUsedAsValues.Remove */,
            preserve: 1 /* ImportsNotUsedAsValues.Preserve */,
            error: 2 /* ImportsNotUsedAsValues.Error */,
        })),
        affectsEmit: true,
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Specify_emit_Slashchecking_behavior_for_imports_that_are_only_used_for_types,
        defaultValueDescription: 0 /* ImportsNotUsedAsValues.Remove */,
    },
    {
        name: "downlevelIteration",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Emit_more_compliant_but_verbose_and_less_performant_JavaScript_for_iteration,
        defaultValueDescription: false,
    },
    {
        name: "isolatedModules",
        type: "boolean",
        category: ts_1.Diagnostics.Interop_Constraints,
        description: ts_1.Diagnostics.Ensure_that_each_file_can_be_safely_transpiled_without_relying_on_other_imports,
        transpileOptionValue: true,
        defaultValueDescription: false,
    },
    {
        name: "verbatimModuleSyntax",
        type: "boolean",
        category: ts_1.Diagnostics.Interop_Constraints,
        description: ts_1.Diagnostics.Do_not_transform_or_elide_any_imports_or_exports_not_marked_as_type_only_ensuring_they_are_written_in_the_output_file_s_format_based_on_the_module_setting,
        defaultValueDescription: false,
    },
    // Strict Type Checks
    {
        name: "strict",
        type: "boolean",
        // Though this affects semantic diagnostics, affectsSemanticDiagnostics is not set here
        // The value of each strictFlag depends on own strictFlag value or this and never accessed directly.
        // But we need to store `strict` in builf info, even though it won't be examined directly, so that the
        // flags it controls (e.g. `strictNullChecks`) will be retrieved correctly
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enable_all_strict_type_checking_options,
        defaultValueDescription: false,
    },
    {
        name: "noImplicitAny",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enable_error_reporting_for_expressions_and_declarations_with_an_implied_any_type,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    {
        name: "strictNullChecks",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.When_type_checking_take_into_account_null_and_undefined,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    {
        name: "strictFunctionTypes",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.When_assigning_functions_check_to_ensure_parameters_and_the_return_values_are_subtype_compatible,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    {
        name: "strictBindCallApply",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Check_that_the_arguments_for_bind_call_and_apply_methods_match_the_original_function,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    {
        name: "strictPropertyInitialization",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Check_for_class_properties_that_are_declared_but_not_set_in_the_constructor,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    {
        name: "noImplicitThis",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enable_error_reporting_when_this_is_given_the_type_any,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    {
        name: "useUnknownInCatchVariables",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Default_catch_clause_variables_as_unknown_instead_of_any,
        defaultValueDescription: false,
    },
    {
        name: "alwaysStrict",
        type: "boolean",
        affectsSourceFile: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        strictFlag: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Ensure_use_strict_is_always_emitted,
        defaultValueDescription: ts_1.Diagnostics.false_unless_strict_is_set
    },
    // Additional Checks
    {
        name: "noUnusedLocals",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enable_error_reporting_when_local_variables_aren_t_read,
        defaultValueDescription: false,
    },
    {
        name: "noUnusedParameters",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Raise_an_error_when_a_function_parameter_isn_t_read,
        defaultValueDescription: false,
    },
    {
        name: "exactOptionalPropertyTypes",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Interpret_optional_property_types_as_written_rather_than_adding_undefined,
        defaultValueDescription: false,
    },
    {
        name: "noImplicitReturns",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enable_error_reporting_for_codepaths_that_do_not_explicitly_return_in_a_function,
        defaultValueDescription: false,
    },
    {
        name: "noFallthroughCasesInSwitch",
        type: "boolean",
        affectsBindDiagnostics: true,
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enable_error_reporting_for_fallthrough_cases_in_switch_statements,
        defaultValueDescription: false,
    },
    {
        name: "noUncheckedIndexedAccess",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Add_undefined_to_a_type_when_accessed_using_an_index,
        defaultValueDescription: false,
    },
    {
        name: "noImplicitOverride",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Ensure_overriding_members_in_derived_classes_are_marked_with_an_override_modifier,
        defaultValueDescription: false,
    },
    {
        name: "noPropertyAccessFromIndexSignature",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        showInSimplifiedHelpView: false,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Enforces_using_indexed_accessors_for_keys_declared_using_an_indexed_type,
        defaultValueDescription: false,
    },
    // Module Resolution
    {
        name: "moduleResolution",
        type: new Map(Object.entries({
            // N.B. The first entry specifies the value shown in `tsc --init`
            node10: ts_1.ModuleResolutionKind.Node10,
            node: ts_1.ModuleResolutionKind.Node10,
            classic: ts_1.ModuleResolutionKind.Classic,
            node16: ts_1.ModuleResolutionKind.Node16,
            nodenext: ts_1.ModuleResolutionKind.NodeNext,
            bundler: ts_1.ModuleResolutionKind.Bundler,
        })),
        deprecatedKeys: new Set(["node"]),
        affectsModuleResolution: true,
        paramType: ts_1.Diagnostics.STRATEGY,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Specify_how_TypeScript_looks_up_a_file_from_a_given_module_specifier,
        defaultValueDescription: ts_1.Diagnostics.module_AMD_or_UMD_or_System_or_ES6_then_Classic_Otherwise_Node
    },
    {
        name: "baseUrl",
        type: "string",
        affectsModuleResolution: true,
        isFilePath: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Specify_the_base_directory_to_resolve_non_relative_module_names
    },
    {
        // this option can only be specified in tsconfig.json
        // use type = object to copy the value as-is
        name: "paths",
        type: "object",
        affectsModuleResolution: true,
        isTSConfigOnly: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Specify_a_set_of_entries_that_re_map_imports_to_additional_lookup_locations,
        transpileOptionValue: undefined
    },
    {
        // this option can only be specified in tsconfig.json
        // use type = object to copy the value as-is
        name: "rootDirs",
        type: "list",
        isTSConfigOnly: true,
        element: {
            name: "rootDirs",
            type: "string",
            isFilePath: true
        },
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Allow_multiple_folders_to_be_treated_as_one_when_resolving_modules,
        transpileOptionValue: undefined,
        defaultValueDescription: ts_1.Diagnostics.Computed_from_the_list_of_input_files
    },
    {
        name: "typeRoots",
        type: "list",
        element: {
            name: "typeRoots",
            type: "string",
            isFilePath: true
        },
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Specify_multiple_folders_that_act_like_Slashnode_modules_Slash_types
    },
    {
        name: "types",
        type: "list",
        element: {
            name: "types",
            type: "string"
        },
        affectsProgramStructure: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Specify_type_package_names_to_be_included_without_being_referenced_in_a_source_file,
        transpileOptionValue: undefined
    },
    {
        name: "allowSyntheticDefaultImports",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Interop_Constraints,
        description: ts_1.Diagnostics.Allow_import_x_from_y_when_a_module_doesn_t_have_a_default_export,
        defaultValueDescription: ts_1.Diagnostics.module_system_or_esModuleInterop
    },
    {
        name: "esModuleInterop",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        showInSimplifiedHelpView: true,
        category: ts_1.Diagnostics.Interop_Constraints,
        description: ts_1.Diagnostics.Emit_additional_JavaScript_to_ease_support_for_importing_CommonJS_modules_This_enables_allowSyntheticDefaultImports_for_type_compatibility,
        defaultValueDescription: false,
    },
    {
        name: "preserveSymlinks",
        type: "boolean",
        category: ts_1.Diagnostics.Interop_Constraints,
        description: ts_1.Diagnostics.Disable_resolving_symlinks_to_their_realpath_This_correlates_to_the_same_flag_in_node,
        defaultValueDescription: false,
    },
    {
        name: "allowUmdGlobalAccess",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Allow_accessing_UMD_globals_from_modules,
        defaultValueDescription: false,
    },
    {
        name: "moduleSuffixes",
        type: "list",
        element: {
            name: "suffix",
            type: "string",
        },
        listPreserveFalsyValues: true,
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.List_of_file_name_suffixes_to_search_when_resolving_a_module,
    },
    {
        name: "allowImportingTsExtensions",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Allow_imports_to_include_TypeScript_file_extensions_Requires_moduleResolution_bundler_and_either_noEmit_or_emitDeclarationOnly_to_be_set,
        defaultValueDescription: false,
        transpileOptionValue: undefined,
    },
    {
        name: "resolvePackageJsonExports",
        type: "boolean",
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Use_the_package_json_exports_field_when_resolving_package_imports,
        defaultValueDescription: ts_1.Diagnostics.true_when_moduleResolution_is_node16_nodenext_or_bundler_otherwise_false,
    },
    {
        name: "resolvePackageJsonImports",
        type: "boolean",
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Use_the_package_json_imports_field_when_resolving_imports,
        defaultValueDescription: ts_1.Diagnostics.true_when_moduleResolution_is_node16_nodenext_or_bundler_otherwise_false,
    },
    {
        name: "customConditions",
        type: "list",
        element: {
            name: "condition",
            type: "string",
        },
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Conditions_to_set_in_addition_to_the_resolver_specific_defaults_when_resolving_imports,
    },
    // Source Maps
    {
        name: "sourceRoot",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        paramType: ts_1.Diagnostics.LOCATION,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Specify_the_root_path_for_debuggers_to_find_the_reference_source_code,
    },
    {
        name: "mapRoot",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        paramType: ts_1.Diagnostics.LOCATION,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Specify_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
    },
    {
        name: "inlineSources",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Include_source_code_in_the_sourcemaps_inside_the_emitted_JavaScript,
        defaultValueDescription: false,
    },
    // Experimental
    {
        name: "experimentalDecorators",
        type: "boolean",
        affectsEmit: true,
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Enable_experimental_support_for_legacy_experimental_decorators,
        defaultValueDescription: false,
    },
    {
        name: "emitDecoratorMetadata",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Emit_design_type_metadata_for_decorated_declarations_in_source_files,
        defaultValueDescription: false,
    },
    // Advanced
    {
        name: "jsxFactory",
        type: "string",
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Specify_the_JSX_factory_function_used_when_targeting_React_JSX_emit_e_g_React_createElement_or_h,
        defaultValueDescription: "`React.createElement`"
    },
    {
        name: "jsxFragmentFactory",
        type: "string",
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Specify_the_JSX_Fragment_reference_used_for_fragments_when_targeting_React_JSX_emit_e_g_React_Fragment_or_Fragment,
        defaultValueDescription: "React.Fragment",
    },
    {
        name: "jsxImportSource",
        type: "string",
        affectsSemanticDiagnostics: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Specify_module_specifier_used_to_import_the_JSX_factory_functions_when_using_jsx_Colon_react_jsx_Asterisk,
        defaultValueDescription: "react"
    },
    {
        name: "resolveJsonModule",
        type: "boolean",
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Enable_importing_json_files,
        defaultValueDescription: false,
    },
    {
        name: "allowArbitraryExtensions",
        type: "boolean",
        affectsProgramStructure: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Enable_importing_files_with_any_extension_provided_a_declaration_file_is_present,
        defaultValueDescription: false,
    },
    {
        name: "out",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsDeclarationPath: true,
        isFilePath: false,
        // for correct behaviour, please use outFile
        category: ts_1.Diagnostics.Backwards_Compatibility,
        paramType: ts_1.Diagnostics.FILE,
        transpileOptionValue: undefined,
        description: ts_1.Diagnostics.Deprecated_setting_Use_outFile_instead,
    },
    {
        name: "reactNamespace",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Specify_the_object_invoked_for_createElement_This_only_applies_when_targeting_react_JSX_emit,
        defaultValueDescription: "`React`",
    },
    {
        name: "skipDefaultLibCheck",
        type: "boolean",
        // We need to store these to determine whether `lib` files need to be rechecked
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Completeness,
        description: ts_1.Diagnostics.Skip_type_checking_d_ts_files_that_are_included_with_TypeScript,
        defaultValueDescription: false,
    },
    {
        name: "charset",
        type: "string",
        category: ts_1.Diagnostics.Backwards_Compatibility,
        description: ts_1.Diagnostics.No_longer_supported_In_early_versions_manually_set_the_text_encoding_for_reading_files,
        defaultValueDescription: "utf8"
    },
    {
        name: "emitBOM",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Emit_a_UTF_8_Byte_Order_Mark_BOM_in_the_beginning_of_output_files,
        defaultValueDescription: false,
    },
    {
        name: "newLine",
        type: new Map(Object.entries({
            crlf: 0 /* NewLineKind.CarriageReturnLineFeed */,
            lf: 1 /* NewLineKind.LineFeed */
        })),
        affectsEmit: true,
        affectsBuildInfo: true,
        paramType: ts_1.Diagnostics.NEWLINE,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Set_the_newline_character_for_emitting_files,
        defaultValueDescription: "lf"
    },
    {
        name: "noErrorTruncation",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Output_Formatting,
        description: ts_1.Diagnostics.Disable_truncating_types_in_error_messages,
        defaultValueDescription: false,
    },
    {
        name: "noLib",
        type: "boolean",
        category: ts_1.Diagnostics.Language_and_Environment,
        affectsProgramStructure: true,
        description: ts_1.Diagnostics.Disable_including_any_library_files_including_the_default_lib_d_ts,
        // We are not returning a sourceFile for lib file when asked by the program,
        // so pass --noLib to avoid reporting a file not found error.
        transpileOptionValue: true,
        defaultValueDescription: false,
    },
    {
        name: "noResolve",
        type: "boolean",
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Modules,
        description: ts_1.Diagnostics.Disallow_import_s_require_s_or_reference_s_from_expanding_the_number_of_files_TypeScript_should_add_to_a_project,
        // We are not doing a full typecheck, we are not resolving the whole context,
        // so pass --noResolve to avoid reporting missing file errors.
        transpileOptionValue: true,
        defaultValueDescription: false,
    },
    {
        name: "stripInternal",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Disable_emitting_declarations_that_have_internal_in_their_JSDoc_comments,
        defaultValueDescription: false,
    },
    {
        name: "disableSizeLimit",
        type: "boolean",
        affectsProgramStructure: true,
        category: ts_1.Diagnostics.Editor_Support,
        description: ts_1.Diagnostics.Remove_the_20mb_cap_on_total_source_code_size_for_JavaScript_files_in_the_TypeScript_language_server,
        defaultValueDescription: false,
    },
    {
        name: "disableSourceOfProjectReferenceRedirect",
        type: "boolean",
        isTSConfigOnly: true,
        category: ts_1.Diagnostics.Projects,
        description: ts_1.Diagnostics.Disable_preferring_source_files_instead_of_declaration_files_when_referencing_composite_projects,
        defaultValueDescription: false,
    },
    {
        name: "disableSolutionSearching",
        type: "boolean",
        isTSConfigOnly: true,
        category: ts_1.Diagnostics.Projects,
        description: ts_1.Diagnostics.Opt_a_project_out_of_multi_project_reference_checking_when_editing,
        defaultValueDescription: false,
    },
    {
        name: "disableReferencedProjectLoad",
        type: "boolean",
        isTSConfigOnly: true,
        category: ts_1.Diagnostics.Projects,
        description: ts_1.Diagnostics.Reduce_the_number_of_projects_loaded_automatically_by_TypeScript,
        defaultValueDescription: false,
    },
    {
        name: "noImplicitUseStrict",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Backwards_Compatibility,
        description: ts_1.Diagnostics.Disable_adding_use_strict_directives_in_emitted_JavaScript_files,
        defaultValueDescription: false,
    },
    {
        name: "noEmitHelpers",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Disable_generating_custom_helper_functions_like_extends_in_compiled_output,
        defaultValueDescription: false,
    },
    {
        name: "noEmitOnError",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        transpileOptionValue: undefined,
        description: ts_1.Diagnostics.Disable_emitting_files_if_any_type_checking_errors_are_reported,
        defaultValueDescription: false,
    },
    {
        name: "preserveConstEnums",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Disable_erasing_const_enum_declarations_in_generated_code,
        defaultValueDescription: false,
    },
    {
        name: "declarationDir",
        type: "string",
        affectsEmit: true,
        affectsBuildInfo: true,
        affectsDeclarationPath: true,
        isFilePath: true,
        paramType: ts_1.Diagnostics.DIRECTORY,
        category: ts_1.Diagnostics.Emit,
        transpileOptionValue: undefined,
        description: ts_1.Diagnostics.Specify_the_output_directory_for_generated_declaration_files,
    },
    {
        name: "skipLibCheck",
        type: "boolean",
        // We need to store these to determine whether `lib` files need to be rechecked
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Completeness,
        description: ts_1.Diagnostics.Skip_type_checking_all_d_ts_files,
        defaultValueDescription: false,
    },
    {
        name: "allowUnusedLabels",
        type: "boolean",
        affectsBindDiagnostics: true,
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Disable_error_reporting_for_unused_labels,
        defaultValueDescription: undefined,
    },
    {
        name: "allowUnreachableCode",
        type: "boolean",
        affectsBindDiagnostics: true,
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Type_Checking,
        description: ts_1.Diagnostics.Disable_error_reporting_for_unreachable_code,
        defaultValueDescription: undefined,
    },
    {
        name: "suppressExcessPropertyErrors",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Backwards_Compatibility,
        description: ts_1.Diagnostics.Disable_reporting_of_excess_property_errors_during_the_creation_of_object_literals,
        defaultValueDescription: false,
    },
    {
        name: "suppressImplicitAnyIndexErrors",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Backwards_Compatibility,
        description: ts_1.Diagnostics.Suppress_noImplicitAny_errors_when_indexing_objects_that_lack_index_signatures,
        defaultValueDescription: false,
    },
    {
        name: "forceConsistentCasingInFileNames",
        type: "boolean",
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.Interop_Constraints,
        description: ts_1.Diagnostics.Ensure_that_casing_is_correct_in_imports,
        defaultValueDescription: true,
    },
    {
        name: "maxNodeModuleJsDepth",
        type: "number",
        affectsModuleResolution: true,
        category: ts_1.Diagnostics.JavaScript_Support,
        description: ts_1.Diagnostics.Specify_the_maximum_folder_depth_used_for_checking_JavaScript_files_from_node_modules_Only_applicable_with_allowJs,
        defaultValueDescription: 0,
    },
    {
        name: "noStrictGenericChecks",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Backwards_Compatibility,
        description: ts_1.Diagnostics.Disable_strict_checking_of_generic_signatures_in_function_types,
        defaultValueDescription: false,
    },
    {
        name: "useDefineForClassFields",
        type: "boolean",
        affectsSemanticDiagnostics: true,
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Language_and_Environment,
        description: ts_1.Diagnostics.Emit_ECMAScript_standard_compliant_class_fields,
        defaultValueDescription: ts_1.Diagnostics.true_for_ES2022_and_above_including_ESNext
    },
    {
        name: "preserveValueImports",
        type: "boolean",
        affectsEmit: true,
        affectsBuildInfo: true,
        category: ts_1.Diagnostics.Emit,
        description: ts_1.Diagnostics.Preserve_unused_imported_values_in_the_JavaScript_output_that_would_otherwise_be_removed,
        defaultValueDescription: false,
    },
    {
        name: "keyofStringsOnly",
        type: "boolean",
        category: ts_1.Diagnostics.Backwards_Compatibility,
        description: ts_1.Diagnostics.Make_keyof_only_return_strings_instead_of_string_numbers_or_symbols_Legacy_option,
        defaultValueDescription: false,
    },
    {
        // A list of plugins to load in the language service
        name: "plugins",
        type: "list",
        isTSConfigOnly: true,
        element: {
            name: "plugin",
            type: "object"
        },
        description: ts_1.Diagnostics.Specify_a_list_of_language_service_plugins_to_include,
        category: ts_1.Diagnostics.Editor_Support,
    },
    {
        name: "moduleDetection",
        type: new Map(Object.entries({
            auto: ts_1.ModuleDetectionKind.Auto,
            legacy: ts_1.ModuleDetectionKind.Legacy,
            force: ts_1.ModuleDetectionKind.Force,
        })),
        affectsModuleResolution: true,
        description: ts_1.Diagnostics.Control_what_method_is_used_to_detect_module_format_JS_files,
        category: ts_1.Diagnostics.Language_and_Environment,
        defaultValueDescription: ts_1.Diagnostics.auto_Colon_Treat_files_with_imports_exports_import_meta_jsx_with_jsx_Colon_react_jsx_or_esm_format_with_module_Colon_node16_as_modules,
    },
    {
        name: "ignoreDeprecations",
        type: "string",
        defaultValueDescription: undefined,
    },
];
/** @internal */
exports.optionDeclarations = __spreadArray(__spreadArray([], exports.commonOptionsWithBuild, true), commandOptionsWithoutBuild, true);
/** @internal */
exports.semanticDiagnosticsOptionDeclarations = exports.optionDeclarations.filter(function (option) { return !!option.affectsSemanticDiagnostics; });
/** @internal */
exports.affectsEmitOptionDeclarations = exports.optionDeclarations.filter(function (option) { return !!option.affectsEmit; });
/** @internal */
exports.affectsDeclarationPathOptionDeclarations = exports.optionDeclarations.filter(function (option) { return !!option.affectsDeclarationPath; });
/** @internal */
exports.moduleResolutionOptionDeclarations = exports.optionDeclarations.filter(function (option) { return !!option.affectsModuleResolution; });
/** @internal */
exports.sourceFileAffectingCompilerOptions = exports.optionDeclarations.filter(function (option) {
    return !!option.affectsSourceFile || !!option.affectsModuleResolution || !!option.affectsBindDiagnostics;
});
/** @internal */
exports.optionsAffectingProgramStructure = exports.optionDeclarations.filter(function (option) { return !!option.affectsProgramStructure; });
/** @internal */
exports.transpileOptionValueCompilerOptions = exports.optionDeclarations.filter(function (option) {
    return (0, ts_1.hasProperty)(option, "transpileOptionValue");
});
// Build related options
/** @internal */
exports.optionsForBuild = [
    {
        name: "verbose",
        shortName: "v",
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Enable_verbose_logging,
        type: "boolean",
        defaultValueDescription: false,
    },
    {
        name: "dry",
        shortName: "d",
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Show_what_would_be_built_or_deleted_if_specified_with_clean,
        type: "boolean",
        defaultValueDescription: false,
    },
    {
        name: "force",
        shortName: "f",
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Build_all_projects_including_those_that_appear_to_be_up_to_date,
        type: "boolean",
        defaultValueDescription: false,
    },
    {
        name: "clean",
        category: ts_1.Diagnostics.Command_line_Options,
        description: ts_1.Diagnostics.Delete_the_outputs_of_all_projects,
        type: "boolean",
        defaultValueDescription: false,
    }
];
/** @internal */
exports.buildOpts = __spreadArray(__spreadArray([], exports.commonOptionsWithBuild, true), exports.optionsForBuild, true);
/** @internal */
exports.typeAcquisitionDeclarations = [
    {
        name: "enable",
        type: "boolean",
        defaultValueDescription: false,
    },
    {
        name: "include",
        type: "list",
        element: {
            name: "include",
            type: "string"
        }
    },
    {
        name: "exclude",
        type: "list",
        element: {
            name: "exclude",
            type: "string"
        }
    },
    {
        name: "disableFilenameBasedTypeAcquisition",
        type: "boolean",
        defaultValueDescription: false,
    },
];
/** @internal */
function createOptionNameMap(optionDeclarations) {
    var optionsNameMap = new Map();
    var shortOptionNames = new Map();
    (0, ts_1.forEach)(optionDeclarations, function (option) {
        optionsNameMap.set(option.name.toLowerCase(), option);
        if (option.shortName) {
            shortOptionNames.set(option.shortName, option.name);
        }
    });
    return { optionsNameMap: optionsNameMap, shortOptionNames: shortOptionNames };
}
exports.createOptionNameMap = createOptionNameMap;
var optionsNameMapCache;
/** @internal */
function getOptionsNameMap() {
    return optionsNameMapCache || (optionsNameMapCache = createOptionNameMap(exports.optionDeclarations));
}
exports.getOptionsNameMap = getOptionsNameMap;
var compilerOptionsAlternateMode = {
    diagnostic: ts_1.Diagnostics.Compiler_option_0_may_only_be_used_with_build,
    getOptionsNameMap: getBuildOptionsNameMap
};
/** @internal */
exports.defaultInitCompilerOptions = {
    module: ts_1.ModuleKind.CommonJS,
    target: 3 /* ScriptTarget.ES2016 */,
    strict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true
};
/** @internal */
function createCompilerDiagnosticForInvalidCustomType(opt) {
    return createDiagnosticForInvalidCustomType(opt, ts_1.createCompilerDiagnostic);
}
exports.createCompilerDiagnosticForInvalidCustomType = createCompilerDiagnosticForInvalidCustomType;
function createDiagnosticForInvalidCustomType(opt, createDiagnostic) {
    var namesOfType = (0, ts_1.arrayFrom)(opt.type.keys());
    var stringNames = (opt.deprecatedKeys ? namesOfType.filter(function (k) { return !opt.deprecatedKeys.has(k); }) : namesOfType).map(function (key) { return "'".concat(key, "'"); }).join(", ");
    return createDiagnostic(ts_1.Diagnostics.Argument_for_0_option_must_be_Colon_1, "--".concat(opt.name), stringNames);
}
/** @internal */
function parseCustomTypeOption(opt, value, errors) {
    return convertJsonOptionOfCustomType(opt, (0, ts_1.trimString)(value || ""), errors);
}
exports.parseCustomTypeOption = parseCustomTypeOption;
/** @internal */
function parseListTypeOption(opt, value, errors) {
    if (value === void 0) { value = ""; }
    value = (0, ts_1.trimString)(value);
    if ((0, ts_1.startsWith)(value, "-")) {
        return undefined;
    }
    if (opt.type === "listOrElement" && !(0, ts_1.stringContains)(value, ",")) {
        return validateJsonOptionValue(opt, value, errors);
    }
    if (value === "") {
        return [];
    }
    var values = value.split(",");
    switch (opt.element.type) {
        case "number":
            return (0, ts_1.mapDefined)(values, function (v) { return validateJsonOptionValue(opt.element, parseInt(v), errors); });
        case "string":
            return (0, ts_1.mapDefined)(values, function (v) { return validateJsonOptionValue(opt.element, v || "", errors); });
        case "boolean":
        case "object":
            return ts_1.Debug.fail("List of ".concat(opt.element.type, " is not yet supported."));
        default:
            return (0, ts_1.mapDefined)(values, function (v) { return parseCustomTypeOption(opt.element, v, errors); });
    }
}
exports.parseListTypeOption = parseListTypeOption;
function getOptionName(option) {
    return option.name;
}
function createUnknownOptionError(unknownOption, diagnostics, unknownOptionErrorText, node, sourceFile) {
    var _a;
    if ((_a = diagnostics.alternateMode) === null || _a === void 0 ? void 0 : _a.getOptionsNameMap().optionsNameMap.has(unknownOption.toLowerCase())) {
        return createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, node, diagnostics.alternateMode.diagnostic, unknownOption);
    }
    var possibleOption = (0, ts_1.getSpellingSuggestion)(unknownOption, diagnostics.optionDeclarations, getOptionName);
    return possibleOption ?
        createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, node, diagnostics.unknownDidYouMeanDiagnostic, unknownOptionErrorText || unknownOption, possibleOption.name) :
        createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, node, diagnostics.unknownOptionDiagnostic, unknownOptionErrorText || unknownOption);
}
/** @internal */
function parseCommandLineWorker(diagnostics, commandLine, readFile) {
    var options = {};
    var watchOptions;
    var fileNames = [];
    var errors = [];
    parseStrings(commandLine);
    return {
        options: options,
        watchOptions: watchOptions,
        fileNames: fileNames,
        errors: errors
    };
    function parseStrings(args) {
        var i = 0;
        while (i < args.length) {
            var s = args[i];
            i++;
            if (s.charCodeAt(0) === 64 /* CharacterCodes.at */) {
                parseResponseFile(s.slice(1));
            }
            else if (s.charCodeAt(0) === 45 /* CharacterCodes.minus */) {
                var inputOptionName = s.slice(s.charCodeAt(1) === 45 /* CharacterCodes.minus */ ? 2 : 1);
                var opt = getOptionDeclarationFromName(diagnostics.getOptionsNameMap, inputOptionName, /*allowShort*/ true);
                if (opt) {
                    i = parseOptionValue(args, i, diagnostics, opt, options, errors);
                }
                else {
                    var watchOpt = getOptionDeclarationFromName(watchOptionsDidYouMeanDiagnostics.getOptionsNameMap, inputOptionName, /*allowShort*/ true);
                    if (watchOpt) {
                        i = parseOptionValue(args, i, watchOptionsDidYouMeanDiagnostics, watchOpt, watchOptions || (watchOptions = {}), errors);
                    }
                    else {
                        errors.push(createUnknownOptionError(inputOptionName, diagnostics, s));
                    }
                }
            }
            else {
                fileNames.push(s);
            }
        }
    }
    function parseResponseFile(fileName) {
        var text = tryReadFile(fileName, readFile || (function (fileName) { return ts_1.sys.readFile(fileName); }));
        if (!(0, ts_1.isString)(text)) {
            errors.push(text);
            return;
        }
        var args = [];
        var pos = 0;
        while (true) {
            while (pos < text.length && text.charCodeAt(pos) <= 32 /* CharacterCodes.space */)
                pos++;
            if (pos >= text.length)
                break;
            var start = pos;
            if (text.charCodeAt(start) === 34 /* CharacterCodes.doubleQuote */) {
                pos++;
                while (pos < text.length && text.charCodeAt(pos) !== 34 /* CharacterCodes.doubleQuote */)
                    pos++;
                if (pos < text.length) {
                    args.push(text.substring(start + 1, pos));
                    pos++;
                }
                else {
                    errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Unterminated_quoted_string_in_response_file_0, fileName));
                }
            }
            else {
                while (text.charCodeAt(pos) > 32 /* CharacterCodes.space */)
                    pos++;
                args.push(text.substring(start, pos));
            }
        }
        parseStrings(args);
    }
}
exports.parseCommandLineWorker = parseCommandLineWorker;
function parseOptionValue(args, i, diagnostics, opt, options, errors) {
    if (opt.isTSConfigOnly) {
        var optValue = args[i];
        if (optValue === "null") {
            options[opt.name] = undefined;
            i++;
        }
        else if (opt.type === "boolean") {
            if (optValue === "false") {
                options[opt.name] = validateJsonOptionValue(opt, /*value*/ false, errors);
                i++;
            }
            else {
                if (optValue === "true")
                    i++;
                errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Option_0_can_only_be_specified_in_tsconfig_json_file_or_set_to_false_or_null_on_command_line, opt.name));
            }
        }
        else {
            errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Option_0_can_only_be_specified_in_tsconfig_json_file_or_set_to_null_on_command_line, opt.name));
            if (optValue && !(0, ts_1.startsWith)(optValue, "-"))
                i++;
        }
    }
    else {
        // Check to see if no argument was provided (e.g. "--locale" is the last command-line argument).
        if (!args[i] && opt.type !== "boolean") {
            errors.push((0, ts_1.createCompilerDiagnostic)(diagnostics.optionTypeMismatchDiagnostic, opt.name, getCompilerOptionValueTypeString(opt)));
        }
        if (args[i] !== "null") {
            switch (opt.type) {
                case "number":
                    options[opt.name] = validateJsonOptionValue(opt, parseInt(args[i]), errors);
                    i++;
                    break;
                case "boolean":
                    // boolean flag has optional value true, false, others
                    var optValue = args[i];
                    options[opt.name] = validateJsonOptionValue(opt, optValue !== "false", errors);
                    // consume next argument as boolean flag value
                    if (optValue === "false" || optValue === "true") {
                        i++;
                    }
                    break;
                case "string":
                    options[opt.name] = validateJsonOptionValue(opt, args[i] || "", errors);
                    i++;
                    break;
                case "list":
                    var result = parseListTypeOption(opt, args[i], errors);
                    options[opt.name] = result || [];
                    if (result) {
                        i++;
                    }
                    break;
                case "listOrElement":
                    ts_1.Debug.fail("listOrElement not supported here");
                    break;
                // If not a primitive, the possible types are specified in what is effectively a map of options.
                default:
                    options[opt.name] = parseCustomTypeOption(opt, args[i], errors);
                    i++;
                    break;
            }
        }
        else {
            options[opt.name] = undefined;
            i++;
        }
    }
    return i;
}
/** @internal */
exports.compilerOptionsDidYouMeanDiagnostics = {
    alternateMode: compilerOptionsAlternateMode,
    getOptionsNameMap: getOptionsNameMap,
    optionDeclarations: exports.optionDeclarations,
    unknownOptionDiagnostic: ts_1.Diagnostics.Unknown_compiler_option_0,
    unknownDidYouMeanDiagnostic: ts_1.Diagnostics.Unknown_compiler_option_0_Did_you_mean_1,
    optionTypeMismatchDiagnostic: ts_1.Diagnostics.Compiler_option_0_expects_an_argument
};
function parseCommandLine(commandLine, readFile) {
    return parseCommandLineWorker(exports.compilerOptionsDidYouMeanDiagnostics, commandLine, readFile);
}
exports.parseCommandLine = parseCommandLine;
/** @internal */
function getOptionFromName(optionName, allowShort) {
    return getOptionDeclarationFromName(getOptionsNameMap, optionName, allowShort);
}
exports.getOptionFromName = getOptionFromName;
function getOptionDeclarationFromName(getOptionNameMap, optionName, allowShort) {
    if (allowShort === void 0) { allowShort = false; }
    optionName = optionName.toLowerCase();
    var _a = getOptionNameMap(), optionsNameMap = _a.optionsNameMap, shortOptionNames = _a.shortOptionNames;
    // Try to translate short option names to their full equivalents.
    if (allowShort) {
        var short = shortOptionNames.get(optionName);
        if (short !== undefined) {
            optionName = short;
        }
    }
    return optionsNameMap.get(optionName);
}
var buildOptionsNameMapCache;
function getBuildOptionsNameMap() {
    return buildOptionsNameMapCache || (buildOptionsNameMapCache = createOptionNameMap(exports.buildOpts));
}
var buildOptionsAlternateMode = {
    diagnostic: ts_1.Diagnostics.Compiler_option_0_may_not_be_used_with_build,
    getOptionsNameMap: getOptionsNameMap
};
var buildOptionsDidYouMeanDiagnostics = {
    alternateMode: buildOptionsAlternateMode,
    getOptionsNameMap: getBuildOptionsNameMap,
    optionDeclarations: exports.buildOpts,
    unknownOptionDiagnostic: ts_1.Diagnostics.Unknown_build_option_0,
    unknownDidYouMeanDiagnostic: ts_1.Diagnostics.Unknown_build_option_0_Did_you_mean_1,
    optionTypeMismatchDiagnostic: ts_1.Diagnostics.Build_option_0_requires_a_value_of_type_1
};
/** @internal */
function parseBuildCommand(args) {
    var _a = parseCommandLineWorker(buildOptionsDidYouMeanDiagnostics, args), options = _a.options, watchOptions = _a.watchOptions, projects = _a.fileNames, errors = _a.errors;
    var buildOptions = options;
    if (projects.length === 0) {
        // tsc -b invoked with no extra arguments; act as if invoked with "tsc -b ."
        projects.push(".");
    }
    // Nonsensical combinations
    if (buildOptions.clean && buildOptions.force) {
        errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Options_0_and_1_cannot_be_combined, "clean", "force"));
    }
    if (buildOptions.clean && buildOptions.verbose) {
        errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Options_0_and_1_cannot_be_combined, "clean", "verbose"));
    }
    if (buildOptions.clean && buildOptions.watch) {
        errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Options_0_and_1_cannot_be_combined, "clean", "watch"));
    }
    if (buildOptions.watch && buildOptions.dry) {
        errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Options_0_and_1_cannot_be_combined, "watch", "dry"));
    }
    return { buildOptions: buildOptions, watchOptions: watchOptions, projects: projects, errors: errors };
}
exports.parseBuildCommand = parseBuildCommand;
/** @internal */
function getDiagnosticText(_message) {
    var _args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        _args[_i - 1] = arguments[_i];
    }
    var diagnostic = ts_1.createCompilerDiagnostic.apply(undefined, arguments);
    return diagnostic.messageText;
}
exports.getDiagnosticText = getDiagnosticText;
/**
 * Reads the config file, reports errors if any and exits if the config file cannot be found
 */
function getParsedCommandLineOfConfigFile(configFileName, optionsToExtend, host, extendedConfigCache, watchOptionsToExtend, extraFileExtensions) {
    var configFileText = tryReadFile(configFileName, function (fileName) { return host.readFile(fileName); });
    if (!(0, ts_1.isString)(configFileText)) {
        host.onUnRecoverableConfigFileDiagnostic(configFileText);
        return undefined;
    }
    var result = (0, ts_1.parseJsonText)(configFileName, configFileText);
    var cwd = host.getCurrentDirectory();
    result.path = (0, ts_1.toPath)(configFileName, cwd, (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames));
    result.resolvedPath = result.path;
    result.originalFileName = result.fileName;
    return parseJsonSourceFileConfigFileContent(result, host, (0, ts_1.getNormalizedAbsolutePath)((0, ts_1.getDirectoryPath)(configFileName), cwd), optionsToExtend, (0, ts_1.getNormalizedAbsolutePath)(configFileName, cwd), 
    /*resolutionStack*/ undefined, extraFileExtensions, extendedConfigCache, watchOptionsToExtend);
}
exports.getParsedCommandLineOfConfigFile = getParsedCommandLineOfConfigFile;
/**
 * Read tsconfig.json file
 * @param fileName The path to the config file
 */
function readConfigFile(fileName, readFile) {
    var textOrDiagnostic = tryReadFile(fileName, readFile);
    return (0, ts_1.isString)(textOrDiagnostic) ? parseConfigFileTextToJson(fileName, textOrDiagnostic) : { config: {}, error: textOrDiagnostic };
}
exports.readConfigFile = readConfigFile;
/**
 * Parse the text of the tsconfig.json file
 * @param fileName The path to the config file
 * @param jsonText The text of the config file
 */
function parseConfigFileTextToJson(fileName, jsonText) {
    var jsonSourceFile = (0, ts_1.parseJsonText)(fileName, jsonText);
    return {
        config: convertConfigFileToObject(jsonSourceFile, jsonSourceFile.parseDiagnostics, /*jsonConversionNotifier*/ undefined),
        error: jsonSourceFile.parseDiagnostics.length ? jsonSourceFile.parseDiagnostics[0] : undefined
    };
}
exports.parseConfigFileTextToJson = parseConfigFileTextToJson;
/**
 * Read tsconfig.json file
 * @param fileName The path to the config file
 */
function readJsonConfigFile(fileName, readFile) {
    var textOrDiagnostic = tryReadFile(fileName, readFile);
    return (0, ts_1.isString)(textOrDiagnostic) ? (0, ts_1.parseJsonText)(fileName, textOrDiagnostic) : { fileName: fileName, parseDiagnostics: [textOrDiagnostic] };
}
exports.readJsonConfigFile = readJsonConfigFile;
/** @internal */
function tryReadFile(fileName, readFile) {
    var text;
    try {
        text = readFile(fileName);
    }
    catch (e) {
        return (0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Cannot_read_file_0_Colon_1, fileName, e.message);
    }
    return text === undefined ? (0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Cannot_read_file_0, fileName) : text;
}
exports.tryReadFile = tryReadFile;
function commandLineOptionsToMap(options) {
    return (0, ts_1.arrayToMap)(options, getOptionName);
}
var typeAcquisitionDidYouMeanDiagnostics = {
    optionDeclarations: exports.typeAcquisitionDeclarations,
    unknownOptionDiagnostic: ts_1.Diagnostics.Unknown_type_acquisition_option_0,
    unknownDidYouMeanDiagnostic: ts_1.Diagnostics.Unknown_type_acquisition_option_0_Did_you_mean_1,
};
var watchOptionsNameMapCache;
function getWatchOptionsNameMap() {
    return watchOptionsNameMapCache || (watchOptionsNameMapCache = createOptionNameMap(exports.optionsForWatch));
}
var watchOptionsDidYouMeanDiagnostics = {
    getOptionsNameMap: getWatchOptionsNameMap,
    optionDeclarations: exports.optionsForWatch,
    unknownOptionDiagnostic: ts_1.Diagnostics.Unknown_watch_option_0,
    unknownDidYouMeanDiagnostic: ts_1.Diagnostics.Unknown_watch_option_0_Did_you_mean_1,
    optionTypeMismatchDiagnostic: ts_1.Diagnostics.Watch_option_0_requires_a_value_of_type_1
};
var commandLineCompilerOptionsMapCache;
function getCommandLineCompilerOptionsMap() {
    return commandLineCompilerOptionsMapCache || (commandLineCompilerOptionsMapCache = commandLineOptionsToMap(exports.optionDeclarations));
}
var commandLineWatchOptionsMapCache;
function getCommandLineWatchOptionsMap() {
    return commandLineWatchOptionsMapCache || (commandLineWatchOptionsMapCache = commandLineOptionsToMap(exports.optionsForWatch));
}
var commandLineTypeAcquisitionMapCache;
function getCommandLineTypeAcquisitionMap() {
    return commandLineTypeAcquisitionMapCache || (commandLineTypeAcquisitionMapCache = commandLineOptionsToMap(exports.typeAcquisitionDeclarations));
}
var extendsOptionDeclaration = {
    name: "extends",
    type: "listOrElement",
    element: {
        name: "extends",
        type: "string"
    },
    category: ts_1.Diagnostics.File_Management,
    disallowNullOrUndefined: true,
};
var compilerOptionsDeclaration = {
    name: "compilerOptions",
    type: "object",
    elementOptions: getCommandLineCompilerOptionsMap(),
    extraKeyDiagnostics: exports.compilerOptionsDidYouMeanDiagnostics,
};
var watchOptionsDeclaration = {
    name: "watchOptions",
    type: "object",
    elementOptions: getCommandLineWatchOptionsMap(),
    extraKeyDiagnostics: watchOptionsDidYouMeanDiagnostics,
};
var typeAcquisitionDeclaration = {
    name: "typeAcquisition",
    type: "object",
    elementOptions: getCommandLineTypeAcquisitionMap(),
    extraKeyDiagnostics: typeAcquisitionDidYouMeanDiagnostics
};
var _tsconfigRootOptions;
function getTsconfigRootOptionsMap() {
    if (_tsconfigRootOptions === undefined) {
        _tsconfigRootOptions = {
            name: undefined,
            type: "object",
            elementOptions: commandLineOptionsToMap([
                compilerOptionsDeclaration,
                watchOptionsDeclaration,
                typeAcquisitionDeclaration,
                extendsOptionDeclaration,
                {
                    name: "references",
                    type: "list",
                    element: {
                        name: "references",
                        type: "object"
                    },
                    category: ts_1.Diagnostics.Projects,
                },
                {
                    name: "files",
                    type: "list",
                    element: {
                        name: "files",
                        type: "string"
                    },
                    category: ts_1.Diagnostics.File_Management,
                },
                {
                    name: "include",
                    type: "list",
                    element: {
                        name: "include",
                        type: "string"
                    },
                    category: ts_1.Diagnostics.File_Management,
                    defaultValueDescription: ts_1.Diagnostics.if_files_is_specified_otherwise_Asterisk_Asterisk_Slash_Asterisk
                },
                {
                    name: "exclude",
                    type: "list",
                    element: {
                        name: "exclude",
                        type: "string"
                    },
                    category: ts_1.Diagnostics.File_Management,
                    defaultValueDescription: ts_1.Diagnostics.node_modules_bower_components_jspm_packages_plus_the_value_of_outDir_if_one_is_specified
                },
                exports.compileOnSaveCommandLineOption
            ])
        };
    }
    return _tsconfigRootOptions;
}
function convertConfigFileToObject(sourceFile, errors, jsonConversionNotifier) {
    var _a;
    var rootExpression = (_a = sourceFile.statements[0]) === null || _a === void 0 ? void 0 : _a.expression;
    if (rootExpression && rootExpression.kind !== 209 /* SyntaxKind.ObjectLiteralExpression */) {
        errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, rootExpression, ts_1.Diagnostics.The_root_value_of_a_0_file_must_be_an_object, (0, ts_1.getBaseFileName)(sourceFile.fileName) === "jsconfig.json" ? "jsconfig.json" : "tsconfig.json"));
        // Last-ditch error recovery. Somewhat useful because the JSON parser will recover from some parse errors by
        // synthesizing a top-level array literal expression. There's a reasonable chance the first element of that
        // array is a well-formed configuration object, made into an array element by stray characters.
        if ((0, ts_1.isArrayLiteralExpression)(rootExpression)) {
            var firstObject = (0, ts_1.find)(rootExpression.elements, ts_1.isObjectLiteralExpression);
            if (firstObject) {
                return convertToJson(sourceFile, firstObject, errors, /*returnValue*/ true, jsonConversionNotifier);
            }
        }
        return {};
    }
    return convertToJson(sourceFile, rootExpression, errors, /*returnValue*/ true, jsonConversionNotifier);
}
/**
 * Convert the json syntax tree into the json value
 */
function convertToObject(sourceFile, errors) {
    var _a;
    return convertToJson(sourceFile, (_a = sourceFile.statements[0]) === null || _a === void 0 ? void 0 : _a.expression, errors, /*returnValue*/ true, /*jsonConversionNotifier*/ undefined);
}
exports.convertToObject = convertToObject;
/**
 * Convert the json syntax tree into the json value and report errors
 * This returns the json value (apart from checking errors) only if returnValue provided is true.
 * Otherwise it just checks the errors and returns undefined
 *
 * @internal
 */
function convertToJson(sourceFile, rootExpression, errors, returnValue, jsonConversionNotifier) {
    if (!rootExpression) {
        return returnValue ? {} : undefined;
    }
    return convertPropertyValueToJson(rootExpression, jsonConversionNotifier === null || jsonConversionNotifier === void 0 ? void 0 : jsonConversionNotifier.rootOptions);
    function convertObjectLiteralExpressionToJson(node, objectOption) {
        var _a;
        var result = returnValue ? {} : undefined;
        for (var _i = 0, _b = node.properties; _i < _b.length; _i++) {
            var element = _b[_i];
            if (element.kind !== 302 /* SyntaxKind.PropertyAssignment */) {
                errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, element, ts_1.Diagnostics.Property_assignment_expected));
                continue;
            }
            if (element.questionToken) {
                errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, element.questionToken, ts_1.Diagnostics.The_0_modifier_can_only_be_used_in_TypeScript_files, "?"));
            }
            if (!isDoubleQuotedString(element.name)) {
                errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, element.name, ts_1.Diagnostics.String_literal_with_double_quotes_expected));
            }
            var textOfKey = (0, ts_1.isComputedNonLiteralName)(element.name) ? undefined : (0, ts_1.getTextOfPropertyName)(element.name);
            var keyText = textOfKey && (0, ts_1.unescapeLeadingUnderscores)(textOfKey);
            var option = keyText ? (_a = objectOption === null || objectOption === void 0 ? void 0 : objectOption.elementOptions) === null || _a === void 0 ? void 0 : _a.get(keyText) : undefined;
            var value = convertPropertyValueToJson(element.initializer, option);
            if (typeof keyText !== "undefined") {
                if (returnValue) {
                    result[keyText] = value;
                }
                // Notify key value set, if user asked for it
                jsonConversionNotifier === null || jsonConversionNotifier === void 0 ? void 0 : jsonConversionNotifier.onPropertySet(keyText, value, element, objectOption, option);
            }
        }
        return result;
    }
    function convertArrayLiteralExpressionToJson(elements, elementOption) {
        if (!returnValue) {
            elements.forEach(function (element) { return convertPropertyValueToJson(element, elementOption); });
            return undefined;
        }
        // Filter out invalid values
        return (0, ts_1.filter)(elements.map(function (element) { return convertPropertyValueToJson(element, elementOption); }), function (v) { return v !== undefined; });
    }
    function convertPropertyValueToJson(valueExpression, option) {
        switch (valueExpression.kind) {
            case 112 /* SyntaxKind.TrueKeyword */:
                return true;
            case 97 /* SyntaxKind.FalseKeyword */:
                return false;
            case 106 /* SyntaxKind.NullKeyword */:
                return null; // eslint-disable-line no-null/no-null
            case 11 /* SyntaxKind.StringLiteral */:
                if (!isDoubleQuotedString(valueExpression)) {
                    errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, valueExpression, ts_1.Diagnostics.String_literal_with_double_quotes_expected));
                }
                return valueExpression.text;
            case 9 /* SyntaxKind.NumericLiteral */:
                return Number(valueExpression.text);
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
                if (valueExpression.operator !== 41 /* SyntaxKind.MinusToken */ || valueExpression.operand.kind !== 9 /* SyntaxKind.NumericLiteral */) {
                    break; // not valid JSON syntax
                }
                return -Number(valueExpression.operand.text);
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                var objectLiteralExpression = valueExpression;
                // Currently having element option declaration in the tsconfig with type "object"
                // determines if it needs onSetValidOptionKeyValueInParent callback or not
                // At moment there are only "compilerOptions", "typeAcquisition" and "typingOptions"
                // that satifies it and need it to modify options set in them (for normalizing file paths)
                // vs what we set in the json
                // If need arises, we can modify this interface and callbacks as needed
                return convertObjectLiteralExpressionToJson(objectLiteralExpression, option);
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
                return convertArrayLiteralExpressionToJson(valueExpression.elements, option && option.element);
        }
        // Not in expected format
        if (option) {
            errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, valueExpression, ts_1.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, option.name, getCompilerOptionValueTypeString(option)));
        }
        else {
            errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, valueExpression, ts_1.Diagnostics.Property_value_can_only_be_string_literal_numeric_literal_true_false_null_object_literal_or_array_literal));
        }
        return undefined;
    }
    function isDoubleQuotedString(node) {
        return (0, ts_1.isStringLiteral)(node) && (0, ts_1.isStringDoubleQuoted)(node, sourceFile);
    }
}
exports.convertToJson = convertToJson;
function getCompilerOptionValueTypeString(option) {
    return (option.type === "listOrElement") ?
        "".concat(getCompilerOptionValueTypeString(option.element), " or Array") :
        option.type === "list" ?
            "Array" :
            (0, ts_1.isString)(option.type) ? option.type : "string";
}
function isCompilerOptionsValue(option, value) {
    if (option) {
        if (isNullOrUndefined(value))
            return !option.disallowNullOrUndefined; // All options are undefinable/nullable
        if (option.type === "list") {
            return (0, ts_1.isArray)(value);
        }
        if (option.type === "listOrElement") {
            return (0, ts_1.isArray)(value) || isCompilerOptionsValue(option.element, value);
        }
        var expectedType = (0, ts_1.isString)(option.type) ? option.type : "string";
        return typeof value === expectedType;
    }
    return false;
}
/**
 * Generate an uncommented, complete tsconfig for use with "--showConfig"
 * @param configParseResult options to be generated into tsconfig.json
 * @param configFileName name of the parsed config file - output paths will be generated relative to this
 * @param host provides current directory and case sensitivity services
 *
 * @internal
 */
function convertToTSConfig(configParseResult, configFileName, host) {
    var _a, _b, _c;
    var getCanonicalFileName = (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames);
    var files = (0, ts_1.map)((0, ts_1.filter)(configParseResult.fileNames, !((_b = (_a = configParseResult.options.configFile) === null || _a === void 0 ? void 0 : _a.configFileSpecs) === null || _b === void 0 ? void 0 : _b.validatedIncludeSpecs) ? ts_1.returnTrue : matchesSpecs(configFileName, configParseResult.options.configFile.configFileSpecs.validatedIncludeSpecs, configParseResult.options.configFile.configFileSpecs.validatedExcludeSpecs, host)), function (f) { return (0, ts_1.getRelativePathFromFile)((0, ts_1.getNormalizedAbsolutePath)(configFileName, host.getCurrentDirectory()), (0, ts_1.getNormalizedAbsolutePath)(f, host.getCurrentDirectory()), getCanonicalFileName); });
    var optionMap = serializeCompilerOptions(configParseResult.options, { configFilePath: (0, ts_1.getNormalizedAbsolutePath)(configFileName, host.getCurrentDirectory()), useCaseSensitiveFileNames: host.useCaseSensitiveFileNames });
    var watchOptionMap = configParseResult.watchOptions && serializeWatchOptions(configParseResult.watchOptions);
    var config = __assign(__assign({ compilerOptions: __assign(__assign({}, optionMapToObject(optionMap)), { showConfig: undefined, configFile: undefined, configFilePath: undefined, help: undefined, init: undefined, listFiles: undefined, listEmittedFiles: undefined, project: undefined, build: undefined, version: undefined }), watchOptions: watchOptionMap && optionMapToObject(watchOptionMap), references: (0, ts_1.map)(configParseResult.projectReferences, function (r) { return (__assign(__assign({}, r), { path: r.originalPath ? r.originalPath : "", originalPath: undefined })); }), files: (0, ts_1.length)(files) ? files : undefined }, (((_c = configParseResult.options.configFile) === null || _c === void 0 ? void 0 : _c.configFileSpecs) ? {
        include: filterSameAsDefaultInclude(configParseResult.options.configFile.configFileSpecs.validatedIncludeSpecs),
        exclude: configParseResult.options.configFile.configFileSpecs.validatedExcludeSpecs
    } : {})), { compileOnSave: !!configParseResult.compileOnSave ? true : undefined });
    return config;
}
exports.convertToTSConfig = convertToTSConfig;
/** @internal */
function optionMapToObject(optionMap) {
    return __assign({}, (0, ts_1.arrayFrom)(optionMap.entries()).reduce(function (prev, cur) {
        var _a;
        return (__assign(__assign({}, prev), (_a = {}, _a[cur[0]] = cur[1], _a)));
    }, {}));
}
exports.optionMapToObject = optionMapToObject;
function filterSameAsDefaultInclude(specs) {
    if (!(0, ts_1.length)(specs))
        return undefined;
    if ((0, ts_1.length)(specs) !== 1)
        return specs;
    if (specs[0] === exports.defaultIncludeSpec)
        return undefined;
    return specs;
}
function matchesSpecs(path, includeSpecs, excludeSpecs, host) {
    if (!includeSpecs)
        return ts_1.returnTrue;
    var patterns = (0, ts_1.getFileMatcherPatterns)(path, excludeSpecs, includeSpecs, host.useCaseSensitiveFileNames, host.getCurrentDirectory());
    var excludeRe = patterns.excludePattern && (0, ts_1.getRegexFromPattern)(patterns.excludePattern, host.useCaseSensitiveFileNames);
    var includeRe = patterns.includeFilePattern && (0, ts_1.getRegexFromPattern)(patterns.includeFilePattern, host.useCaseSensitiveFileNames);
    if (includeRe) {
        if (excludeRe) {
            return function (path) { return !(includeRe.test(path) && !excludeRe.test(path)); };
        }
        return function (path) { return !includeRe.test(path); };
    }
    if (excludeRe) {
        return function (path) { return excludeRe.test(path); };
    }
    return ts_1.returnTrue;
}
function getCustomTypeMapOfCommandLineOption(optionDefinition) {
    switch (optionDefinition.type) {
        case "string":
        case "number":
        case "boolean":
        case "object":
            // this is of a type CommandLineOptionOfPrimitiveType
            return undefined;
        case "list":
        case "listOrElement":
            return getCustomTypeMapOfCommandLineOption(optionDefinition.element);
        default:
            return optionDefinition.type;
    }
}
/** @internal */
function getNameOfCompilerOptionValue(value, customTypeMap) {
    // There is a typeMap associated with this command-line option so use it to map value back to its name
    return (0, ts_1.forEachEntry)(customTypeMap, function (mapValue, key) {
        if (mapValue === value) {
            return key;
        }
    });
}
exports.getNameOfCompilerOptionValue = getNameOfCompilerOptionValue;
/** @internal */
function serializeCompilerOptions(options, pathOptions) {
    return serializeOptionBaseObject(options, getOptionsNameMap(), pathOptions);
}
exports.serializeCompilerOptions = serializeCompilerOptions;
function serializeWatchOptions(options) {
    return serializeOptionBaseObject(options, getWatchOptionsNameMap());
}
function serializeOptionBaseObject(options, _a, pathOptions) {
    var optionsNameMap = _a.optionsNameMap;
    var result = new Map();
    var getCanonicalFileName = pathOptions && (0, ts_1.createGetCanonicalFileName)(pathOptions.useCaseSensitiveFileNames);
    var _loop_1 = function (name_1) {
        if ((0, ts_1.hasProperty)(options, name_1)) {
            // tsconfig only options cannot be specified via command line,
            // so we can assume that only types that can appear here string | number | boolean
            if (optionsNameMap.has(name_1) && (optionsNameMap.get(name_1).category === ts_1.Diagnostics.Command_line_Options || optionsNameMap.get(name_1).category === ts_1.Diagnostics.Output_Formatting)) {
                return "continue";
            }
            var value = options[name_1];
            var optionDefinition = optionsNameMap.get(name_1.toLowerCase());
            if (optionDefinition) {
                ts_1.Debug.assert(optionDefinition.type !== "listOrElement");
                var customTypeMap_1 = getCustomTypeMapOfCommandLineOption(optionDefinition);
                if (!customTypeMap_1) {
                    // There is no map associated with this compiler option then use the value as-is
                    // This is the case if the value is expect to be string, number, boolean or list of string
                    if (pathOptions && optionDefinition.isFilePath) {
                        result.set(name_1, (0, ts_1.getRelativePathFromFile)(pathOptions.configFilePath, (0, ts_1.getNormalizedAbsolutePath)(value, (0, ts_1.getDirectoryPath)(pathOptions.configFilePath)), getCanonicalFileName));
                    }
                    else {
                        result.set(name_1, value);
                    }
                }
                else {
                    if (optionDefinition.type === "list") {
                        result.set(name_1, value.map(function (element) { return getNameOfCompilerOptionValue(element, customTypeMap_1); })); // TODO: GH#18217
                    }
                    else {
                        // There is a typeMap associated with this command-line option so use it to map value back to its name
                        result.set(name_1, getNameOfCompilerOptionValue(value, customTypeMap_1));
                    }
                }
            }
        }
    };
    for (var name_1 in options) {
        _loop_1(name_1);
    }
    return result;
}
/**
 * Generate a list of the compiler options whose value is not the default.
 * @param options compilerOptions to be evaluated.
/** @internal */
function getCompilerOptionsDiffValue(options, newLine) {
    var compilerOptionsMap = getSerializedCompilerOption(options);
    return getOverwrittenDefaultOptions();
    function makePadding(paddingLength) {
        return Array(paddingLength + 1).join(" ");
    }
    function getOverwrittenDefaultOptions() {
        var result = [];
        var tab = makePadding(2);
        commandOptionsWithoutBuild.forEach(function (cmd) {
            if (!compilerOptionsMap.has(cmd.name)) {
                return;
            }
            var newValue = compilerOptionsMap.get(cmd.name);
            var defaultValue = getDefaultValueForOption(cmd);
            if (newValue !== defaultValue) {
                result.push("".concat(tab).concat(cmd.name, ": ").concat(newValue));
            }
            else if ((0, ts_1.hasProperty)(exports.defaultInitCompilerOptions, cmd.name)) {
                result.push("".concat(tab).concat(cmd.name, ": ").concat(defaultValue));
            }
        });
        return result.join(newLine) + newLine;
    }
}
exports.getCompilerOptionsDiffValue = getCompilerOptionsDiffValue;
/**
 * Get the compiler options to be written into the tsconfig.json.
 * @param options commandlineOptions to be included in the compileOptions.
 */
function getSerializedCompilerOption(options) {
    var compilerOptions = (0, ts_1.extend)(options, exports.defaultInitCompilerOptions);
    return serializeCompilerOptions(compilerOptions);
}
/**
 * Generate tsconfig configuration when running command line "--init"
 * @param options commandlineOptions to be generated into tsconfig.json
 * @param fileNames array of filenames to be generated into tsconfig.json
 *
 * @internal
 */
function generateTSConfig(options, fileNames, newLine) {
    var compilerOptionsMap = getSerializedCompilerOption(options);
    return writeConfigurations();
    function makePadding(paddingLength) {
        return Array(paddingLength + 1).join(" ");
    }
    function isAllowedOptionForOutput(_a) {
        var category = _a.category, name = _a.name, isCommandLineOnly = _a.isCommandLineOnly;
        // Skip options which do not have a category or have categories which are more niche
        var categoriesToSkip = [ts_1.Diagnostics.Command_line_Options, ts_1.Diagnostics.Editor_Support, ts_1.Diagnostics.Compiler_Diagnostics, ts_1.Diagnostics.Backwards_Compatibility, ts_1.Diagnostics.Watch_and_Build_Modes, ts_1.Diagnostics.Output_Formatting];
        return !isCommandLineOnly && category !== undefined && (!categoriesToSkip.includes(category) || compilerOptionsMap.has(name));
    }
    function writeConfigurations() {
        // Filter applicable options to place in the file
        var categorizedOptions = new Map();
        // Set allowed categories in order
        categorizedOptions.set(ts_1.Diagnostics.Projects, []);
        categorizedOptions.set(ts_1.Diagnostics.Language_and_Environment, []);
        categorizedOptions.set(ts_1.Diagnostics.Modules, []);
        categorizedOptions.set(ts_1.Diagnostics.JavaScript_Support, []);
        categorizedOptions.set(ts_1.Diagnostics.Emit, []);
        categorizedOptions.set(ts_1.Diagnostics.Interop_Constraints, []);
        categorizedOptions.set(ts_1.Diagnostics.Type_Checking, []);
        categorizedOptions.set(ts_1.Diagnostics.Completeness, []);
        for (var _i = 0, optionDeclarations_1 = exports.optionDeclarations; _i < optionDeclarations_1.length; _i++) {
            var option = optionDeclarations_1[_i];
            if (isAllowedOptionForOutput(option)) {
                var listForCategory = categorizedOptions.get(option.category);
                if (!listForCategory)
                    categorizedOptions.set(option.category, listForCategory = []);
                listForCategory.push(option);
            }
        }
        // Serialize all options and their descriptions
        var marginLength = 0;
        var seenKnownKeys = 0;
        var entries = [];
        categorizedOptions.forEach(function (options, category) {
            if (entries.length !== 0) {
                entries.push({ value: "" });
            }
            entries.push({ value: "/* ".concat((0, ts_1.getLocaleSpecificMessage)(category), " */") });
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var option = options_1[_i];
                var optionName = void 0;
                if (compilerOptionsMap.has(option.name)) {
                    optionName = "\"".concat(option.name, "\": ").concat(JSON.stringify(compilerOptionsMap.get(option.name))).concat((seenKnownKeys += 1) === compilerOptionsMap.size ? "" : ",");
                }
                else {
                    optionName = "// \"".concat(option.name, "\": ").concat(JSON.stringify(getDefaultValueForOption(option)), ",");
                }
                entries.push({
                    value: optionName,
                    description: "/* ".concat(option.description && (0, ts_1.getLocaleSpecificMessage)(option.description) || option.name, " */")
                });
                marginLength = Math.max(optionName.length, marginLength);
            }
        });
        // Write the output
        var tab = makePadding(2);
        var result = [];
        result.push("{");
        result.push("".concat(tab, "\"compilerOptions\": {"));
        result.push("".concat(tab).concat(tab, "/* ").concat((0, ts_1.getLocaleSpecificMessage)(ts_1.Diagnostics.Visit_https_Colon_Slash_Slashaka_ms_Slashtsconfig_to_read_more_about_this_file), " */"));
        result.push("");
        // Print out each row, aligning all the descriptions on the same column.
        for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
            var entry = entries_1[_a];
            var value = entry.value, _b = entry.description, description = _b === void 0 ? "" : _b;
            result.push(value && "".concat(tab).concat(tab).concat(value).concat(description && (makePadding(marginLength - value.length + 2) + description)));
        }
        if (fileNames.length) {
            result.push("".concat(tab, "},"));
            result.push("".concat(tab, "\"files\": ["));
            for (var i = 0; i < fileNames.length; i++) {
                result.push("".concat(tab).concat(tab).concat(JSON.stringify(fileNames[i])).concat(i === fileNames.length - 1 ? "" : ","));
            }
            result.push("".concat(tab, "]"));
        }
        else {
            result.push("".concat(tab, "}"));
        }
        result.push("}");
        return result.join(newLine) + newLine;
    }
}
exports.generateTSConfig = generateTSConfig;
/** @internal */
function convertToOptionsWithAbsolutePaths(options, toAbsolutePath) {
    var result = {};
    var optionsNameMap = getOptionsNameMap().optionsNameMap;
    for (var name_2 in options) {
        if ((0, ts_1.hasProperty)(options, name_2)) {
            result[name_2] = convertToOptionValueWithAbsolutePaths(optionsNameMap.get(name_2.toLowerCase()), options[name_2], toAbsolutePath);
        }
    }
    if (result.configFilePath) {
        result.configFilePath = toAbsolutePath(result.configFilePath);
    }
    return result;
}
exports.convertToOptionsWithAbsolutePaths = convertToOptionsWithAbsolutePaths;
function convertToOptionValueWithAbsolutePaths(option, value, toAbsolutePath) {
    if (option && !isNullOrUndefined(value)) {
        if (option.type === "list") {
            var values = value;
            if (option.element.isFilePath && values.length) {
                return values.map(toAbsolutePath);
            }
        }
        else if (option.isFilePath) {
            return toAbsolutePath(value);
        }
        ts_1.Debug.assert(option.type !== "listOrElement");
    }
    return value;
}
/**
 * Parse the contents of a config file (tsconfig.json).
 * @param json The contents of the config file to parse
 * @param host Instance of ParseConfigHost used to enumerate files in folder.
 * @param basePath A root directory to resolve relative path entries in the config
 *    file to. e.g. outDir
 */
function parseJsonConfigFileContent(json, host, basePath, existingOptions, configFileName, resolutionStack, extraFileExtensions, extendedConfigCache, existingWatchOptions) {
    return parseJsonConfigFileContentWorker(json, /*sourceFile*/ undefined, host, basePath, existingOptions, existingWatchOptions, configFileName, resolutionStack, extraFileExtensions, extendedConfigCache);
}
exports.parseJsonConfigFileContent = parseJsonConfigFileContent;
/**
 * Parse the contents of a config file (tsconfig.json).
 * @param jsonNode The contents of the config file to parse
 * @param host Instance of ParseConfigHost used to enumerate files in folder.
 * @param basePath A root directory to resolve relative path entries in the config
 *    file to. e.g. outDir
 */
function parseJsonSourceFileConfigFileContent(sourceFile, host, basePath, existingOptions, configFileName, resolutionStack, extraFileExtensions, extendedConfigCache, existingWatchOptions) {
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("parse" /* tracing.Phase.Parse */, "parseJsonSourceFileConfigFileContent", { path: sourceFile.fileName });
    var result = parseJsonConfigFileContentWorker(/*json*/ undefined, sourceFile, host, basePath, existingOptions, existingWatchOptions, configFileName, resolutionStack, extraFileExtensions, extendedConfigCache);
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    return result;
}
exports.parseJsonSourceFileConfigFileContent = parseJsonSourceFileConfigFileContent;
/** @internal */
function setConfigFileInOptions(options, configFile) {
    if (configFile) {
        Object.defineProperty(options, "configFile", { enumerable: false, writable: false, value: configFile });
    }
}
exports.setConfigFileInOptions = setConfigFileInOptions;
function isNullOrUndefined(x) {
    return x === undefined || x === null; // eslint-disable-line no-null/no-null
}
function directoryOfCombinedPath(fileName, basePath) {
    // Use the `getNormalizedAbsolutePath` function to avoid canonicalizing the path, as it must remain noncanonical
    // until consistent casing errors are reported
    return (0, ts_1.getDirectoryPath)((0, ts_1.getNormalizedAbsolutePath)(fileName, basePath));
}
/** @internal */
exports.defaultIncludeSpec = "**/*";
/**
 * Parse the contents of a config file from json or json source file (tsconfig.json).
 * @param json The contents of the config file to parse
 * @param sourceFile sourceFile corresponding to the Json
 * @param host Instance of ParseConfigHost used to enumerate files in folder.
 * @param basePath A root directory to resolve relative path entries in the config
 *    file to. e.g. outDir
 * @param resolutionStack Only present for backwards-compatibility. Should be empty.
 */
function parseJsonConfigFileContentWorker(json, sourceFile, host, basePath, existingOptions, existingWatchOptions, configFileName, resolutionStack, extraFileExtensions, extendedConfigCache) {
    if (existingOptions === void 0) { existingOptions = {}; }
    if (resolutionStack === void 0) { resolutionStack = []; }
    if (extraFileExtensions === void 0) { extraFileExtensions = []; }
    ts_1.Debug.assert((json === undefined && sourceFile !== undefined) || (json !== undefined && sourceFile === undefined));
    var errors = [];
    var parsedConfig = parseConfig(json, sourceFile, host, basePath, configFileName, resolutionStack, errors, extendedConfigCache);
    var raw = parsedConfig.raw;
    var options = (0, ts_1.extend)(existingOptions, parsedConfig.options || {});
    var watchOptions = existingWatchOptions && parsedConfig.watchOptions ?
        (0, ts_1.extend)(existingWatchOptions, parsedConfig.watchOptions) :
        parsedConfig.watchOptions || existingWatchOptions;
    options.configFilePath = configFileName && (0, ts_1.normalizeSlashes)(configFileName);
    var configFileSpecs = getConfigFileSpecs();
    if (sourceFile)
        sourceFile.configFileSpecs = configFileSpecs;
    setConfigFileInOptions(options, sourceFile);
    var basePathForFileNames = (0, ts_1.normalizePath)(configFileName ? directoryOfCombinedPath(configFileName, basePath) : basePath);
    return {
        options: options,
        watchOptions: watchOptions,
        fileNames: getFileNames(basePathForFileNames),
        projectReferences: getProjectReferences(basePathForFileNames),
        typeAcquisition: parsedConfig.typeAcquisition || getDefaultTypeAcquisition(),
        raw: raw,
        errors: errors,
        // Wildcard directories (provided as part of a wildcard path) are stored in a
        // file map that marks whether it was a regular wildcard match (with a `*` or `?` token),
        // or a recursive directory. This information is used by filesystem watchers to monitor for
        // new entries in these paths.
        wildcardDirectories: getWildcardDirectories(configFileSpecs, basePathForFileNames, host.useCaseSensitiveFileNames),
        compileOnSave: !!raw.compileOnSave,
    };
    function getConfigFileSpecs() {
        var referencesOfRaw = getPropFromRaw("references", function (element) { return typeof element === "object"; }, "object");
        var filesSpecs = toPropValue(getSpecsFromRaw("files"));
        if (filesSpecs) {
            var hasZeroOrNoReferences = referencesOfRaw === "no-prop" || (0, ts_1.isArray)(referencesOfRaw) && referencesOfRaw.length === 0;
            var hasExtends = (0, ts_1.hasProperty)(raw, "extends");
            if (filesSpecs.length === 0 && hasZeroOrNoReferences && !hasExtends) {
                if (sourceFile) {
                    var fileName = configFileName || "tsconfig.json";
                    var diagnosticMessage = ts_1.Diagnostics.The_files_list_in_config_file_0_is_empty;
                    var nodeValue = (0, ts_1.forEachTsConfigPropArray)(sourceFile, "files", function (property) { return property.initializer; });
                    var error = createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, nodeValue, diagnosticMessage, fileName);
                    errors.push(error);
                }
                else {
                    createCompilerDiagnosticOnlyIfJson(ts_1.Diagnostics.The_files_list_in_config_file_0_is_empty, configFileName || "tsconfig.json");
                }
            }
        }
        var includeSpecs = toPropValue(getSpecsFromRaw("include"));
        var excludeOfRaw = getSpecsFromRaw("exclude");
        var isDefaultIncludeSpec = false;
        var excludeSpecs = toPropValue(excludeOfRaw);
        if (excludeOfRaw === "no-prop" && raw.compilerOptions) {
            var outDir = raw.compilerOptions.outDir;
            var declarationDir = raw.compilerOptions.declarationDir;
            if (outDir || declarationDir) {
                excludeSpecs = [outDir, declarationDir].filter(function (d) { return !!d; });
            }
        }
        if (filesSpecs === undefined && includeSpecs === undefined) {
            includeSpecs = [exports.defaultIncludeSpec];
            isDefaultIncludeSpec = true;
        }
        var validatedIncludeSpecs, validatedExcludeSpecs;
        // The exclude spec list is converted into a regular expression, which allows us to quickly
        // test whether a file or directory should be excluded before recursively traversing the
        // file system.
        if (includeSpecs) {
            validatedIncludeSpecs = validateSpecs(includeSpecs, errors, /*disallowTrailingRecursion*/ true, sourceFile, "include");
        }
        if (excludeSpecs) {
            validatedExcludeSpecs = validateSpecs(excludeSpecs, errors, /*disallowTrailingRecursion*/ false, sourceFile, "exclude");
        }
        return {
            filesSpecs: filesSpecs,
            includeSpecs: includeSpecs,
            excludeSpecs: excludeSpecs,
            validatedFilesSpec: (0, ts_1.filter)(filesSpecs, ts_1.isString),
            validatedIncludeSpecs: validatedIncludeSpecs,
            validatedExcludeSpecs: validatedExcludeSpecs,
            pathPatterns: undefined,
            isDefaultIncludeSpec: isDefaultIncludeSpec,
        };
    }
    function getFileNames(basePath) {
        var fileNames = getFileNamesFromConfigSpecs(configFileSpecs, basePath, options, host, extraFileExtensions);
        if (shouldReportNoInputFiles(fileNames, canJsonReportNoInputFiles(raw), resolutionStack)) {
            errors.push(getErrorForNoInputFiles(configFileSpecs, configFileName));
        }
        return fileNames;
    }
    function getProjectReferences(basePath) {
        var projectReferences;
        var referencesOfRaw = getPropFromRaw("references", function (element) { return typeof element === "object"; }, "object");
        if ((0, ts_1.isArray)(referencesOfRaw)) {
            for (var _i = 0, referencesOfRaw_1 = referencesOfRaw; _i < referencesOfRaw_1.length; _i++) {
                var ref = referencesOfRaw_1[_i];
                if (typeof ref.path !== "string") {
                    createCompilerDiagnosticOnlyIfJson(ts_1.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, "reference.path", "string");
                }
                else {
                    (projectReferences || (projectReferences = [])).push({
                        path: (0, ts_1.getNormalizedAbsolutePath)(ref.path, basePath),
                        originalPath: ref.path,
                        prepend: ref.prepend,
                        circular: ref.circular
                    });
                }
            }
        }
        return projectReferences;
    }
    function toPropValue(specResult) {
        return (0, ts_1.isArray)(specResult) ? specResult : undefined;
    }
    function getSpecsFromRaw(prop) {
        return getPropFromRaw(prop, ts_1.isString, "string");
    }
    function getPropFromRaw(prop, validateElement, elementTypeName) {
        if ((0, ts_1.hasProperty)(raw, prop) && !isNullOrUndefined(raw[prop])) {
            if ((0, ts_1.isArray)(raw[prop])) {
                var result = raw[prop];
                if (!sourceFile && !(0, ts_1.every)(result, validateElement)) {
                    errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, prop, elementTypeName));
                }
                return result;
            }
            else {
                createCompilerDiagnosticOnlyIfJson(ts_1.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, prop, "Array");
                return "not-array";
            }
        }
        return "no-prop";
    }
    function createCompilerDiagnosticOnlyIfJson(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!sourceFile) {
            errors.push(ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false)));
        }
    }
}
function isErrorNoInputFiles(error) {
    return error.code === ts_1.Diagnostics.No_inputs_were_found_in_config_file_0_Specified_include_paths_were_1_and_exclude_paths_were_2.code;
}
function getErrorForNoInputFiles(_a, configFileName) {
    var includeSpecs = _a.includeSpecs, excludeSpecs = _a.excludeSpecs;
    return (0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.No_inputs_were_found_in_config_file_0_Specified_include_paths_were_1_and_exclude_paths_were_2, configFileName || "tsconfig.json", JSON.stringify(includeSpecs || []), JSON.stringify(excludeSpecs || []));
}
function shouldReportNoInputFiles(fileNames, canJsonReportNoInutFiles, resolutionStack) {
    return fileNames.length === 0 && canJsonReportNoInutFiles && (!resolutionStack || resolutionStack.length === 0);
}
/** @internal */
function canJsonReportNoInputFiles(raw) {
    return !(0, ts_1.hasProperty)(raw, "files") && !(0, ts_1.hasProperty)(raw, "references");
}
exports.canJsonReportNoInputFiles = canJsonReportNoInputFiles;
/** @internal */
function updateErrorForNoInputFiles(fileNames, configFileName, configFileSpecs, configParseDiagnostics, canJsonReportNoInutFiles) {
    var existingErrors = configParseDiagnostics.length;
    if (shouldReportNoInputFiles(fileNames, canJsonReportNoInutFiles)) {
        configParseDiagnostics.push(getErrorForNoInputFiles(configFileSpecs, configFileName));
    }
    else {
        (0, ts_1.filterMutate)(configParseDiagnostics, function (error) { return !isErrorNoInputFiles(error); });
    }
    return existingErrors !== configParseDiagnostics.length;
}
exports.updateErrorForNoInputFiles = updateErrorForNoInputFiles;
function isSuccessfulParsedTsconfig(value) {
    return !!value.options;
}
/**
 * This *just* extracts options/include/exclude/files out of a config file.
 * It does *not* resolve the included files.
 */
function parseConfig(json, sourceFile, host, basePath, configFileName, resolutionStack, errors, extendedConfigCache) {
    var _a;
    basePath = (0, ts_1.normalizeSlashes)(basePath);
    var resolvedPath = (0, ts_1.getNormalizedAbsolutePath)(configFileName || "", basePath);
    if (resolutionStack.indexOf(resolvedPath) >= 0) {
        errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Circularity_detected_while_resolving_configuration_Colon_0, __spreadArray(__spreadArray([], resolutionStack, true), [resolvedPath], false).join(" -> ")));
        return { raw: json || convertToObject(sourceFile, errors) };
    }
    var ownConfig = json ?
        parseOwnConfigOfJson(json, host, basePath, configFileName, errors) :
        parseOwnConfigOfJsonSourceFile(sourceFile, host, basePath, configFileName, errors);
    if ((_a = ownConfig.options) === null || _a === void 0 ? void 0 : _a.paths) {
        // If we end up needing to resolve relative paths from 'paths' relative to
        // the config file location, we'll need to know where that config file was.
        // Since 'paths' can be inherited from an extended config in another directory,
        // we wouldn't know which directory to use unless we store it here.
        ownConfig.options.pathsBasePath = basePath;
    }
    if (ownConfig.extendedConfigPath) {
        // copy the resolution stack so it is never reused between branches in potential diamond-problem scenarios.
        resolutionStack = resolutionStack.concat([resolvedPath]);
        var result_1 = { options: {} };
        if ((0, ts_1.isString)(ownConfig.extendedConfigPath)) {
            applyExtendedConfig(result_1, ownConfig.extendedConfigPath);
        }
        else {
            ownConfig.extendedConfigPath.forEach(function (extendedConfigPath) { return applyExtendedConfig(result_1, extendedConfigPath); });
        }
        if (!ownConfig.raw.include && result_1.include)
            ownConfig.raw.include = result_1.include;
        if (!ownConfig.raw.exclude && result_1.exclude)
            ownConfig.raw.exclude = result_1.exclude;
        if (!ownConfig.raw.files && result_1.files)
            ownConfig.raw.files = result_1.files;
        if (ownConfig.raw.compileOnSave === undefined && result_1.compileOnSave)
            ownConfig.raw.compileOnSave = result_1.compileOnSave;
        if (sourceFile && result_1.extendedSourceFiles)
            sourceFile.extendedSourceFiles = (0, ts_1.arrayFrom)(result_1.extendedSourceFiles.keys());
        ownConfig.options = (0, ts_1.assign)(result_1.options, ownConfig.options);
        ownConfig.watchOptions = ownConfig.watchOptions && result_1.watchOptions ?
            (0, ts_1.assign)(result_1.watchOptions, ownConfig.watchOptions) :
            ownConfig.watchOptions || result_1.watchOptions;
    }
    return ownConfig;
    function applyExtendedConfig(result, extendedConfigPath) {
        var extendedConfig = getExtendedConfig(sourceFile, extendedConfigPath, host, resolutionStack, errors, extendedConfigCache, result);
        if (extendedConfig && isSuccessfulParsedTsconfig(extendedConfig)) {
            var extendsRaw_1 = extendedConfig.raw;
            var relativeDifference_1;
            var setPropertyInResultIfNotUndefined = function (propertyName) {
                if (extendsRaw_1[propertyName]) {
                    result[propertyName] = (0, ts_1.map)(extendsRaw_1[propertyName], function (path) { return (0, ts_1.isRootedDiskPath)(path) ? path : (0, ts_1.combinePaths)(relativeDifference_1 || (relativeDifference_1 = (0, ts_1.convertToRelativePath)((0, ts_1.getDirectoryPath)(extendedConfigPath), basePath, (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames))), path); });
                }
            };
            setPropertyInResultIfNotUndefined("include");
            setPropertyInResultIfNotUndefined("exclude");
            setPropertyInResultIfNotUndefined("files");
            if (extendsRaw_1.compileOnSave !== undefined) {
                result.compileOnSave = extendsRaw_1.compileOnSave;
            }
            (0, ts_1.assign)(result.options, extendedConfig.options);
            result.watchOptions = result.watchOptions && extendedConfig.watchOptions ?
                (0, ts_1.assign)({}, result.watchOptions, extendedConfig.watchOptions) :
                result.watchOptions || extendedConfig.watchOptions;
            // TODO extend type typeAcquisition
        }
    }
}
function parseOwnConfigOfJson(json, host, basePath, configFileName, errors) {
    if ((0, ts_1.hasProperty)(json, "excludes")) {
        errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Unknown_option_excludes_Did_you_mean_exclude));
    }
    var options = convertCompilerOptionsFromJsonWorker(json.compilerOptions, basePath, errors, configFileName);
    var typeAcquisition = convertTypeAcquisitionFromJsonWorker(json.typeAcquisition, basePath, errors, configFileName);
    var watchOptions = convertWatchOptionsFromJsonWorker(json.watchOptions, basePath, errors);
    json.compileOnSave = convertCompileOnSaveOptionFromJson(json, basePath, errors);
    var extendedConfigPath = json.extends || json.extends === "" ?
        getExtendsConfigPathOrArray(json.extends, host, basePath, configFileName, errors) :
        undefined;
    return { raw: json, options: options, watchOptions: watchOptions, typeAcquisition: typeAcquisition, extendedConfigPath: extendedConfigPath };
}
function getExtendsConfigPathOrArray(value, host, basePath, configFileName, errors, propertyAssignment, valueExpression, sourceFile) {
    var extendedConfigPath;
    var newBase = configFileName ? directoryOfCombinedPath(configFileName, basePath) : basePath;
    if ((0, ts_1.isString)(value)) {
        extendedConfigPath = getExtendsConfigPath(value, host, newBase, errors, valueExpression, sourceFile);
    }
    else if ((0, ts_1.isArray)(value)) {
        extendedConfigPath = [];
        for (var index = 0; index < value.length; index++) {
            var fileName = value[index];
            if ((0, ts_1.isString)(fileName)) {
                extendedConfigPath = (0, ts_1.append)(extendedConfigPath, getExtendsConfigPath(fileName, host, newBase, errors, valueExpression === null || valueExpression === void 0 ? void 0 : valueExpression.elements[index], sourceFile));
            }
            else {
                convertJsonOption(extendsOptionDeclaration.element, value, basePath, errors, propertyAssignment, valueExpression === null || valueExpression === void 0 ? void 0 : valueExpression.elements[index], sourceFile);
            }
        }
    }
    else {
        convertJsonOption(extendsOptionDeclaration, value, basePath, errors, propertyAssignment, valueExpression, sourceFile);
    }
    return extendedConfigPath;
}
function parseOwnConfigOfJsonSourceFile(sourceFile, host, basePath, configFileName, errors) {
    var options = getDefaultCompilerOptions(configFileName);
    var typeAcquisition;
    var watchOptions;
    var extendedConfigPath;
    var rootCompilerOptions;
    var rootOptions = getTsconfigRootOptionsMap();
    var json = convertConfigFileToObject(sourceFile, errors, { rootOptions: rootOptions, onPropertySet: onPropertySet });
    if (!typeAcquisition) {
        typeAcquisition = getDefaultTypeAcquisition(configFileName);
    }
    if (rootCompilerOptions && json && json.compilerOptions === undefined) {
        errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, rootCompilerOptions[0], ts_1.Diagnostics._0_should_be_set_inside_the_compilerOptions_object_of_the_config_json_file, (0, ts_1.getTextOfPropertyName)(rootCompilerOptions[0])));
    }
    return { raw: json, options: options, watchOptions: watchOptions, typeAcquisition: typeAcquisition, extendedConfigPath: extendedConfigPath };
    function onPropertySet(keyText, value, propertyAssignment, parentOption, option) {
        // Ensure value is verified except for extends which is handled in its own way for error reporting
        if (option && option !== extendsOptionDeclaration)
            value = convertJsonOption(option, value, basePath, errors, propertyAssignment, propertyAssignment.initializer, sourceFile);
        if (parentOption === null || parentOption === void 0 ? void 0 : parentOption.name) {
            if (option) {
                var currentOption = void 0;
                if (parentOption === compilerOptionsDeclaration)
                    currentOption = options;
                else if (parentOption === watchOptionsDeclaration)
                    currentOption = watchOptions !== null && watchOptions !== void 0 ? watchOptions : (watchOptions = {});
                else if (parentOption === typeAcquisitionDeclaration)
                    currentOption = typeAcquisition !== null && typeAcquisition !== void 0 ? typeAcquisition : (typeAcquisition = getDefaultTypeAcquisition(configFileName));
                else
                    ts_1.Debug.fail("Unknown option");
                currentOption[option.name] = value;
            }
            else if (keyText && (parentOption === null || parentOption === void 0 ? void 0 : parentOption.extraKeyDiagnostics)) {
                if (parentOption.elementOptions) {
                    errors.push(createUnknownOptionError(keyText, parentOption.extraKeyDiagnostics, 
                    /*unknownOptionErrorText*/ undefined, propertyAssignment.name, sourceFile));
                }
                else {
                    errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, propertyAssignment.name, parentOption.extraKeyDiagnostics.unknownOptionDiagnostic, keyText));
                }
            }
        }
        else if (parentOption === rootOptions) {
            if (option === extendsOptionDeclaration) {
                extendedConfigPath = getExtendsConfigPathOrArray(value, host, basePath, configFileName, errors, propertyAssignment, propertyAssignment.initializer, sourceFile);
            }
            else if (!option) {
                if (keyText === "excludes") {
                    errors.push((0, ts_1.createDiagnosticForNodeInSourceFile)(sourceFile, propertyAssignment.name, ts_1.Diagnostics.Unknown_option_excludes_Did_you_mean_exclude));
                }
                if ((0, ts_1.find)(commandOptionsWithoutBuild, function (opt) { return opt.name === keyText; })) {
                    rootCompilerOptions = (0, ts_1.append)(rootCompilerOptions, propertyAssignment.name);
                }
            }
        }
    }
}
function getExtendsConfigPath(extendedConfig, host, basePath, errors, valueExpression, sourceFile) {
    extendedConfig = (0, ts_1.normalizeSlashes)(extendedConfig);
    if ((0, ts_1.isRootedDiskPath)(extendedConfig) || (0, ts_1.startsWith)(extendedConfig, "./") || (0, ts_1.startsWith)(extendedConfig, "../")) {
        var extendedConfigPath = (0, ts_1.getNormalizedAbsolutePath)(extendedConfig, basePath);
        if (!host.fileExists(extendedConfigPath) && !(0, ts_1.endsWith)(extendedConfigPath, ".json" /* Extension.Json */)) {
            extendedConfigPath = "".concat(extendedConfigPath, ".json");
            if (!host.fileExists(extendedConfigPath)) {
                errors.push(createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, valueExpression, ts_1.Diagnostics.File_0_not_found, extendedConfig));
                return undefined;
            }
        }
        return extendedConfigPath;
    }
    // If the path isn't a rooted or relative path, resolve like a module
    var resolved = (0, ts_1.nodeNextJsonConfigResolver)(extendedConfig, (0, ts_1.combinePaths)(basePath, "tsconfig.json"), host);
    if (resolved.resolvedModule) {
        return resolved.resolvedModule.resolvedFileName;
    }
    if (extendedConfig === "") {
        errors.push(createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, valueExpression, ts_1.Diagnostics.Compiler_option_0_cannot_be_given_an_empty_string, "extends"));
    }
    else {
        errors.push(createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, valueExpression, ts_1.Diagnostics.File_0_not_found, extendedConfig));
    }
    return undefined;
}
function getExtendedConfig(sourceFile, extendedConfigPath, host, resolutionStack, errors, extendedConfigCache, result) {
    var _a;
    var path = host.useCaseSensitiveFileNames ? extendedConfigPath : (0, ts_1.toFileNameLowerCase)(extendedConfigPath);
    var value;
    var extendedResult;
    var extendedConfig;
    if (extendedConfigCache && (value = extendedConfigCache.get(path))) {
        (extendedResult = value.extendedResult, extendedConfig = value.extendedConfig);
    }
    else {
        extendedResult = readJsonConfigFile(extendedConfigPath, function (path) { return host.readFile(path); });
        if (!extendedResult.parseDiagnostics.length) {
            extendedConfig = parseConfig(/*json*/ undefined, extendedResult, host, (0, ts_1.getDirectoryPath)(extendedConfigPath), (0, ts_1.getBaseFileName)(extendedConfigPath), resolutionStack, errors, extendedConfigCache);
        }
        if (extendedConfigCache) {
            extendedConfigCache.set(path, { extendedResult: extendedResult, extendedConfig: extendedConfig });
        }
    }
    if (sourceFile) {
        ((_a = result.extendedSourceFiles) !== null && _a !== void 0 ? _a : (result.extendedSourceFiles = new Set())).add(extendedResult.fileName);
        if (extendedResult.extendedSourceFiles) {
            for (var _i = 0, _b = extendedResult.extendedSourceFiles; _i < _b.length; _i++) {
                var extenedSourceFile = _b[_i];
                result.extendedSourceFiles.add(extenedSourceFile);
            }
        }
    }
    if (extendedResult.parseDiagnostics.length) {
        errors.push.apply(errors, extendedResult.parseDiagnostics);
        return undefined;
    }
    return extendedConfig;
}
function convertCompileOnSaveOptionFromJson(jsonOption, basePath, errors) {
    if (!(0, ts_1.hasProperty)(jsonOption, exports.compileOnSaveCommandLineOption.name)) {
        return false;
    }
    var result = convertJsonOption(exports.compileOnSaveCommandLineOption, jsonOption.compileOnSave, basePath, errors);
    return typeof result === "boolean" && result;
}
function convertCompilerOptionsFromJson(jsonOptions, basePath, configFileName) {
    var errors = [];
    var options = convertCompilerOptionsFromJsonWorker(jsonOptions, basePath, errors, configFileName);
    return { options: options, errors: errors };
}
exports.convertCompilerOptionsFromJson = convertCompilerOptionsFromJson;
function convertTypeAcquisitionFromJson(jsonOptions, basePath, configFileName) {
    var errors = [];
    var options = convertTypeAcquisitionFromJsonWorker(jsonOptions, basePath, errors, configFileName);
    return { options: options, errors: errors };
}
exports.convertTypeAcquisitionFromJson = convertTypeAcquisitionFromJson;
function getDefaultCompilerOptions(configFileName) {
    var options = configFileName && (0, ts_1.getBaseFileName)(configFileName) === "jsconfig.json"
        ? { allowJs: true, maxNodeModuleJsDepth: 2, allowSyntheticDefaultImports: true, skipLibCheck: true, noEmit: true }
        : {};
    return options;
}
function convertCompilerOptionsFromJsonWorker(jsonOptions, basePath, errors, configFileName) {
    var options = getDefaultCompilerOptions(configFileName);
    convertOptionsFromJson(getCommandLineCompilerOptionsMap(), jsonOptions, basePath, options, exports.compilerOptionsDidYouMeanDiagnostics, errors);
    if (configFileName) {
        options.configFilePath = (0, ts_1.normalizeSlashes)(configFileName);
    }
    return options;
}
function getDefaultTypeAcquisition(configFileName) {
    return { enable: !!configFileName && (0, ts_1.getBaseFileName)(configFileName) === "jsconfig.json", include: [], exclude: [] };
}
function convertTypeAcquisitionFromJsonWorker(jsonOptions, basePath, errors, configFileName) {
    var options = getDefaultTypeAcquisition(configFileName);
    convertOptionsFromJson(getCommandLineTypeAcquisitionMap(), jsonOptions, basePath, options, typeAcquisitionDidYouMeanDiagnostics, errors);
    return options;
}
function convertWatchOptionsFromJsonWorker(jsonOptions, basePath, errors) {
    return convertOptionsFromJson(getCommandLineWatchOptionsMap(), jsonOptions, basePath, /*defaultOptions*/ undefined, watchOptionsDidYouMeanDiagnostics, errors);
}
function convertOptionsFromJson(optionsNameMap, jsonOptions, basePath, defaultOptions, diagnostics, errors) {
    if (!jsonOptions) {
        return;
    }
    for (var id in jsonOptions) {
        var opt = optionsNameMap.get(id);
        if (opt) {
            (defaultOptions || (defaultOptions = {}))[opt.name] = convertJsonOption(opt, jsonOptions[id], basePath, errors);
        }
        else {
            errors.push(createUnknownOptionError(id, diagnostics));
        }
    }
    return defaultOptions;
}
function createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, node, message) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return sourceFile && node ? ts_1.createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([sourceFile, node, message], args, false)) : ts_1.createCompilerDiagnostic.apply(void 0, __spreadArray([message], args, false));
}
/** @internal */
function convertJsonOption(opt, value, basePath, errors, propertyAssignment, valueExpression, sourceFile) {
    if (opt.isCommandLineOnly) {
        errors.push(createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, propertyAssignment === null || propertyAssignment === void 0 ? void 0 : propertyAssignment.name, ts_1.Diagnostics.Option_0_can_only_be_specified_on_command_line, opt.name));
        return undefined;
    }
    if (isCompilerOptionsValue(opt, value)) {
        var optType = opt.type;
        if ((optType === "list") && (0, ts_1.isArray)(value)) {
            return convertJsonOptionOfListType(opt, value, basePath, errors, propertyAssignment, valueExpression, sourceFile);
        }
        else if (optType === "listOrElement") {
            return (0, ts_1.isArray)(value) ?
                convertJsonOptionOfListType(opt, value, basePath, errors, propertyAssignment, valueExpression, sourceFile) :
                convertJsonOption(opt.element, value, basePath, errors, propertyAssignment, valueExpression, sourceFile);
        }
        else if (!(0, ts_1.isString)(opt.type)) {
            return convertJsonOptionOfCustomType(opt, value, errors, valueExpression, sourceFile);
        }
        var validatedValue = validateJsonOptionValue(opt, value, errors, valueExpression, sourceFile);
        return isNullOrUndefined(validatedValue) ? validatedValue : normalizeNonListOptionValue(opt, basePath, validatedValue);
    }
    else {
        errors.push(createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(sourceFile, valueExpression, ts_1.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, opt.name, getCompilerOptionValueTypeString(opt)));
    }
}
exports.convertJsonOption = convertJsonOption;
function normalizeNonListOptionValue(option, basePath, value) {
    if (option.isFilePath) {
        value = (0, ts_1.getNormalizedAbsolutePath)(value, basePath);
        if (value === "") {
            value = ".";
        }
    }
    return value;
}
function validateJsonOptionValue(opt, value, errors, valueExpression, sourceFile) {
    var _a;
    if (isNullOrUndefined(value))
        return undefined;
    var d = (_a = opt.extraValidation) === null || _a === void 0 ? void 0 : _a.call(opt, value);
    if (!d)
        return value;
    errors.push(createDiagnosticForNodeInSourceFileOrCompilerDiagnostic.apply(void 0, __spreadArray([sourceFile, valueExpression], d, false)));
    return undefined;
}
function convertJsonOptionOfCustomType(opt, value, errors, valueExpression, sourceFile) {
    if (isNullOrUndefined(value))
        return undefined;
    var key = value.toLowerCase();
    var val = opt.type.get(key);
    if (val !== undefined) {
        return validateJsonOptionValue(opt, val, errors, valueExpression, sourceFile);
    }
    else {
        errors.push(createDiagnosticForInvalidCustomType(opt, function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return createDiagnosticForNodeInSourceFileOrCompilerDiagnostic.apply(void 0, __spreadArray([sourceFile, valueExpression, message], args, false));
        }));
    }
}
function convertJsonOptionOfListType(option, values, basePath, errors, propertyAssignment, valueExpression, sourceFile) {
    return (0, ts_1.filter)((0, ts_1.map)(values, function (v, index) { return convertJsonOption(option.element, v, basePath, errors, propertyAssignment, valueExpression === null || valueExpression === void 0 ? void 0 : valueExpression.elements[index], sourceFile); }), function (v) { return option.listPreserveFalsyValues ? true : !!v; });
}
/**
 * Tests for a path that ends in a recursive directory wildcard.
 * Matches **, \**, **\, and \**\, but not a**b.
 *
 * NOTE: used \ in place of / above to avoid issues with multiline comments.
 *
 * Breakdown:
 *  (^|\/)      # matches either the beginning of the string or a directory separator.
 *  \*\*        # matches the recursive directory wildcard "**".
 *  \/?$        # matches an optional trailing directory separator at the end of the string.
 */
var invalidTrailingRecursionPattern = /(^|\/)\*\*\/?$/;
/**
 * Matches the portion of a wildcard path that does not contain wildcards.
 * Matches \a of \a\*, or \a\b\c of \a\b\c\?\d.
 *
 * NOTE: used \ in place of / above to avoid issues with multiline comments.
 *
 * Breakdown:
 *  ^                   # matches the beginning of the string
 *  [^*?]*              # matches any number of non-wildcard characters
 *  (?=\/[^/]*[*?])     # lookahead that matches a directory separator followed by
 *                      # a path component that contains at least one wildcard character (* or ?).
 */
var wildcardDirectoryPattern = /^[^*?]*(?=\/[^/]*[*?])/;
/**
 * Gets the file names from the provided config file specs that contain, files, include, exclude and
 * other properties needed to resolve the file names
 * @param configFileSpecs The config file specs extracted with file names to include, wildcards to include/exclude and other details
 * @param basePath The base path for any relative file specifications.
 * @param options Compiler options.
 * @param host The host used to resolve files and directories.
 * @param extraFileExtensions optionaly file extra file extension information from host
 *
 * @internal
 */
function getFileNamesFromConfigSpecs(configFileSpecs, basePath, options, host, extraFileExtensions) {
    if (extraFileExtensions === void 0) { extraFileExtensions = ts_1.emptyArray; }
    basePath = (0, ts_1.normalizePath)(basePath);
    var keyMapper = (0, ts_1.createGetCanonicalFileName)(host.useCaseSensitiveFileNames);
    // Literal file names (provided via the "files" array in tsconfig.json) are stored in a
    // file map with a possibly case insensitive key. We use this map later when when including
    // wildcard paths.
    var literalFileMap = new Map();
    // Wildcard paths (provided via the "includes" array in tsconfig.json) are stored in a
    // file map with a possibly case insensitive key. We use this map to store paths matched
    // via wildcard, and to handle extension priority.
    var wildcardFileMap = new Map();
    // Wildcard paths of json files (provided via the "includes" array in tsconfig.json) are stored in a
    // file map with a possibly case insensitive key. We use this map to store paths matched
    // via wildcard of *.json kind
    var wildCardJsonFileMap = new Map();
    var validatedFilesSpec = configFileSpecs.validatedFilesSpec, validatedIncludeSpecs = configFileSpecs.validatedIncludeSpecs, validatedExcludeSpecs = configFileSpecs.validatedExcludeSpecs;
    // Rather than re-query this for each file and filespec, we query the supported extensions
    // once and store it on the expansion context.
    var supportedExtensions = (0, ts_1.getSupportedExtensions)(options, extraFileExtensions);
    var supportedExtensionsWithJsonIfResolveJsonModule = (0, ts_1.getSupportedExtensionsWithJsonIfResolveJsonModule)(options, supportedExtensions);
    // Literal files are always included verbatim. An "include" or "exclude" specification cannot
    // remove a literal file.
    if (validatedFilesSpec) {
        for (var _i = 0, validatedFilesSpec_1 = validatedFilesSpec; _i < validatedFilesSpec_1.length; _i++) {
            var fileName = validatedFilesSpec_1[_i];
            var file = (0, ts_1.getNormalizedAbsolutePath)(fileName, basePath);
            literalFileMap.set(keyMapper(file), file);
        }
    }
    var jsonOnlyIncludeRegexes;
    if (validatedIncludeSpecs && validatedIncludeSpecs.length > 0) {
        var _loop_2 = function (file) {
            if ((0, ts_1.fileExtensionIs)(file, ".json" /* Extension.Json */)) {
                // Valid only if *.json specified
                if (!jsonOnlyIncludeRegexes) {
                    var includes = validatedIncludeSpecs.filter(function (s) { return (0, ts_1.endsWith)(s, ".json" /* Extension.Json */); });
                    var includeFilePatterns = (0, ts_1.map)((0, ts_1.getRegularExpressionsForWildcards)(includes, basePath, "files"), function (pattern) { return "^".concat(pattern, "$"); });
                    jsonOnlyIncludeRegexes = includeFilePatterns ? includeFilePatterns.map(function (pattern) { return (0, ts_1.getRegexFromPattern)(pattern, host.useCaseSensitiveFileNames); }) : ts_1.emptyArray;
                }
                var includeIndex = (0, ts_1.findIndex)(jsonOnlyIncludeRegexes, function (re) { return re.test(file); });
                if (includeIndex !== -1) {
                    var key_1 = keyMapper(file);
                    if (!literalFileMap.has(key_1) && !wildCardJsonFileMap.has(key_1)) {
                        wildCardJsonFileMap.set(key_1, file);
                    }
                }
                return "continue";
            }
            // If we have already included a literal or wildcard path with a
            // higher priority extension, we should skip this file.
            //
            // This handles cases where we may encounter both <file>.ts and
            // <file>.d.ts (or <file>.js if "allowJs" is enabled) in the same
            // directory when they are compilation outputs.
            if (hasFileWithHigherPriorityExtension(file, literalFileMap, wildcardFileMap, supportedExtensions, keyMapper)) {
                return "continue";
            }
            // We may have included a wildcard path with a lower priority
            // extension due to the user-defined order of entries in the
            // "include" array. If there is a lower priority extension in the
            // same directory, we should remove it.
            removeWildcardFilesWithLowerPriorityExtension(file, wildcardFileMap, supportedExtensions, keyMapper);
            var key = keyMapper(file);
            if (!literalFileMap.has(key) && !wildcardFileMap.has(key)) {
                wildcardFileMap.set(key, file);
            }
        };
        for (var _a = 0, _b = host.readDirectory(basePath, (0, ts_1.flatten)(supportedExtensionsWithJsonIfResolveJsonModule), validatedExcludeSpecs, validatedIncludeSpecs, /*depth*/ undefined); _a < _b.length; _a++) {
            var file = _b[_a];
            _loop_2(file);
        }
    }
    var literalFiles = (0, ts_1.arrayFrom)(literalFileMap.values());
    var wildcardFiles = (0, ts_1.arrayFrom)(wildcardFileMap.values());
    return literalFiles.concat(wildcardFiles, (0, ts_1.arrayFrom)(wildCardJsonFileMap.values()));
}
exports.getFileNamesFromConfigSpecs = getFileNamesFromConfigSpecs;
/** @internal */
function isExcludedFile(pathToCheck, spec, basePath, useCaseSensitiveFileNames, currentDirectory) {
    var validatedFilesSpec = spec.validatedFilesSpec, validatedIncludeSpecs = spec.validatedIncludeSpecs, validatedExcludeSpecs = spec.validatedExcludeSpecs;
    if (!(0, ts_1.length)(validatedIncludeSpecs) || !(0, ts_1.length)(validatedExcludeSpecs))
        return false;
    basePath = (0, ts_1.normalizePath)(basePath);
    var keyMapper = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    if (validatedFilesSpec) {
        for (var _i = 0, validatedFilesSpec_2 = validatedFilesSpec; _i < validatedFilesSpec_2.length; _i++) {
            var fileName = validatedFilesSpec_2[_i];
            if (keyMapper((0, ts_1.getNormalizedAbsolutePath)(fileName, basePath)) === pathToCheck)
                return false;
        }
    }
    return matchesExcludeWorker(pathToCheck, validatedExcludeSpecs, useCaseSensitiveFileNames, currentDirectory, basePath);
}
exports.isExcludedFile = isExcludedFile;
function invalidDotDotAfterRecursiveWildcard(s) {
    // We used to use the regex /(^|\/)\*\*\/(.*\/)?\.\.($|\/)/ to check for this case, but
    // in v8, that has polynomial performance because the recursive wildcard match - **/ -
    // can be matched in many arbitrary positions when multiple are present, resulting
    // in bad backtracking (and we don't care which is matched - just that some /.. segment
    // comes after some **/ segment).
    var wildcardIndex = (0, ts_1.startsWith)(s, "**/") ? 0 : s.indexOf("/**/");
    if (wildcardIndex === -1) {
        return false;
    }
    var lastDotIndex = (0, ts_1.endsWith)(s, "/..") ? s.length : s.lastIndexOf("/../");
    return lastDotIndex > wildcardIndex;
}
/** @internal */
function matchesExclude(pathToCheck, excludeSpecs, useCaseSensitiveFileNames, currentDirectory) {
    return matchesExcludeWorker(pathToCheck, (0, ts_1.filter)(excludeSpecs, function (spec) { return !invalidDotDotAfterRecursiveWildcard(spec); }), useCaseSensitiveFileNames, currentDirectory);
}
exports.matchesExclude = matchesExclude;
function matchesExcludeWorker(pathToCheck, excludeSpecs, useCaseSensitiveFileNames, currentDirectory, basePath) {
    var excludePattern = (0, ts_1.getRegularExpressionForWildcard)(excludeSpecs, (0, ts_1.combinePaths)((0, ts_1.normalizePath)(currentDirectory), basePath), "exclude");
    var excludeRegex = excludePattern && (0, ts_1.getRegexFromPattern)(excludePattern, useCaseSensitiveFileNames);
    if (!excludeRegex)
        return false;
    if (excludeRegex.test(pathToCheck))
        return true;
    return !(0, ts_1.hasExtension)(pathToCheck) && excludeRegex.test((0, ts_1.ensureTrailingDirectorySeparator)(pathToCheck));
}
function validateSpecs(specs, errors, disallowTrailingRecursion, jsonSourceFile, specKey) {
    return specs.filter(function (spec) {
        if (!(0, ts_1.isString)(spec))
            return false;
        var diag = specToDiagnostic(spec, disallowTrailingRecursion);
        if (diag !== undefined) {
            errors.push(createDiagnostic.apply(void 0, diag));
        }
        return diag === undefined;
    });
    function createDiagnostic(message, spec) {
        var element = (0, ts_1.getTsConfigPropArrayElementValue)(jsonSourceFile, specKey, spec);
        return createDiagnosticForNodeInSourceFileOrCompilerDiagnostic(jsonSourceFile, element, message, spec);
    }
}
function specToDiagnostic(spec, disallowTrailingRecursion) {
    ts_1.Debug.assert(typeof spec === "string");
    if (disallowTrailingRecursion && invalidTrailingRecursionPattern.test(spec)) {
        return [ts_1.Diagnostics.File_specification_cannot_end_in_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0, spec];
    }
    else if (invalidDotDotAfterRecursiveWildcard(spec)) {
        return [ts_1.Diagnostics.File_specification_cannot_contain_a_parent_directory_that_appears_after_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0, spec];
    }
}
/**
 * Gets directories in a set of include patterns that should be watched for changes.
 */
function getWildcardDirectories(_a, path, useCaseSensitiveFileNames) {
    var include = _a.validatedIncludeSpecs, exclude = _a.validatedExcludeSpecs;
    // We watch a directory recursively if it contains a wildcard anywhere in a directory segment
    // of the pattern:
    //
    //  /a/b/**/d   - Watch /a/b recursively to catch changes to any d in any subfolder recursively
    //  /a/b/*/d    - Watch /a/b recursively to catch any d in any immediate subfolder, even if a new subfolder is added
    //  /a/b        - Watch /a/b recursively to catch changes to anything in any recursive subfoler
    //
    // We watch a directory without recursion if it contains a wildcard in the file segment of
    // the pattern:
    //
    //  /a/b/*      - Watch /a/b directly to catch any new file
    //  /a/b/a?z    - Watch /a/b directly to catch any new file matching a?z
    var rawExcludeRegex = (0, ts_1.getRegularExpressionForWildcard)(exclude, path, "exclude");
    var excludeRegex = rawExcludeRegex && new RegExp(rawExcludeRegex, useCaseSensitiveFileNames ? "" : "i");
    var wildcardDirectories = {};
    if (include !== undefined) {
        var recursiveKeys = [];
        for (var _i = 0, include_1 = include; _i < include_1.length; _i++) {
            var file = include_1[_i];
            var spec = (0, ts_1.normalizePath)((0, ts_1.combinePaths)(path, file));
            if (excludeRegex && excludeRegex.test(spec)) {
                continue;
            }
            var match = getWildcardDirectoryFromSpec(spec, useCaseSensitiveFileNames);
            if (match) {
                var key = match.key, flags = match.flags;
                var existingFlags = wildcardDirectories[key];
                if (existingFlags === undefined || existingFlags < flags) {
                    wildcardDirectories[key] = flags;
                    if (flags === 1 /* WatchDirectoryFlags.Recursive */) {
                        recursiveKeys.push(key);
                    }
                }
            }
        }
        // Remove any subpaths under an existing recursively watched directory.
        for (var key in wildcardDirectories) {
            if ((0, ts_1.hasProperty)(wildcardDirectories, key)) {
                for (var _b = 0, recursiveKeys_1 = recursiveKeys; _b < recursiveKeys_1.length; _b++) {
                    var recursiveKey = recursiveKeys_1[_b];
                    if (key !== recursiveKey && (0, ts_1.containsPath)(recursiveKey, key, path, !useCaseSensitiveFileNames)) {
                        delete wildcardDirectories[key];
                    }
                }
            }
        }
    }
    return wildcardDirectories;
}
function getWildcardDirectoryFromSpec(spec, useCaseSensitiveFileNames) {
    var match = wildcardDirectoryPattern.exec(spec);
    if (match) {
        // We check this with a few `indexOf` calls because 3 `indexOf`/`lastIndexOf` calls is
        // less algorithmically complex (roughly O(3n) worst-case) than the regex we used to use,
        // \/[^/]*?[*?][^/]*\/ which was polynominal in v8, since arbitrary sequences of wildcard
        // characters could match any of the central patterns, resulting in bad backtracking.
        var questionWildcardIndex = spec.indexOf("?");
        var starWildcardIndex = spec.indexOf("*");
        var lastDirectorySeperatorIndex = spec.lastIndexOf(ts_1.directorySeparator);
        return {
            key: useCaseSensitiveFileNames ? match[0] : (0, ts_1.toFileNameLowerCase)(match[0]),
            flags: (questionWildcardIndex !== -1 && questionWildcardIndex < lastDirectorySeperatorIndex)
                || (starWildcardIndex !== -1 && starWildcardIndex < lastDirectorySeperatorIndex)
                ? 1 /* WatchDirectoryFlags.Recursive */ : 0 /* WatchDirectoryFlags.None */
        };
    }
    if ((0, ts_1.isImplicitGlob)(spec.substring(spec.lastIndexOf(ts_1.directorySeparator) + 1))) {
        return {
            key: (0, ts_1.removeTrailingDirectorySeparator)(useCaseSensitiveFileNames ? spec : (0, ts_1.toFileNameLowerCase)(spec)),
            flags: 1 /* WatchDirectoryFlags.Recursive */
        };
    }
    return undefined;
}
/**
 * Determines whether a literal or wildcard file has already been included that has a higher
 * extension priority.
 *
 * @param file The path to the file.
 */
function hasFileWithHigherPriorityExtension(file, literalFiles, wildcardFiles, extensions, keyMapper) {
    var extensionGroup = (0, ts_1.forEach)(extensions, function (group) { return (0, ts_1.fileExtensionIsOneOf)(file, group) ? group : undefined; });
    if (!extensionGroup) {
        return false;
    }
    for (var _i = 0, extensionGroup_1 = extensionGroup; _i < extensionGroup_1.length; _i++) {
        var ext = extensionGroup_1[_i];
        if ((0, ts_1.fileExtensionIs)(file, ext)) {
            return false;
        }
        var higherPriorityPath = keyMapper((0, ts_1.changeExtension)(file, ext));
        if (literalFiles.has(higherPriorityPath) || wildcardFiles.has(higherPriorityPath)) {
            if (ext === ".d.ts" /* Extension.Dts */ && ((0, ts_1.fileExtensionIs)(file, ".js" /* Extension.Js */) || (0, ts_1.fileExtensionIs)(file, ".jsx" /* Extension.Jsx */))) {
                // LEGACY BEHAVIOR: An off-by-one bug somewhere in the extension priority system for wildcard module loading allowed declaration
                // files to be loaded alongside their js(x) counterparts. We regard this as generally undesirable, but retain the behavior to
                // prevent breakage.
                continue;
            }
            return true;
        }
    }
    return false;
}
/**
 * Removes files included via wildcard expansion with a lower extension priority that have
 * already been included.
 *
 * @param file The path to the file.
 */
function removeWildcardFilesWithLowerPriorityExtension(file, wildcardFiles, extensions, keyMapper) {
    var extensionGroup = (0, ts_1.forEach)(extensions, function (group) { return (0, ts_1.fileExtensionIsOneOf)(file, group) ? group : undefined; });
    if (!extensionGroup) {
        return;
    }
    for (var i = extensionGroup.length - 1; i >= 0; i--) {
        var ext = extensionGroup[i];
        if ((0, ts_1.fileExtensionIs)(file, ext)) {
            return;
        }
        var lowerPriorityPath = keyMapper((0, ts_1.changeExtension)(file, ext));
        wildcardFiles.delete(lowerPriorityPath);
    }
}
/**
 * Produces a cleaned version of compiler options with personally identifying info (aka, paths) removed.
 * Also converts enum values back to strings.
 *
 * @internal
 */
function convertCompilerOptionsForTelemetry(opts) {
    var out = {};
    for (var key in opts) {
        if ((0, ts_1.hasProperty)(opts, key)) {
            var type = getOptionFromName(key);
            if (type !== undefined) { // Ignore unknown options
                out[key] = getOptionValueWithEmptyStrings(opts[key], type);
            }
        }
    }
    return out;
}
exports.convertCompilerOptionsForTelemetry = convertCompilerOptionsForTelemetry;
function getOptionValueWithEmptyStrings(value, option) {
    if (value === undefined)
        return value;
    switch (option.type) {
        case "object": // "paths". Can't get any useful information from the value since we blank out strings, so just return "".
            return "";
        case "string": // Could be any arbitrary string -- use empty string instead.
            return "";
        case "number": // Allow numbers, but be sure to check it's actually a number.
            return typeof value === "number" ? value : "";
        case "boolean":
            return typeof value === "boolean" ? value : "";
        case "listOrElement":
            if (!(0, ts_1.isArray)(value))
                return getOptionValueWithEmptyStrings(value, option.element);
        // fall through to list
        case "list":
            var elementType_1 = option.element;
            return (0, ts_1.isArray)(value) ? (0, ts_1.mapDefined)(value, function (v) { return getOptionValueWithEmptyStrings(v, elementType_1); }) : "";
        default:
            return (0, ts_1.forEachEntry)(option.type, function (optionEnumValue, optionStringValue) {
                if (optionEnumValue === value) {
                    return optionStringValue;
                }
            });
    }
}
function getDefaultValueForOption(option) {
    switch (option.type) {
        case "number":
            return 1;
        case "boolean":
            return true;
        case "string":
            var defaultValue = option.defaultValueDescription;
            return option.isFilePath ? "./".concat(defaultValue && typeof defaultValue === "string" ? defaultValue : "") : "";
        case "list":
            return [];
        case "listOrElement":
            return getDefaultValueForOption(option.element);
        case "object":
            return {};
        default:
            var value = (0, ts_1.firstOrUndefinedIterator)(option.type.keys());
            if (value !== undefined)
                return value;
            return ts_1.Debug.fail("Expected 'option.type' to have entries.");
    }
}
