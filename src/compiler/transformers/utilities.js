"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessPrivateIdentifier = exports.setPrivateIdentifier = exports.getPrivateIdentifier = exports.newPrivateEnvironment = exports.walkUpLexicalEnvironments = exports.getAllDecoratorsOfClassElement = exports.getAllDecoratorsOfClass = exports.isNonStaticMethodOrAccessorWithPrivateName = exports.isInitializedProperty = exports.getStaticPropertiesAndClassStaticBlock = exports.getProperties = exports.findSuperStatementIndex = exports.getSuperCallFromStatement = exports.getNonAssignmentOperatorForCompoundAssignment = exports.isCompoundAssignment = exports.isSimpleInlineableExpression = exports.isSimpleCopiableExpression = exports.collectExternalModuleInfo = exports.getImportNeedsImportDefaultHelper = exports.getImportNeedsImportStarHelper = exports.getExportNeedsImportStarHelper = exports.chainBundle = exports.getOriginalNodeId = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function getOriginalNodeId(node) {
    node = (0, ts_1.getOriginalNode)(node);
    return node ? (0, ts_1.getNodeId)(node) : 0;
}
exports.getOriginalNodeId = getOriginalNodeId;
function containsDefaultReference(node) {
    if (!node)
        return false;
    if (!(0, ts_1.isNamedImports)(node))
        return false;
    return (0, ts_1.some)(node.elements, isNamedDefaultReference);
}
function isNamedDefaultReference(e) {
    return e.propertyName !== undefined && e.propertyName.escapedText === "default" /* InternalSymbolName.Default */;
}
/** @internal */
function chainBundle(context, transformSourceFile) {
    return transformSourceFileOrBundle;
    function transformSourceFileOrBundle(node) {
        return node.kind === 311 /* SyntaxKind.SourceFile */ ? transformSourceFile(node) : transformBundle(node);
    }
    function transformBundle(node) {
        return context.factory.createBundle((0, ts_1.map)(node.sourceFiles, transformSourceFile), node.prepends);
    }
}
exports.chainBundle = chainBundle;
/** @internal */
function getExportNeedsImportStarHelper(node) {
    return !!(0, ts_1.getNamespaceDeclarationNode)(node);
}
exports.getExportNeedsImportStarHelper = getExportNeedsImportStarHelper;
/** @internal */
function getImportNeedsImportStarHelper(node) {
    if (!!(0, ts_1.getNamespaceDeclarationNode)(node)) {
        return true;
    }
    var bindings = node.importClause && node.importClause.namedBindings;
    if (!bindings) {
        return false;
    }
    if (!(0, ts_1.isNamedImports)(bindings))
        return false;
    var defaultRefCount = 0;
    for (var _i = 0, _a = bindings.elements; _i < _a.length; _i++) {
        var binding = _a[_i];
        if (isNamedDefaultReference(binding)) {
            defaultRefCount++;
        }
    }
    // Import star is required if there's default named refs mixed with non-default refs, or if theres non-default refs and it has a default import
    return (defaultRefCount > 0 && defaultRefCount !== bindings.elements.length) || (!!(bindings.elements.length - defaultRefCount) && (0, ts_1.isDefaultImport)(node));
}
exports.getImportNeedsImportStarHelper = getImportNeedsImportStarHelper;
/** @internal */
function getImportNeedsImportDefaultHelper(node) {
    // Import default is needed if there's a default import or a default ref and no other refs (meaning an import star helper wasn't requested)
    return !getImportNeedsImportStarHelper(node) && ((0, ts_1.isDefaultImport)(node) || (!!node.importClause && (0, ts_1.isNamedImports)(node.importClause.namedBindings) && containsDefaultReference(node.importClause.namedBindings))); // TODO: GH#18217
}
exports.getImportNeedsImportDefaultHelper = getImportNeedsImportDefaultHelper;
/** @internal */
function collectExternalModuleInfo(context, sourceFile, resolver, compilerOptions) {
    var externalImports = [];
    var exportSpecifiers = (0, ts_1.createMultiMap)();
    var exportedBindings = [];
    var uniqueExports = new Map();
    var exportedNames;
    var hasExportDefault = false;
    var exportEquals;
    var hasExportStarsToExportValues = false;
    var hasImportStar = false;
    var hasImportDefault = false;
    for (var _i = 0, _a = sourceFile.statements; _i < _a.length; _i++) {
        var node = _a[_i];
        switch (node.kind) {
            case 271 /* SyntaxKind.ImportDeclaration */:
                // import "mod"
                // import x from "mod"
                // import * as x from "mod"
                // import { x, y } from "mod"
                externalImports.push(node);
                if (!hasImportStar && getImportNeedsImportStarHelper(node)) {
                    hasImportStar = true;
                }
                if (!hasImportDefault && getImportNeedsImportDefaultHelper(node)) {
                    hasImportDefault = true;
                }
                break;
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                if (node.moduleReference.kind === 282 /* SyntaxKind.ExternalModuleReference */) {
                    // import x = require("mod")
                    externalImports.push(node);
                }
                break;
            case 277 /* SyntaxKind.ExportDeclaration */:
                if (node.moduleSpecifier) {
                    if (!node.exportClause) {
                        // export * from "mod"
                        externalImports.push(node);
                        hasExportStarsToExportValues = true;
                    }
                    else {
                        // export * as ns from "mod"
                        // export { x, y } from "mod"
                        externalImports.push(node);
                        if ((0, ts_1.isNamedExports)(node.exportClause)) {
                            addExportedNamesForExportDeclaration(node);
                        }
                        else {
                            var name_1 = node.exportClause.name;
                            if (!uniqueExports.get((0, ts_1.idText)(name_1))) {
                                multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), name_1);
                                uniqueExports.set((0, ts_1.idText)(name_1), true);
                                exportedNames = (0, ts_1.append)(exportedNames, name_1);
                            }
                            // we use the same helpers for `export * as ns` as we do for `import * as ns`
                            hasImportStar = true;
                        }
                    }
                }
                else {
                    // export { x, y }
                    addExportedNamesForExportDeclaration(node);
                }
                break;
            case 276 /* SyntaxKind.ExportAssignment */:
                if (node.isExportEquals && !exportEquals) {
                    // export = x
                    exportEquals = node;
                }
                break;
            case 242 /* SyntaxKind.VariableStatement */:
                if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
                    for (var _b = 0, _c = node.declarationList.declarations; _b < _c.length; _b++) {
                        var decl = _c[_b];
                        exportedNames = collectExportedVariableInfo(decl, uniqueExports, exportedNames, exportedBindings);
                    }
                }
                break;
            case 261 /* SyntaxKind.FunctionDeclaration */:
                if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
                    if ((0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */)) {
                        // export default function() { }
                        if (!hasExportDefault) {
                            multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), context.factory.getDeclarationName(node));
                            hasExportDefault = true;
                        }
                    }
                    else {
                        // export function x() { }
                        var name_2 = node.name;
                        if (!uniqueExports.get((0, ts_1.idText)(name_2))) {
                            multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), name_2);
                            uniqueExports.set((0, ts_1.idText)(name_2), true);
                            exportedNames = (0, ts_1.append)(exportedNames, name_2);
                        }
                    }
                }
                break;
            case 262 /* SyntaxKind.ClassDeclaration */:
                if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
                    if ((0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */)) {
                        // export default class { }
                        if (!hasExportDefault) {
                            multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), context.factory.getDeclarationName(node));
                            hasExportDefault = true;
                        }
                    }
                    else {
                        // export class x { }
                        var name_3 = node.name;
                        if (name_3 && !uniqueExports.get((0, ts_1.idText)(name_3))) {
                            multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(node), name_3);
                            uniqueExports.set((0, ts_1.idText)(name_3), true);
                            exportedNames = (0, ts_1.append)(exportedNames, name_3);
                        }
                    }
                }
                break;
        }
    }
    var externalHelpersImportDeclaration = (0, ts_1.createExternalHelpersImportDeclarationIfNeeded)(context.factory, context.getEmitHelperFactory(), sourceFile, compilerOptions, hasExportStarsToExportValues, hasImportStar, hasImportDefault);
    if (externalHelpersImportDeclaration) {
        externalImports.unshift(externalHelpersImportDeclaration);
    }
    return { externalImports: externalImports, exportSpecifiers: exportSpecifiers, exportEquals: exportEquals, hasExportStarsToExportValues: hasExportStarsToExportValues, exportedBindings: exportedBindings, exportedNames: exportedNames, externalHelpersImportDeclaration: externalHelpersImportDeclaration };
    function addExportedNamesForExportDeclaration(node) {
        for (var _i = 0, _a = (0, ts_1.cast)(node.exportClause, ts_1.isNamedExports).elements; _i < _a.length; _i++) {
            var specifier = _a[_i];
            if (!uniqueExports.get((0, ts_1.idText)(specifier.name))) {
                var name_4 = specifier.propertyName || specifier.name;
                if (!node.moduleSpecifier) {
                    exportSpecifiers.add((0, ts_1.idText)(name_4), specifier);
                }
                var decl = resolver.getReferencedImportDeclaration(name_4)
                    || resolver.getReferencedValueDeclaration(name_4);
                if (decl) {
                    multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(decl), specifier.name);
                }
                uniqueExports.set((0, ts_1.idText)(specifier.name), true);
                exportedNames = (0, ts_1.append)(exportedNames, specifier.name);
            }
        }
    }
}
exports.collectExternalModuleInfo = collectExternalModuleInfo;
function collectExportedVariableInfo(decl, uniqueExports, exportedNames, exportedBindings) {
    if ((0, ts_1.isBindingPattern)(decl.name)) {
        for (var _i = 0, _a = decl.name.elements; _i < _a.length; _i++) {
            var element = _a[_i];
            if (!(0, ts_1.isOmittedExpression)(element)) {
                exportedNames = collectExportedVariableInfo(element, uniqueExports, exportedNames, exportedBindings);
            }
        }
    }
    else if (!(0, ts_1.isGeneratedIdentifier)(decl.name)) {
        var text = (0, ts_1.idText)(decl.name);
        if (!uniqueExports.get(text)) {
            uniqueExports.set(text, true);
            exportedNames = (0, ts_1.append)(exportedNames, decl.name);
            if ((0, ts_1.isLocalName)(decl.name)) {
                multiMapSparseArrayAdd(exportedBindings, getOriginalNodeId(decl), decl.name);
            }
        }
    }
    return exportedNames;
}
/** Use a sparse array as a multi-map. */
function multiMapSparseArrayAdd(map, key, value) {
    var values = map[key];
    if (values) {
        values.push(value);
    }
    else {
        map[key] = values = [value];
    }
    return values;
}
/**
 * Used in the module transformer to check if an expression is reasonably without sideeffect,
 *  and thus better to copy into multiple places rather than to cache in a temporary variable
 *  - this is mostly subjective beyond the requirement that the expression not be sideeffecting
 *
 * @internal
 */
