"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSystemModule = void 0;
var ts_1 = require("../../_namespaces/ts");
/** @internal */
function transformSystemModule(context) {
    var factory = context.factory, startLexicalEnvironment = context.startLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var compilerOptions = context.getCompilerOptions();
    var resolver = context.getEmitResolver();
    var host = context.getEmitHost();
    var previousOnSubstituteNode = context.onSubstituteNode;
    var previousOnEmitNode = context.onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    context.onEmitNode = onEmitNode;
    context.enableSubstitution(80 /* SyntaxKind.Identifier */); // Substitutes expression identifiers for imported symbols.
    context.enableSubstitution(303 /* SyntaxKind.ShorthandPropertyAssignment */); // Substitutes expression identifiers for imported symbols
    context.enableSubstitution(225 /* SyntaxKind.BinaryExpression */); // Substitutes assignments to exported symbols.
    context.enableSubstitution(235 /* SyntaxKind.MetaProperty */); // Substitutes 'import.meta'
    context.enableEmitNotification(311 /* SyntaxKind.SourceFile */); // Restore state when substituting nodes in a file.
    var moduleInfoMap = []; // The ExternalModuleInfo for each file.
    var exportFunctionsMap = []; // The export function associated with a source file.
    var noSubstitutionMap = []; // Set of nodes for which substitution rules should be ignored for each file.
    var contextObjectMap = []; // The context object associated with a source file.
    var currentSourceFile; // The current file.
    var moduleInfo; // ExternalModuleInfo for the current file.
    var exportFunction; // The export function for the current file.
    var contextObject; // The context object for the current file.
    var hoistedStatements;
    var enclosingBlockScopedContainer;
    var noSubstitution; // Set of nodes for which substitution rules should be ignored.
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    /**
     * Transforms the module aspects of a SourceFile.
     *
     * @param node The SourceFile node.
     */
    function transformSourceFile(node) {
        if (node.isDeclarationFile || !((0, ts_1.isEffectiveExternalModule)(node, compilerOptions) || node.transformFlags & 8388608 /* TransformFlags.ContainsDynamicImport */)) {
            return node;
        }
        var id = (0, ts_1.getOriginalNodeId)(node);
        currentSourceFile = node;
        enclosingBlockScopedContainer = node;
        // System modules have the following shape:
        //
        //     System.register(['dep-1', ... 'dep-n'], function(exports) {/* module body function */})
        //
        // The parameter 'exports' here is a callback '<T>(name: string, value: T) => T' that
        // is used to publish exported values. 'exports' returns its 'value' argument so in
        // most cases expressions that mutate exported values can be rewritten as:
        //
        //     expr -> exports('name', expr)
        //
        // The only exception in this rule is postfix unary operators,
        // see comment to 'substitutePostfixUnaryExpression' for more details
        // Collect information about the external module and dependency groups.
        moduleInfo = moduleInfoMap[id] = (0, ts_1.collectExternalModuleInfo)(context, node, resolver, compilerOptions);
        // Make sure that the name of the 'exports' function does not conflict with
        // existing identifiers.
        exportFunction = factory.createUniqueName("exports");
        exportFunctionsMap[id] = exportFunction;
        contextObject = contextObjectMap[id] = factory.createUniqueName("context");
        // Add the body of the module.
        var dependencyGroups = collectDependencyGroups(moduleInfo.externalImports);
        var moduleBodyBlock = createSystemModuleBody(node, dependencyGroups);
        var moduleBodyFunction = factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, [
            factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, exportFunction),
            factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, contextObject)
        ], 
        /*type*/ undefined, moduleBodyBlock);
        // Write the call to `System.register`
        // Clear the emit-helpers flag for later passes since we'll have already used it in the module body
        // So the helper will be emit at the correct position instead of at the top of the source-file
        var moduleName = (0, ts_1.tryGetModuleNameFromFile)(factory, node, host, compilerOptions);
        var dependencies = factory.createArrayLiteralExpression((0, ts_1.map)(dependencyGroups, function (dependencyGroup) { return dependencyGroup.name; }));
        var updated = (0, ts_1.setEmitFlags)(factory.updateSourceFile(node, (0, ts_1.setTextRange)(factory.createNodeArray([
            factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("System"), "register"), 
            /*typeArguments*/ undefined, moduleName
                ? [moduleName, dependencies, moduleBodyFunction]
                : [dependencies, moduleBodyFunction]))
        ]), node.statements)), 2048 /* EmitFlags.NoTrailingComments */);
        if (!(0, ts_1.outFile)(compilerOptions)) {
            (0, ts_1.moveEmitHelpers)(updated, moduleBodyBlock, function (helper) { return !helper.scoped; });
        }
        if (noSubstitution) {
            noSubstitutionMap[id] = noSubstitution;
            noSubstitution = undefined;
        }
        currentSourceFile = undefined;
        moduleInfo = undefined;
        exportFunction = undefined;
        contextObject = undefined;
        hoistedStatements = undefined;
        enclosingBlockScopedContainer = undefined;
        return updated;
    }
    /**
     * Collects the dependency groups for this files imports.
     *
     * @param externalImports The imports for the file.
     */
    function collectDependencyGroups(externalImports) {
        var groupIndices = new Map();
        var dependencyGroups = [];
        for (var _i = 0, externalImports_1 = externalImports; _i < externalImports_1.length; _i++) {
            var externalImport = externalImports_1[_i];
            var externalModuleName = (0, ts_1.getExternalModuleNameLiteral)(factory, externalImport, currentSourceFile, host, resolver, compilerOptions);
            if (externalModuleName) {
                var text = externalModuleName.text;
                var groupIndex = groupIndices.get(text);
                if (groupIndex !== undefined) {
                    // deduplicate/group entries in dependency list by the dependency name
                    dependencyGroups[groupIndex].externalImports.push(externalImport);
                }
                else {
                    groupIndices.set(text, dependencyGroups.length);
                    dependencyGroups.push({
                        name: externalModuleName,
                        externalImports: [externalImport]
                    });
                }
            }
        }
        return dependencyGroups;
    }
    /**
     * Adds the statements for the module body function for the source file.
     *
     * @param node The source file for the module.
     * @param dependencyGroups The grouped dependencies of the module.
     */
    function createSystemModuleBody(node, dependencyGroups) {
        // Shape of the body in system modules:
        //
        //  function (exports) {
        //      <list of local aliases for imports>
        //      <hoisted variable declarations>
        //      <hoisted function declarations>
        //      return {
        //          setters: [
        //              <list of setter function for imports>
        //          ],
        //          execute: function() {
        //              <module statements>
        //          }
        //      }
        //      <temp declarations>
        //  }
        //
        // i.e:
        //
        //   import {x} from 'file1'
        //   var y = 1;
        //   export function foo() { return y + x(); }
        //   console.log(y);
        //
        // Will be transformed to:
        //
        //  function(exports) {
        //      function foo() { return y + file_1.x(); }
        //      exports("foo", foo);
        //      var file_1, y;
        //      return {
        //          setters: [
        //              function(v) { file_1 = v }
        //          ],
        //          execute(): function() {
        //              y = 1;
        //              console.log(y);
        //          }
        //      };
        //  }
        var statements = [];
        // We start a new lexical environment in this function body, but *not* in the
        // body of the execute function. This allows us to emit temporary declarations
        // only in the outer module body and not in the inner one.
        startLexicalEnvironment();
        // Add any prologue directives.
        var ensureUseStrict = (0, ts_1.getStrictOptionValue)(compilerOptions, "alwaysStrict") || (!compilerOptions.noImplicitUseStrict && (0, ts_1.isExternalModule)(currentSourceFile));
        var statementOffset = factory.copyPrologue(node.statements, statements, ensureUseStrict, topLevelVisitor);
        // var __moduleName = context_1 && context_1.id;
        statements.push(factory.createVariableStatement(
        /*modifiers*/ undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration("__moduleName", 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, factory.createLogicalAnd(contextObject, factory.createPropertyAccessExpression(contextObject, "id")))
        ])));
        // Visit the synthetic external helpers import declaration if present
        (0, ts_1.visitNode)(moduleInfo.externalHelpersImportDeclaration, topLevelVisitor, ts_1.isStatement);
        // Visit the statements of the source file, emitting any transformations into
        // the `executeStatements` array. We do this *before* we fill the `setters` array
        // as we both emit transformations as well as aggregate some data used when creating
        // setters. This allows us to reduce the number of times we need to loop through the
        // statements of the source file.
        var executeStatements = (0, ts_1.visitNodes)(node.statements, topLevelVisitor, ts_1.isStatement, statementOffset);
        // Emit early exports for function declarations.
        (0, ts_1.addRange)(statements, hoistedStatements);
        // We emit hoisted variables early to align roughly with our previous emit output.
        // Two key differences in this approach are:
        // - Temporary variables will appear at the top rather than at the bottom of the file
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        var exportStarFunction = addExportStarIfNeeded(statements); // TODO: GH#18217
        var modifiers = node.transformFlags & 2097152 /* TransformFlags.ContainsAwait */ ?
            factory.createModifiersFromModifierFlags(512 /* ModifierFlags.Async */) :
            undefined;
        var moduleObject = factory.createObjectLiteralExpression([
            factory.createPropertyAssignment("setters", createSettersArray(exportStarFunction, dependencyGroups)),
            factory.createPropertyAssignment("execute", factory.createFunctionExpression(modifiers, 
            /*asteriskToken*/ undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, 
            /*parameters*/ [], 
            /*type*/ undefined, factory.createBlock(executeStatements, /*multiLine*/ true)))
        ], /*multiLine*/ true);
        statements.push(factory.createReturnStatement(moduleObject));
        return factory.createBlock(statements, /*multiLine*/ true);
    }
    /**
     * Adds an exportStar function to a statement list if it is needed for the file.
     *
     * @param statements A statement list.
     */
    function addExportStarIfNeeded(statements) {
        if (!moduleInfo.hasExportStarsToExportValues) {
            return;
        }
        // when resolving exports local exported entries/indirect exported entries in the module
        // should always win over entries with similar names that were added via star exports
        // to support this we store names of local/indirect exported entries in a set.
        // this set is used to filter names brought by star expors.
        // local names set should only be added if we have anything exported
        if (!moduleInfo.exportedNames && moduleInfo.exportSpecifiers.size === 0) {
            // no exported declarations (export var ...) or export specifiers (export {x})
            // check if we have any non star export declarations.
            var hasExportDeclarationWithExportClause = false;
            for (var _i = 0, _a = moduleInfo.externalImports; _i < _a.length; _i++) {
                var externalImport = _a[_i];
                if (externalImport.kind === 277 /* SyntaxKind.ExportDeclaration */ && externalImport.exportClause) {
                    hasExportDeclarationWithExportClause = true;
                    break;
                }
            }
            if (!hasExportDeclarationWithExportClause) {
                // we still need to emit exportStar helper
                var exportStarFunction_1 = createExportStarFunction(/*localNames*/ undefined);
                statements.push(exportStarFunction_1);
                return exportStarFunction_1.name;
            }
        }
        var exportedNames = [];
        if (moduleInfo.exportedNames) {
            for (var _b = 0, _c = moduleInfo.exportedNames; _b < _c.length; _b++) {
                var exportedLocalName = _c[_b];
                if (exportedLocalName.escapedText === "default") {
                    continue;
                }
                // write name of exported declaration, i.e 'export var x...'
                exportedNames.push(factory.createPropertyAssignment(factory.createStringLiteralFromNode(exportedLocalName), factory.createTrue()));
            }
        }
        var exportedNamesStorageRef = factory.createUniqueName("exportedNames");
        statements.push(factory.createVariableStatement(
        /*modifiers*/ undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration(exportedNamesStorageRef, 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, factory.createObjectLiteralExpression(exportedNames, /*multiLine*/ true))
        ])));
        var exportStarFunction = createExportStarFunction(exportedNamesStorageRef);
        statements.push(exportStarFunction);
        return exportStarFunction.name;
    }
    /**
     * Creates an exportStar function for the file, with an optional set of excluded local
     * names.
     *
     * @param localNames An optional reference to an object containing a set of excluded local
     * names.
     */
    function createExportStarFunction(localNames) {
        var exportStarFunction = factory.createUniqueName("exportStar");
        var m = factory.createIdentifier("m");
        var n = factory.createIdentifier("n");
        var exports = factory.createIdentifier("exports");
        var condition = factory.createStrictInequality(n, factory.createStringLiteral("default"));
        if (localNames) {
            condition = factory.createLogicalAnd(condition, factory.createLogicalNot(factory.createCallExpression(factory.createPropertyAccessExpression(localNames, "hasOwnProperty"), 
            /*typeArguments*/ undefined, [n])));
        }
        return factory.createFunctionDeclaration(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, exportStarFunction, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, m)], 
        /*type*/ undefined, factory.createBlock([
            factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList([
                factory.createVariableDeclaration(exports, 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, factory.createObjectLiteralExpression([]))
            ])),
            factory.createForInStatement(factory.createVariableDeclarationList([
                factory.createVariableDeclaration(n)
            ]), m, factory.createBlock([
                (0, ts_1.setEmitFlags)(factory.createIfStatement(condition, factory.createExpressionStatement(factory.createAssignment(factory.createElementAccessExpression(exports, n), factory.createElementAccessExpression(m, n)))), 1 /* EmitFlags.SingleLine */)
            ])),
            factory.createExpressionStatement(factory.createCallExpression(exportFunction, 
            /*typeArguments*/ undefined, [exports]))
        ], /*multiLine*/ true));
    }
    /**
     * Creates an array setter callbacks for each dependency group.
     *
     * @param exportStarFunction A reference to an exportStarFunction for the file.
     * @param dependencyGroups An array of grouped dependencies.
     */
    function createSettersArray(exportStarFunction, dependencyGroups) {
        var setters = [];
        for (var _i = 0, dependencyGroups_1 = dependencyGroups; _i < dependencyGroups_1.length; _i++) {
            var group = dependencyGroups_1[_i];
            // derive a unique name for parameter from the first named entry in the group
            var localName = (0, ts_1.forEach)(group.externalImports, function (i) { return (0, ts_1.getLocalNameForExternalImport)(factory, i, currentSourceFile); });
            var parameterName = localName ? factory.getGeneratedNameForNode(localName) : factory.createUniqueName("");
            var statements = [];
            for (var _a = 0, _b = group.externalImports; _a < _b.length; _a++) {
                var entry = _b[_a];
                var importVariableName = (0, ts_1.getLocalNameForExternalImport)(factory, entry, currentSourceFile); // TODO: GH#18217
                switch (entry.kind) {
                    case 271 /* SyntaxKind.ImportDeclaration */:
                        if (!entry.importClause) {
                            // 'import "..."' case
                            // module is imported only for side-effects, no emit required
                            break;
                        }
                    // falls through
                    case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                        ts_1.Debug.assert(importVariableName !== undefined);
                        // save import into the local
                        statements.push(factory.createExpressionStatement(factory.createAssignment(importVariableName, parameterName)));
                        if ((0, ts_1.hasSyntacticModifier)(entry, 1 /* ModifierFlags.Export */)) {
                            statements.push(factory.createExpressionStatement(factory.createCallExpression(exportFunction, 
                            /*typeArguments*/ undefined, [
                                factory.createStringLiteral((0, ts_1.idText)(importVariableName)),
                                parameterName,
                            ])));
                        }
                        break;
                    case 277 /* SyntaxKind.ExportDeclaration */:
                        ts_1.Debug.assert(importVariableName !== undefined);
                        if (entry.exportClause) {
                            if ((0, ts_1.isNamedExports)(entry.exportClause)) {
                                //  export {a, b as c} from 'foo'
                                //
                                // emit as:
                                //
                                //  exports_({
                                //     "a": _["a"],
                                //     "c": _["b"]
                                //  });
                                var properties = [];
                                for (var _c = 0, _d = entry.exportClause.elements; _c < _d.length; _c++) {
                                    var e = _d[_c];
                                    properties.push(factory.createPropertyAssignment(factory.createStringLiteral((0, ts_1.idText)(e.name)), factory.createElementAccessExpression(parameterName, factory.createStringLiteral((0, ts_1.idText)(e.propertyName || e.name)))));
                                }
                                statements.push(factory.createExpressionStatement(factory.createCallExpression(exportFunction, 
                                /*typeArguments*/ undefined, [factory.createObjectLiteralExpression(properties, /*multiLine*/ true)])));
                            }
                            else {
                                statements.push(factory.createExpressionStatement(factory.createCallExpression(exportFunction, 
                                /*typeArguments*/ undefined, [
                                    factory.createStringLiteral((0, ts_1.idText)(entry.exportClause.name)),
                                    parameterName
                                ])));
                            }
                        }
                        else {
                            //  export * from 'foo'
                            //
                            // emit as:
                            //
                            //  exportStar(foo_1_1);
                            statements.push(factory.createExpressionStatement(factory.createCallExpression(exportStarFunction, 
                            /*typeArguments*/ undefined, [parameterName])));
                        }
                        break;
                }
            }
            setters.push(factory.createFunctionExpression(
            /*modifiers*/ undefined, 
            /*asteriskToken*/ undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, parameterName)], 
            /*type*/ undefined, factory.createBlock(statements, /*multiLine*/ true)));
        }
        return factory.createArrayLiteralExpression(setters, /*multiLine*/ true);
    }
    //
    // Top-level Source Element Visitors
    //
    /**
     * Visit source elements at the top-level of a module.
     *
     * @param node The node to visit.
     */
    function topLevelVisitor(node) {
        switch (node.kind) {
            case 271 /* SyntaxKind.ImportDeclaration */:
                return visitImportDeclaration(node);
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                return visitImportEqualsDeclaration(node);
            case 277 /* SyntaxKind.ExportDeclaration */:
                return visitExportDeclaration(node);
            case 276 /* SyntaxKind.ExportAssignment */:
                return visitExportAssignment(node);
            default:
                return topLevelNestedVisitor(node);
        }
    }
    /**
     * Visits an ImportDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitImportDeclaration(node) {
        var statements;
        if (node.importClause) {
            hoistVariableDeclaration((0, ts_1.getLocalNameForExternalImport)(factory, node, currentSourceFile)); // TODO: GH#18217
        }
        return (0, ts_1.singleOrMany)(appendExportsOfImportDeclaration(statements, node));
    }
    function visitExportDeclaration(node) {
        ts_1.Debug.assertIsDefined(node);
        return undefined;
    }
    /**
     * Visits an ImportEqualsDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitImportEqualsDeclaration(node) {
        ts_1.Debug.assert((0, ts_1.isExternalModuleImportEqualsDeclaration)(node), "import= for internal module references should be handled in an earlier transformer.");
        var statements;
        hoistVariableDeclaration((0, ts_1.getLocalNameForExternalImport)(factory, node, currentSourceFile)); // TODO: GH#18217
        return (0, ts_1.singleOrMany)(appendExportsOfImportEqualsDeclaration(statements, node));
    }
    /**
     * Visits an ExportAssignment node.
     *
     * @param node The node to visit.
     */
    function visitExportAssignment(node) {
        if (node.isExportEquals) {
            // Elide `export=` as it is illegal in a SystemJS module.
            return undefined;
        }
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        return createExportStatement(factory.createIdentifier("default"), expression, /*allowComments*/ true);
    }
    /**
     * Visits a FunctionDeclaration, hoisting it to the outer module body function.
     *
     * @param node The node to visit.
     */
    function visitFunctionDeclaration(node) {
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            hoistedStatements = (0, ts_1.append)(hoistedStatements, factory.updateFunctionDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifierLike), node.asteriskToken, factory.getDeclarationName(node, /*allowComments*/ true, /*allowSourceMaps*/ true), 
            /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), 
            /*type*/ undefined, (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock)));
        }
        else {
            hoistedStatements = (0, ts_1.append)(hoistedStatements, (0, ts_1.visitEachChild)(node, visitor, context));
        }
        hoistedStatements = appendExportsOfHoistedDeclaration(hoistedStatements, node);
        return undefined;
    }
    /**
     * Visits a ClassDeclaration, hoisting its name to the outer module body function.
     *
     * @param node The node to visit.
     */
    function visitClassDeclaration(node) {
        var statements;
        // Hoist the name of the class declaration to the outer module body function.
        var name = factory.getLocalName(node);
        hoistVariableDeclaration(name);
        // Rewrite the class declaration into an assignment of a class expression.
        statements = (0, ts_1.append)(statements, (0, ts_1.setTextRange)(factory.createExpressionStatement(factory.createAssignment(name, (0, ts_1.setTextRange)(factory.createClassExpression((0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifierLike), node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause), (0, ts_1.visitNodes)(node.members, visitor, ts_1.isClassElement)), node))), node));
        statements = appendExportsOfHoistedDeclaration(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Visits a variable statement, hoisting declared names to the top-level module body.
     * Each declaration is rewritten into an assignment expression.
     *
     * @param node The node to visit.
     */
    function visitVariableStatement(node) {
        if (!shouldHoistVariableDeclarationList(node.declarationList)) {
            return (0, ts_1.visitNode)(node, visitor, ts_1.isStatement);
        }
        var expressions;
        var isExportedDeclaration = (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */);
        for (var _i = 0, _a = node.declarationList.declarations; _i < _a.length; _i++) {
            var variable = _a[_i];
            if (variable.initializer) {
                expressions = (0, ts_1.append)(expressions, transformInitializedVariable(variable, isExportedDeclaration));
            }
            else {
                hoistBindingElement(variable);
            }
        }
        var statements;
        if (expressions) {
            statements = (0, ts_1.append)(statements, (0, ts_1.setTextRange)(factory.createExpressionStatement(factory.inlineExpressions(expressions)), node));
        }
        statements = appendExportsOfVariableStatement(statements, node, /*exportSelf*/ false);
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Hoists the declared names of a VariableDeclaration or BindingElement.
     *
     * @param node The declaration to hoist.
     */
    function hoistBindingElement(node) {
        if ((0, ts_1.isBindingPattern)(node.name)) {
            for (var _i = 0, _a = node.name.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                if (!(0, ts_1.isOmittedExpression)(element)) {
                    hoistBindingElement(element);
                }
            }
        }
        else {
            hoistVariableDeclaration(factory.cloneNode(node.name));
        }
    }
    /**
     * Determines whether a VariableDeclarationList should be hoisted.
     *
     * @param node The node to test.
     */
    function shouldHoistVariableDeclarationList(node) {
        // hoist only non-block scoped declarations or block scoped declarations parented by source file
        return ((0, ts_1.getEmitFlags)(node) & 4194304 /* EmitFlags.NoHoisting */) === 0
            && (enclosingBlockScopedContainer.kind === 311 /* SyntaxKind.SourceFile */
                || ((0, ts_1.getOriginalNode)(node).flags & 3 /* NodeFlags.BlockScoped */) === 0);
    }
    /**
     * Transform an initialized variable declaration into an expression.
     *
     * @param node The node to transform.
     * @param isExportedDeclaration A value indicating whether the variable is exported.
     */
    function transformInitializedVariable(node, isExportedDeclaration) {
        var createAssignment = isExportedDeclaration ? createExportedVariableAssignment : createNonExportedVariableAssignment;
        return (0, ts_1.isBindingPattern)(node.name)
            ? (0, ts_1.flattenDestructuringAssignment)(node, visitor, context, 0 /* FlattenLevel.All */, 
            /*needsValue*/ false, createAssignment)
            : node.initializer ? createAssignment(node.name, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression)) : node.name;
    }
    /**
     * Creates an assignment expression for an exported variable declaration.
     *
     * @param name The name of the variable.
     * @param value The value of the variable's initializer.
     * @param location The source map location for the assignment.
     */
    function createExportedVariableAssignment(name, value, location) {
        return createVariableAssignment(name, value, location, /*isExportedDeclaration*/ true);
    }
    /**
     * Creates an assignment expression for a non-exported variable declaration.
     *
     * @param name The name of the variable.
     * @param value The value of the variable's initializer.
     * @param location The source map location for the assignment.
     */
    function createNonExportedVariableAssignment(name, value, location) {
        return createVariableAssignment(name, value, location, /*isExportedDeclaration*/ false);
    }
    /**
     * Creates an assignment expression for a variable declaration.
     *
     * @param name The name of the variable.
     * @param value The value of the variable's initializer.
     * @param location The source map location for the assignment.
     * @param isExportedDeclaration A value indicating whether the variable is exported.
     */
    function createVariableAssignment(name, value, location, isExportedDeclaration) {
        hoistVariableDeclaration(factory.cloneNode(name));
        return isExportedDeclaration
            ? createExportExpression(name, preventSubstitution((0, ts_1.setTextRange)(factory.createAssignment(name, value), location)))
            : preventSubstitution((0, ts_1.setTextRange)(factory.createAssignment(name, value), location));
    }
    /**
     * Appends the exports of an ImportDeclaration to a statement list, returning the
     * statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfImportDeclaration(statements, decl) {
        if (moduleInfo.exportEquals) {
            return statements;
        }
        var importClause = decl.importClause;
        if (!importClause) {
            return statements;
        }
        if (importClause.name) {
            statements = appendExportsOfDeclaration(statements, importClause);
        }
        var namedBindings = importClause.namedBindings;
        if (namedBindings) {
            switch (namedBindings.kind) {
                case 273 /* SyntaxKind.NamespaceImport */:
                    statements = appendExportsOfDeclaration(statements, namedBindings);
                    break;
                case 274 /* SyntaxKind.NamedImports */:
                    for (var _i = 0, _a = namedBindings.elements; _i < _a.length; _i++) {
                        var importBinding = _a[_i];
                        statements = appendExportsOfDeclaration(statements, importBinding);
                    }
                    break;
            }
        }
        return statements;
    }
    /**
     * Appends the export of an ImportEqualsDeclaration to a statement list, returning the
     * statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfImportEqualsDeclaration(statements, decl) {
        if (moduleInfo.exportEquals) {
            return statements;
        }
        return appendExportsOfDeclaration(statements, decl);
    }
    /**
     * Appends the exports of a VariableStatement to a statement list, returning the statement
     * list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param node The VariableStatement whose exports are to be recorded.
     * @param exportSelf A value indicating whether to also export each VariableDeclaration of
     * `nodes` declaration list.
     */
    function appendExportsOfVariableStatement(statements, node, exportSelf) {
        if (moduleInfo.exportEquals) {
            return statements;
        }
        for (var _i = 0, _a = node.declarationList.declarations; _i < _a.length; _i++) {
            var decl = _a[_i];
            if (decl.initializer || exportSelf) {
                statements = appendExportsOfBindingElement(statements, decl, exportSelf);
            }
        }
        return statements;
    }
    /**
     * Appends the exports of a VariableDeclaration or BindingElement to a statement list,
     * returning the statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     * @param exportSelf A value indicating whether to also export the declaration itself.
     */
    function appendExportsOfBindingElement(statements, decl, exportSelf) {
        if (moduleInfo.exportEquals) {
            return statements;
        }
        if ((0, ts_1.isBindingPattern)(decl.name)) {
            for (var _i = 0, _a = decl.name.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                if (!(0, ts_1.isOmittedExpression)(element)) {
                    statements = appendExportsOfBindingElement(statements, element, exportSelf);
                }
            }
        }
        else if (!(0, ts_1.isGeneratedIdentifier)(decl.name)) {
            var excludeName = void 0;
            if (exportSelf) {
                statements = appendExportStatement(statements, decl.name, factory.getLocalName(decl));
                excludeName = (0, ts_1.idText)(decl.name);
            }
            statements = appendExportsOfDeclaration(statements, decl, excludeName);
        }
        return statements;
    }
    /**
     * Appends the exports of a ClassDeclaration or FunctionDeclaration to a statement list,
     * returning the statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfHoistedDeclaration(statements, decl) {
        if (moduleInfo.exportEquals) {
            return statements;
        }
        var excludeName;
        if ((0, ts_1.hasSyntacticModifier)(decl, 1 /* ModifierFlags.Export */)) {
            var exportName = (0, ts_1.hasSyntacticModifier)(decl, 1024 /* ModifierFlags.Default */) ? factory.createStringLiteral("default") : decl.name;
            statements = appendExportStatement(statements, exportName, factory.getLocalName(decl));
            excludeName = (0, ts_1.getTextOfIdentifierOrLiteral)(exportName);
        }
        if (decl.name) {
            statements = appendExportsOfDeclaration(statements, decl, excludeName);
        }
        return statements;
    }
    /**
     * Appends the exports of a declaration to a statement list, returning the statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration to export.
     * @param excludeName An optional name to exclude from exports.
     */
    function appendExportsOfDeclaration(statements, decl, excludeName) {
        if (moduleInfo.exportEquals) {
            return statements;
        }
        var name = factory.getDeclarationName(decl);
        var exportSpecifiers = moduleInfo.exportSpecifiers.get((0, ts_1.idText)(name));
        if (exportSpecifiers) {
            for (var _i = 0, exportSpecifiers_1 = exportSpecifiers; _i < exportSpecifiers_1.length; _i++) {
                var exportSpecifier = exportSpecifiers_1[_i];
                if (exportSpecifier.name.escapedText !== excludeName) {
                    statements = appendExportStatement(statements, exportSpecifier.name, name);
                }
            }
        }
        return statements;
    }
    /**
     * Appends the down-level representation of an export to a statement list, returning the
     * statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param exportName The name of the export.
     * @param expression The expression to export.
     * @param allowComments Whether to allow comments on the export.
     */
    function appendExportStatement(statements, exportName, expression, allowComments) {
        statements = (0, ts_1.append)(statements, createExportStatement(exportName, expression, allowComments));
        return statements;
    }
    /**
     * Creates a call to the current file's export function to export a value.
     *
     * @param name The bound name of the export.
     * @param value The exported value.
     * @param allowComments An optional value indicating whether to emit comments for the statement.
     */
    function createExportStatement(name, value, allowComments) {
        var statement = factory.createExpressionStatement(createExportExpression(name, value));
        (0, ts_1.startOnNewLine)(statement);
        if (!allowComments) {
            (0, ts_1.setEmitFlags)(statement, 3072 /* EmitFlags.NoComments */);
        }
        return statement;
    }
    /**
     * Creates a call to the current file's export function to export a value.
     *
     * @param name The bound name of the export.
     * @param value The exported value.
     */
    function createExportExpression(name, value) {
        var exportName = (0, ts_1.isIdentifier)(name) ? factory.createStringLiteralFromNode(name) : name;
        (0, ts_1.setEmitFlags)(value, (0, ts_1.getEmitFlags)(value) | 3072 /* EmitFlags.NoComments */);
        return (0, ts_1.setCommentRange)(factory.createCallExpression(exportFunction, /*typeArguments*/ undefined, [exportName, value]), value);
    }
    //
    // Top-Level or Nested Source Element Visitors
    //
    /**
     * Visit nested elements at the top-level of a module.
     *
     * @param node The node to visit.
     */
    function topLevelNestedVisitor(node) {
        switch (node.kind) {
            case 242 /* SyntaxKind.VariableStatement */:
                return visitVariableStatement(node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return visitFunctionDeclaration(node);
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node, /*isTopLevel*/ true);
            case 248 /* SyntaxKind.ForInStatement */:
                return visitForInStatement(node);
            case 249 /* SyntaxKind.ForOfStatement */:
                return visitForOfStatement(node);
            case 245 /* SyntaxKind.DoStatement */:
                return visitDoStatement(node);
            case 246 /* SyntaxKind.WhileStatement */:
                return visitWhileStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return visitLabeledStatement(node);
            case 253 /* SyntaxKind.WithStatement */:
                return visitWithStatement(node);
            case 244 /* SyntaxKind.IfStatement */:
                return visitIfStatement(node);
            case 254 /* SyntaxKind.SwitchStatement */:
                return visitSwitchStatement(node);
            case 268 /* SyntaxKind.CaseBlock */:
                return visitCaseBlock(node);
            case 295 /* SyntaxKind.CaseClause */:
                return visitCaseClause(node);
            case 296 /* SyntaxKind.DefaultClause */:
                return visitDefaultClause(node);
            case 257 /* SyntaxKind.TryStatement */:
                return visitTryStatement(node);
            case 298 /* SyntaxKind.CatchClause */:
                return visitCatchClause(node);
            case 240 /* SyntaxKind.Block */:
                return visitBlock(node);
            default:
                return visitor(node);
        }
    }
    /**
     * Visits the body of a ForStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitForStatement(node, isTopLevel) {
        var savedEnclosingBlockScopedContainer = enclosingBlockScopedContainer;
        enclosingBlockScopedContainer = node;
        node = factory.updateForStatement(node, (0, ts_1.visitNode)(node.initializer, isTopLevel ? visitForInitializer : discardedValueVisitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, discardedValueVisitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, isTopLevel ? topLevelNestedVisitor : visitor, context));
        enclosingBlockScopedContainer = savedEnclosingBlockScopedContainer;
        return node;
    }
    /**
     * Visits the body of a ForInStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitForInStatement(node) {
        var savedEnclosingBlockScopedContainer = enclosingBlockScopedContainer;
        enclosingBlockScopedContainer = node;
        node = factory.updateForInStatement(node, visitForInitializer(node.initializer), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context));
        enclosingBlockScopedContainer = savedEnclosingBlockScopedContainer;
        return node;
    }
    /**
     * Visits the body of a ForOfStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitForOfStatement(node) {
        var savedEnclosingBlockScopedContainer = enclosingBlockScopedContainer;
        enclosingBlockScopedContainer = node;
        node = factory.updateForOfStatement(node, node.awaitModifier, visitForInitializer(node.initializer), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context));
        enclosingBlockScopedContainer = savedEnclosingBlockScopedContainer;
        return node;
    }
    /**
     * Determines whether to hoist the initializer of a ForStatement, ForInStatement, or
     * ForOfStatement.
     *
     * @param node The node to test.
     */
    function shouldHoistForInitializer(node) {
        return (0, ts_1.isVariableDeclarationList)(node)
            && shouldHoistVariableDeclarationList(node);
    }
    /**
     * Visits the initializer of a ForStatement, ForInStatement, or ForOfStatement
     *
     * @param node The node to visit.
     */
    function visitForInitializer(node) {
        if (shouldHoistForInitializer(node)) {
            var expressions = void 0;
            for (var _i = 0, _a = node.declarations; _i < _a.length; _i++) {
                var variable = _a[_i];
                expressions = (0, ts_1.append)(expressions, transformInitializedVariable(variable, /*isExportedDeclaration*/ false));
                if (!variable.initializer) {
                    hoistBindingElement(variable);
                }
            }
            return expressions ? factory.inlineExpressions(expressions) : factory.createOmittedExpression();
        }
        else {
            return (0, ts_1.visitNode)(node, discardedValueVisitor, ts_1.isForInitializer);
        }
    }
    /**
     * Visits the body of a DoStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitDoStatement(node) {
        return factory.updateDoStatement(node, (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression));
    }
    /**
     * Visits the body of a WhileStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitWhileStatement(node) {
        return factory.updateWhileStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context));
    }
    /**
     * Visits the body of a LabeledStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitLabeledStatement(node) {
        return factory.updateLabeledStatement(node, node.label, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock)));
    }
    /**
     * Visits the body of a WithStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitWithStatement(node) {
        return factory.updateWithStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock)));
    }
    /**
     * Visits the body of a IfStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitIfStatement(node) {
        return factory.updateIfStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.thenStatement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock)), (0, ts_1.visitNode)(node.elseStatement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock));
    }
    /**
     * Visits the body of a SwitchStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitSwitchStatement(node) {
        return factory.updateSwitchStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.caseBlock, topLevelNestedVisitor, ts_1.isCaseBlock)));
    }
    /**
     * Visits the body of a CaseBlock to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitCaseBlock(node) {
        var savedEnclosingBlockScopedContainer = enclosingBlockScopedContainer;
        enclosingBlockScopedContainer = node;
        node = factory.updateCaseBlock(node, (0, ts_1.visitNodes)(node.clauses, topLevelNestedVisitor, ts_1.isCaseOrDefaultClause));
        enclosingBlockScopedContainer = savedEnclosingBlockScopedContainer;
        return node;
    }
    /**
     * Visits the body of a CaseClause to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitCaseClause(node) {
        return factory.updateCaseClause(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitNodes)(node.statements, topLevelNestedVisitor, ts_1.isStatement));
    }
    /**
     * Visits the body of a DefaultClause to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitDefaultClause(node) {
        return (0, ts_1.visitEachChild)(node, topLevelNestedVisitor, context);
    }
    /**
     * Visits the body of a TryStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitTryStatement(node) {
        return (0, ts_1.visitEachChild)(node, topLevelNestedVisitor, context);
    }
    /**
     * Visits the body of a CatchClause to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitCatchClause(node) {
        var savedEnclosingBlockScopedContainer = enclosingBlockScopedContainer;
        enclosingBlockScopedContainer = node;
        node = factory.updateCatchClause(node, node.variableDeclaration, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.block, topLevelNestedVisitor, ts_1.isBlock)));
        enclosingBlockScopedContainer = savedEnclosingBlockScopedContainer;
        return node;
    }
    /**
     * Visits the body of a Block to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitBlock(node) {
        var savedEnclosingBlockScopedContainer = enclosingBlockScopedContainer;
        enclosingBlockScopedContainer = node;
        node = (0, ts_1.visitEachChild)(node, topLevelNestedVisitor, context);
        enclosingBlockScopedContainer = savedEnclosingBlockScopedContainer;
        return node;
    }
    //
    // Destructuring Assignment Visitors
    //
    /**
     * Visit nodes to flatten destructuring assignments to exported symbols.
     *
     * @param node The node to visit.
     */
    function visitorWorker(node, valueIsDiscarded) {
        if (!(node.transformFlags & (4096 /* TransformFlags.ContainsDestructuringAssignment */ | 8388608 /* TransformFlags.ContainsDynamicImport */ | 268435456 /* TransformFlags.ContainsUpdateExpressionForIdentifier */))) {
            return node;
        }
        switch (node.kind) {
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node, /*isTopLevel*/ false);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return visitExpressionStatement(node);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, valueIsDiscarded);
            case 359 /* SyntaxKind.PartiallyEmittedExpression */:
                return visitPartiallyEmittedExpression(node, valueIsDiscarded);
            case 225 /* SyntaxKind.BinaryExpression */:
                if ((0, ts_1.isDestructuringAssignment)(node)) {
                    return visitDestructuringAssignment(node, valueIsDiscarded);
                }
                break;
            case 212 /* SyntaxKind.CallExpression */:
                if ((0, ts_1.isImportCall)(node)) {
                    return visitImportCallExpression(node);
                }
                break;
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                return visitPrefixOrPostfixUnaryExpression(node, valueIsDiscarded);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visit nodes to flatten destructuring assignments to exported symbols.
     *
     * @param node The node to visit.
     */
    function visitor(node) {
        return visitorWorker(node, /*valueIsDiscarded*/ false);
    }
    function discardedValueVisitor(node) {
        return visitorWorker(node, /*valueIsDiscarded*/ true);
    }
    function visitExpressionStatement(node) {
        return factory.updateExpressionStatement(node, (0, ts_1.visitNode)(node.expression, discardedValueVisitor, ts_1.isExpression));
    }
    function visitParenthesizedExpression(node, valueIsDiscarded) {
        return factory.updateParenthesizedExpression(node, (0, ts_1.visitNode)(node.expression, valueIsDiscarded ? discardedValueVisitor : visitor, ts_1.isExpression));
    }
    function visitPartiallyEmittedExpression(node, valueIsDiscarded) {
        return factory.updatePartiallyEmittedExpression(node, (0, ts_1.visitNode)(node.expression, valueIsDiscarded ? discardedValueVisitor : visitor, ts_1.isExpression));
    }
    function visitImportCallExpression(node) {
        // import("./blah")
        // emit as
        // System.register([], function (_export, _context) {
        //     return {
        //         setters: [],
        //         execute: () => {
        //             _context.import('./blah');
        //         }
        //     };
        // });
        var externalModuleName = (0, ts_1.getExternalModuleNameLiteral)(factory, node, currentSourceFile, host, resolver, compilerOptions);
        var firstArgument = (0, ts_1.visitNode)((0, ts_1.firstOrUndefined)(node.arguments), visitor, ts_1.isExpression);
        // Only use the external module name if it differs from the first argument. This allows us to preserve the quote style of the argument on output.
        var argument = externalModuleName && (!firstArgument || !(0, ts_1.isStringLiteral)(firstArgument) || firstArgument.text !== externalModuleName.text) ? externalModuleName : firstArgument;
        return factory.createCallExpression(factory.createPropertyAccessExpression(contextObject, factory.createIdentifier("import")), 
        /*typeArguments*/ undefined, argument ? [argument] : []);
    }
    /**
     * Visits a DestructuringAssignment to flatten destructuring to exported symbols.
     *
     * @param node The node to visit.
     */
    function visitDestructuringAssignment(node, valueIsDiscarded) {
        if (hasExportedReferenceInDestructuringTarget(node.left)) {
            return (0, ts_1.flattenDestructuringAssignment)(node, visitor, context, 0 /* FlattenLevel.All */, !valueIsDiscarded);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Determines whether the target of a destructuring assignment refers to an exported symbol.
     *
     * @param node The destructuring target.
     */
    function hasExportedReferenceInDestructuringTarget(node) {
        if ((0, ts_1.isAssignmentExpression)(node, /*excludeCompoundAssignment*/ true)) {
            return hasExportedReferenceInDestructuringTarget(node.left);
        }
        else if ((0, ts_1.isSpreadElement)(node)) {
            return hasExportedReferenceInDestructuringTarget(node.expression);
        }
        else if ((0, ts_1.isObjectLiteralExpression)(node)) {
            return (0, ts_1.some)(node.properties, hasExportedReferenceInDestructuringTarget);
        }
        else if ((0, ts_1.isArrayLiteralExpression)(node)) {
            return (0, ts_1.some)(node.elements, hasExportedReferenceInDestructuringTarget);
        }
        else if ((0, ts_1.isShorthandPropertyAssignment)(node)) {
            return hasExportedReferenceInDestructuringTarget(node.name);
        }
        else if ((0, ts_1.isPropertyAssignment)(node)) {
            return hasExportedReferenceInDestructuringTarget(node.initializer);
        }
        else if ((0, ts_1.isIdentifier)(node)) {
            var container = resolver.getReferencedExportContainer(node);
            return container !== undefined && container.kind === 311 /* SyntaxKind.SourceFile */;
        }
        else {
            return false;
        }
    }
    function visitPrefixOrPostfixUnaryExpression(node, valueIsDiscarded) {
        // When we see a prefix or postfix increment expression whose operand is an exported
        // symbol, we should ensure all exports of that symbol are updated with the correct
        // value.
        //
        // - We do not transform generated identifiers for any reason.
        // - We do not transform identifiers tagged with the LocalName flag.
        // - We do not transform identifiers that were originally the name of an enum or
        //   namespace due to how they are transformed in TypeScript.
        // - We only transform identifiers that are exported at the top level.
        if ((node.operator === 46 /* SyntaxKind.PlusPlusToken */ || node.operator === 47 /* SyntaxKind.MinusMinusToken */)
            && (0, ts_1.isIdentifier)(node.operand)
            && !(0, ts_1.isGeneratedIdentifier)(node.operand)
            && !(0, ts_1.isLocalName)(node.operand)
            && !(0, ts_1.isDeclarationNameOfEnumOrNamespace)(node.operand)) {
            var exportedNames = getExports(node.operand);
            if (exportedNames) {
                var temp = void 0;
                var expression = (0, ts_1.visitNode)(node.operand, visitor, ts_1.isExpression);
                if ((0, ts_1.isPrefixUnaryExpression)(node)) {
                    expression = factory.updatePrefixUnaryExpression(node, expression);
                }
                else {
                    expression = factory.updatePostfixUnaryExpression(node, expression);
                    if (!valueIsDiscarded) {
                        temp = factory.createTempVariable(hoistVariableDeclaration);
                        expression = factory.createAssignment(temp, expression);
                        (0, ts_1.setTextRange)(expression, node);
                    }
                    expression = factory.createComma(expression, factory.cloneNode(node.operand));
                    (0, ts_1.setTextRange)(expression, node);
                }
                for (var _i = 0, exportedNames_1 = exportedNames; _i < exportedNames_1.length; _i++) {
                    var exportName = exportedNames_1[_i];
                    expression = createExportExpression(exportName, preventSubstitution(expression));
                }
                if (temp) {
                    expression = factory.createComma(expression, temp);
                    (0, ts_1.setTextRange)(expression, node);
                }
                return expression;
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    //
    // Modifier Visitors
    //
    /**
     * Visit nodes to elide module-specific modifiers.
     *
     * @param node The node to visit.
     */
    function modifierVisitor(node) {
        switch (node.kind) {
            case 95 /* SyntaxKind.ExportKeyword */:
            case 90 /* SyntaxKind.DefaultKeyword */:
                return undefined;
        }
        return node;
    }
    //
    // Emit Notification
    //
    /**
     * Hook for node emit notifications.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emitCallback A callback used to emit the node in the printer.
     */
    function onEmitNode(hint, node, emitCallback) {
        if (node.kind === 311 /* SyntaxKind.SourceFile */) {
            var id = (0, ts_1.getOriginalNodeId)(node);
            currentSourceFile = node;
            moduleInfo = moduleInfoMap[id];
            exportFunction = exportFunctionsMap[id];
            noSubstitution = noSubstitutionMap[id];
            contextObject = contextObjectMap[id];
            if (noSubstitution) {
                delete noSubstitutionMap[id];
            }
            previousOnEmitNode(hint, node, emitCallback);
            currentSourceFile = undefined;
            moduleInfo = undefined;
            exportFunction = undefined;
            contextObject = undefined;
            noSubstitution = undefined;
        }
        else {
            previousOnEmitNode(hint, node, emitCallback);
        }
    }
    //
    // Substitutions
    //
    /**
     * Hooks node substitutions.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to substitute.
     */
    function onSubstituteNode(hint, node) {
        node = previousOnSubstituteNode(hint, node);
        if (isSubstitutionPrevented(node)) {
            return node;
        }
        if (hint === 1 /* EmitHint.Expression */) {
            return substituteExpression(node);
        }
        else if (hint === 4 /* EmitHint.Unspecified */) {
            return substituteUnspecified(node);
        }
        return node;
    }
    /**
     * Substitute the node, if necessary.
     *
     * @param node The node to substitute.
     */
    function substituteUnspecified(node) {
        switch (node.kind) {
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                return substituteShorthandPropertyAssignment(node);
        }
        return node;
    }
    /**
     * Substitution for a ShorthandPropertyAssignment whose name that may contain an imported or exported symbol.
     *
     * @param node The node to substitute.
     */
    function substituteShorthandPropertyAssignment(node) {
        var _a, _b;
        var name = node.name;
        if (!(0, ts_1.isGeneratedIdentifier)(name) && !(0, ts_1.isLocalName)(name)) {
            var importDeclaration = resolver.getReferencedImportDeclaration(name);
            if (importDeclaration) {
                if ((0, ts_1.isImportClause)(importDeclaration)) {
                    return (0, ts_1.setTextRange)(factory.createPropertyAssignment(factory.cloneNode(name), factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(importDeclaration.parent), factory.createIdentifier("default"))), 
                    /*location*/ node);
                }
                else if ((0, ts_1.isImportSpecifier)(importDeclaration)) {
                    return (0, ts_1.setTextRange)(factory.createPropertyAssignment(factory.cloneNode(name), factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(((_b = (_a = importDeclaration.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) || importDeclaration), factory.cloneNode(importDeclaration.propertyName || importDeclaration.name))), 
                    /*location*/ node);
                }
            }
        }
        return node;
    }
    /**
     * Substitute the expression, if necessary.
     *
     * @param node The node to substitute.
     */
    function substituteExpression(node) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
                return substituteExpressionIdentifier(node);
            case 225 /* SyntaxKind.BinaryExpression */:
                return substituteBinaryExpression(node);
            case 235 /* SyntaxKind.MetaProperty */:
                return substituteMetaProperty(node);
        }
        return node;
    }
    /**
     * Substitution for an Identifier expression that may contain an imported or exported symbol.
     *
     * @param node The node to substitute.
     */
    function substituteExpressionIdentifier(node) {
        var _a, _b;
        if ((0, ts_1.getEmitFlags)(node) & 8192 /* EmitFlags.HelperName */) {
            var externalHelpersModuleName = (0, ts_1.getExternalHelpersModuleName)(currentSourceFile);
            if (externalHelpersModuleName) {
                return factory.createPropertyAccessExpression(externalHelpersModuleName, node);
            }
            return node;
        }
        // When we see an identifier in an expression position that
        // points to an imported symbol, we should substitute a qualified
        // reference to the imported symbol if one is needed.
        //
        // - We do not substitute generated identifiers for any reason.
        // - We do not substitute identifiers tagged with the LocalName flag.
        if (!(0, ts_1.isGeneratedIdentifier)(node) && !(0, ts_1.isLocalName)(node)) {
            var importDeclaration = resolver.getReferencedImportDeclaration(node);
            if (importDeclaration) {
                if ((0, ts_1.isImportClause)(importDeclaration)) {
                    return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(importDeclaration.parent), factory.createIdentifier("default")), 
                    /*location*/ node);
                }
                else if ((0, ts_1.isImportSpecifier)(importDeclaration)) {
                    return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(((_b = (_a = importDeclaration.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) || importDeclaration), factory.cloneNode(importDeclaration.propertyName || importDeclaration.name)), 
                    /*location*/ node);
                }
            }
        }
        return node;
    }
    /**
     * Substitution for a BinaryExpression that may contain an imported or exported symbol.
     *
     * @param node The node to substitute.
     */
    function substituteBinaryExpression(node) {
        // When we see an assignment expression whose left-hand side is an exported symbol,
        // we should ensure all exports of that symbol are updated with the correct value.
        //
        // - We do not substitute generated identifiers for any reason.
        // - We do not substitute identifiers tagged with the LocalName flag.
        // - We only substitute identifiers that are exported at the top level.
        if ((0, ts_1.isAssignmentOperator)(node.operatorToken.kind)
            && (0, ts_1.isIdentifier)(node.left)
            && !(0, ts_1.isGeneratedIdentifier)(node.left)
            && !(0, ts_1.isLocalName)(node.left)) {
            var exportedNames = getExports(node.left);
            if (exportedNames) {
                // For each additional export of the declaration, apply an export assignment.
                var expression = node;
                for (var _i = 0, exportedNames_2 = exportedNames; _i < exportedNames_2.length; _i++) {
                    var exportName = exportedNames_2[_i];
                    expression = createExportExpression(exportName, preventSubstitution(expression));
                }
                return expression;
            }
        }
        return node;
    }
    function substituteMetaProperty(node) {
        if ((0, ts_1.isImportMeta)(node)) {
            return factory.createPropertyAccessExpression(contextObject, factory.createIdentifier("meta"));
        }
        return node;
    }
    /**
     * Gets the exports of a name.
     *
     * @param name The name.
     */
    function getExports(name) {
        var exportedNames;
        var valueDeclaration = getReferencedDeclaration(name);
        if (valueDeclaration) {
            var exportContainer = resolver.getReferencedExportContainer(name, /*prefixLocals*/ false);
            if (exportContainer && exportContainer.kind === 311 /* SyntaxKind.SourceFile */) {
                exportedNames = (0, ts_1.append)(exportedNames, factory.getDeclarationName(valueDeclaration));
            }
            exportedNames = (0, ts_1.addRange)(exportedNames, moduleInfo === null || moduleInfo === void 0 ? void 0 : moduleInfo.exportedBindings[(0, ts_1.getOriginalNodeId)(valueDeclaration)]);
        }
        return exportedNames;
    }
    function getReferencedDeclaration(name) {
        if (!(0, ts_1.isGeneratedIdentifier)(name)) {
            var importDeclaration = resolver.getReferencedImportDeclaration(name);
            if (importDeclaration)
                return importDeclaration;
            var valueDeclaration = resolver.getReferencedValueDeclaration(name);
            if (valueDeclaration && (moduleInfo === null || moduleInfo === void 0 ? void 0 : moduleInfo.exportedBindings[(0, ts_1.getOriginalNodeId)(valueDeclaration)]))
                return valueDeclaration;
            // An exported namespace or enum may merge with an ambient declaration, which won't show up in
            // .js emit. When that happens, try to find bindings associated with a non-ambient declaration.
            var declarations = resolver.getReferencedValueDeclarations(name);
            if (declarations) {
                for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
                    var declaration = declarations_1[_i];
                    if (declaration !== valueDeclaration && (moduleInfo === null || moduleInfo === void 0 ? void 0 : moduleInfo.exportedBindings[(0, ts_1.getOriginalNodeId)(declaration)]))
                        return declaration;
                }
            }
            return valueDeclaration;
        }
    }
    /**
     * Prevent substitution of a node for this transformer.
     *
     * @param node The node which should not be substituted.
     */
    function preventSubstitution(node) {
        if (noSubstitution === undefined)
            noSubstitution = [];
        noSubstitution[(0, ts_1.getNodeId)(node)] = true;
        return node;
    }
    /**
     * Determines whether a node should not be substituted.
     *
     * @param node The node to test.
     */
    function isSubstitutionPrevented(node) {
        return noSubstitution && node.id && noSubstitution[node.id];
    }
}
exports.transformSystemModule = transformSystemModule;