function isSimpleCopiableExpression(expression) {
    return (0, ts_1.isStringLiteralLike)(expression) ||
        expression.kind === 9 /* SyntaxKind.NumericLiteral */ ||
        (0, ts_1.isKeyword)(expression.kind) ||
        (0, ts_1.isIdentifier)(expression);
}
exports.isSimpleCopiableExpression = isSimpleCopiableExpression;
/**
 * A simple inlinable expression is an expression which can be copied into multiple locations
 * without risk of repeating any sideeffects and whose value could not possibly change between
 * any such locations
 *
 * @internal
 */
function isSimpleInlineableExpression(expression) {
    return !(0, ts_1.isIdentifier)(expression) && isSimpleCopiableExpression(expression);
}
exports.isSimpleInlineableExpression = isSimpleInlineableExpression;
/** @internal */
function isCompoundAssignment(kind) {
    return kind >= 65 /* SyntaxKind.FirstCompoundAssignment */
        && kind <= 79 /* SyntaxKind.LastCompoundAssignment */;
}
exports.isCompoundAssignment = isCompoundAssignment;
/** @internal */
function getNonAssignmentOperatorForCompoundAssignment(kind) {
    switch (kind) {
        case 65 /* SyntaxKind.PlusEqualsToken */: return 40 /* SyntaxKind.PlusToken */;
        case 66 /* SyntaxKind.MinusEqualsToken */: return 41 /* SyntaxKind.MinusToken */;
        case 67 /* SyntaxKind.AsteriskEqualsToken */: return 42 /* SyntaxKind.AsteriskToken */;
        case 68 /* SyntaxKind.AsteriskAsteriskEqualsToken */: return 43 /* SyntaxKind.AsteriskAsteriskToken */;
        case 69 /* SyntaxKind.SlashEqualsToken */: return 44 /* SyntaxKind.SlashToken */;
        case 70 /* SyntaxKind.PercentEqualsToken */: return 45 /* SyntaxKind.PercentToken */;
        case 71 /* SyntaxKind.LessThanLessThanEqualsToken */: return 48 /* SyntaxKind.LessThanLessThanToken */;
        case 72 /* SyntaxKind.GreaterThanGreaterThanEqualsToken */: return 49 /* SyntaxKind.GreaterThanGreaterThanToken */;
        case 73 /* SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken */: return 50 /* SyntaxKind.GreaterThanGreaterThanGreaterThanToken */;
        case 74 /* SyntaxKind.AmpersandEqualsToken */: return 51 /* SyntaxKind.AmpersandToken */;
        case 75 /* SyntaxKind.BarEqualsToken */: return 52 /* SyntaxKind.BarToken */;
        case 79 /* SyntaxKind.CaretEqualsToken */: return 53 /* SyntaxKind.CaretToken */;
        case 76 /* SyntaxKind.BarBarEqualsToken */: return 57 /* SyntaxKind.BarBarToken */;
        case 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */: return 56 /* SyntaxKind.AmpersandAmpersandToken */;
        case 78 /* SyntaxKind.QuestionQuestionEqualsToken */: return 61 /* SyntaxKind.QuestionQuestionToken */;
    }
}
exports.getNonAssignmentOperatorForCompoundAssignment = getNonAssignmentOperatorForCompoundAssignment;
/**
 * @returns Contained super() call from descending into the statement ignoring parentheses, if that call exists.
 *
 * @internal
 */
function getSuperCallFromStatement(statement) {
    if (!(0, ts_1.isExpressionStatement)(statement)) {
        return undefined;
    }
    var expression = (0, ts_1.skipParentheses)(statement.expression);
    return (0, ts_1.isSuperCall)(expression)
        ? expression
        : undefined;
}
exports.getSuperCallFromStatement = getSuperCallFromStatement;
/**
 * @returns The index (after prologue statements) of a super call, or -1 if not found.
 *
 * @internal
 */
function findSuperStatementIndex(statements, indexAfterLastPrologueStatement) {
    for (var i = indexAfterLastPrologueStatement; i < statements.length; i += 1) {
        var statement = statements[i];
        if (getSuperCallFromStatement(statement)) {
            return i;
        }
    }
    return -1;
}
exports.findSuperStatementIndex = findSuperStatementIndex;
/** @internal */
function getProperties(node, requireInitializer, isStatic) {
    return (0, ts_1.filter)(node.members, function (m) { return isInitializedOrStaticProperty(m, requireInitializer, isStatic); });
}
exports.getProperties = getProperties;
function isStaticPropertyDeclarationOrClassStaticBlockDeclaration(element) {
    return isStaticPropertyDeclaration(element) || (0, ts_1.isClassStaticBlockDeclaration)(element);
}
/** @internal */
function getStaticPropertiesAndClassStaticBlock(node) {
    return (0, ts_1.filter)(node.members, isStaticPropertyDeclarationOrClassStaticBlockDeclaration);
}
exports.getStaticPropertiesAndClassStaticBlock = getStaticPropertiesAndClassStaticBlock;
/**
 * Is a class element either a static or an instance property declaration with an initializer?
 *
 * @param member The class element node.
 * @param isStatic A value indicating whether the member should be a static or instance member.
 */
function isInitializedOrStaticProperty(member, requireInitializer, isStatic) {
    return (0, ts_1.isPropertyDeclaration)(member)
        && (!!member.initializer || !requireInitializer)
        && (0, ts_1.hasStaticModifier)(member) === isStatic;
}
function isStaticPropertyDeclaration(member) {
    return (0, ts_1.isPropertyDeclaration)(member) && (0, ts_1.hasStaticModifier)(member);
}
/**
 * Gets a value indicating whether a class element is either a static or an instance property declaration with an initializer.
 *
 * @param member The class element node.
 * @param isStatic A value indicating whether the member should be a static or instance member.
 *
 * @internal
 */
function isInitializedProperty(member) {
    return member.kind === 171 /* SyntaxKind.PropertyDeclaration */
        && member.initializer !== undefined;
}
exports.isInitializedProperty = isInitializedProperty;
/**
 * Gets a value indicating whether a class element is a private instance method or accessor.
 *
 * @param member The class element node.
 *
 * @internal
 */
function isNonStaticMethodOrAccessorWithPrivateName(member) {
    return !(0, ts_1.isStatic)(member) && ((0, ts_1.isMethodOrAccessor)(member) || (0, ts_1.isAutoAccessorPropertyDeclaration)(member)) && (0, ts_1.isPrivateIdentifier)(member.name);
}
exports.isNonStaticMethodOrAccessorWithPrivateName = isNonStaticMethodOrAccessorWithPrivateName;
/**
 * Gets an array of arrays of decorators for the parameters of a function-like node.
 * The offset into the result array should correspond to the offset of the parameter.
 *
 * @param node The function-like node.
 */
function getDecoratorsOfParameters(node) {
    var decorators;
    if (node) {
        var parameters = node.parameters;
        var firstParameterIsThis = parameters.length > 0 && (0, ts_1.parameterIsThisKeyword)(parameters[0]);
        var firstParameterOffset = firstParameterIsThis ? 1 : 0;
        var numParameters = firstParameterIsThis ? parameters.length - 1 : parameters.length;
        for (var i = 0; i < numParameters; i++) {
            var parameter = parameters[i + firstParameterOffset];
            if (decorators || (0, ts_1.hasDecorators)(parameter)) {
                if (!decorators) {
                    decorators = new Array(numParameters);
                }
                decorators[i] = (0, ts_1.getDecorators)(parameter);
            }
        }
    }
    return decorators;
}
/**
 * Gets an AllDecorators object containing the decorators for the class and the decorators for the
 * parameters of the constructor of the class.
 *
 * @param node The class node.
 *
 * @internal
 */
function getAllDecoratorsOfClass(node) {
    var decorators = (0, ts_1.getDecorators)(node);
    var parameters = getDecoratorsOfParameters((0, ts_1.getFirstConstructorWithBody)(node));
    if (!(0, ts_1.some)(decorators) && !(0, ts_1.some)(parameters)) {
        return undefined;
    }
    return {
        decorators: decorators,
        parameters: parameters
    };
}
exports.getAllDecoratorsOfClass = getAllDecoratorsOfClass;
/**
 * Gets an AllDecorators object containing the decorators for the member and its parameters.
 *
 * @param parent The class node that contains the member.
 * @param member The class member.
 *
 * @internal
 */
function getAllDecoratorsOfClassElement(member, parent, useLegacyDecorators) {
    switch (member.kind) {
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
            if (!useLegacyDecorators) {
                return getAllDecoratorsOfMethod(member);
            }
            return getAllDecoratorsOfAccessors(member, parent);
        case 173 /* SyntaxKind.MethodDeclaration */:
            return getAllDecoratorsOfMethod(member);
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return getAllDecoratorsOfProperty(member);
        default:
            return undefined;
    }
}
exports.getAllDecoratorsOfClassElement = getAllDecoratorsOfClassElement;
/**
 * Gets an AllDecorators object containing the decorators for the accessor and its parameters.
 *
 * @param parent The class node that contains the accessor.
 * @param accessor The class accessor member.
 */
function getAllDecoratorsOfAccessors(accessor, parent) {
    if (!accessor.body) {
        return undefined;
    }
    var _a = (0, ts_1.getAllAccessorDeclarations)(parent.members, accessor), firstAccessor = _a.firstAccessor, secondAccessor = _a.secondAccessor, getAccessor = _a.getAccessor, setAccessor = _a.setAccessor;
    var firstAccessorWithDecorators = (0, ts_1.hasDecorators)(firstAccessor) ? firstAccessor :
        secondAccessor && (0, ts_1.hasDecorators)(secondAccessor) ? secondAccessor :
            undefined;
    if (!firstAccessorWithDecorators || accessor !== firstAccessorWithDecorators) {
        return undefined;
    }
    var decorators = (0, ts_1.getDecorators)(firstAccessorWithDecorators);
    var parameters = getDecoratorsOfParameters(setAccessor);
    if (!(0, ts_1.some)(decorators) && !(0, ts_1.some)(parameters)) {
        return undefined;
    }
    return {
        decorators: decorators,
        parameters: parameters,
        getDecorators: getAccessor && (0, ts_1.getDecorators)(getAccessor),
        setDecorators: setAccessor && (0, ts_1.getDecorators)(setAccessor)
    };
}
/**
 * Gets an AllDecorators object containing the decorators for the method and its parameters.
 *
 * @param method The class method member.
 */
function getAllDecoratorsOfMethod(method) {
    if (!method.body) {
        return undefined;
    }
    var decorators = (0, ts_1.getDecorators)(method);
    var parameters = getDecoratorsOfParameters(method);
    if (!(0, ts_1.some)(decorators) && !(0, ts_1.some)(parameters)) {
        return undefined;
    }
    return { decorators: decorators, parameters: parameters };
}
/**
 * Gets an AllDecorators object containing the decorators for the property.
 *
 * @param property The class property member.
 */
function getAllDecoratorsOfProperty(property) {
    var decorators = (0, ts_1.getDecorators)(property);
    if (!(0, ts_1.some)(decorators)) {
        return undefined;
    }
    return { decorators: decorators };
}
/** @internal */
function walkUpLexicalEnvironments(env, cb) {
    while (env) {
        var result = cb(env);
        if (result !== undefined)
            return result;
        env = env.previous;
    }
}
exports.walkUpLexicalEnvironments = walkUpLexicalEnvironments;
/** @internal */
function newPrivateEnvironment(data) {
    return { data: data };
}
exports.newPrivateEnvironment = newPrivateEnvironment;
/** @internal */
function getPrivateIdentifier(privateEnv, name) {
    var _a, _b;
    return (0, ts_1.isGeneratedPrivateIdentifier)(name) ?
        (_a = privateEnv === null || privateEnv === void 0 ? void 0 : privateEnv.generatedIdentifiers) === null || _a === void 0 ? void 0 : _a.get((0, ts_1.getNodeForGeneratedName)(name)) :
        (_b = privateEnv === null || privateEnv === void 0 ? void 0 : privateEnv.identifiers) === null || _b === void 0 ? void 0 : _b.get(name.escapedText);
}
exports.getPrivateIdentifier = getPrivateIdentifier;
/** @internal */
function setPrivateIdentifier(privateEnv, name, entry) {
    var _a, _b;
    if ((0, ts_1.isGeneratedPrivateIdentifier)(name)) {
        (_a = privateEnv.generatedIdentifiers) !== null && _a !== void 0 ? _a : (privateEnv.generatedIdentifiers = new Map());
        privateEnv.generatedIdentifiers.set((0, ts_1.getNodeForGeneratedName)(name), entry);
    }
    else {
        (_b = privateEnv.identifiers) !== null && _b !== void 0 ? _b : (privateEnv.identifiers = new Map());
        privateEnv.identifiers.set(name.escapedText, entry);
    }
}
exports.setPrivateIdentifier = setPrivateIdentifier;
/** @internal */
function accessPrivateIdentifier(env, name) {
    return walkUpLexicalEnvironments(env, function (env) { return getPrivateIdentifier(env.privateEnv, name); });
}
exports.accessPrivateIdentifier = accessPrivateIdentifier;
