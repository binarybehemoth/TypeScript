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
exports.getNonDecoratorTokenPosOfNode = exports.getTokenPosOfNode = exports.createCommentDirectivesMap = exports.isPinnedComment = exports.isRecognizedTripleSlashComment = exports.insertStatementAfterCustomPrologue = exports.insertStatementAfterStandardPrologue = exports.insertStatementsAfterCustomPrologue = exports.insertStatementsAfterStandardPrologue = exports.isGrammarError = exports.nodeIsPresent = exports.nodeIsMissing = exports.isFileLevelUniqueName = exports.getEndLinePosition = exports.nodePosToString = exports.getStartPositionOfLine = exports.isStatementWithLocals = exports.isPlainJsFile = exports.getSourceFileOfModule = exports.getSourceFileOfNode = exports.containsParseError = exports.hasChangesInResolutions = exports.typeDirectiveIsEqualTo = exports.packageIdToString = exports.packageIdToPackageName = exports.createModuleNotFoundChain = exports.moduleResolutionIsEqualTo = exports.projectReferenceIsEqualTo = exports.getResolvedTypeReferenceDirective = exports.setResolvedTypeReferenceDirective = exports.setResolvedModule = exports.getResolvedModule = exports.getFullWidth = exports.usingSingleLineStringWriter = exports.copyEntries = exports.forEachKey = exports.forEachEntry = exports.forEachAncestor = exports.optionsHaveChanges = exports.changesAffectingProgramStructure = exports.optionsHaveModuleResolutionChanges = exports.changesAffectModuleResolution = exports.isTransientSymbol = exports.createSymbolTable = exports.getDeclarationsOfKind = exports.getDeclarationOfKind = exports.noTruncationMaximumTruncationLength = exports.defaultMaximumTruncationLength = exports.externalHelpersModuleNameText = exports.resolvingEmptyArray = void 0;
exports.createDiagnosticMessageChainFromDiagnostic = exports.createDiagnosticForFileFromMessageChain = exports.createFileDiagnosticFromMessageChain = exports.createDiagnosticForNodeArrayFromMessageChain = exports.createDiagnosticForNodeFromMessageChain = exports.createDiagnosticForNodeInSourceFile = exports.createDiagnosticForNodeArray = exports.createDiagnosticForNode = exports.entityNameToString = exports.getTextOfPropertyName = exports.tryGetTextOfPropertyName = exports.isComputedNonLiteralName = exports.getNameFromIndexInfo = exports.declarationNameToString = exports.forEachEnclosingBlockScopeContainer = exports.getEnclosingBlockScopeContainer = exports.isAnyImportOrReExport = exports.hasPossibleExternalModuleReference = exports.isLateVisibilityPaintedStatement = exports.isAnyImportOrBareOrAccessedRequire = exports.isAnyImportSyntax = exports.isDeclarationWithTypeParameterChildren = exports.isDeclarationWithTypeParameters = exports.isBlockScope = exports.isAmbientPropertyDeclaration = exports.isEffectiveStrictModeSourceFile = exports.isEffectiveExternalModule = exports.getNonAugmentationDeclaration = exports.isModuleAugmentationExternal = exports.isExternalModuleAugmentation = exports.isGlobalScopeAugmentation = exports.isBlockScopedContainerTopLevel = exports.isShorthandAmbientModuleSymbol = exports.isEffectiveModuleDeclaration = exports.isNonGlobalAmbientModule = exports.isModuleWithStringLiteralName = exports.isAmbientModule = exports.isCatchClauseVariableDeclarationOrBindingElement = exports.isBlockOrCatchScoped = exports.makeIdentifierFromModuleName = exports.getTextOfConstantValue = exports.getLiteralText = exports.getScriptTargetFeatures = exports.getInternalEmitFlags = exports.getEmitFlags = exports.indexOfNode = exports.getTextOfNode = exports.getTextOfNodeFromSourceText = exports.isExportNamespaceAsDefaultDeclaration = exports.getSourceTextOfNodeFromSourceFile = void 0;
exports.getContainingClassStaticBlock = exports.getContainingClass = exports.getContainingFunctionDeclaration = exports.getContainingFunction = exports.forEachTsConfigPropArray = exports.getTsConfigPropArrayElementValue = exports.getTsConfigObjectLiteralExpression = exports.getPropertyArrayElementValue = exports.forEachPropertyAssignment = exports.isThisTypePredicate = exports.isIdentifierTypePredicate = exports.isObjectLiteralOrClassExpressionMethodOrAccessor = exports.isObjectLiteralMethod = exports.isFunctionBlock = exports.unwrapInnermostStatementOfLabel = exports.introducesArgumentsExoticObject = exports.isValidESSymbolDeclaration = exports.isCommonJsExportPropertyAssignment = exports.isCommonJsExportedExpression = exports.isVariableDeclarationInVariableStatement = exports.isVariableLikeOrAccessor = exports.isVariableLike = exports.getMembersOfDeclaration = exports.getRestParameterElementType = exports.forEachYieldExpression = exports.forEachReturnStatement = exports.isChildOfNodeWithKind = exports.isPartOfTypeNode = exports.fullTripleSlashAMDReferencePathRegEx = exports.fullTripleSlashReferencePathRegEx = exports.getJSDocCommentRanges = exports.getLeadingCommentRangesOfNode = exports.isHoistedVariableStatement = exports.isHoistedFunction = exports.isCustomPrologue = exports.isPrologueDirective = exports.isLiteralImportTypeNode = exports.isImportMeta = exports.isImportCall = exports.isSuperCall = exports.isLet = exports.isVarConst = exports.isDeclarationReadonly = exports.isEnumConst = exports.isJsonSourceFile = exports.isExternalOrCommonJsModule = exports.getErrorSpanForNode = exports.scanTokenAtPosition = exports.getSpanOfTokenAtPosition = exports.createDiagnosticForRange = void 0;
exports.isDefaultedExpandoInitializer = exports.getExpandoInitializer = exports.getAssignedExpandoInitializer = exports.getDeclaredExpandoInitializer = exports.getEffectiveInitializer = exports.isAssignmentDeclaration = exports.isStringDoubleQuoted = exports.isSingleOrDoubleQuote = exports.isRequireVariableStatement = exports.isBindingElementOfBareOrAccessedRequire = exports.isVariableDeclarationInitializedToBareOrAccessedRequire = exports.isVariableDeclarationInitializedToRequire = exports.isRequireCall = exports.isJSDocIndexSignature = exports.isInJSDoc = exports.isSourceFileNotJson = exports.isInJsonFile = exports.isInJSFile = exports.isSourceFileNotJS = exports.isSourceFileJS = exports.isInternalModuleImportEqualsDeclaration = exports.getExternalModuleRequireArgument = exports.getExternalModuleImportEqualsDeclarationExpression = exports.isExternalModuleImportEqualsDeclaration = exports.isNamespaceReexportDeclaration = exports.isPartOfTypeQuery = exports.isInExpressionContext = exports.isExpressionNode = exports.isJSXTagName = exports.isEmptyStringLiteral = exports.classElementOrClassElementParameterIsDecorated = exports.classOrConstructorParameterIsDecorated = exports.childIsDecorated = exports.nodeOrChildIsDecorated = exports.nodeIsDecorated = exports.nodeCanBeDecorated = exports.getInvokedExpression = exports.getEntityNameFromTypeNode = exports.isThisInitializedObjectBindingExpression = exports.isThisInitializedDeclaration = exports.isThisProperty = exports.isSuperProperty = exports.isSuperOrSuperProperty = exports.getImmediatelyInvokedFunctionExpression = exports.getSuperContainer = exports.getNewTargetContainer = exports.isInTopLevelContext = exports.isThisContainerOrFunctionBlock = exports.getThisContainer = exports.getContainingFunctionOrClassStaticBlock = void 0;
exports.isNodeWithPossibleHoistedDeclaration = exports.isAssignmentTarget = exports.getAssignmentTargetKind = exports.hasTypeArguments = exports.getTypeParameterFromJsDoc = exports.getJSDocRoot = exports.getJSDocHost = exports.getEffectiveJSDocHost = exports.getHostSignatureFromJSDoc = exports.getEffectiveContainerForJSDocTemplateTag = exports.getParameterSymbolFromJSDoc = exports.getNextJSDocCommentLocation = exports.getJSDocCommentsAndTags = exports.canHaveJSDoc = exports.canHaveFlowNode = exports.getSingleVariableOfVariableStatement = exports.getSingleInitializerOfVariableStatementOrPropertyDeclaration = exports.isTypeAlias = exports.isJSDocTypeAlias = exports.isJSDocConstructSignature = exports.hasQuestionToken = exports.forEachImportClauseDeclaration = exports.isDefaultImport = exports.getNamespaceDeclarationNode = exports.getExternalModuleName = exports.tryGetImportFromModuleSpecifier = exports.importFromModuleSpecifier = exports.tryGetModuleSpecifierFromDeclaration = exports.isFunctionSymbol = exports.setValueDeclaration = exports.isSpecialPropertyDeclaration = exports.isPrototypePropertyAssignment = exports.getInitializerOfBinaryExpression = exports.getAssignmentDeclarationPropertyAccessKind = exports.getElementOrPropertyAccessName = exports.getElementOrPropertyAccessArgumentExpressionOrName = exports.getNameOrArgument = exports.isBindableStaticNameExpression = exports.isBindableStaticElementAccessExpression = exports.isBindableStaticAccessExpression = exports.isLiteralLikeElementAccess = exports.isLiteralLikeAccess = exports.isBindableObjectDefinePropertyCall = exports.getAssignmentDeclarationKind = exports.isModuleExportsAccessExpression = exports.isModuleIdentifier = exports.isExportsIdentifier = exports.getRightMostAssignedExpression = exports.isSameEntityName = exports.getNameOfExpando = void 0;
exports.isESSymbolIdentifier = exports.isPrivateIdentifierSymbol = exports.isKnownSymbol = exports.getSymbolNameForPrivateIdentifier = exports.getPropertyNameForUniqueESSymbol = exports.getEscapedTextOfIdentifierOrLiteral = exports.getTextOfIdentifierOrLiteral = exports.isPropertyNameLiteral = exports.getPropertyNameForPropertyNameNode = exports.isDynamicName = exports.hasDynamicName = exports.isSignedNumericLiteral = exports.isStringOrNumericLiteralLike = exports.isAsyncFunction = exports.getFunctionFlags = exports.isTrivia = exports.isIdentifierANonContextualKeyword = exports.isStringAKeyword = exports.isStringANonContextualKeyword = exports.isFutureReservedKeyword = exports.isNonContextualKeyword = exports.isContextualKeyword = exports.isKeywordOrPunctuation = exports.isPunctuation = exports.isKeyword = exports.getAncestor = exports.getHeritageClause = exports.getInterfaceBaseTypeNodes = exports.getAllSuperTypeNodes = exports.getEffectiveImplementsTypeNodes = exports.getClassExtendsHeritageElement = exports.getEffectiveBaseTypeNode = exports.getPropertyAssignmentAliasLikeExpression = exports.getExportAssignmentExpression = exports.exportAssignmentIsAlias = exports.isAliasableExpression = exports.getAliasDeclarationFromName = exports.isAliasSymbolDeclaration = exports.isIdentifierName = exports.isLiteralComputedPropertyDeclarationName = exports.getDeclarationFromName = exports.isDeclarationName = exports.isNodeDescendantOf = exports.isDeleteTarget = exports.skipParentheses = exports.skipTypeParentheses = exports.walkUpParenthesizedTypesAndGetParentAndChild = exports.walkUpParenthesizedExpressions = exports.walkUpParenthesizedTypes = exports.isValueSignatureDeclaration = void 0;
exports.getFirstConstructorWithBody = exports.getLineOfLocalPositionFromLineMap = exports.getLineOfLocalPosition = exports.writeFileEnsuringDirectories = exports.writeFile = exports.getSourceFilePathInNewDirWorker = exports.getSourceFilePathInNewDir = exports.sourceFileMayBeEmitted = exports.getSourceFilesToEmit = exports.getPathsBasePath = exports.outFile = exports.getPossibleOriginalInputExtensionForExtension = exports.getDeclarationEmitExtensionForPath = exports.getDeclarationEmitOutputFilePathWorker = exports.getDeclarationEmitOutputFilePath = exports.getOwnEmitOutputFilePath = exports.getExternalModuleNameFromPath = exports.getExternalModuleNameFromDeclaration = exports.getResolvedExternalModuleName = exports.hostGetCanonicalFileName = exports.hostUsesCaseSensitiveFileNames = exports.getTrailingSemicolonDeferringWriter = exports.createTextWriter = exports.isNightly = exports.getIndentSize = exports.getIndentString = exports.isIntrinsicJsxName = exports.stripQuotes = exports.escapeJsxAttributeString = exports.escapeNonAsciiString = exports.escapeString = exports.hasInvalidEscape = exports.createDiagnosticCollection = exports.getSemanticJsxChildren = exports.getBinaryOperatorPrecedence = exports.getOperatorPrecedence = exports.getOperator = exports.getExpressionPrecedence = exports.getOperatorAssociativity = exports.getExpressionAssociativity = exports.getOriginalSourceFile = exports.nodeIsSynthesized = exports.nodeStartsNewLexicalEnvironment = exports.getRootDeclaration = exports.isParameterDeclaration = exports.isPushOrUnshiftIdentifier = exports.isNamedEvaluation = exports.isNamedEvaluationSource = exports.isAnonymousFunctionDefinition = exports.isProtoSetter = void 0;
exports.isLeftHandSideOfAssignment = exports.isAssignmentExpression = exports.tryGetClassImplementingOrExtendingExpressionWithTypeArguments = exports.tryGetClassExtendingExpressionWithTypeArguments = exports.isAssignmentOperator = exports.isLogicalOrCoalescingBinaryExpression = exports.isLogicalOrCoalescingBinaryOperator = exports.isLogicalOrCoalescingAssignmentExpression = exports.isLogicalOrCoalescingAssignmentOperator = exports.isLogicalOperator = exports.modifierToFlag = exports.modifiersToFlags = exports.getSyntacticModifierFlagsNoCache = exports.getEffectiveModifierFlagsNoCache = exports.getSyntacticModifierFlags = exports.getEffectiveModifierFlagsAlwaysIncludeJSDoc = exports.getEffectiveModifierFlags = exports.getSelectedSyntacticModifierFlags = exports.getSelectedEffectiveModifierFlags = exports.hasDecorators = exports.hasEffectiveReadonlyModifier = exports.hasAccessorModifier = exports.hasAmbientModifier = exports.hasAbstractModifier = exports.hasOverrideModifier = exports.hasStaticModifier = exports.isStatic = exports.hasSyntacticModifier = exports.hasEffectiveModifier = exports.hasSyntacticModifiers = exports.hasEffectiveModifiers = exports.writeCommentRange = exports.emitDetachedComments = exports.emitComments = exports.emitNewLineBeforeLeadingCommentOfPosition = exports.emitNewLineBeforeLeadingCommentsOfPosition = exports.emitNewLineBeforeLeadingComments = exports.getEffectiveSetAccessorTypeAnnotationNode = exports.getJSDocTypeParameterDeclarations = exports.getEffectiveReturnTypeNode = exports.getTypeAnnotationNode = exports.getEffectiveTypeAnnotationNode = exports.getAllAccessorDeclarations = exports.identifierIsThisKeyword = exports.isThisInTypeQuery = exports.isThisIdentifier = exports.parameterIsThisKeyword = exports.getThisParameter = exports.getSetAccessorTypeAnnotationNode = exports.getSetAccessorValueParameter = void 0;
exports.getCombinedLocalAndExportSymbolFlags = exports.skipAlias = exports.getDeclarationModifierFlagsFromSymbol = exports.getCheckFlags = exports.closeFileWatcher = exports.isWatchSet = exports.isInitializedVariable = exports.getInitializedVariables = exports.isDeclarationNameOfEnumOrNamespace = exports.getLinesBetweenPositionAndNextNonWhitespaceCharacter = exports.getLinesBetweenPositionAndPrecedingNonWhitespaceCharacter = exports.getStartPositionOfRange = exports.positionsAreOnSameLine = exports.isNodeArrayMultiLine = exports.getLinesBetweenRangeEndPositions = exports.getLinesBetweenRangeEndAndRangeStart = exports.rangeEndIsOnSameLineAsRangeStart = exports.rangeStartIsOnSameLineAsRangeEnd = exports.rangeEndPositionsAreOnSameLine = exports.rangeStartPositionsAreOnSameLine = exports.rangeIsOnSingleLine = exports.createTokenRange = exports.isCollapsedRange = exports.moveRangePastModifiers = exports.moveRangePastDecorators = exports.moveRangePos = exports.moveRangeEnd = exports.createRange = exports.getNewLineCharacter = exports.directoryProbablyExists = exports.readJson = exports.readJsonOrUndefined = exports.base64decode = exports.base64encode = exports.convertToBase64 = exports.tryExtractTSExtension = exports.getLocalSymbolForExportDefault = exports.isEmptyArrayLiteral = exports.isEmptyObjectLiteral = exports.isRightSideOfQualifiedNameOrPropertyAccessOrJSDocMemberName = exports.isRightSideOfAccessExpression = exports.isRightSideOfQualifiedNameOrPropertyAccess = exports.isPrototypeAccess = exports.tryGetPropertyAccessOrIdentifierToString = exports.isPropertyAccessEntityNameExpression = exports.isDottedName = exports.getFirstIdentifier = exports.isEntityNameExpression = exports.isExpressionWithTypeArgumentsInClassExtendsClause = exports.isDestructuringAssignment = void 0;
exports.importNameElisionDisabled = exports.getIsolatedModules = exports.hasJsonModuleEmitEnabled = exports.getEmitModuleDetectionKind = exports.getEmitModuleResolutionKind = exports.emitModuleKindIsNonNodeESM = exports.getEmitModuleKind = exports.getEmitScriptTarget = exports.getSetExternalModuleIndicator = exports.getLanguageVariant = exports.compareDiagnosticsSkipRelatedInformation = exports.compareDiagnostics = exports.concatenateDiagnosticMessageChains = exports.chainDiagnosticMessages = exports.createCompilerDiagnosticFromMessageChain = exports.createCompilerDiagnostic = exports.formatMessage = exports.createFileDiagnostic = exports.attachFileToDiagnostics = exports.createDetachedDiagnostic = exports.getLocaleSpecificMessage = exports.maybeSetLocalizedDiagnosticMessages = exports.setLocalizedDiagnosticMessages = exports.formatStringFromArgs = exports.setObjectAllocator = exports.addObjectAllocatorPatcher = exports.objectAllocator = exports.getLeftmostExpression = exports.forEachNameInAccessChainWalkingLeft = exports.getLeftmostAccessExpression = exports.isNamedImportsOrExports = exports.isBundleFileTextLike = exports.getNameOfAccessExpression = exports.isAccessExpression = exports.isTypeNodeKind = exports.isObjectTypeDeclaration = exports.addToSeen = exports.getLastChild = exports.showModuleSpecifier = exports.isUMDExportSymbol = exports.forSomeAncestorDirectory = exports.getObjectFlags = exports.getClassLikeDeclarationOfSymbol = exports.isAbstractConstructorSymbol = exports.mutateMap = exports.mutateMapSkippingNewValues = exports.clearMap = exports.compareDataObjects = exports.isWriteAccess = exports.isWriteOnlyAccess = void 0;
exports.getModuleSpecifierEndingPreference = exports.usesExtensionsOnImports = exports.hasTSFileExtension = exports.hasJSFileExtension = exports.getSupportedExtensionsWithJsonIfResolveJsonModule = exports.getSupportedExtensions = exports.extensionsNotSupportingExtensionlessResolution = exports.supportedTSImplementationExtensions = exports.supportedDeclarationExtensions = exports.supportedJSExtensionsFlat = exports.supportedJSExtensions = exports.supportedTSExtensionsFlat = exports.supportedTSExtensions = exports.getScriptKindFromFileName = exports.ensureScriptKind = exports.matchFiles = exports.getRegexFromPattern = exports.getFileMatcherPatterns = exports.getPatternFromSpec = exports.isImplicitGlob = exports.getRegularExpressionsForWildcards = exports.getRegularExpressionForWildcard = exports.commonPackageFolders = exports.regExpEscape = exports.tryRemoveDirectoryPrefix = exports.createSymlinkCache = exports.hasZeroOrOneAsteriskCharacter = exports.getJSXRuntimeImport = exports.getJSXImplicitImportBase = exports.getJSXTransformEnabled = exports.getCompilerOptionValue = exports.compilerOptionsAffectDeclarationPath = exports.compilerOptionsAffectEmit = exports.compilerOptionsAffectSemanticDiagnostics = exports.getUseDefineForClassFields = exports.getAllowJSCompilerOption = exports.getStrictOptionValue = exports.isIncrementalCompilation = exports.shouldPreserveConstEnums = exports.getEmitDeclarations = exports.getResolveJsonModule = exports.getResolvePackageJsonImports = exports.getResolvePackageJsonExports = exports.shouldResolveJsRequire = exports.moduleResolutionSupportsPackageJsonExportsAndImports = exports.getAllowSyntheticDefaultImports = exports.getESModuleInterop = exports.getAreDeclarationMapsEnabled = exports.unusedLabelIsError = exports.unreachableCodeIsError = void 0;
exports.escapeSnippetText = exports.isFunctionExpressionOrArrowFunction = exports.isParameterOrCatchClauseVariable = exports.isCatchClauseVariableDeclaration = exports.isInfinityOrNaNString = exports.hasContextSensitiveParameters = exports.getContainingNodeArray = exports.containsIgnoredPath = exports.expressionResultIsUnused = exports.isPackedArrayLiteral = exports.setParentRecursive = exports.setEachParent = exports.setParent = exports.setNodeFlags = exports.setTextRangePosWidth = exports.setTextRangePosEnd = exports.setTextRangeEnd = exports.setTextRangePos = exports.arrayIsHomogeneous = exports.isIdentifierTypeReference = exports.isValidTypeOnlyAliasUseSite = exports.isValidBigIntString = exports.parseValidBigInt = exports.parseBigInt = exports.pseudoBigIntToString = exports.parsePseudoBigInt = exports.isJsonEqual = exports.skipTypeChecking = exports.rangeOfTypeParameters = exports.rangeOfNode = exports.minAndMax = exports.addRelatedInfo = exports.sliceAfter = exports.matchPatternOrExact = exports.emptyFileSystemEntries = exports.isCheckJsEnabledForFile = exports.tryGetExtensionFromPath = exports.isAnySupportedFileExtension = exports.extensionFromPath = exports.resolutionExtensionIsTSOrJson = exports.extensionIsTS = exports.positionIsSynthesized = exports.tryParsePatterns = exports.tryParsePattern = exports.changeExtension = exports.removeExtension = exports.tryRemoveExtension = exports.removeFileExtension = exports.compareNumberOfDirectorySeparators = exports.isSupportedSourceFileName = void 0;
exports.intrinsicTagNameToString = exports.getTextOfJsxNamespacedName = exports.getEscapedTextOfJsxNamespacedName = exports.isJsxAttributeName = exports.getTextOfJsxAttributeName = exports.getEscapedTextOfJsxAttributeName = exports.tryGetJSDocSatisfiesTypeNode = exports.getJSDocSatisfiesExpressionType = exports.isJSDocSatisfiesExpression = exports.isNonNullAccess = exports.isOptionalDeclaration = exports.isJSDocOptionalParameter = exports.hasTabstop = exports.canUsePropertyAccess = exports.isOptionalJSDocPropertyLikeTag = exports.canHaveExportModifier = exports.isTypeDeclaration = exports.getParameterTypeNode = exports.getNodeModulePathParts = exports.isThisTypeParameter = exports.createPropertyNameNodeForIdentifierOrLiteral = exports.isNumericLiteralName = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
exports.resolvingEmptyArray = [];
/** @internal */
exports.externalHelpersModuleNameText = "tslib";
/** @internal */
exports.defaultMaximumTruncationLength = 160;
/** @internal */
exports.noTruncationMaximumTruncationLength = 1000000;
/** @internal */
function getDeclarationOfKind(symbol, kind) {
    var declarations = symbol.declarations;
    if (declarations) {
        for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
            var declaration = declarations_1[_i];
            if (declaration.kind === kind) {
                return declaration;
            }
        }
    }
    return undefined;
}
exports.getDeclarationOfKind = getDeclarationOfKind;
/** @internal */
function getDeclarationsOfKind(symbol, kind) {
    return (0, ts_1.filter)(symbol.declarations || ts_1.emptyArray, function (d) { return d.kind === kind; });
}
exports.getDeclarationsOfKind = getDeclarationsOfKind;
/** @internal */
function createSymbolTable(symbols) {
    var result = new Map();
    if (symbols) {
        for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
            var symbol = symbols_1[_i];
            result.set(symbol.escapedName, symbol);
        }
    }
    return result;
}
exports.createSymbolTable = createSymbolTable;
/** @internal */
function isTransientSymbol(symbol) {
    return (symbol.flags & 33554432 /* SymbolFlags.Transient */) !== 0;
}
exports.isTransientSymbol = isTransientSymbol;
var stringWriter = createSingleLineStringWriter();
function createSingleLineStringWriter() {
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var str = "";
    /* eslint-enable no-var */
    var writeText = function (text) { return str += text; };
    return {
        getText: function () { return str; },
        write: writeText,
        rawWrite: writeText,
        writeKeyword: writeText,
        writeOperator: writeText,
        writePunctuation: writeText,
        writeSpace: writeText,
        writeStringLiteral: writeText,
        writeLiteral: writeText,
        writeParameter: writeText,
        writeProperty: writeText,
        writeSymbol: function (s, _) { return writeText(s); },
        writeTrailingSemicolon: writeText,
        writeComment: writeText,
        getTextPos: function () { return str.length; },
        getLine: function () { return 0; },
        getColumn: function () { return 0; },
        getIndent: function () { return 0; },
        isAtStartOfLine: function () { return false; },
        hasTrailingComment: function () { return false; },
        hasTrailingWhitespace: function () { return !!str.length && (0, ts_1.isWhiteSpaceLike)(str.charCodeAt(str.length - 1)); },
        // Completely ignore indentation for string writers.  And map newlines to
        // a single space.
        writeLine: function () { return str += " "; },
        increaseIndent: ts_1.noop,
        decreaseIndent: ts_1.noop,
        clear: function () { return str = ""; },
    };
}
/** @internal */
function changesAffectModuleResolution(oldOptions, newOptions) {
    return oldOptions.configFilePath !== newOptions.configFilePath ||
        optionsHaveModuleResolutionChanges(oldOptions, newOptions);
}
exports.changesAffectModuleResolution = changesAffectModuleResolution;
/** @internal */
function optionsHaveModuleResolutionChanges(oldOptions, newOptions) {
    return optionsHaveChanges(oldOptions, newOptions, ts_1.moduleResolutionOptionDeclarations);
}
exports.optionsHaveModuleResolutionChanges = optionsHaveModuleResolutionChanges;
/** @internal */
function changesAffectingProgramStructure(oldOptions, newOptions) {
    return optionsHaveChanges(oldOptions, newOptions, ts_1.optionsAffectingProgramStructure);
}
exports.changesAffectingProgramStructure = changesAffectingProgramStructure;
/** @internal */
function optionsHaveChanges(oldOptions, newOptions, optionDeclarations) {
    return oldOptions !== newOptions && optionDeclarations.some(function (o) {
        return !isJsonEqual(getCompilerOptionValue(oldOptions, o), getCompilerOptionValue(newOptions, o));
    });
}
exports.optionsHaveChanges = optionsHaveChanges;
/** @internal */
function forEachAncestor(node, callback) {
    while (true) {
        var res = callback(node);
        if (res === "quit")
            return undefined;
        if (res !== undefined)
            return res;
        if ((0, ts_1.isSourceFile)(node))
            return undefined;
        node = node.parent;
    }
}
exports.forEachAncestor = forEachAncestor;
/**
 * Calls `callback` for each entry in the map, returning the first truthy result.
 * Use `map.forEach` instead for normal iteration.
 *
 * @internal
 */
function forEachEntry(map, callback) {
    var iterator = map.entries();
    for (var _i = 0, iterator_1 = iterator; _i < iterator_1.length; _i++) {
        var _a = iterator_1[_i], key = _a[0], value = _a[1];
        var result = callback(value, key);
        if (result) {
            return result;
        }
    }
    return undefined;
}
exports.forEachEntry = forEachEntry;
/**
 * `forEachEntry` for just keys.
 *
 * @internal
 */
function forEachKey(map, callback) {
    var iterator = map.keys();
    for (var _i = 0, iterator_2 = iterator; _i < iterator_2.length; _i++) {
        var key = iterator_2[_i];
        var result = callback(key);
        if (result) {
            return result;
        }
    }
    return undefined;
}
exports.forEachKey = forEachKey;
/**
 * Copy entries from `source` to `target`.
 *
 * @internal
 */
function copyEntries(source, target) {
    source.forEach(function (value, key) {
        target.set(key, value);
    });
}
exports.copyEntries = copyEntries;
/** @internal */
function usingSingleLineStringWriter(action) {
    var oldString = stringWriter.getText();
    try {
        action(stringWriter);
        return stringWriter.getText();
    }
    finally {
        stringWriter.clear();
        stringWriter.writeKeyword(oldString);
    }
}
exports.usingSingleLineStringWriter = usingSingleLineStringWriter;
/** @internal */
function getFullWidth(node) {
    return node.end - node.pos;
}
exports.getFullWidth = getFullWidth;
/** @internal */
function getResolvedModule(sourceFile, moduleNameText, mode) {
    var _a, _b;
    return (_b = (_a = sourceFile === null || sourceFile === void 0 ? void 0 : sourceFile.resolvedModules) === null || _a === void 0 ? void 0 : _a.get(moduleNameText, mode)) === null || _b === void 0 ? void 0 : _b.resolvedModule;
}
exports.getResolvedModule = getResolvedModule;
/** @internal */
function setResolvedModule(sourceFile, moduleNameText, resolvedModule, mode) {
    if (!sourceFile.resolvedModules) {
        sourceFile.resolvedModules = (0, ts_1.createModeAwareCache)();
    }
    sourceFile.resolvedModules.set(moduleNameText, mode, resolvedModule);
}
exports.setResolvedModule = setResolvedModule;
/** @internal */
function setResolvedTypeReferenceDirective(sourceFile, typeReferenceDirectiveName, resolvedTypeReferenceDirective, mode) {
    if (!sourceFile.resolvedTypeReferenceDirectiveNames) {
        sourceFile.resolvedTypeReferenceDirectiveNames = (0, ts_1.createModeAwareCache)();
    }
    sourceFile.resolvedTypeReferenceDirectiveNames.set(typeReferenceDirectiveName, mode, resolvedTypeReferenceDirective);
}
exports.setResolvedTypeReferenceDirective = setResolvedTypeReferenceDirective;
/** @internal */
function getResolvedTypeReferenceDirective(sourceFile, typeReferenceDirectiveName, mode) {
    var _a, _b;
    return (_b = (_a = sourceFile === null || sourceFile === void 0 ? void 0 : sourceFile.resolvedTypeReferenceDirectiveNames) === null || _a === void 0 ? void 0 : _a.get(typeReferenceDirectiveName, mode)) === null || _b === void 0 ? void 0 : _b.resolvedTypeReferenceDirective;
}
exports.getResolvedTypeReferenceDirective = getResolvedTypeReferenceDirective;
/** @internal */
function projectReferenceIsEqualTo(oldRef, newRef) {
    return oldRef.path === newRef.path &&
        !oldRef.prepend === !newRef.prepend &&
        !oldRef.circular === !newRef.circular;
}
exports.projectReferenceIsEqualTo = projectReferenceIsEqualTo;
/** @internal */
function moduleResolutionIsEqualTo(oldResolution, newResolution) {
    return oldResolution === newResolution ||
        oldResolution.resolvedModule === newResolution.resolvedModule ||
        !!oldResolution.resolvedModule &&
            !!newResolution.resolvedModule &&
            oldResolution.resolvedModule.isExternalLibraryImport === newResolution.resolvedModule.isExternalLibraryImport &&
            oldResolution.resolvedModule.extension === newResolution.resolvedModule.extension &&
            oldResolution.resolvedModule.resolvedFileName === newResolution.resolvedModule.resolvedFileName &&
            oldResolution.resolvedModule.originalPath === newResolution.resolvedModule.originalPath &&
            packageIdIsEqual(oldResolution.resolvedModule.packageId, newResolution.resolvedModule.packageId) &&
            oldResolution.node10Result === newResolution.node10Result;
}
exports.moduleResolutionIsEqualTo = moduleResolutionIsEqualTo;
/** @internal */
function createModuleNotFoundChain(sourceFile, host, moduleReference, mode, packageName) {
    var _a, _b;
    var node10Result = (_b = (_a = sourceFile.resolvedModules) === null || _a === void 0 ? void 0 : _a.get(moduleReference, mode)) === null || _b === void 0 ? void 0 : _b.node10Result;
    var result = node10Result
        ? chainDiagnosticMessages(
        /*details*/ undefined, ts_1.Diagnostics.There_are_types_at_0_but_this_result_could_not_be_resolved_when_respecting_package_json_exports_The_1_library_may_need_to_update_its_package_json_or_typings, node10Result, node10Result.indexOf(ts_1.nodeModulesPathPart + "@types/") > -1 ? "@types/".concat((0, ts_1.mangleScopedPackageName)(packageName)) : packageName)
        : host.typesPackageExists(packageName)
            ? chainDiagnosticMessages(
            /*details*/ undefined, ts_1.Diagnostics.If_the_0_package_actually_exposes_this_module_consider_sending_a_pull_request_to_amend_https_Colon_Slash_Slashgithub_com_SlashDefinitelyTyped_SlashDefinitelyTyped_Slashtree_Slashmaster_Slashtypes_Slash_1, packageName, (0, ts_1.mangleScopedPackageName)(packageName))
            : host.packageBundlesTypes(packageName)
                ? chainDiagnosticMessages(
                /*details*/ undefined, ts_1.Diagnostics.If_the_0_package_actually_exposes_this_module_try_adding_a_new_declaration_d_ts_file_containing_declare_module_1, packageName, moduleReference)
                : chainDiagnosticMessages(
                /*details*/ undefined, ts_1.Diagnostics.Try_npm_i_save_dev_types_Slash_1_if_it_exists_or_add_a_new_declaration_d_ts_file_containing_declare_module_0, moduleReference, (0, ts_1.mangleScopedPackageName)(packageName));
    if (result)
        result.repopulateInfo = function () { return ({ moduleReference: moduleReference, mode: mode, packageName: packageName === moduleReference ? undefined : packageName }); };
    return result;
}
exports.createModuleNotFoundChain = createModuleNotFoundChain;
function packageIdIsEqual(a, b) {
    return a === b || !!a && !!b && a.name === b.name && a.subModuleName === b.subModuleName && a.version === b.version;
}
/** @internal */
function packageIdToPackageName(_a) {
    var name = _a.name, subModuleName = _a.subModuleName;
    return subModuleName ? "".concat(name, "/").concat(subModuleName) : name;
}
exports.packageIdToPackageName = packageIdToPackageName;
/** @internal */
function packageIdToString(packageId) {
    return "".concat(packageIdToPackageName(packageId), "@").concat(packageId.version);
}
exports.packageIdToString = packageIdToString;
/** @internal */
function typeDirectiveIsEqualTo(oldResolution, newResolution) {
    return oldResolution === newResolution ||
        oldResolution.resolvedTypeReferenceDirective === newResolution.resolvedTypeReferenceDirective ||
        !!oldResolution.resolvedTypeReferenceDirective &&
            !!newResolution.resolvedTypeReferenceDirective &&
            oldResolution.resolvedTypeReferenceDirective.resolvedFileName === newResolution.resolvedTypeReferenceDirective.resolvedFileName &&
            !!oldResolution.resolvedTypeReferenceDirective.primary === !!newResolution.resolvedTypeReferenceDirective.primary &&
            oldResolution.resolvedTypeReferenceDirective.originalPath === newResolution.resolvedTypeReferenceDirective.originalPath;
}
exports.typeDirectiveIsEqualTo = typeDirectiveIsEqualTo;
/** @internal */
function hasChangesInResolutions(names, newSourceFile, newResolutions, oldResolutions, comparer, nameAndModeGetter) {
    ts_1.Debug.assert(names.length === newResolutions.length);
    for (var i = 0; i < names.length; i++) {
        var newResolution = newResolutions[i];
        var entry = names[i];
        var name_1 = nameAndModeGetter.getName(entry);
        var mode = nameAndModeGetter.getMode(entry, newSourceFile);
        var oldResolution = oldResolutions && oldResolutions.get(name_1, mode);
        var changed = oldResolution
            ? !newResolution || !comparer(oldResolution, newResolution)
            : newResolution;
        if (changed) {
            return true;
        }
    }
    return false;
}
exports.hasChangesInResolutions = hasChangesInResolutions;
// Returns true if this node contains a parse error anywhere underneath it.
/** @internal */
function containsParseError(node) {
    aggregateChildData(node);
    return (node.flags & 524288 /* NodeFlags.ThisNodeOrAnySubNodesHasError */) !== 0;
}
exports.containsParseError = containsParseError;
function aggregateChildData(node) {
    if (!(node.flags & 1048576 /* NodeFlags.HasAggregatedChildData */)) {
        // A node is considered to contain a parse error if:
        //  a) the parser explicitly marked that it had an error
        //  b) any of it's children reported that it had an error.
        var thisNodeOrAnySubNodesHasError = ((node.flags & 131072 /* NodeFlags.ThisNodeHasError */) !== 0) ||
            (0, ts_1.forEachChild)(node, containsParseError);
        // If so, mark ourselves accordingly.
        if (thisNodeOrAnySubNodesHasError) {
            node.flags |= 524288 /* NodeFlags.ThisNodeOrAnySubNodesHasError */;
        }
        // Also mark that we've propagated the child information to this node.  This way we can
        // always consult the bit directly on this node without needing to check its children
        // again.
        node.flags |= 1048576 /* NodeFlags.HasAggregatedChildData */;
    }
}
/** @internal */
function getSourceFileOfNode(node) {
    while (node && node.kind !== 311 /* SyntaxKind.SourceFile */) {
        node = node.parent;
    }
    return node;
}
exports.getSourceFileOfNode = getSourceFileOfNode;
/** @internal */
function getSourceFileOfModule(module) {
    return getSourceFileOfNode(module.valueDeclaration || getNonAugmentationDeclaration(module));
}
exports.getSourceFileOfModule = getSourceFileOfModule;
/** @internal */
function isPlainJsFile(file, checkJs) {
    return !!file && (file.scriptKind === 1 /* ScriptKind.JS */ || file.scriptKind === 2 /* ScriptKind.JSX */) && !file.checkJsDirective && checkJs === undefined;
}
exports.isPlainJsFile = isPlainJsFile;
/** @internal */
function isStatementWithLocals(node) {
    switch (node.kind) {
        case 240 /* SyntaxKind.Block */:
        case 268 /* SyntaxKind.CaseBlock */:
        case 247 /* SyntaxKind.ForStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
            return true;
    }
    return false;
}
exports.isStatementWithLocals = isStatementWithLocals;
/** @internal */
function getStartPositionOfLine(line, sourceFile) {
    ts_1.Debug.assert(line >= 0);
    return (0, ts_1.getLineStarts)(sourceFile)[line];
}
exports.getStartPositionOfLine = getStartPositionOfLine;
// This is a useful function for debugging purposes.
/** @internal */
function nodePosToString(node) {
    var file = getSourceFileOfNode(node);
    var loc = (0, ts_1.getLineAndCharacterOfPosition)(file, node.pos);
    return "".concat(file.fileName, "(").concat(loc.line + 1, ",").concat(loc.character + 1, ")");
}
exports.nodePosToString = nodePosToString;
/** @internal */
function getEndLinePosition(line, sourceFile) {
    ts_1.Debug.assert(line >= 0);
    var lineStarts = (0, ts_1.getLineStarts)(sourceFile);
    var lineIndex = line;
    var sourceText = sourceFile.text;
    if (lineIndex + 1 === lineStarts.length) {
        // last line - return EOF
        return sourceText.length - 1;
    }
    else {
        // current line start
        var start = lineStarts[lineIndex];
        // take the start position of the next line - 1 = it should be some line break
        var pos = lineStarts[lineIndex + 1] - 1;
        ts_1.Debug.assert((0, ts_1.isLineBreak)(sourceText.charCodeAt(pos)));
        // walk backwards skipping line breaks, stop the the beginning of current line.
        // i.e:
        // <some text>
        // $ <- end of line for this position should match the start position
        while (start <= pos && (0, ts_1.isLineBreak)(sourceText.charCodeAt(pos))) {
            pos--;
        }
        return pos;
    }
}
exports.getEndLinePosition = getEndLinePosition;
/**
 * Returns a value indicating whether a name is unique globally or within the current file.
 * Note: This does not consider whether a name appears as a free identifier or not, so at the expression `x.y` this includes both `x` and `y`.
 *
 * @internal
 */
function isFileLevelUniqueName(sourceFile, name, hasGlobalName) {
    return !(hasGlobalName && hasGlobalName(name)) && !sourceFile.identifiers.has(name);
}
exports.isFileLevelUniqueName = isFileLevelUniqueName;
// Returns true if this node is missing from the actual source code. A 'missing' node is different
// from 'undefined/defined'. When a node is undefined (which can happen for optional nodes
// in the tree), it is definitely missing. However, a node may be defined, but still be
// missing.  This happens whenever the parser knows it needs to parse something, but can't
// get anything in the source code that it expects at that location. For example:
//
//          let a: ;
//
// Here, the Type in the Type-Annotation is not-optional (as there is a colon in the source
// code). So the parser will attempt to parse out a type, and will create an actual node.
// However, this node will be 'missing' in the sense that no actual source-code/tokens are
// contained within it.
/** @internal */
function nodeIsMissing(node) {
    if (node === undefined) {
        return true;
    }
    return node.pos === node.end && node.pos >= 0 && node.kind !== 1 /* SyntaxKind.EndOfFileToken */;
}
exports.nodeIsMissing = nodeIsMissing;
/** @internal */
function nodeIsPresent(node) {
    return !nodeIsMissing(node);
}
exports.nodeIsPresent = nodeIsPresent;
/**
 * Tests whether `child` is a grammar error on `parent`.
 * @internal
 */
function isGrammarError(parent, child) {
    if ((0, ts_1.isTypeParameterDeclaration)(parent))
        return child === parent.expression;
    if ((0, ts_1.isClassStaticBlockDeclaration)(parent))
        return child === parent.modifiers;
    if ((0, ts_1.isPropertySignature)(parent))
        return child === parent.initializer;
    if ((0, ts_1.isPropertyDeclaration)(parent))
        return child === parent.questionToken && (0, ts_1.isAutoAccessorPropertyDeclaration)(parent);
    if ((0, ts_1.isPropertyAssignment)(parent))
        return child === parent.modifiers || child === parent.questionToken || child === parent.exclamationToken || isGrammarErrorElement(parent.modifiers, child, ts_1.isModifierLike);
    if ((0, ts_1.isShorthandPropertyAssignment)(parent))
        return child === parent.equalsToken || child === parent.modifiers || child === parent.questionToken || child === parent.exclamationToken || isGrammarErrorElement(parent.modifiers, child, ts_1.isModifierLike);
    if ((0, ts_1.isMethodDeclaration)(parent))
        return child === parent.exclamationToken;
    if ((0, ts_1.isConstructorDeclaration)(parent))
        return child === parent.typeParameters || child === parent.type || isGrammarErrorElement(parent.typeParameters, child, ts_1.isTypeParameterDeclaration);
    if ((0, ts_1.isGetAccessorDeclaration)(parent))
        return child === parent.typeParameters || isGrammarErrorElement(parent.typeParameters, child, ts_1.isTypeParameterDeclaration);
    if ((0, ts_1.isSetAccessorDeclaration)(parent))
        return child === parent.typeParameters || child === parent.type || isGrammarErrorElement(parent.typeParameters, child, ts_1.isTypeParameterDeclaration);
    if ((0, ts_1.isNamespaceExportDeclaration)(parent))
        return child === parent.modifiers || isGrammarErrorElement(parent.modifiers, child, ts_1.isModifierLike);
    return false;
}
exports.isGrammarError = isGrammarError;
function isGrammarErrorElement(nodeArray, child, isElement) {
    if (!nodeArray || (0, ts_1.isArray)(child) || !isElement(child))
        return false;
    return (0, ts_1.contains)(nodeArray, child);
}
function insertStatementsAfterPrologue(to, from, isPrologueDirective) {
    if (from === undefined || from.length === 0)
        return to;
    var statementIndex = 0;
    // skip all prologue directives to insert at the correct position
    for (; statementIndex < to.length; ++statementIndex) {
        if (!isPrologueDirective(to[statementIndex])) {
            break;
        }
    }
    to.splice.apply(to, __spreadArray([statementIndex, 0], from, false));
    return to;
}
function insertStatementAfterPrologue(to, statement, isPrologueDirective) {
    if (statement === undefined)
        return to;
    var statementIndex = 0;
    // skip all prologue directives to insert at the correct position
    for (; statementIndex < to.length; ++statementIndex) {
        if (!isPrologueDirective(to[statementIndex])) {
            break;
        }
    }
    to.splice(statementIndex, 0, statement);
    return to;
}
function isAnyPrologueDirective(node) {
    return isPrologueDirective(node) || !!(getEmitFlags(node) & 2097152 /* EmitFlags.CustomPrologue */);
}
/**
 * Prepends statements to an array while taking care of prologue directives.
 *
 * @internal
 */
function insertStatementsAfterStandardPrologue(to, from) {
    return insertStatementsAfterPrologue(to, from, isPrologueDirective);
}
exports.insertStatementsAfterStandardPrologue = insertStatementsAfterStandardPrologue;
/** @internal */
function insertStatementsAfterCustomPrologue(to, from) {
    return insertStatementsAfterPrologue(to, from, isAnyPrologueDirective);
}
exports.insertStatementsAfterCustomPrologue = insertStatementsAfterCustomPrologue;
/**
 * Prepends statements to an array while taking care of prologue directives.
 *
 * @internal
 */
function insertStatementAfterStandardPrologue(to, statement) {
    return insertStatementAfterPrologue(to, statement, isPrologueDirective);
}
exports.insertStatementAfterStandardPrologue = insertStatementAfterStandardPrologue;
/** @internal */
function insertStatementAfterCustomPrologue(to, statement) {
    return insertStatementAfterPrologue(to, statement, isAnyPrologueDirective);
}
exports.insertStatementAfterCustomPrologue = insertStatementAfterCustomPrologue;
/**
 * Determine if the given comment is a triple-slash
 *
 * @return true if the comment is a triple-slash comment else false
 *
 * @internal
 */
function isRecognizedTripleSlashComment(text, commentPos, commentEnd) {
    // Verify this is /// comment, but do the regexp match only when we first can find /// in the comment text
    // so that we don't end up computing comment string and doing match for all // comments
    if (text.charCodeAt(commentPos + 1) === 47 /* CharacterCodes.slash */ &&
        commentPos + 2 < commentEnd &&
        text.charCodeAt(commentPos + 2) === 47 /* CharacterCodes.slash */) {
        var textSubStr = text.substring(commentPos, commentEnd);
        return exports.fullTripleSlashReferencePathRegEx.test(textSubStr) ||
            exports.fullTripleSlashAMDReferencePathRegEx.test(textSubStr) ||
            fullTripleSlashAMDModuleRegEx.test(textSubStr) ||
            fullTripleSlashReferenceTypeReferenceDirectiveRegEx.test(textSubStr) ||
            fullTripleSlashLibReferenceRegEx.test(textSubStr) ||
            defaultLibReferenceRegEx.test(textSubStr) ?
            true : false;
    }
    return false;
}
exports.isRecognizedTripleSlashComment = isRecognizedTripleSlashComment;
/** @internal */
function isPinnedComment(text, start) {
    return text.charCodeAt(start + 1) === 42 /* CharacterCodes.asterisk */ &&
        text.charCodeAt(start + 2) === 33 /* CharacterCodes.exclamation */;
}
exports.isPinnedComment = isPinnedComment;
/** @internal */
function createCommentDirectivesMap(sourceFile, commentDirectives) {
    var directivesByLine = new Map(commentDirectives.map(function (commentDirective) { return ([
        "".concat((0, ts_1.getLineAndCharacterOfPosition)(sourceFile, commentDirective.range.end).line),
        commentDirective,
    ]); }));
    var usedLines = new Map();
    return { getUnusedExpectations: getUnusedExpectations, markUsed: markUsed };
    function getUnusedExpectations() {
        return (0, ts_1.arrayFrom)(directivesByLine.entries())
            .filter(function (_a) {
            var line = _a[0], directive = _a[1];
            return directive.type === 0 /* CommentDirectiveType.ExpectError */ && !usedLines.get(line);
        })
            .map(function (_a) {
            var _ = _a[0], directive = _a[1];
            return directive;
        });
    }
    function markUsed(line) {
        if (!directivesByLine.has("".concat(line))) {
            return false;
        }
        usedLines.set("".concat(line), true);
        return true;
    }
}
exports.createCommentDirectivesMap = createCommentDirectivesMap;
/** @internal */
function getTokenPosOfNode(node, sourceFile, includeJsDoc) {
    // With nodes that have no width (i.e. 'Missing' nodes), we actually *don't*
    // want to skip trivia because this will launch us forward to the next token.
    if (nodeIsMissing(node)) {
        return node.pos;
    }
    if ((0, ts_1.isJSDocNode)(node) || node.kind === 12 /* SyntaxKind.JsxText */) {
        // JsxText cannot actually contain comments, even though the scanner will think it sees comments
        return (0, ts_1.skipTrivia)((sourceFile || getSourceFileOfNode(node)).text, node.pos, /*stopAfterLineBreak*/ false, /*stopAtComments*/ true);
    }
    if (includeJsDoc && (0, ts_1.hasJSDocNodes)(node)) {
        return getTokenPosOfNode(node.jsDoc[0], sourceFile);
    }
    // For a syntax list, it is possible that one of its children has JSDocComment nodes, while
    // the syntax list itself considers them as normal trivia. Therefore if we simply skip
    // trivia for the list, we may have skipped the JSDocComment as well. So we should process its
    // first child to determine the actual position of its first token.
    if (node.kind === 357 /* SyntaxKind.SyntaxList */ && node._children.length > 0) {
        return getTokenPosOfNode(node._children[0], sourceFile, includeJsDoc);
    }
    return (0, ts_1.skipTrivia)((sourceFile || getSourceFileOfNode(node)).text, node.pos, 
    /*stopAfterLineBreak*/ false, 
    /*stopAtComments*/ false, isInJSDoc(node));
}
exports.getTokenPosOfNode = getTokenPosOfNode;
/** @internal */
function getNonDecoratorTokenPosOfNode(node, sourceFile) {
    var lastDecorator = !nodeIsMissing(node) && (0, ts_1.canHaveModifiers)(node) ? (0, ts_1.findLast)(node.modifiers, ts_1.isDecorator) : undefined;
    if (!lastDecorator) {
        return getTokenPosOfNode(node, sourceFile);
    }
    return (0, ts_1.skipTrivia)((sourceFile || getSourceFileOfNode(node)).text, lastDecorator.end);
}
exports.getNonDecoratorTokenPosOfNode = getNonDecoratorTokenPosOfNode;
/** @internal */
function getSourceTextOfNodeFromSourceFile(sourceFile, node, includeTrivia) {
    if (includeTrivia === void 0) { includeTrivia = false; }
    return getTextOfNodeFromSourceText(sourceFile.text, node, includeTrivia);
}
exports.getSourceTextOfNodeFromSourceFile = getSourceTextOfNodeFromSourceFile;
function isJSDocTypeExpressionOrChild(node) {
    return !!(0, ts_1.findAncestor)(node, ts_1.isJSDocTypeExpression);
}
/** @internal */
function isExportNamespaceAsDefaultDeclaration(node) {
    return !!((0, ts_1.isExportDeclaration)(node) && node.exportClause && (0, ts_1.isNamespaceExport)(node.exportClause) && node.exportClause.name.escapedText === "default");
}
exports.isExportNamespaceAsDefaultDeclaration = isExportNamespaceAsDefaultDeclaration;
/** @internal */
function getTextOfNodeFromSourceText(sourceText, node, includeTrivia) {
    if (includeTrivia === void 0) { includeTrivia = false; }
    if (nodeIsMissing(node)) {
        return "";
    }
    var text = sourceText.substring(includeTrivia ? node.pos : (0, ts_1.skipTrivia)(sourceText, node.pos), node.end);
    if (isJSDocTypeExpressionOrChild(node)) {
        // strip space + asterisk at line start
        text = text.split(/\r\n|\n|\r/).map(function (line) { return (0, ts_1.trimStringStart)(line.replace(/^\s*\*/, "")); }).join("\n");
    }
    return text;
}
exports.getTextOfNodeFromSourceText = getTextOfNodeFromSourceText;
/** @internal */
function getTextOfNode(node, includeTrivia) {
    if (includeTrivia === void 0) { includeTrivia = false; }
    return getSourceTextOfNodeFromSourceFile(getSourceFileOfNode(node), node, includeTrivia);
}
exports.getTextOfNode = getTextOfNode;
function getPos(range) {
    return range.pos;
}
/**
 * Note: it is expected that the `nodeArray` and the `node` are within the same file.
 * For example, searching for a `SourceFile` in a `SourceFile[]` wouldn't work.
 *
 * @internal
 */
function indexOfNode(nodeArray, node) {
    return (0, ts_1.binarySearch)(nodeArray, node, getPos, ts_1.compareValues);
}
exports.indexOfNode = indexOfNode;
/**
 * Gets flags that control emit behavior of a node.
 *
 * @internal
 */
function getEmitFlags(node) {
    var emitNode = node.emitNode;
    return emitNode && emitNode.flags || 0;
}
exports.getEmitFlags = getEmitFlags;
/**
 * Gets flags that control emit behavior of a node.
 *
 * @internal
 */
function getInternalEmitFlags(node) {
    var emitNode = node.emitNode;
    return emitNode && emitNode.internalFlags || 0;
}
exports.getInternalEmitFlags = getInternalEmitFlags;
/** @internal */
function getScriptTargetFeatures() {
    return new Map(Object.entries({
        Array: new Map(Object.entries({
            es2015: [
                "find",
                "findIndex",
                "fill",
                "copyWithin",
                "entries",
                "keys",
                "values"
            ],
            es2016: [
                "includes"
            ],
            es2019: [
                "flat",
                "flatMap"
            ],
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Iterator: new Map(Object.entries({
            es2015: ts_1.emptyArray,
        })),
        AsyncIterator: new Map(Object.entries({
            es2015: ts_1.emptyArray,
        })),
        Atomics: new Map(Object.entries({
            es2017: ts_1.emptyArray,
        })),
        SharedArrayBuffer: new Map(Object.entries({
            es2017: ts_1.emptyArray,
        })),
        AsyncIterable: new Map(Object.entries({
            es2018: ts_1.emptyArray,
        })),
        AsyncIterableIterator: new Map(Object.entries({
            es2018: ts_1.emptyArray,
        })),
        AsyncGenerator: new Map(Object.entries({
            es2018: ts_1.emptyArray,
        })),
        AsyncGeneratorFunction: new Map(Object.entries({
            es2018: ts_1.emptyArray,
        })),
        RegExp: new Map(Object.entries({
            es2015: [
                "flags",
                "sticky",
                "unicode"
            ],
            es2018: [
                "dotAll"
            ]
        })),
        Reflect: new Map(Object.entries({
            es2015: [
                "apply",
                "construct",
                "defineProperty",
                "deleteProperty",
                "get",
                " getOwnPropertyDescriptor",
                "getPrototypeOf",
                "has",
                "isExtensible",
                "ownKeys",
                "preventExtensions",
                "set",
                "setPrototypeOf"
            ]
        })),
        ArrayConstructor: new Map(Object.entries({
            es2015: [
                "from",
                "of"
            ]
        })),
        ObjectConstructor: new Map(Object.entries({
            es2015: [
                "assign",
                "getOwnPropertySymbols",
                "keys",
                "is",
                "setPrototypeOf"
            ],
            es2017: [
                "values",
                "entries",
                "getOwnPropertyDescriptors"
            ],
            es2019: [
                "fromEntries"
            ],
            es2022: [
                "hasOwn"
            ]
        })),
        NumberConstructor: new Map(Object.entries({
            es2015: [
                "isFinite",
                "isInteger",
                "isNaN",
                "isSafeInteger",
                "parseFloat",
                "parseInt"
            ]
        })),
        Math: new Map(Object.entries({
            es2015: [
                "clz32",
                "imul",
                "sign",
                "log10",
                "log2",
                "log1p",
                "expm1",
                "cosh",
                "sinh",
                "tanh",
                "acosh",
                "asinh",
                "atanh",
                "hypot",
                "trunc",
                "fround",
                "cbrt"
            ]
        })),
        Map: new Map(Object.entries({
            es2015: [
                "entries",
                "keys",
                "values"
            ]
        })),
        Set: new Map(Object.entries({
            es2015: [
                "entries",
                "keys",
                "values"
            ]
        })),
        PromiseConstructor: new Map(Object.entries({
            es2015: [
                "all",
                "race",
                "reject",
                "resolve"
            ],
            es2020: [
                "allSettled"
            ],
            es2021: [
                "any"
            ]
        })),
        Symbol: new Map(Object.entries({
            es2015: [
                "for",
                "keyFor"
            ],
            es2019: [
                "description"
            ]
        })),
        WeakMap: new Map(Object.entries({
            es2015: [
                "entries",
                "keys",
                "values"
            ]
        })),
        WeakSet: new Map(Object.entries({
            es2015: [
                "entries",
                "keys",
                "values"
            ]
        })),
        String: new Map(Object.entries({
            es2015: [
                "codePointAt",
                "includes",
                "endsWith",
                "normalize",
                "repeat",
                "startsWith",
                "anchor",
                "big",
                "blink",
                "bold",
                "fixed",
                "fontcolor",
                "fontsize",
                "italics",
                "link",
                "small",
                "strike",
                "sub",
                "sup"
            ],
            es2017: [
                "padStart",
                "padEnd"
            ],
            es2019: [
                "trimStart",
                "trimEnd",
                "trimLeft",
                "trimRight"
            ],
            es2020: [
                "matchAll"
            ],
            es2021: [
                "replaceAll"
            ],
            es2022: [
                "at"
            ]
        })),
        StringConstructor: new Map(Object.entries({
            es2015: [
                "fromCodePoint",
                "raw"
            ]
        })),
        DateTimeFormat: new Map(Object.entries({
            es2017: [
                "formatToParts"
            ]
        })),
        Promise: new Map(Object.entries({
            es2015: ts_1.emptyArray,
            es2018: [
                "finally"
            ]
        })),
        RegExpMatchArray: new Map(Object.entries({
            es2018: [
                "groups"
            ]
        })),
        RegExpExecArray: new Map(Object.entries({
            es2018: [
                "groups"
            ]
        })),
        Intl: new Map(Object.entries({
            es2018: [
                "PluralRules"
            ]
        })),
        NumberFormat: new Map(Object.entries({
            es2018: [
                "formatToParts"
            ]
        })),
        SymbolConstructor: new Map(Object.entries({
            es2020: [
                "matchAll"
            ]
        })),
        DataView: new Map(Object.entries({
            es2020: [
                "setBigInt64",
                "setBigUint64",
                "getBigInt64",
                "getBigUint64"
            ]
        })),
        BigInt: new Map(Object.entries({
            es2020: ts_1.emptyArray
        })),
        RelativeTimeFormat: new Map(Object.entries({
            es2020: [
                "format",
                "formatToParts",
                "resolvedOptions"
            ]
        })),
        Int8Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Uint8Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Uint8ClampedArray: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Int16Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Uint16Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Int32Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Uint32Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Float32Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Float64Array: new Map(Object.entries({
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        BigInt64Array: new Map(Object.entries({
            es2020: ts_1.emptyArray,
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        BigUint64Array: new Map(Object.entries({
            es2020: ts_1.emptyArray,
            es2022: [
                "at"
            ],
            es2023: [
                "findLastIndex",
                "findLast"
            ],
        })),
        Error: new Map(Object.entries({
            es2022: [
                "cause"
            ]
        })),
    }));
}
exports.getScriptTargetFeatures = getScriptTargetFeatures;
/** @internal */
function getLiteralText(node, sourceFile, flags) {
    var _a;
    // If we don't need to downlevel and we can reach the original source text using
    // the node's parent reference, then simply get the text as it was originally written.
    if (sourceFile && canUseOriginalText(node, flags)) {
        return getSourceTextOfNodeFromSourceFile(sourceFile, node);
    }
    // If we can't reach the original source text, use the canonical form if it's a number,
    // or a (possibly escaped) quoted form of the original text if it's string-like.
    switch (node.kind) {
        case 11 /* SyntaxKind.StringLiteral */: {
            var escapeText = flags & 2 /* GetLiteralTextFlags.JsxAttributeEscape */ ? escapeJsxAttributeString :
                flags & 1 /* GetLiteralTextFlags.NeverAsciiEscape */ || (getEmitFlags(node) & 16777216 /* EmitFlags.NoAsciiEscaping */) ? escapeString :
                    escapeNonAsciiString;
            if (node.singleQuote) {
                return "'" + escapeText(node.text, 39 /* CharacterCodes.singleQuote */) + "'";
            }
            else {
                return '"' + escapeText(node.text, 34 /* CharacterCodes.doubleQuote */) + '"';
            }
        }
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 16 /* SyntaxKind.TemplateHead */:
        case 17 /* SyntaxKind.TemplateMiddle */:
        case 18 /* SyntaxKind.TemplateTail */: {
            // If a NoSubstitutionTemplateLiteral appears to have a substitution in it, the original text
            // had to include a backslash: `not \${a} substitution`.
            var escapeText = flags & 1 /* GetLiteralTextFlags.NeverAsciiEscape */ || (getEmitFlags(node) & 16777216 /* EmitFlags.NoAsciiEscaping */) ? escapeString :
                escapeNonAsciiString;
            var rawText = (_a = node.rawText) !== null && _a !== void 0 ? _a : escapeTemplateSubstitution(escapeText(node.text, 96 /* CharacterCodes.backtick */));
            switch (node.kind) {
                case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
                    return "`" + rawText + "`";
                case 16 /* SyntaxKind.TemplateHead */:
                    return "`" + rawText + "${";
                case 17 /* SyntaxKind.TemplateMiddle */:
                    return "}" + rawText + "${";
                case 18 /* SyntaxKind.TemplateTail */:
                    return "}" + rawText + "`";
            }
            break;
        }
        case 9 /* SyntaxKind.NumericLiteral */:
        case 10 /* SyntaxKind.BigIntLiteral */:
            return node.text;
        case 14 /* SyntaxKind.RegularExpressionLiteral */:
            if (flags & 4 /* GetLiteralTextFlags.TerminateUnterminatedLiterals */ && node.isUnterminated) {
                return node.text + (node.text.charCodeAt(node.text.length - 1) === 92 /* CharacterCodes.backslash */ ? " /" : "/");
            }
            return node.text;
    }
    return ts_1.Debug.fail("Literal kind '".concat(node.kind, "' not accounted for."));
}
exports.getLiteralText = getLiteralText;
function canUseOriginalText(node, flags) {
    if (nodeIsSynthesized(node) || !node.parent || (flags & 4 /* GetLiteralTextFlags.TerminateUnterminatedLiterals */ && node.isUnterminated)) {
        return false;
    }
    if ((0, ts_1.isNumericLiteral)(node)) {
        if (node.numericLiteralFlags & 26656 /* TokenFlags.IsInvalid */) {
            return false;
        }
        if (node.numericLiteralFlags & 512 /* TokenFlags.ContainsSeparator */) {
            return !!(flags & 8 /* GetLiteralTextFlags.AllowNumericSeparator */);
        }
    }
    return !(0, ts_1.isBigIntLiteral)(node);
}
/** @internal */
function getTextOfConstantValue(value) {
    return (0, ts_1.isString)(value) ? '"' + escapeNonAsciiString(value) + '"' : "" + value;
}
exports.getTextOfConstantValue = getTextOfConstantValue;
// Make an identifier from an external module name by extracting the string after the last "/" and replacing
// all non-alphanumeric characters with underscores
/** @internal */
function makeIdentifierFromModuleName(moduleName) {
    return (0, ts_1.getBaseFileName)(moduleName).replace(/^(\d)/, "_$1").replace(/\W/g, "_");
}
exports.makeIdentifierFromModuleName = makeIdentifierFromModuleName;
/** @internal */
function isBlockOrCatchScoped(declaration) {
    return ((0, ts_1.getCombinedNodeFlags)(declaration) & 3 /* NodeFlags.BlockScoped */) !== 0 ||
        isCatchClauseVariableDeclarationOrBindingElement(declaration);
}
exports.isBlockOrCatchScoped = isBlockOrCatchScoped;
/** @internal */
function isCatchClauseVariableDeclarationOrBindingElement(declaration) {
    var node = getRootDeclaration(declaration);
    return node.kind === 259 /* SyntaxKind.VariableDeclaration */ && node.parent.kind === 298 /* SyntaxKind.CatchClause */;
}
exports.isCatchClauseVariableDeclarationOrBindingElement = isCatchClauseVariableDeclarationOrBindingElement;
/** @internal */
function isAmbientModule(node) {
    return (0, ts_1.isModuleDeclaration)(node) && (node.name.kind === 11 /* SyntaxKind.StringLiteral */ || isGlobalScopeAugmentation(node));
}
exports.isAmbientModule = isAmbientModule;
/** @internal */
function isModuleWithStringLiteralName(node) {
    return (0, ts_1.isModuleDeclaration)(node) && node.name.kind === 11 /* SyntaxKind.StringLiteral */;
}
exports.isModuleWithStringLiteralName = isModuleWithStringLiteralName;
/** @internal */
function isNonGlobalAmbientModule(node) {
    return (0, ts_1.isModuleDeclaration)(node) && (0, ts_1.isStringLiteral)(node.name);
}
exports.isNonGlobalAmbientModule = isNonGlobalAmbientModule;
/**
 * An effective module (namespace) declaration is either
 * 1. An actual declaration: namespace X { ... }
 * 2. A Javascript declaration, which is:
 *    An identifier in a nested property access expression: Y in `X.Y.Z = { ... }`
 *
 * @internal
 */
function isEffectiveModuleDeclaration(node) {
    return (0, ts_1.isModuleDeclaration)(node) || (0, ts_1.isIdentifier)(node);
}
exports.isEffectiveModuleDeclaration = isEffectiveModuleDeclaration;
/**
 * Given a symbol for a module, checks that it is a shorthand ambient module.
 *
 * @internal
 */
function isShorthandAmbientModuleSymbol(moduleSymbol) {
    return isShorthandAmbientModule(moduleSymbol.valueDeclaration);
}
exports.isShorthandAmbientModuleSymbol = isShorthandAmbientModuleSymbol;
function isShorthandAmbientModule(node) {
    // The only kind of module that can be missing a body is a shorthand ambient module.
    return !!node && node.kind === 266 /* SyntaxKind.ModuleDeclaration */ && (!node.body);
}
/** @internal */
function isBlockScopedContainerTopLevel(node) {
    return node.kind === 311 /* SyntaxKind.SourceFile */ ||
        node.kind === 266 /* SyntaxKind.ModuleDeclaration */ ||
        (0, ts_1.isFunctionLikeOrClassStaticBlockDeclaration)(node);
}
exports.isBlockScopedContainerTopLevel = isBlockScopedContainerTopLevel;
/** @internal */
function isGlobalScopeAugmentation(module) {
    return !!(module.flags & 1024 /* NodeFlags.GlobalAugmentation */);
}
exports.isGlobalScopeAugmentation = isGlobalScopeAugmentation;
/** @internal */
function isExternalModuleAugmentation(node) {
    return isAmbientModule(node) && isModuleAugmentationExternal(node);
}
exports.isExternalModuleAugmentation = isExternalModuleAugmentation;
/** @internal */
function isModuleAugmentationExternal(node) {
    // external module augmentation is a ambient module declaration that is either:
    // - defined in the top level scope and source file is an external module
    // - defined inside ambient module declaration located in the top level scope and source file not an external module
    switch (node.parent.kind) {
        case 311 /* SyntaxKind.SourceFile */:
            return (0, ts_1.isExternalModule)(node.parent);
        case 267 /* SyntaxKind.ModuleBlock */:
            return isAmbientModule(node.parent.parent) && (0, ts_1.isSourceFile)(node.parent.parent.parent) && !(0, ts_1.isExternalModule)(node.parent.parent.parent);
    }
    return false;
}
exports.isModuleAugmentationExternal = isModuleAugmentationExternal;
/** @internal */
function getNonAugmentationDeclaration(symbol) {
    var _a;
    return (_a = symbol.declarations) === null || _a === void 0 ? void 0 : _a.find(function (d) { return !isExternalModuleAugmentation(d) && !((0, ts_1.isModuleDeclaration)(d) && isGlobalScopeAugmentation(d)); });
}
exports.getNonAugmentationDeclaration = getNonAugmentationDeclaration;
function isCommonJSContainingModuleKind(kind) {
    return kind === ts_1.ModuleKind.CommonJS || kind === ts_1.ModuleKind.Node16 || kind === ts_1.ModuleKind.NodeNext;
}
/** @internal */
function isEffectiveExternalModule(node, compilerOptions) {
    return (0, ts_1.isExternalModule)(node) || (isCommonJSContainingModuleKind(getEmitModuleKind(compilerOptions)) && !!node.commonJsModuleIndicator);
}
exports.isEffectiveExternalModule = isEffectiveExternalModule;
/**
 * Returns whether the source file will be treated as if it were in strict mode at runtime.
 *
 * @internal
 */
function isEffectiveStrictModeSourceFile(node, compilerOptions) {
    // We can only verify strict mode for JS/TS files
    switch (node.scriptKind) {
        case 1 /* ScriptKind.JS */:
        case 3 /* ScriptKind.TS */:
        case 2 /* ScriptKind.JSX */:
        case 4 /* ScriptKind.TSX */:
            break;
        default:
            return false;
    }
    // Strict mode does not matter for declaration files.
    if (node.isDeclarationFile) {
        return false;
    }
    // If `alwaysStrict` is set, then treat the file as strict.
    if (getStrictOptionValue(compilerOptions, "alwaysStrict")) {
        return true;
    }
    // Starting with a "use strict" directive indicates the file is strict.
    if ((0, ts_1.startsWithUseStrict)(node.statements)) {
        return true;
    }
    if ((0, ts_1.isExternalModule)(node) || getIsolatedModules(compilerOptions)) {
        // ECMAScript Modules are always strict.
        if (getEmitModuleKind(compilerOptions) >= ts_1.ModuleKind.ES2015) {
            return true;
        }
        // Other modules are strict unless otherwise specified.
        return !compilerOptions.noImplicitUseStrict;
    }
    return false;
}
exports.isEffectiveStrictModeSourceFile = isEffectiveStrictModeSourceFile;
/** @internal */
function isAmbientPropertyDeclaration(node) {
    return !!(node.flags & 16777216 /* NodeFlags.Ambient */) || hasSyntacticModifier(node, 2 /* ModifierFlags.Ambient */);
}
exports.isAmbientPropertyDeclaration = isAmbientPropertyDeclaration;
/** @internal */
function isBlockScope(node, parentNode) {
    switch (node.kind) {
        case 311 /* SyntaxKind.SourceFile */:
        case 268 /* SyntaxKind.CaseBlock */:
        case 298 /* SyntaxKind.CatchClause */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 247 /* SyntaxKind.ForStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
        case 175 /* SyntaxKind.Constructor */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
            return true;
        case 240 /* SyntaxKind.Block */:
            // function block is not considered block-scope container
            // see comment in binder.ts: bind(...), case for SyntaxKind.Block
            return !(0, ts_1.isFunctionLikeOrClassStaticBlockDeclaration)(parentNode);
    }
    return false;
}
exports.isBlockScope = isBlockScope;
/** @internal */
function isDeclarationWithTypeParameters(node) {
    ts_1.Debug.type(node);
    switch (node.kind) {
        case 344 /* SyntaxKind.JSDocCallbackTag */:
        case 352 /* SyntaxKind.JSDocTypedefTag */:
        case 329 /* SyntaxKind.JSDocSignature */:
            return true;
        default:
            (0, ts_1.assertType)(node);
            return isDeclarationWithTypeParameterChildren(node);
    }
}
exports.isDeclarationWithTypeParameters = isDeclarationWithTypeParameters;
/** @internal */
function isDeclarationWithTypeParameterChildren(node) {
    ts_1.Debug.type(node);
    switch (node.kind) {
        case 178 /* SyntaxKind.CallSignature */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 183 /* SyntaxKind.FunctionType */:
        case 184 /* SyntaxKind.ConstructorType */:
        case 323 /* SyntaxKind.JSDocFunctionType */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 351 /* SyntaxKind.JSDocTemplateTag */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 175 /* SyntaxKind.Constructor */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
            return true;
        default:
            (0, ts_1.assertType)(node);
            return false;
    }
}
exports.isDeclarationWithTypeParameterChildren = isDeclarationWithTypeParameterChildren;
/** @internal */
function isAnyImportSyntax(node) {
    switch (node.kind) {
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            return true;
        default:
            return false;
    }
}
exports.isAnyImportSyntax = isAnyImportSyntax;
/** @internal */
function isAnyImportOrBareOrAccessedRequire(node) {
    return isAnyImportSyntax(node) || isVariableDeclarationInitializedToBareOrAccessedRequire(node);
}
exports.isAnyImportOrBareOrAccessedRequire = isAnyImportOrBareOrAccessedRequire;
/** @internal */
function isLateVisibilityPaintedStatement(node) {
    switch (node.kind) {
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
        case 242 /* SyntaxKind.VariableStatement */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 265 /* SyntaxKind.EnumDeclaration */:
            return true;
        default:
            return false;
    }
}
exports.isLateVisibilityPaintedStatement = isLateVisibilityPaintedStatement;
/** @internal */
function hasPossibleExternalModuleReference(node) {
    return isAnyImportOrReExport(node) || (0, ts_1.isModuleDeclaration)(node) || (0, ts_1.isImportTypeNode)(node) || isImportCall(node);
}
exports.hasPossibleExternalModuleReference = hasPossibleExternalModuleReference;
/** @internal */
function isAnyImportOrReExport(node) {
    return isAnyImportSyntax(node) || (0, ts_1.isExportDeclaration)(node);
}
exports.isAnyImportOrReExport = isAnyImportOrReExport;
// Gets the nearest enclosing block scope container that has the provided node
// as a descendant, that is not the provided node.
/** @internal */
function getEnclosingBlockScopeContainer(node) {
    return (0, ts_1.findAncestor)(node.parent, function (current) { return isBlockScope(current, current.parent); });
}
exports.getEnclosingBlockScopeContainer = getEnclosingBlockScopeContainer;
/** @internal */
function forEachEnclosingBlockScopeContainer(node, cb) {
    var container = getEnclosingBlockScopeContainer(node);
    while (container) {
        cb(container);
        container = getEnclosingBlockScopeContainer(container);
    }
}
exports.forEachEnclosingBlockScopeContainer = forEachEnclosingBlockScopeContainer;
// Return display name of an identifier
// Computed property names will just be emitted as "[<expr>]", where <expr> is the source
// text of the expression in the computed property.
/** @internal */
function declarationNameToString(name) {
    return !name || getFullWidth(name) === 0 ? "(Missing)" : getTextOfNode(name);
}
exports.declarationNameToString = declarationNameToString;
/** @internal */
function getNameFromIndexInfo(info) {
    return info.declaration ? declarationNameToString(info.declaration.parameters[0].name) : undefined;
}
exports.getNameFromIndexInfo = getNameFromIndexInfo;
/** @internal */
function isComputedNonLiteralName(name) {
    return name.kind === 166 /* SyntaxKind.ComputedPropertyName */ && !isStringOrNumericLiteralLike(name.expression);
}
exports.isComputedNonLiteralName = isComputedNonLiteralName;
/** @internal */
function tryGetTextOfPropertyName(name) {
    var _a;
    switch (name.kind) {
        case 80 /* SyntaxKind.Identifier */:
        case 81 /* SyntaxKind.PrivateIdentifier */:
            return ((_a = name.emitNode) === null || _a === void 0 ? void 0 : _a.autoGenerate) ? undefined : name.escapedText;
        case 11 /* SyntaxKind.StringLiteral */:
        case 9 /* SyntaxKind.NumericLiteral */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
            return (0, ts_1.escapeLeadingUnderscores)(name.text);
        case 166 /* SyntaxKind.ComputedPropertyName */:
            if (isStringOrNumericLiteralLike(name.expression))
                return (0, ts_1.escapeLeadingUnderscores)(name.expression.text);
            return undefined;
        case 294 /* SyntaxKind.JsxNamespacedName */:
            return getEscapedTextOfJsxNamespacedName(name);
        default:
            return ts_1.Debug.assertNever(name);
    }
}
exports.tryGetTextOfPropertyName = tryGetTextOfPropertyName;
/** @internal */
function getTextOfPropertyName(name) {
    return ts_1.Debug.checkDefined(tryGetTextOfPropertyName(name));
}
exports.getTextOfPropertyName = getTextOfPropertyName;
/** @internal */
function entityNameToString(name) {
    switch (name.kind) {
        case 110 /* SyntaxKind.ThisKeyword */:
            return "this";
        case 81 /* SyntaxKind.PrivateIdentifier */:
        case 80 /* SyntaxKind.Identifier */:
            return getFullWidth(name) === 0 ? (0, ts_1.idText)(name) : getTextOfNode(name);
        case 165 /* SyntaxKind.QualifiedName */:
            return entityNameToString(name.left) + "." + entityNameToString(name.right);
        case 210 /* SyntaxKind.PropertyAccessExpression */:
            if ((0, ts_1.isIdentifier)(name.name) || (0, ts_1.isPrivateIdentifier)(name.name)) {
                return entityNameToString(name.expression) + "." + entityNameToString(name.name);
            }
            else {
                return ts_1.Debug.assertNever(name.name);
            }
        case 317 /* SyntaxKind.JSDocMemberName */:
            return entityNameToString(name.left) + entityNameToString(name.right);
        case 294 /* SyntaxKind.JsxNamespacedName */:
            return entityNameToString(name.namespace) + ":" + entityNameToString(name.name);
        default:
            return ts_1.Debug.assertNever(name);
    }
}
exports.entityNameToString = entityNameToString;
/** @internal */
function createDiagnosticForNode(node, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var sourceFile = getSourceFileOfNode(node);
    return createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([sourceFile, node, message], args, false));
}
exports.createDiagnosticForNode = createDiagnosticForNode;
/** @internal */
function createDiagnosticForNodeArray(sourceFile, nodes, message) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    var start = (0, ts_1.skipTrivia)(sourceFile.text, nodes.pos);
    return createFileDiagnostic.apply(void 0, __spreadArray([sourceFile, start, nodes.end - start, message], args, false));
}
exports.createDiagnosticForNodeArray = createDiagnosticForNodeArray;
/** @internal */
function createDiagnosticForNodeInSourceFile(sourceFile, node, message) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    var span = getErrorSpanForNode(sourceFile, node);
    return createFileDiagnostic.apply(void 0, __spreadArray([sourceFile, span.start, span.length, message], args, false));
}
exports.createDiagnosticForNodeInSourceFile = createDiagnosticForNodeInSourceFile;
/** @internal */
function createDiagnosticForNodeFromMessageChain(sourceFile, node, messageChain, relatedInformation) {
    var span = getErrorSpanForNode(sourceFile, node);
    return createFileDiagnosticFromMessageChain(sourceFile, span.start, span.length, messageChain, relatedInformation);
}
exports.createDiagnosticForNodeFromMessageChain = createDiagnosticForNodeFromMessageChain;
/** @internal */
function createDiagnosticForNodeArrayFromMessageChain(sourceFile, nodes, messageChain, relatedInformation) {
    var start = (0, ts_1.skipTrivia)(sourceFile.text, nodes.pos);
    return createFileDiagnosticFromMessageChain(sourceFile, start, nodes.end - start, messageChain, relatedInformation);
}
exports.createDiagnosticForNodeArrayFromMessageChain = createDiagnosticForNodeArrayFromMessageChain;
function assertDiagnosticLocation(file, start, length) {
    ts_1.Debug.assertGreaterThanOrEqual(start, 0);
    ts_1.Debug.assertGreaterThanOrEqual(length, 0);
    if (file) {
        ts_1.Debug.assertLessThanOrEqual(start, file.text.length);
        ts_1.Debug.assertLessThanOrEqual(start + length, file.text.length);
    }
}
/** @internal */
function createFileDiagnosticFromMessageChain(file, start, length, messageChain, relatedInformation) {
    assertDiagnosticLocation(file, start, length);
    return {
        file: file,
        start: start,
        length: length,
        code: messageChain.code,
        category: messageChain.category,
        messageText: messageChain.next ? messageChain : messageChain.messageText,
        relatedInformation: relatedInformation
    };
}
exports.createFileDiagnosticFromMessageChain = createFileDiagnosticFromMessageChain;
/** @internal */
function createDiagnosticForFileFromMessageChain(sourceFile, messageChain, relatedInformation) {
    return {
        file: sourceFile,
        start: 0,
        length: 0,
        code: messageChain.code,
        category: messageChain.category,
        messageText: messageChain.next ? messageChain : messageChain.messageText,
        relatedInformation: relatedInformation
    };
}
exports.createDiagnosticForFileFromMessageChain = createDiagnosticForFileFromMessageChain;
/** @internal */
function createDiagnosticMessageChainFromDiagnostic(diagnostic) {
    return typeof diagnostic.messageText === "string" ? {
        code: diagnostic.code,
        category: diagnostic.category,
        messageText: diagnostic.messageText,
        next: diagnostic.next,
    } : diagnostic.messageText;
}
exports.createDiagnosticMessageChainFromDiagnostic = createDiagnosticMessageChainFromDiagnostic;
/** @internal */
function createDiagnosticForRange(sourceFile, range, message) {
    return {
        file: sourceFile,
        start: range.pos,
        length: range.end - range.pos,
        code: message.code,
        category: message.category,
        messageText: message.message,
    };
}
exports.createDiagnosticForRange = createDiagnosticForRange;
/** @internal */
function getSpanOfTokenAtPosition(sourceFile, pos) {
    var scanner = (0, ts_1.createScanner)(sourceFile.languageVersion, /*skipTrivia*/ true, sourceFile.languageVariant, sourceFile.text, /*onError*/ undefined, pos);
    scanner.scan();
    var start = scanner.getTokenStart();
    return (0, ts_1.createTextSpanFromBounds)(start, scanner.getTokenEnd());
}
exports.getSpanOfTokenAtPosition = getSpanOfTokenAtPosition;
/** @internal */
function scanTokenAtPosition(sourceFile, pos) {
    var scanner = (0, ts_1.createScanner)(sourceFile.languageVersion, /*skipTrivia*/ true, sourceFile.languageVariant, sourceFile.text, /*onError*/ undefined, pos);
    scanner.scan();
    return scanner.getToken();
}
exports.scanTokenAtPosition = scanTokenAtPosition;
function getErrorSpanForArrowFunction(sourceFile, node) {
    var pos = (0, ts_1.skipTrivia)(sourceFile.text, node.pos);
    if (node.body && node.body.kind === 240 /* SyntaxKind.Block */) {
        var startLine = (0, ts_1.getLineAndCharacterOfPosition)(sourceFile, node.body.pos).line;
        var endLine = (0, ts_1.getLineAndCharacterOfPosition)(sourceFile, node.body.end).line;
        if (startLine < endLine) {
            // The arrow function spans multiple lines,
            // make the error span be the first line, inclusive.
            return (0, ts_1.createTextSpan)(pos, getEndLinePosition(startLine, sourceFile) - pos + 1);
        }
    }
    return (0, ts_1.createTextSpanFromBounds)(pos, node.end);
}
/** @internal */
function getErrorSpanForNode(sourceFile, node) {
    var errorNode = node;
    switch (node.kind) {
        case 311 /* SyntaxKind.SourceFile */: {
            var pos_1 = (0, ts_1.skipTrivia)(sourceFile.text, 0, /*stopAfterLineBreak*/ false);
            if (pos_1 === sourceFile.text.length) {
                // file is empty - return span for the beginning of the file
                return (0, ts_1.createTextSpan)(0, 0);
            }
            return getSpanOfTokenAtPosition(sourceFile, pos_1);
        }
        // This list is a work in progress. Add missing node kinds to improve their error
        // spans.
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 207 /* SyntaxKind.BindingElement */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 265 /* SyntaxKind.EnumDeclaration */:
        case 305 /* SyntaxKind.EnumMember */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 273 /* SyntaxKind.NamespaceImport */:
            errorNode = node.name;
            break;
        case 218 /* SyntaxKind.ArrowFunction */:
            return getErrorSpanForArrowFunction(sourceFile, node);
        case 295 /* SyntaxKind.CaseClause */:
        case 296 /* SyntaxKind.DefaultClause */: {
            var start = (0, ts_1.skipTrivia)(sourceFile.text, node.pos);
            var end = node.statements.length > 0 ? node.statements[0].pos : node.end;
            return (0, ts_1.createTextSpanFromBounds)(start, end);
        }
        case 252 /* SyntaxKind.ReturnStatement */:
        case 228 /* SyntaxKind.YieldExpression */: {
            var pos_2 = (0, ts_1.skipTrivia)(sourceFile.text, node.pos);
            return getSpanOfTokenAtPosition(sourceFile, pos_2);
        }
        case 237 /* SyntaxKind.SatisfiesExpression */: {
            var pos_3 = (0, ts_1.skipTrivia)(sourceFile.text, node.expression.end);
            return getSpanOfTokenAtPosition(sourceFile, pos_3);
        }
        case 356 /* SyntaxKind.JSDocSatisfiesTag */: {
            var pos_4 = (0, ts_1.skipTrivia)(sourceFile.text, node.tagName.pos);
            return getSpanOfTokenAtPosition(sourceFile, pos_4);
        }
    }
    if (errorNode === undefined) {
        // If we don't have a better node, then just set the error on the first token of
        // construct.
        return getSpanOfTokenAtPosition(sourceFile, node.pos);
    }
    ts_1.Debug.assert(!(0, ts_1.isJSDoc)(errorNode));
    var isMissing = nodeIsMissing(errorNode);
    var pos = isMissing || (0, ts_1.isJsxText)(node)
        ? errorNode.pos
        : (0, ts_1.skipTrivia)(sourceFile.text, errorNode.pos);
    // These asserts should all be satisfied for a properly constructed `errorNode`.
    if (isMissing) {
        ts_1.Debug.assert(pos === errorNode.pos, "This failure could trigger https://github.com/Microsoft/TypeScript/issues/20809");
        ts_1.Debug.assert(pos === errorNode.end, "This failure could trigger https://github.com/Microsoft/TypeScript/issues/20809");
    }
    else {
        ts_1.Debug.assert(pos >= errorNode.pos, "This failure could trigger https://github.com/Microsoft/TypeScript/issues/20809");
        ts_1.Debug.assert(pos <= errorNode.end, "This failure could trigger https://github.com/Microsoft/TypeScript/issues/20809");
    }
    return (0, ts_1.createTextSpanFromBounds)(pos, errorNode.end);
}
exports.getErrorSpanForNode = getErrorSpanForNode;
/** @internal */
function isExternalOrCommonJsModule(file) {
    return (file.externalModuleIndicator || file.commonJsModuleIndicator) !== undefined;
}
exports.isExternalOrCommonJsModule = isExternalOrCommonJsModule;
/** @internal */
function isJsonSourceFile(file) {
    return file.scriptKind === 6 /* ScriptKind.JSON */;
}
exports.isJsonSourceFile = isJsonSourceFile;
/** @internal */
function isEnumConst(node) {
    return !!((0, ts_1.getCombinedModifierFlags)(node) & 2048 /* ModifierFlags.Const */);
}
exports.isEnumConst = isEnumConst;
/** @internal */
function isDeclarationReadonly(declaration) {
    return !!((0, ts_1.getCombinedModifierFlags)(declaration) & 64 /* ModifierFlags.Readonly */ && !(0, ts_1.isParameterPropertyDeclaration)(declaration, declaration.parent));
}
exports.isDeclarationReadonly = isDeclarationReadonly;
/** @internal */
function isVarConst(node) {
    return !!((0, ts_1.getCombinedNodeFlags)(node) & 2 /* NodeFlags.Const */);
}
exports.isVarConst = isVarConst;
/** @internal */
function isLet(node) {
    return !!((0, ts_1.getCombinedNodeFlags)(node) & 1 /* NodeFlags.Let */);
}
exports.isLet = isLet;
/** @internal */
function isSuperCall(n) {
    return n.kind === 212 /* SyntaxKind.CallExpression */ && n.expression.kind === 108 /* SyntaxKind.SuperKeyword */;
}
exports.isSuperCall = isSuperCall;
/** @internal */
function isImportCall(n) {
    return n.kind === 212 /* SyntaxKind.CallExpression */ && n.expression.kind === 102 /* SyntaxKind.ImportKeyword */;
}
exports.isImportCall = isImportCall;
/** @internal */
function isImportMeta(n) {
    return (0, ts_1.isMetaProperty)(n)
        && n.keywordToken === 102 /* SyntaxKind.ImportKeyword */
        && n.name.escapedText === "meta";
}
exports.isImportMeta = isImportMeta;
/** @internal */
function isLiteralImportTypeNode(n) {
    return (0, ts_1.isImportTypeNode)(n) && (0, ts_1.isLiteralTypeNode)(n.argument) && (0, ts_1.isStringLiteral)(n.argument.literal);
}
exports.isLiteralImportTypeNode = isLiteralImportTypeNode;
/** @internal */
function isPrologueDirective(node) {
    return node.kind === 243 /* SyntaxKind.ExpressionStatement */
        && node.expression.kind === 11 /* SyntaxKind.StringLiteral */;
}
exports.isPrologueDirective = isPrologueDirective;
/** @internal */
function isCustomPrologue(node) {
    return !!(getEmitFlags(node) & 2097152 /* EmitFlags.CustomPrologue */);
}
exports.isCustomPrologue = isCustomPrologue;
/** @internal */
function isHoistedFunction(node) {
    return isCustomPrologue(node)
        && (0, ts_1.isFunctionDeclaration)(node);
}
exports.isHoistedFunction = isHoistedFunction;
function isHoistedVariable(node) {
    return (0, ts_1.isIdentifier)(node.name)
        && !node.initializer;
}
/** @internal */
function isHoistedVariableStatement(node) {
    return isCustomPrologue(node)
        && (0, ts_1.isVariableStatement)(node)
        && (0, ts_1.every)(node.declarationList.declarations, isHoistedVariable);
}
exports.isHoistedVariableStatement = isHoistedVariableStatement;
/** @internal */
function getLeadingCommentRangesOfNode(node, sourceFileOfNode) {
    return node.kind !== 12 /* SyntaxKind.JsxText */ ? (0, ts_1.getLeadingCommentRanges)(sourceFileOfNode.text, node.pos) : undefined;
}
exports.getLeadingCommentRangesOfNode = getLeadingCommentRangesOfNode;
/** @internal */
function getJSDocCommentRanges(node, text) {
    var commentRanges = (node.kind === 168 /* SyntaxKind.Parameter */ ||
        node.kind === 167 /* SyntaxKind.TypeParameter */ ||
        node.kind === 217 /* SyntaxKind.FunctionExpression */ ||
        node.kind === 218 /* SyntaxKind.ArrowFunction */ ||
        node.kind === 216 /* SyntaxKind.ParenthesizedExpression */ ||
        node.kind === 259 /* SyntaxKind.VariableDeclaration */ ||
        node.kind === 280 /* SyntaxKind.ExportSpecifier */) ?
        (0, ts_1.concatenate)((0, ts_1.getTrailingCommentRanges)(text, node.pos), (0, ts_1.getLeadingCommentRanges)(text, node.pos)) :
        (0, ts_1.getLeadingCommentRanges)(text, node.pos);
    // True if the comment starts with '/**' but not if it is '/**/'
    return (0, ts_1.filter)(commentRanges, function (comment) {
        return text.charCodeAt(comment.pos + 1) === 42 /* CharacterCodes.asterisk */ &&
            text.charCodeAt(comment.pos + 2) === 42 /* CharacterCodes.asterisk */ &&
            text.charCodeAt(comment.pos + 3) !== 47 /* CharacterCodes.slash */;
    });
}
exports.getJSDocCommentRanges = getJSDocCommentRanges;
/** @internal */
exports.fullTripleSlashReferencePathRegEx = /^(\/\/\/\s*<reference\s+path\s*=\s*)(('[^']*')|("[^"]*")).*?\/>/;
var fullTripleSlashReferenceTypeReferenceDirectiveRegEx = /^(\/\/\/\s*<reference\s+types\s*=\s*)(('[^']*')|("[^"]*")).*?\/>/;
var fullTripleSlashLibReferenceRegEx = /^(\/\/\/\s*<reference\s+lib\s*=\s*)(('[^']*')|("[^"]*")).*?\/>/;
/** @internal */
exports.fullTripleSlashAMDReferencePathRegEx = /^(\/\/\/\s*<amd-dependency\s+path\s*=\s*)(('[^']*')|("[^"]*")).*?\/>/;
var fullTripleSlashAMDModuleRegEx = /^\/\/\/\s*<amd-module\s+.*?\/>/;
var defaultLibReferenceRegEx = /^(\/\/\/\s*<reference\s+no-default-lib\s*=\s*)(('[^']*')|("[^"]*"))\s*\/>/;
/** @internal */
function isPartOfTypeNode(node) {
    if (181 /* SyntaxKind.FirstTypeNode */ <= node.kind && node.kind <= 204 /* SyntaxKind.LastTypeNode */) {
        return true;
    }
    switch (node.kind) {
        case 133 /* SyntaxKind.AnyKeyword */:
        case 159 /* SyntaxKind.UnknownKeyword */:
        case 150 /* SyntaxKind.NumberKeyword */:
        case 162 /* SyntaxKind.BigIntKeyword */:
        case 154 /* SyntaxKind.StringKeyword */:
        case 136 /* SyntaxKind.BooleanKeyword */:
        case 155 /* SyntaxKind.SymbolKeyword */:
        case 151 /* SyntaxKind.ObjectKeyword */:
        case 157 /* SyntaxKind.UndefinedKeyword */:
        case 106 /* SyntaxKind.NullKeyword */:
        case 146 /* SyntaxKind.NeverKeyword */:
            return true;
        case 116 /* SyntaxKind.VoidKeyword */:
            return node.parent.kind !== 221 /* SyntaxKind.VoidExpression */;
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
            return (0, ts_1.isHeritageClause)(node.parent) && !isExpressionWithTypeArgumentsInClassExtendsClause(node);
        case 167 /* SyntaxKind.TypeParameter */:
            return node.parent.kind === 199 /* SyntaxKind.MappedType */ || node.parent.kind === 194 /* SyntaxKind.InferType */;
        // Identifiers and qualified names may be type nodes, depending on their context. Climb
        // above them to find the lowest container
        case 80 /* SyntaxKind.Identifier */:
            // If the identifier is the RHS of a qualified name, then it's a type iff its parent is.
            if (node.parent.kind === 165 /* SyntaxKind.QualifiedName */ && node.parent.right === node) {
                node = node.parent;
            }
            else if (node.parent.kind === 210 /* SyntaxKind.PropertyAccessExpression */ && node.parent.name === node) {
                node = node.parent;
            }
            // At this point, node is either a qualified name or an identifier
            ts_1.Debug.assert(node.kind === 80 /* SyntaxKind.Identifier */ || node.kind === 165 /* SyntaxKind.QualifiedName */ || node.kind === 210 /* SyntaxKind.PropertyAccessExpression */, "'node' was expected to be a qualified name, identifier or property access in 'isPartOfTypeNode'.");
        // falls through
        case 165 /* SyntaxKind.QualifiedName */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 110 /* SyntaxKind.ThisKeyword */: {
            var parent_1 = node.parent;
            if (parent_1.kind === 185 /* SyntaxKind.TypeQuery */) {
                return false;
            }
            if (parent_1.kind === 204 /* SyntaxKind.ImportType */) {
                return !parent_1.isTypeOf;
            }
            // Do not recursively call isPartOfTypeNode on the parent. In the example:
            //
            //     let a: A.B.C;
            //
            // Calling isPartOfTypeNode would consider the qualified name A.B a type node.
            // Only C and A.B.C are type nodes.
            if (181 /* SyntaxKind.FirstTypeNode */ <= parent_1.kind && parent_1.kind <= 204 /* SyntaxKind.LastTypeNode */) {
                return true;
            }
            switch (parent_1.kind) {
                case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                    return (0, ts_1.isHeritageClause)(parent_1.parent) && !isExpressionWithTypeArgumentsInClassExtendsClause(parent_1);
                case 167 /* SyntaxKind.TypeParameter */:
                    return node === parent_1.constraint;
                case 351 /* SyntaxKind.JSDocTemplateTag */:
                    return node === parent_1.constraint;
                case 171 /* SyntaxKind.PropertyDeclaration */:
                case 170 /* SyntaxKind.PropertySignature */:
                case 168 /* SyntaxKind.Parameter */:
                case 259 /* SyntaxKind.VariableDeclaration */:
                    return node === parent_1.type;
                case 261 /* SyntaxKind.FunctionDeclaration */:
                case 217 /* SyntaxKind.FunctionExpression */:
                case 218 /* SyntaxKind.ArrowFunction */:
                case 175 /* SyntaxKind.Constructor */:
                case 173 /* SyntaxKind.MethodDeclaration */:
                case 172 /* SyntaxKind.MethodSignature */:
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                    return node === parent_1.type;
                case 178 /* SyntaxKind.CallSignature */:
                case 179 /* SyntaxKind.ConstructSignature */:
                case 180 /* SyntaxKind.IndexSignature */:
                    return node === parent_1.type;
                case 215 /* SyntaxKind.TypeAssertionExpression */:
                    return node === parent_1.type;
                case 212 /* SyntaxKind.CallExpression */:
                case 213 /* SyntaxKind.NewExpression */:
                case 214 /* SyntaxKind.TaggedTemplateExpression */:
                    return (0, ts_1.contains)(parent_1.typeArguments, node);
            }
        }
    }
    return false;
}
exports.isPartOfTypeNode = isPartOfTypeNode;
/** @internal */
function isChildOfNodeWithKind(node, kind) {
    while (node) {
        if (node.kind === kind) {
            return true;
        }
        node = node.parent;
    }
    return false;
}
exports.isChildOfNodeWithKind = isChildOfNodeWithKind;
// Warning: This has the same semantics as the forEach family of functions,
//          in that traversal terminates in the event that 'visitor' supplies a truthy value.
/** @internal */
function forEachReturnStatement(body, visitor) {
    return traverse(body);
    function traverse(node) {
        switch (node.kind) {
            case 252 /* SyntaxKind.ReturnStatement */:
                return visitor(node);
            case 268 /* SyntaxKind.CaseBlock */:
            case 240 /* SyntaxKind.Block */:
            case 244 /* SyntaxKind.IfStatement */:
            case 245 /* SyntaxKind.DoStatement */:
            case 246 /* SyntaxKind.WhileStatement */:
            case 247 /* SyntaxKind.ForStatement */:
            case 248 /* SyntaxKind.ForInStatement */:
            case 249 /* SyntaxKind.ForOfStatement */:
            case 253 /* SyntaxKind.WithStatement */:
            case 254 /* SyntaxKind.SwitchStatement */:
            case 295 /* SyntaxKind.CaseClause */:
            case 296 /* SyntaxKind.DefaultClause */:
            case 255 /* SyntaxKind.LabeledStatement */:
            case 257 /* SyntaxKind.TryStatement */:
            case 298 /* SyntaxKind.CatchClause */:
                return (0, ts_1.forEachChild)(node, traverse);
        }
    }
}
exports.forEachReturnStatement = forEachReturnStatement;
/** @internal */
function forEachYieldExpression(body, visitor) {
    return traverse(body);
    function traverse(node) {
        switch (node.kind) {
            case 228 /* SyntaxKind.YieldExpression */:
                visitor(node);
                var operand = node.expression;
                if (operand) {
                    traverse(operand);
                }
                return;
            case 265 /* SyntaxKind.EnumDeclaration */:
            case 263 /* SyntaxKind.InterfaceDeclaration */:
            case 266 /* SyntaxKind.ModuleDeclaration */:
            case 264 /* SyntaxKind.TypeAliasDeclaration */:
                // These are not allowed inside a generator now, but eventually they may be allowed
                // as local types. Regardless, skip them to avoid the work.
                return;
            default:
                if ((0, ts_1.isFunctionLike)(node)) {
                    if (node.name && node.name.kind === 166 /* SyntaxKind.ComputedPropertyName */) {
                        // Note that we will not include methods/accessors of a class because they would require
                        // first descending into the class. This is by design.
                        traverse(node.name.expression);
                        return;
                    }
                }
                else if (!isPartOfTypeNode(node)) {
                    // This is the general case, which should include mostly expressions and statements.
                    // Also includes NodeArrays.
                    (0, ts_1.forEachChild)(node, traverse);
                }
        }
    }
}
exports.forEachYieldExpression = forEachYieldExpression;
/**
 * Gets the most likely element type for a TypeNode. This is not an exhaustive test
 * as it assumes a rest argument can only be an array type (either T[], or Array<T>).
 *
 * @param node The type node.
 *
 * @internal
 */
function getRestParameterElementType(node) {
    if (node && node.kind === 187 /* SyntaxKind.ArrayType */) {
        return node.elementType;
    }
    else if (node && node.kind === 182 /* SyntaxKind.TypeReference */) {
        return (0, ts_1.singleOrUndefined)(node.typeArguments);
    }
    else {
        return undefined;
    }
}
exports.getRestParameterElementType = getRestParameterElementType;
/** @internal */
function getMembersOfDeclaration(node) {
    switch (node.kind) {
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 186 /* SyntaxKind.TypeLiteral */:
            return node.members;
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
            return node.properties;
    }
}
exports.getMembersOfDeclaration = getMembersOfDeclaration;
/** @internal */
function isVariableLike(node) {
    if (node) {
        switch (node.kind) {
            case 207 /* SyntaxKind.BindingElement */:
            case 305 /* SyntaxKind.EnumMember */:
            case 168 /* SyntaxKind.Parameter */:
            case 302 /* SyntaxKind.PropertyAssignment */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 170 /* SyntaxKind.PropertySignature */:
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            case 259 /* SyntaxKind.VariableDeclaration */:
                return true;
        }
    }
    return false;
}
exports.isVariableLike = isVariableLike;
/** @internal */
function isVariableLikeOrAccessor(node) {
    return isVariableLike(node) || (0, ts_1.isAccessor)(node);
}
exports.isVariableLikeOrAccessor = isVariableLikeOrAccessor;
/** @internal */
function isVariableDeclarationInVariableStatement(node) {
    return node.parent.kind === 260 /* SyntaxKind.VariableDeclarationList */
        && node.parent.parent.kind === 242 /* SyntaxKind.VariableStatement */;
}
exports.isVariableDeclarationInVariableStatement = isVariableDeclarationInVariableStatement;
/** @internal */
function isCommonJsExportedExpression(node) {
    if (!isInJSFile(node))
        return false;
    return ((0, ts_1.isObjectLiteralExpression)(node.parent) && (0, ts_1.isBinaryExpression)(node.parent.parent) && getAssignmentDeclarationKind(node.parent.parent) === 2 /* AssignmentDeclarationKind.ModuleExports */) ||
        isCommonJsExportPropertyAssignment(node.parent);
}
exports.isCommonJsExportedExpression = isCommonJsExportedExpression;
/** @internal */
function isCommonJsExportPropertyAssignment(node) {
    if (!isInJSFile(node))
        return false;
    return ((0, ts_1.isBinaryExpression)(node) && getAssignmentDeclarationKind(node) === 1 /* AssignmentDeclarationKind.ExportsProperty */);
}
exports.isCommonJsExportPropertyAssignment = isCommonJsExportPropertyAssignment;
/** @internal */
function isValidESSymbolDeclaration(node) {
    return ((0, ts_1.isVariableDeclaration)(node) ? isVarConst(node) && (0, ts_1.isIdentifier)(node.name) && isVariableDeclarationInVariableStatement(node) :
        (0, ts_1.isPropertyDeclaration)(node) ? hasEffectiveReadonlyModifier(node) && hasStaticModifier(node) :
            (0, ts_1.isPropertySignature)(node) && hasEffectiveReadonlyModifier(node)) || isCommonJsExportPropertyAssignment(node);
}
exports.isValidESSymbolDeclaration = isValidESSymbolDeclaration;
/** @internal */
function introducesArgumentsExoticObject(node) {
    switch (node.kind) {
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 175 /* SyntaxKind.Constructor */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
            return true;
    }
    return false;
}
exports.introducesArgumentsExoticObject = introducesArgumentsExoticObject;
/** @internal */
function unwrapInnermostStatementOfLabel(node, beforeUnwrapLabelCallback) {
    while (true) {
        if (beforeUnwrapLabelCallback) {
            beforeUnwrapLabelCallback(node);
        }
        if (node.statement.kind !== 255 /* SyntaxKind.LabeledStatement */) {
            return node.statement;
        }
        node = node.statement;
    }
}
exports.unwrapInnermostStatementOfLabel = unwrapInnermostStatementOfLabel;
/** @internal */
function isFunctionBlock(node) {
    return node && node.kind === 240 /* SyntaxKind.Block */ && (0, ts_1.isFunctionLike)(node.parent);
}
exports.isFunctionBlock = isFunctionBlock;
/** @internal */
function isObjectLiteralMethod(node) {
    return node && node.kind === 173 /* SyntaxKind.MethodDeclaration */ && node.parent.kind === 209 /* SyntaxKind.ObjectLiteralExpression */;
}
exports.isObjectLiteralMethod = isObjectLiteralMethod;
/** @internal */
function isObjectLiteralOrClassExpressionMethodOrAccessor(node) {
    return (node.kind === 173 /* SyntaxKind.MethodDeclaration */ || node.kind === 176 /* SyntaxKind.GetAccessor */ || node.kind === 177 /* SyntaxKind.SetAccessor */) &&
        (node.parent.kind === 209 /* SyntaxKind.ObjectLiteralExpression */ ||
            node.parent.kind === 230 /* SyntaxKind.ClassExpression */);
}
exports.isObjectLiteralOrClassExpressionMethodOrAccessor = isObjectLiteralOrClassExpressionMethodOrAccessor;
/** @internal */
function isIdentifierTypePredicate(predicate) {
    return predicate && predicate.kind === 1 /* TypePredicateKind.Identifier */;
}
exports.isIdentifierTypePredicate = isIdentifierTypePredicate;
/** @internal */
function isThisTypePredicate(predicate) {
    return predicate && predicate.kind === 0 /* TypePredicateKind.This */;
}
exports.isThisTypePredicate = isThisTypePredicate;
/** @internal */
function forEachPropertyAssignment(objectLiteral, key, callback, key2) {
    return (0, ts_1.forEach)(objectLiteral === null || objectLiteral === void 0 ? void 0 : objectLiteral.properties, function (property) {
        if (!(0, ts_1.isPropertyAssignment)(property))
            return undefined;
        var propName = tryGetTextOfPropertyName(property.name);
        return key === propName || (key2 && key2 === propName) ?
            callback(property) :
            undefined;
    });
}
exports.forEachPropertyAssignment = forEachPropertyAssignment;
/** @internal */
function getPropertyArrayElementValue(objectLiteral, propKey, elementValue) {
    return forEachPropertyAssignment(objectLiteral, propKey, function (property) {
        return (0, ts_1.isArrayLiteralExpression)(property.initializer) ?
            (0, ts_1.find)(property.initializer.elements, function (element) { return (0, ts_1.isStringLiteral)(element) && element.text === elementValue; }) :
            undefined;
    });
}
exports.getPropertyArrayElementValue = getPropertyArrayElementValue;
/** @internal */
function getTsConfigObjectLiteralExpression(tsConfigSourceFile) {
    if (tsConfigSourceFile && tsConfigSourceFile.statements.length) {
        var expression = tsConfigSourceFile.statements[0].expression;
        return (0, ts_1.tryCast)(expression, ts_1.isObjectLiteralExpression);
    }
}
exports.getTsConfigObjectLiteralExpression = getTsConfigObjectLiteralExpression;
/** @internal */
function getTsConfigPropArrayElementValue(tsConfigSourceFile, propKey, elementValue) {
    return forEachTsConfigPropArray(tsConfigSourceFile, propKey, function (property) {
        return (0, ts_1.isArrayLiteralExpression)(property.initializer) ?
            (0, ts_1.find)(property.initializer.elements, function (element) { return (0, ts_1.isStringLiteral)(element) && element.text === elementValue; }) :
            undefined;
    });
}
exports.getTsConfigPropArrayElementValue = getTsConfigPropArrayElementValue;
/** @internal */
function forEachTsConfigPropArray(tsConfigSourceFile, propKey, callback) {
    return forEachPropertyAssignment(getTsConfigObjectLiteralExpression(tsConfigSourceFile), propKey, callback);
}
exports.forEachTsConfigPropArray = forEachTsConfigPropArray;
/** @internal */
function getContainingFunction(node) {
    return (0, ts_1.findAncestor)(node.parent, ts_1.isFunctionLike);
}
exports.getContainingFunction = getContainingFunction;
/** @internal */
function getContainingFunctionDeclaration(node) {
    return (0, ts_1.findAncestor)(node.parent, ts_1.isFunctionLikeDeclaration);
}
exports.getContainingFunctionDeclaration = getContainingFunctionDeclaration;
/** @internal */
function getContainingClass(node) {
    return (0, ts_1.findAncestor)(node.parent, ts_1.isClassLike);
}
exports.getContainingClass = getContainingClass;
/** @internal */
function getContainingClassStaticBlock(node) {
    return (0, ts_1.findAncestor)(node.parent, function (n) {
        if ((0, ts_1.isClassLike)(n) || (0, ts_1.isFunctionLike)(n)) {
            return "quit";
        }
        return (0, ts_1.isClassStaticBlockDeclaration)(n);
    });
}
exports.getContainingClassStaticBlock = getContainingClassStaticBlock;
/** @internal */
function getContainingFunctionOrClassStaticBlock(node) {
    return (0, ts_1.findAncestor)(node.parent, ts_1.isFunctionLikeOrClassStaticBlockDeclaration);
}
exports.getContainingFunctionOrClassStaticBlock = getContainingFunctionOrClassStaticBlock;
function getThisContainer(node, includeArrowFunctions, includeClassComputedPropertyName) {
    ts_1.Debug.assert(node.kind !== 311 /* SyntaxKind.SourceFile */);
    while (true) {
        node = node.parent;
        if (!node) {
            return ts_1.Debug.fail(); // If we never pass in a SourceFile, this should be unreachable, since we'll stop when we reach that.
        }
        switch (node.kind) {
            case 166 /* SyntaxKind.ComputedPropertyName */:
                // If the grandparent node is an object literal (as opposed to a class),
                // then the computed property is not a 'this' container.
                // A computed property name in a class needs to be a this container
                // so that we can error on it.
                if (includeClassComputedPropertyName && (0, ts_1.isClassLike)(node.parent.parent)) {
                    return node;
                }
                // If this is a computed property, then the parent should not
                // make it a this container. The parent might be a property
                // in an object literal, like a method or accessor. But in order for
                // such a parent to be a this container, the reference must be in
                // the *body* of the container.
                node = node.parent.parent;
                break;
            case 169 /* SyntaxKind.Decorator */:
                // Decorators are always applied outside of the body of a class or method.
                if (node.parent.kind === 168 /* SyntaxKind.Parameter */ && (0, ts_1.isClassElement)(node.parent.parent)) {
                    // If the decorator's parent is a Parameter, we resolve the this container from
                    // the grandparent class declaration.
                    node = node.parent.parent;
                }
                else if ((0, ts_1.isClassElement)(node.parent)) {
                    // If the decorator's parent is a class element, we resolve the 'this' container
                    // from the parent class declaration.
                    node = node.parent;
                }
                break;
            case 218 /* SyntaxKind.ArrowFunction */:
                if (!includeArrowFunctions) {
                    continue;
                }
            // falls through
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 217 /* SyntaxKind.FunctionExpression */:
            case 266 /* SyntaxKind.ModuleDeclaration */:
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 170 /* SyntaxKind.PropertySignature */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
            case 175 /* SyntaxKind.Constructor */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 178 /* SyntaxKind.CallSignature */:
            case 179 /* SyntaxKind.ConstructSignature */:
            case 180 /* SyntaxKind.IndexSignature */:
            case 265 /* SyntaxKind.EnumDeclaration */:
            case 311 /* SyntaxKind.SourceFile */:
                return node;
        }
    }
}
exports.getThisContainer = getThisContainer;
/**
 * @returns Whether the node creates a new 'this' scope for its children.
 *
 * @internal
 */
function isThisContainerOrFunctionBlock(node) {
    switch (node.kind) {
        // Arrow functions use the same scope, but may do so in a "delayed" manner
        // For example, `const getThis = () => this` may be before a super() call in a derived constructor
        case 218 /* SyntaxKind.ArrowFunction */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return true;
        case 240 /* SyntaxKind.Block */:
            switch (node.parent.kind) {
                case 175 /* SyntaxKind.Constructor */:
                case 173 /* SyntaxKind.MethodDeclaration */:
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                    // Object properties can have computed names; only method-like bodies start a new scope
                    return true;
                default:
                    return false;
            }
        default:
            return false;
    }
}
exports.isThisContainerOrFunctionBlock = isThisContainerOrFunctionBlock;
/** @internal */
function isInTopLevelContext(node) {
    // The name of a class or function declaration is a BindingIdentifier in its surrounding scope.
    if ((0, ts_1.isIdentifier)(node) && ((0, ts_1.isClassDeclaration)(node.parent) || (0, ts_1.isFunctionDeclaration)(node.parent)) && node.parent.name === node) {
        node = node.parent;
    }
    var container = getThisContainer(node, /*includeArrowFunctions*/ true, /*includeClassComputedPropertyName*/ false);
    return (0, ts_1.isSourceFile)(container);
}
exports.isInTopLevelContext = isInTopLevelContext;
/** @internal */
function getNewTargetContainer(node) {
    var container = getThisContainer(node, /*includeArrowFunctions*/ false, /*includeClassComputedPropertyName*/ false);
    if (container) {
        switch (container.kind) {
            case 175 /* SyntaxKind.Constructor */:
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 217 /* SyntaxKind.FunctionExpression */:
                return container;
        }
    }
    return undefined;
}
exports.getNewTargetContainer = getNewTargetContainer;
function getSuperContainer(node, stopOnFunctions) {
    while (true) {
        node = node.parent;
        if (!node) {
            return undefined;
        }
        switch (node.kind) {
            case 166 /* SyntaxKind.ComputedPropertyName */:
                node = node.parent;
                break;
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 217 /* SyntaxKind.FunctionExpression */:
            case 218 /* SyntaxKind.ArrowFunction */:
                if (!stopOnFunctions) {
                    continue;
                }
            // falls through
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 170 /* SyntaxKind.PropertySignature */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
            case 175 /* SyntaxKind.Constructor */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return node;
            case 169 /* SyntaxKind.Decorator */:
                // Decorators are always applied outside of the body of a class or method.
                if (node.parent.kind === 168 /* SyntaxKind.Parameter */ && (0, ts_1.isClassElement)(node.parent.parent)) {
                    // If the decorator's parent is a Parameter, we resolve the this container from
                    // the grandparent class declaration.
                    node = node.parent.parent;
                }
                else if ((0, ts_1.isClassElement)(node.parent)) {
                    // If the decorator's parent is a class element, we resolve the 'this' container
                    // from the parent class declaration.
                    node = node.parent;
                }
                break;
        }
    }
}
exports.getSuperContainer = getSuperContainer;
/** @internal */
function getImmediatelyInvokedFunctionExpression(func) {
    if (func.kind === 217 /* SyntaxKind.FunctionExpression */ || func.kind === 218 /* SyntaxKind.ArrowFunction */) {
        var prev = func;
        var parent_2 = func.parent;
        while (parent_2.kind === 216 /* SyntaxKind.ParenthesizedExpression */) {
            prev = parent_2;
            parent_2 = parent_2.parent;
        }
        if (parent_2.kind === 212 /* SyntaxKind.CallExpression */ && parent_2.expression === prev) {
            return parent_2;
        }
    }
}
exports.getImmediatelyInvokedFunctionExpression = getImmediatelyInvokedFunctionExpression;
/** @internal */
function isSuperOrSuperProperty(node) {
    return node.kind === 108 /* SyntaxKind.SuperKeyword */
        || isSuperProperty(node);
}
exports.isSuperOrSuperProperty = isSuperOrSuperProperty;
/**
 * Determines whether a node is a property or element access expression for `super`.
 *
 * @internal
 */
function isSuperProperty(node) {
    var kind = node.kind;
    return (kind === 210 /* SyntaxKind.PropertyAccessExpression */ || kind === 211 /* SyntaxKind.ElementAccessExpression */)
        && node.expression.kind === 108 /* SyntaxKind.SuperKeyword */;
}
exports.isSuperProperty = isSuperProperty;
/**
 * Determines whether a node is a property or element access expression for `this`.
 *
 * @internal
 */
function isThisProperty(node) {
    var kind = node.kind;
    return (kind === 210 /* SyntaxKind.PropertyAccessExpression */ || kind === 211 /* SyntaxKind.ElementAccessExpression */)
        && node.expression.kind === 110 /* SyntaxKind.ThisKeyword */;
}
exports.isThisProperty = isThisProperty;
/** @internal */
function isThisInitializedDeclaration(node) {
    var _a;
    return !!node && (0, ts_1.isVariableDeclaration)(node) && ((_a = node.initializer) === null || _a === void 0 ? void 0 : _a.kind) === 110 /* SyntaxKind.ThisKeyword */;
}
exports.isThisInitializedDeclaration = isThisInitializedDeclaration;
/** @internal */
function isThisInitializedObjectBindingExpression(node) {
    return !!node
        && ((0, ts_1.isShorthandPropertyAssignment)(node) || (0, ts_1.isPropertyAssignment)(node))
        && (0, ts_1.isBinaryExpression)(node.parent.parent)
        && node.parent.parent.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */
        && node.parent.parent.right.kind === 110 /* SyntaxKind.ThisKeyword */;
}
exports.isThisInitializedObjectBindingExpression = isThisInitializedObjectBindingExpression;
/** @internal */
function getEntityNameFromTypeNode(node) {
    switch (node.kind) {
        case 182 /* SyntaxKind.TypeReference */:
            return node.typeName;
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
            return isEntityNameExpression(node.expression)
                ? node.expression
                : undefined;
        // TODO(rbuckton): These aren't valid TypeNodes, but we treat them as such because of `isPartOfTypeNode`, which returns `true` for things that aren't `TypeNode`s.
        case 80 /* SyntaxKind.Identifier */:
        case 165 /* SyntaxKind.QualifiedName */:
            return node;
    }
    return undefined;
}
exports.getEntityNameFromTypeNode = getEntityNameFromTypeNode;
/** @internal */
function getInvokedExpression(node) {
    switch (node.kind) {
        case 214 /* SyntaxKind.TaggedTemplateExpression */:
            return node.tag;
        case 285 /* SyntaxKind.JsxOpeningElement */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
            return node.tagName;
        default:
            return node.expression;
    }
}
exports.getInvokedExpression = getInvokedExpression;
/** @internal */
function nodeCanBeDecorated(useLegacyDecorators, node, parent, grandparent) {
    // private names cannot be used with decorators yet
    if (useLegacyDecorators && (0, ts_1.isNamedDeclaration)(node) && (0, ts_1.isPrivateIdentifier)(node.name)) {
        return false;
    }
    switch (node.kind) {
        case 262 /* SyntaxKind.ClassDeclaration */:
            // class declarations are valid targets
            return true;
        case 230 /* SyntaxKind.ClassExpression */:
            // class expressions are valid targets for native decorators
            return !useLegacyDecorators;
        case 171 /* SyntaxKind.PropertyDeclaration */:
            // property declarations are valid if their parent is a class declaration.
            return parent !== undefined
                && (useLegacyDecorators ? (0, ts_1.isClassDeclaration)(parent) : (0, ts_1.isClassLike)(parent) && !hasAbstractModifier(node) && !hasAmbientModifier(node));
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 173 /* SyntaxKind.MethodDeclaration */:
            // if this method has a body and its parent is a class declaration, this is a valid target.
            return node.body !== undefined
                && parent !== undefined
                && (useLegacyDecorators ? (0, ts_1.isClassDeclaration)(parent) : (0, ts_1.isClassLike)(parent));
        case 168 /* SyntaxKind.Parameter */:
            // TODO(rbuckton): Parameter decorator support for ES decorators must wait until it is standardized
            if (!useLegacyDecorators)
                return false;
            // if the parameter's parent has a body and its grandparent is a class declaration, this is a valid target.
            return parent !== undefined
                && parent.body !== undefined
                && (parent.kind === 175 /* SyntaxKind.Constructor */
                    || parent.kind === 173 /* SyntaxKind.MethodDeclaration */
                    || parent.kind === 177 /* SyntaxKind.SetAccessor */)
                && getThisParameter(parent) !== node
                && grandparent !== undefined
                && grandparent.kind === 262 /* SyntaxKind.ClassDeclaration */;
    }
    return false;
}
exports.nodeCanBeDecorated = nodeCanBeDecorated;
/** @internal */
function nodeIsDecorated(useLegacyDecorators, node, parent, grandparent) {
    return hasDecorators(node)
        && nodeCanBeDecorated(useLegacyDecorators, node, parent, grandparent);
}
exports.nodeIsDecorated = nodeIsDecorated;
/** @internal */
function nodeOrChildIsDecorated(useLegacyDecorators, node, parent, grandparent) {
    return nodeIsDecorated(useLegacyDecorators, node, parent, grandparent)
        || childIsDecorated(useLegacyDecorators, node, parent);
}
exports.nodeOrChildIsDecorated = nodeOrChildIsDecorated;
/** @internal */
function childIsDecorated(useLegacyDecorators, node, parent) {
    switch (node.kind) {
        case 262 /* SyntaxKind.ClassDeclaration */:
            return (0, ts_1.some)(node.members, function (m) { return nodeOrChildIsDecorated(useLegacyDecorators, m, node, parent); });
        case 230 /* SyntaxKind.ClassExpression */:
            return !useLegacyDecorators && (0, ts_1.some)(node.members, function (m) { return nodeOrChildIsDecorated(useLegacyDecorators, m, node, parent); });
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 175 /* SyntaxKind.Constructor */:
            return (0, ts_1.some)(node.parameters, function (p) { return nodeIsDecorated(useLegacyDecorators, p, node, parent); });
        default:
            return false;
    }
}
exports.childIsDecorated = childIsDecorated;
/** @internal */
function classOrConstructorParameterIsDecorated(useLegacyDecorators, node) {
    if (nodeIsDecorated(useLegacyDecorators, node))
        return true;
    var constructor = getFirstConstructorWithBody(node);
    return !!constructor && childIsDecorated(useLegacyDecorators, constructor, node);
}
exports.classOrConstructorParameterIsDecorated = classOrConstructorParameterIsDecorated;
/** @internal */
function classElementOrClassElementParameterIsDecorated(useLegacyDecorators, node, parent) {
    var parameters;
    if ((0, ts_1.isAccessor)(node)) {
        var _a = getAllAccessorDeclarations(parent.members, node), firstAccessor = _a.firstAccessor, secondAccessor = _a.secondAccessor, setAccessor = _a.setAccessor;
        var firstAccessorWithDecorators = hasDecorators(firstAccessor) ? firstAccessor :
            secondAccessor && hasDecorators(secondAccessor) ? secondAccessor :
                undefined;
        if (!firstAccessorWithDecorators || node !== firstAccessorWithDecorators) {
            return false;
        }
        parameters = setAccessor === null || setAccessor === void 0 ? void 0 : setAccessor.parameters;
    }
    else if ((0, ts_1.isMethodDeclaration)(node)) {
        parameters = node.parameters;
    }
    if (nodeIsDecorated(useLegacyDecorators, node, parent)) {
        return true;
    }
    if (parameters) {
        for (var _i = 0, parameters_1 = parameters; _i < parameters_1.length; _i++) {
            var parameter = parameters_1[_i];
            if (parameterIsThisKeyword(parameter))
                continue;
            if (nodeIsDecorated(useLegacyDecorators, parameter, node, parent))
                return true;
        }
    }
    return false;
}
exports.classElementOrClassElementParameterIsDecorated = classElementOrClassElementParameterIsDecorated;
/** @internal */
function isEmptyStringLiteral(node) {
    if (node.textSourceNode) {
        switch (node.textSourceNode.kind) {
            case 11 /* SyntaxKind.StringLiteral */:
                return isEmptyStringLiteral(node.textSourceNode);
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
                return node.text === "";
        }
        return false;
    }
    return node.text === "";
}
exports.isEmptyStringLiteral = isEmptyStringLiteral;
/** @internal */
function isJSXTagName(node) {
    var parent = node.parent;
    if (parent.kind === 285 /* SyntaxKind.JsxOpeningElement */ ||
        parent.kind === 284 /* SyntaxKind.JsxSelfClosingElement */ ||
        parent.kind === 286 /* SyntaxKind.JsxClosingElement */) {
        return parent.tagName === node;
    }
    return false;
}
exports.isJSXTagName = isJSXTagName;
/** @internal */
function isExpressionNode(node) {
    switch (node.kind) {
        case 108 /* SyntaxKind.SuperKeyword */:
        case 106 /* SyntaxKind.NullKeyword */:
        case 112 /* SyntaxKind.TrueKeyword */:
        case 97 /* SyntaxKind.FalseKeyword */:
        case 14 /* SyntaxKind.RegularExpressionLiteral */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
        case 212 /* SyntaxKind.CallExpression */:
        case 213 /* SyntaxKind.NewExpression */:
        case 214 /* SyntaxKind.TaggedTemplateExpression */:
        case 233 /* SyntaxKind.AsExpression */:
        case 215 /* SyntaxKind.TypeAssertionExpression */:
        case 237 /* SyntaxKind.SatisfiesExpression */:
        case 234 /* SyntaxKind.NonNullExpression */:
        case 216 /* SyntaxKind.ParenthesizedExpression */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
        case 221 /* SyntaxKind.VoidExpression */:
        case 219 /* SyntaxKind.DeleteExpression */:
        case 220 /* SyntaxKind.TypeOfExpression */:
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
        case 224 /* SyntaxKind.PostfixUnaryExpression */:
        case 225 /* SyntaxKind.BinaryExpression */:
        case 226 /* SyntaxKind.ConditionalExpression */:
        case 229 /* SyntaxKind.SpreadElement */:
        case 227 /* SyntaxKind.TemplateExpression */:
        case 231 /* SyntaxKind.OmittedExpression */:
        case 283 /* SyntaxKind.JsxElement */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
        case 287 /* SyntaxKind.JsxFragment */:
        case 228 /* SyntaxKind.YieldExpression */:
        case 222 /* SyntaxKind.AwaitExpression */:
        case 235 /* SyntaxKind.MetaProperty */:
            return true;
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
            return !(0, ts_1.isHeritageClause)(node.parent) && !(0, ts_1.isJSDocAugmentsTag)(node.parent);
        case 165 /* SyntaxKind.QualifiedName */:
            while (node.parent.kind === 165 /* SyntaxKind.QualifiedName */) {
                node = node.parent;
            }
            return node.parent.kind === 185 /* SyntaxKind.TypeQuery */ || (0, ts_1.isJSDocLinkLike)(node.parent) || (0, ts_1.isJSDocNameReference)(node.parent) || (0, ts_1.isJSDocMemberName)(node.parent) || isJSXTagName(node);
        case 317 /* SyntaxKind.JSDocMemberName */:
            while ((0, ts_1.isJSDocMemberName)(node.parent)) {
                node = node.parent;
            }
            return node.parent.kind === 185 /* SyntaxKind.TypeQuery */ || (0, ts_1.isJSDocLinkLike)(node.parent) || (0, ts_1.isJSDocNameReference)(node.parent) || (0, ts_1.isJSDocMemberName)(node.parent) || isJSXTagName(node);
        case 81 /* SyntaxKind.PrivateIdentifier */:
            return (0, ts_1.isBinaryExpression)(node.parent) && node.parent.left === node && node.parent.operatorToken.kind === 103 /* SyntaxKind.InKeyword */;
        case 80 /* SyntaxKind.Identifier */:
            if (node.parent.kind === 185 /* SyntaxKind.TypeQuery */ || (0, ts_1.isJSDocLinkLike)(node.parent) || (0, ts_1.isJSDocNameReference)(node.parent) || (0, ts_1.isJSDocMemberName)(node.parent) || isJSXTagName(node)) {
                return true;
            }
        // falls through
        case 9 /* SyntaxKind.NumericLiteral */:
        case 10 /* SyntaxKind.BigIntLiteral */:
        case 11 /* SyntaxKind.StringLiteral */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 110 /* SyntaxKind.ThisKeyword */:
            return isInExpressionContext(node);
        default:
            return false;
    }
}
exports.isExpressionNode = isExpressionNode;
/** @internal */
function isInExpressionContext(node) {
    var parent = node.parent;
    switch (parent.kind) {
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 168 /* SyntaxKind.Parameter */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 305 /* SyntaxKind.EnumMember */:
        case 302 /* SyntaxKind.PropertyAssignment */:
        case 207 /* SyntaxKind.BindingElement */:
            return parent.initializer === node;
        case 243 /* SyntaxKind.ExpressionStatement */:
        case 244 /* SyntaxKind.IfStatement */:
        case 245 /* SyntaxKind.DoStatement */:
        case 246 /* SyntaxKind.WhileStatement */:
        case 252 /* SyntaxKind.ReturnStatement */:
        case 253 /* SyntaxKind.WithStatement */:
        case 254 /* SyntaxKind.SwitchStatement */:
        case 295 /* SyntaxKind.CaseClause */:
        case 256 /* SyntaxKind.ThrowStatement */:
            return parent.expression === node;
        case 247 /* SyntaxKind.ForStatement */:
            var forStatement = parent;
            return (forStatement.initializer === node && forStatement.initializer.kind !== 260 /* SyntaxKind.VariableDeclarationList */) ||
                forStatement.condition === node ||
                forStatement.incrementor === node;
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
            var forInStatement = parent;
            return (forInStatement.initializer === node && forInStatement.initializer.kind !== 260 /* SyntaxKind.VariableDeclarationList */) ||
                forInStatement.expression === node;
        case 215 /* SyntaxKind.TypeAssertionExpression */:
        case 233 /* SyntaxKind.AsExpression */:
            return node === parent.expression;
        case 238 /* SyntaxKind.TemplateSpan */:
            return node === parent.expression;
        case 166 /* SyntaxKind.ComputedPropertyName */:
            return node === parent.expression;
        case 169 /* SyntaxKind.Decorator */:
        case 293 /* SyntaxKind.JsxExpression */:
        case 292 /* SyntaxKind.JsxSpreadAttribute */:
        case 304 /* SyntaxKind.SpreadAssignment */:
            return true;
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
            return parent.expression === node && !isPartOfTypeNode(parent);
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            return parent.objectAssignmentInitializer === node;
        case 237 /* SyntaxKind.SatisfiesExpression */:
            return node === parent.expression;
        default:
            return isExpressionNode(parent);
    }
}
exports.isInExpressionContext = isInExpressionContext;
/** @internal */
function isPartOfTypeQuery(node) {
    while (node.kind === 165 /* SyntaxKind.QualifiedName */ || node.kind === 80 /* SyntaxKind.Identifier */) {
        node = node.parent;
    }
    return node.kind === 185 /* SyntaxKind.TypeQuery */;
}
exports.isPartOfTypeQuery = isPartOfTypeQuery;
/** @internal */
function isNamespaceReexportDeclaration(node) {
    return (0, ts_1.isNamespaceExport)(node) && !!node.parent.moduleSpecifier;
}
exports.isNamespaceReexportDeclaration = isNamespaceReexportDeclaration;
/** @internal */
function isExternalModuleImportEqualsDeclaration(node) {
    return node.kind === 270 /* SyntaxKind.ImportEqualsDeclaration */ && node.moduleReference.kind === 282 /* SyntaxKind.ExternalModuleReference */;
}
exports.isExternalModuleImportEqualsDeclaration = isExternalModuleImportEqualsDeclaration;
/** @internal */
function getExternalModuleImportEqualsDeclarationExpression(node) {
    ts_1.Debug.assert(isExternalModuleImportEqualsDeclaration(node));
    return node.moduleReference.expression;
}
exports.getExternalModuleImportEqualsDeclarationExpression = getExternalModuleImportEqualsDeclarationExpression;
/** @internal */
function getExternalModuleRequireArgument(node) {
    return isVariableDeclarationInitializedToBareOrAccessedRequire(node) && getLeftmostAccessExpression(node.initializer).arguments[0];
}
exports.getExternalModuleRequireArgument = getExternalModuleRequireArgument;
/** @internal */
function isInternalModuleImportEqualsDeclaration(node) {
    return node.kind === 270 /* SyntaxKind.ImportEqualsDeclaration */ && node.moduleReference.kind !== 282 /* SyntaxKind.ExternalModuleReference */;
}
exports.isInternalModuleImportEqualsDeclaration = isInternalModuleImportEqualsDeclaration;
/** @internal */
function isSourceFileJS(file) {
    return isInJSFile(file);
}
exports.isSourceFileJS = isSourceFileJS;
/** @internal */
function isSourceFileNotJS(file) {
    return !isInJSFile(file);
}
exports.isSourceFileNotJS = isSourceFileNotJS;
/** @internal */
function isInJSFile(node) {
    return !!node && !!(node.flags & 262144 /* NodeFlags.JavaScriptFile */);
}
exports.isInJSFile = isInJSFile;
/** @internal */
function isInJsonFile(node) {
    return !!node && !!(node.flags & 67108864 /* NodeFlags.JsonFile */);
}
exports.isInJsonFile = isInJsonFile;
/** @internal */
function isSourceFileNotJson(file) {
    return !isJsonSourceFile(file);
}
exports.isSourceFileNotJson = isSourceFileNotJson;
/** @internal */
function isInJSDoc(node) {
    return !!node && !!(node.flags & 8388608 /* NodeFlags.JSDoc */);
}
exports.isInJSDoc = isInJSDoc;
/** @internal */
function isJSDocIndexSignature(node) {
    return (0, ts_1.isTypeReferenceNode)(node) &&
        (0, ts_1.isIdentifier)(node.typeName) &&
        node.typeName.escapedText === "Object" &&
        node.typeArguments && node.typeArguments.length === 2 &&
        (node.typeArguments[0].kind === 154 /* SyntaxKind.StringKeyword */ || node.typeArguments[0].kind === 150 /* SyntaxKind.NumberKeyword */);
}
exports.isJSDocIndexSignature = isJSDocIndexSignature;
/** @internal */
function isRequireCall(callExpression, requireStringLiteralLikeArgument) {
    if (callExpression.kind !== 212 /* SyntaxKind.CallExpression */) {
        return false;
    }
    var _a = callExpression, expression = _a.expression, args = _a.arguments;
    if (expression.kind !== 80 /* SyntaxKind.Identifier */ || expression.escapedText !== "require") {
        return false;
    }
    if (args.length !== 1) {
        return false;
    }
    var arg = args[0];
    return !requireStringLiteralLikeArgument || (0, ts_1.isStringLiteralLike)(arg);
}
exports.isRequireCall = isRequireCall;
/**
 * Returns true if the node is a VariableDeclaration initialized to a require call (see `isRequireCall`).
 * This function does not test if the node is in a JavaScript file or not.
 *
 * @internal
 */
function isVariableDeclarationInitializedToRequire(node) {
    return isVariableDeclarationInitializedWithRequireHelper(node, /*allowAccessedRequire*/ false);
}
exports.isVariableDeclarationInitializedToRequire = isVariableDeclarationInitializedToRequire;
/**
 * Like {@link isVariableDeclarationInitializedToRequire} but allows things like `require("...").foo.bar` or `require("...")["baz"]`.
 *
 * @internal
 */
function isVariableDeclarationInitializedToBareOrAccessedRequire(node) {
    return isVariableDeclarationInitializedWithRequireHelper(node, /*allowAccessedRequire*/ true);
}
exports.isVariableDeclarationInitializedToBareOrAccessedRequire = isVariableDeclarationInitializedToBareOrAccessedRequire;
/** @internal */
function isBindingElementOfBareOrAccessedRequire(node) {
    return (0, ts_1.isBindingElement)(node) && isVariableDeclarationInitializedToBareOrAccessedRequire(node.parent.parent);
}
exports.isBindingElementOfBareOrAccessedRequire = isBindingElementOfBareOrAccessedRequire;
function isVariableDeclarationInitializedWithRequireHelper(node, allowAccessedRequire) {
    return (0, ts_1.isVariableDeclaration)(node) &&
        !!node.initializer &&
        isRequireCall(allowAccessedRequire ? getLeftmostAccessExpression(node.initializer) : node.initializer, /*requireStringLiteralLikeArgument*/ true);
}
/** @internal */
function isRequireVariableStatement(node) {
    return (0, ts_1.isVariableStatement)(node)
        && node.declarationList.declarations.length > 0
        && (0, ts_1.every)(node.declarationList.declarations, function (decl) { return isVariableDeclarationInitializedToRequire(decl); });
}
exports.isRequireVariableStatement = isRequireVariableStatement;
/** @internal */
function isSingleOrDoubleQuote(charCode) {
    return charCode === 39 /* CharacterCodes.singleQuote */ || charCode === 34 /* CharacterCodes.doubleQuote */;
}
exports.isSingleOrDoubleQuote = isSingleOrDoubleQuote;
/** @internal */
function isStringDoubleQuoted(str, sourceFile) {
    return getSourceTextOfNodeFromSourceFile(sourceFile, str).charCodeAt(0) === 34 /* CharacterCodes.doubleQuote */;
}
exports.isStringDoubleQuoted = isStringDoubleQuoted;
/** @internal */
function isAssignmentDeclaration(decl) {
    return (0, ts_1.isBinaryExpression)(decl) || isAccessExpression(decl) || (0, ts_1.isIdentifier)(decl) || (0, ts_1.isCallExpression)(decl);
}
exports.isAssignmentDeclaration = isAssignmentDeclaration;
/**
 * Get the initializer, taking into account defaulted Javascript initializers
 *
 * @internal
 */
function getEffectiveInitializer(node) {
    if (isInJSFile(node) && node.initializer &&
        (0, ts_1.isBinaryExpression)(node.initializer) &&
        (node.initializer.operatorToken.kind === 57 /* SyntaxKind.BarBarToken */ || node.initializer.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */) &&
        node.name && isEntityNameExpression(node.name) && isSameEntityName(node.name, node.initializer.left)) {
        return node.initializer.right;
    }
    return node.initializer;
}
exports.getEffectiveInitializer = getEffectiveInitializer;
/**
 * Get the declaration initializer when it is container-like (See getExpandoInitializer).
 *
 * @internal
 */
function getDeclaredExpandoInitializer(node) {
    var init = getEffectiveInitializer(node);
    return init && getExpandoInitializer(init, isPrototypeAccess(node.name));
}
exports.getDeclaredExpandoInitializer = getDeclaredExpandoInitializer;
function hasExpandoValueProperty(node, isPrototypeAssignment) {
    return (0, ts_1.forEach)(node.properties, function (p) {
        return (0, ts_1.isPropertyAssignment)(p) &&
            (0, ts_1.isIdentifier)(p.name) &&
            p.name.escapedText === "value" &&
            p.initializer &&
            getExpandoInitializer(p.initializer, isPrototypeAssignment);
    });
}
/**
 * Get the assignment 'initializer' -- the righthand side-- when the initializer is container-like (See getExpandoInitializer).
 * We treat the right hand side of assignments with container-like initializers as declarations.
 *
 * @internal
 */
function getAssignedExpandoInitializer(node) {
    if (node && node.parent && (0, ts_1.isBinaryExpression)(node.parent) && node.parent.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */) {
        var isPrototypeAssignment = isPrototypeAccess(node.parent.left);
        return getExpandoInitializer(node.parent.right, isPrototypeAssignment) ||
            getDefaultedExpandoInitializer(node.parent.left, node.parent.right, isPrototypeAssignment);
    }
    if (node && (0, ts_1.isCallExpression)(node) && isBindableObjectDefinePropertyCall(node)) {
        var result = hasExpandoValueProperty(node.arguments[2], node.arguments[1].text === "prototype");
        if (result) {
            return result;
        }
    }
}
exports.getAssignedExpandoInitializer = getAssignedExpandoInitializer;
/**
 * Recognized expando initializers are:
 * 1. (function() {})() -- IIFEs
 * 2. function() { } -- Function expressions
 * 3. class { } -- Class expressions
 * 4. {} -- Empty object literals
 * 5. { ... } -- Non-empty object literals, when used to initialize a prototype, like `C.prototype = { m() { } }`
 *
 * This function returns the provided initializer, or undefined if it is not valid.
 *
 * @internal
 */
function getExpandoInitializer(initializer, isPrototypeAssignment) {
    if ((0, ts_1.isCallExpression)(initializer)) {
        var e = skipParentheses(initializer.expression);
        return e.kind === 217 /* SyntaxKind.FunctionExpression */ || e.kind === 218 /* SyntaxKind.ArrowFunction */ ? initializer : undefined;
    }
    if (initializer.kind === 217 /* SyntaxKind.FunctionExpression */ ||
        initializer.kind === 230 /* SyntaxKind.ClassExpression */ ||
        initializer.kind === 218 /* SyntaxKind.ArrowFunction */) {
        return initializer;
    }
    if ((0, ts_1.isObjectLiteralExpression)(initializer) && (initializer.properties.length === 0 || isPrototypeAssignment)) {
        return initializer;
    }
}
exports.getExpandoInitializer = getExpandoInitializer;
/**
 * A defaulted expando initializer matches the pattern
 * `Lhs = Lhs || ExpandoInitializer`
 * or `var Lhs = Lhs || ExpandoInitializer`
 *
 * The second Lhs is required to be the same as the first except that it may be prefixed with
 * 'window.', 'global.' or 'self.' The second Lhs is otherwise ignored by the binder and checker.
 */
function getDefaultedExpandoInitializer(name, initializer, isPrototypeAssignment) {
    var e = (0, ts_1.isBinaryExpression)(initializer)
        && (initializer.operatorToken.kind === 57 /* SyntaxKind.BarBarToken */ || initializer.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */)
        && getExpandoInitializer(initializer.right, isPrototypeAssignment);
    if (e && isSameEntityName(name, initializer.left)) {
        return e;
    }
}
/** @internal */
function isDefaultedExpandoInitializer(node) {
    var name = (0, ts_1.isVariableDeclaration)(node.parent) ? node.parent.name :
        (0, ts_1.isBinaryExpression)(node.parent) && node.parent.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */ ? node.parent.left :
            undefined;
    return name && getExpandoInitializer(node.right, isPrototypeAccess(name)) && isEntityNameExpression(name) && isSameEntityName(name, node.left);
}
exports.isDefaultedExpandoInitializer = isDefaultedExpandoInitializer;
/**
 * Given an expando initializer, return its declaration name, or the left-hand side of the assignment if it's part of an assignment declaration.
 *
 * @internal
 */
function getNameOfExpando(node) {
    if ((0, ts_1.isBinaryExpression)(node.parent)) {
        var parent_3 = ((node.parent.operatorToken.kind === 57 /* SyntaxKind.BarBarToken */ || node.parent.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */) && (0, ts_1.isBinaryExpression)(node.parent.parent)) ? node.parent.parent : node.parent;
        if (parent_3.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */ && (0, ts_1.isIdentifier)(parent_3.left)) {
            return parent_3.left;
        }
    }
    else if ((0, ts_1.isVariableDeclaration)(node.parent)) {
        return node.parent.name;
    }
}
exports.getNameOfExpando = getNameOfExpando;
/**
 * Is the 'declared' name the same as the one in the initializer?
 * @return true for identical entity names, as well as ones where the initializer is prefixed with
 * 'window', 'self' or 'global'. For example:
 *
 * var my = my || {}
 * var min = window.min || {}
 * my.app = self.my.app || class { }
 *
 * @internal
 */
function isSameEntityName(name, initializer) {
    if (isPropertyNameLiteral(name) && isPropertyNameLiteral(initializer)) {
        return getTextOfIdentifierOrLiteral(name) === getTextOfIdentifierOrLiteral(initializer);
    }
    if ((0, ts_1.isMemberName)(name) && isLiteralLikeAccess(initializer) &&
        (initializer.expression.kind === 110 /* SyntaxKind.ThisKeyword */ ||
            (0, ts_1.isIdentifier)(initializer.expression) &&
                (initializer.expression.escapedText === "window" ||
                    initializer.expression.escapedText === "self" ||
                    initializer.expression.escapedText === "global"))) {
        return isSameEntityName(name, getNameOrArgument(initializer));
    }
    if (isLiteralLikeAccess(name) && isLiteralLikeAccess(initializer)) {
        return getElementOrPropertyAccessName(name) === getElementOrPropertyAccessName(initializer)
            && isSameEntityName(name.expression, initializer.expression);
    }
    return false;
}
exports.isSameEntityName = isSameEntityName;
/** @internal */
function getRightMostAssignedExpression(node) {
    while (isAssignmentExpression(node, /*excludeCompoundAssignment*/ true)) {
        node = node.right;
    }
    return node;
}
exports.getRightMostAssignedExpression = getRightMostAssignedExpression;
/** @internal */
function isExportsIdentifier(node) {
    return (0, ts_1.isIdentifier)(node) && node.escapedText === "exports";
}
exports.isExportsIdentifier = isExportsIdentifier;
/** @internal */
function isModuleIdentifier(node) {
    return (0, ts_1.isIdentifier)(node) && node.escapedText === "module";
}
exports.isModuleIdentifier = isModuleIdentifier;
/** @internal */
function isModuleExportsAccessExpression(node) {
    return ((0, ts_1.isPropertyAccessExpression)(node) || isLiteralLikeElementAccess(node))
        && isModuleIdentifier(node.expression)
        && getElementOrPropertyAccessName(node) === "exports";
}
exports.isModuleExportsAccessExpression = isModuleExportsAccessExpression;
/// Given a BinaryExpression, returns SpecialPropertyAssignmentKind for the various kinds of property
/// assignments we treat as special in the binder
/** @internal */
function getAssignmentDeclarationKind(expr) {
    var special = getAssignmentDeclarationKindWorker(expr);
    return special === 5 /* AssignmentDeclarationKind.Property */ || isInJSFile(expr) ? special : 0 /* AssignmentDeclarationKind.None */;
}
exports.getAssignmentDeclarationKind = getAssignmentDeclarationKind;
/** @internal */
function isBindableObjectDefinePropertyCall(expr) {
    return (0, ts_1.length)(expr.arguments) === 3 &&
        (0, ts_1.isPropertyAccessExpression)(expr.expression) &&
        (0, ts_1.isIdentifier)(expr.expression.expression) &&
        (0, ts_1.idText)(expr.expression.expression) === "Object" &&
        (0, ts_1.idText)(expr.expression.name) === "defineProperty" &&
        isStringOrNumericLiteralLike(expr.arguments[1]) &&
        isBindableStaticNameExpression(expr.arguments[0], /*excludeThisKeyword*/ true);
}
exports.isBindableObjectDefinePropertyCall = isBindableObjectDefinePropertyCall;
/**
 * x.y OR x[0]
 *
 * @internal
 */
function isLiteralLikeAccess(node) {
    return (0, ts_1.isPropertyAccessExpression)(node) || isLiteralLikeElementAccess(node);
}
exports.isLiteralLikeAccess = isLiteralLikeAccess;
/**
 * x[0] OR x['a'] OR x[Symbol.y]
 *
 * @internal
 */
function isLiteralLikeElementAccess(node) {
    return (0, ts_1.isElementAccessExpression)(node) && isStringOrNumericLiteralLike(node.argumentExpression);
}
exports.isLiteralLikeElementAccess = isLiteralLikeElementAccess;
/**
 * Any series of property and element accesses.
 *
 * @internal
 */
function isBindableStaticAccessExpression(node, excludeThisKeyword) {
    return (0, ts_1.isPropertyAccessExpression)(node) && (!excludeThisKeyword && node.expression.kind === 110 /* SyntaxKind.ThisKeyword */ || (0, ts_1.isIdentifier)(node.name) && isBindableStaticNameExpression(node.expression, /*excludeThisKeyword*/ true))
        || isBindableStaticElementAccessExpression(node, excludeThisKeyword);
}
exports.isBindableStaticAccessExpression = isBindableStaticAccessExpression;
/**
 * Any series of property and element accesses, ending in a literal element access
 *
 * @internal
 */
function isBindableStaticElementAccessExpression(node, excludeThisKeyword) {
    return isLiteralLikeElementAccess(node)
        && ((!excludeThisKeyword && node.expression.kind === 110 /* SyntaxKind.ThisKeyword */) ||
            isEntityNameExpression(node.expression) ||
            isBindableStaticAccessExpression(node.expression, /*excludeThisKeyword*/ true));
}
exports.isBindableStaticElementAccessExpression = isBindableStaticElementAccessExpression;
/** @internal */
function isBindableStaticNameExpression(node, excludeThisKeyword) {
    return isEntityNameExpression(node) || isBindableStaticAccessExpression(node, excludeThisKeyword);
}
exports.isBindableStaticNameExpression = isBindableStaticNameExpression;
/** @internal */
function getNameOrArgument(expr) {
    if ((0, ts_1.isPropertyAccessExpression)(expr)) {
        return expr.name;
    }
    return expr.argumentExpression;
}
exports.getNameOrArgument = getNameOrArgument;
function getAssignmentDeclarationKindWorker(expr) {
    if ((0, ts_1.isCallExpression)(expr)) {
        if (!isBindableObjectDefinePropertyCall(expr)) {
            return 0 /* AssignmentDeclarationKind.None */;
        }
        var entityName = expr.arguments[0];
        if (isExportsIdentifier(entityName) || isModuleExportsAccessExpression(entityName)) {
            return 8 /* AssignmentDeclarationKind.ObjectDefinePropertyExports */;
        }
        if (isBindableStaticAccessExpression(entityName) && getElementOrPropertyAccessName(entityName) === "prototype") {
            return 9 /* AssignmentDeclarationKind.ObjectDefinePrototypeProperty */;
        }
        return 7 /* AssignmentDeclarationKind.ObjectDefinePropertyValue */;
    }
    if (expr.operatorToken.kind !== 64 /* SyntaxKind.EqualsToken */ || !isAccessExpression(expr.left) || isVoidZero(getRightMostAssignedExpression(expr))) {
        return 0 /* AssignmentDeclarationKind.None */;
    }
    if (isBindableStaticNameExpression(expr.left.expression, /*excludeThisKeyword*/ true) && getElementOrPropertyAccessName(expr.left) === "prototype" && (0, ts_1.isObjectLiteralExpression)(getInitializerOfBinaryExpression(expr))) {
        // F.prototype = { ... }
        return 6 /* AssignmentDeclarationKind.Prototype */;
    }
    return getAssignmentDeclarationPropertyAccessKind(expr.left);
}
function isVoidZero(node) {
    return (0, ts_1.isVoidExpression)(node) && (0, ts_1.isNumericLiteral)(node.expression) && node.expression.text === "0";
}
/**
 * Does not handle signed numeric names like `a[+0]` - handling those would require handling prefix unary expressions
 * throughout late binding handling as well, which is awkward (but ultimately probably doable if there is demand)
 *
 * @internal
 */
function getElementOrPropertyAccessArgumentExpressionOrName(node) {
    if ((0, ts_1.isPropertyAccessExpression)(node)) {
        return node.name;
    }
    var arg = skipParentheses(node.argumentExpression);
    if ((0, ts_1.isNumericLiteral)(arg) || (0, ts_1.isStringLiteralLike)(arg)) {
        return arg;
    }
    return node;
}
exports.getElementOrPropertyAccessArgumentExpressionOrName = getElementOrPropertyAccessArgumentExpressionOrName;
/** @internal */
function getElementOrPropertyAccessName(node) {
    var name = getElementOrPropertyAccessArgumentExpressionOrName(node);
    if (name) {
        if ((0, ts_1.isIdentifier)(name)) {
            return name.escapedText;
        }
        if ((0, ts_1.isStringLiteralLike)(name) || (0, ts_1.isNumericLiteral)(name)) {
            return (0, ts_1.escapeLeadingUnderscores)(name.text);
        }
    }
    return undefined;
}
exports.getElementOrPropertyAccessName = getElementOrPropertyAccessName;
/** @internal */
function getAssignmentDeclarationPropertyAccessKind(lhs) {
    if (lhs.expression.kind === 110 /* SyntaxKind.ThisKeyword */) {
        return 4 /* AssignmentDeclarationKind.ThisProperty */;
    }
    else if (isModuleExportsAccessExpression(lhs)) {
        // module.exports = expr
        return 2 /* AssignmentDeclarationKind.ModuleExports */;
    }
    else if (isBindableStaticNameExpression(lhs.expression, /*excludeThisKeyword*/ true)) {
        if (isPrototypeAccess(lhs.expression)) {
            // F.G....prototype.x = expr
            return 3 /* AssignmentDeclarationKind.PrototypeProperty */;
        }
        var nextToLast = lhs;
        while (!(0, ts_1.isIdentifier)(nextToLast.expression)) {
            nextToLast = nextToLast.expression;
        }
        var id = nextToLast.expression;
        if ((id.escapedText === "exports" ||
            id.escapedText === "module" && getElementOrPropertyAccessName(nextToLast) === "exports") &&
            // ExportsProperty does not support binding with computed names
            isBindableStaticAccessExpression(lhs)) {
            // exports.name = expr OR module.exports.name = expr OR exports["name"] = expr ...
            return 1 /* AssignmentDeclarationKind.ExportsProperty */;
        }
        if (isBindableStaticNameExpression(lhs, /*excludeThisKeyword*/ true) || ((0, ts_1.isElementAccessExpression)(lhs) && isDynamicName(lhs))) {
            // F.G...x = expr
            return 5 /* AssignmentDeclarationKind.Property */;
        }
    }
    return 0 /* AssignmentDeclarationKind.None */;
}
exports.getAssignmentDeclarationPropertyAccessKind = getAssignmentDeclarationPropertyAccessKind;
/** @internal */
function getInitializerOfBinaryExpression(expr) {
    while ((0, ts_1.isBinaryExpression)(expr.right)) {
        expr = expr.right;
    }
    return expr.right;
}
exports.getInitializerOfBinaryExpression = getInitializerOfBinaryExpression;
/** @internal */
function isPrototypePropertyAssignment(node) {
    return (0, ts_1.isBinaryExpression)(node) && getAssignmentDeclarationKind(node) === 3 /* AssignmentDeclarationKind.PrototypeProperty */;
}
exports.isPrototypePropertyAssignment = isPrototypePropertyAssignment;
/** @internal */
function isSpecialPropertyDeclaration(expr) {
    return isInJSFile(expr) &&
        expr.parent && expr.parent.kind === 243 /* SyntaxKind.ExpressionStatement */ &&
        (!(0, ts_1.isElementAccessExpression)(expr) || isLiteralLikeElementAccess(expr)) &&
        !!(0, ts_1.getJSDocTypeTag)(expr.parent);
}
exports.isSpecialPropertyDeclaration = isSpecialPropertyDeclaration;
/** @internal */
function setValueDeclaration(symbol, node) {
    var valueDeclaration = symbol.valueDeclaration;
    if (!valueDeclaration ||
        !(node.flags & 16777216 /* NodeFlags.Ambient */ && !isInJSFile(node) && !(valueDeclaration.flags & 16777216 /* NodeFlags.Ambient */)) &&
            (isAssignmentDeclaration(valueDeclaration) && !isAssignmentDeclaration(node)) ||
        (valueDeclaration.kind !== node.kind && isEffectiveModuleDeclaration(valueDeclaration))) {
        // other kinds of value declarations take precedence over modules and assignment declarations
        symbol.valueDeclaration = node;
    }
}
exports.setValueDeclaration = setValueDeclaration;
/** @internal */
function isFunctionSymbol(symbol) {
    if (!symbol || !symbol.valueDeclaration) {
        return false;
    }
    var decl = symbol.valueDeclaration;
    return decl.kind === 261 /* SyntaxKind.FunctionDeclaration */ || (0, ts_1.isVariableDeclaration)(decl) && decl.initializer && (0, ts_1.isFunctionLike)(decl.initializer);
}
exports.isFunctionSymbol = isFunctionSymbol;
/** @internal */
function tryGetModuleSpecifierFromDeclaration(node) {
    var _a, _b;
    switch (node.kind) {
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 207 /* SyntaxKind.BindingElement */:
            return (_a = (0, ts_1.findAncestor)(node.initializer, function (node) { return isRequireCall(node, /*requireStringLiteralLikeArgument*/ true); })) === null || _a === void 0 ? void 0 : _a.arguments[0];
        case 271 /* SyntaxKind.ImportDeclaration */:
            return (0, ts_1.tryCast)(node.moduleSpecifier, ts_1.isStringLiteralLike);
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            return (0, ts_1.tryCast)((_b = (0, ts_1.tryCast)(node.moduleReference, ts_1.isExternalModuleReference)) === null || _b === void 0 ? void 0 : _b.expression, ts_1.isStringLiteralLike);
        case 272 /* SyntaxKind.ImportClause */:
        case 279 /* SyntaxKind.NamespaceExport */:
            return (0, ts_1.tryCast)(node.parent.moduleSpecifier, ts_1.isStringLiteralLike);
        case 273 /* SyntaxKind.NamespaceImport */:
        case 280 /* SyntaxKind.ExportSpecifier */:
            return (0, ts_1.tryCast)(node.parent.parent.moduleSpecifier, ts_1.isStringLiteralLike);
        case 275 /* SyntaxKind.ImportSpecifier */:
            return (0, ts_1.tryCast)(node.parent.parent.parent.moduleSpecifier, ts_1.isStringLiteralLike);
        default:
            ts_1.Debug.assertNever(node);
    }
}
exports.tryGetModuleSpecifierFromDeclaration = tryGetModuleSpecifierFromDeclaration;
/** @internal */
function importFromModuleSpecifier(node) {
    return tryGetImportFromModuleSpecifier(node) || ts_1.Debug.failBadSyntaxKind(node.parent);
}
exports.importFromModuleSpecifier = importFromModuleSpecifier;
/** @internal */
function tryGetImportFromModuleSpecifier(node) {
    switch (node.parent.kind) {
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 277 /* SyntaxKind.ExportDeclaration */:
            return node.parent;
        case 282 /* SyntaxKind.ExternalModuleReference */:
            return node.parent.parent;
        case 212 /* SyntaxKind.CallExpression */:
            return isImportCall(node.parent) || isRequireCall(node.parent, /*requireStringLiteralLikeArgument*/ false) ? node.parent : undefined;
        case 200 /* SyntaxKind.LiteralType */:
            ts_1.Debug.assert((0, ts_1.isStringLiteral)(node));
            return (0, ts_1.tryCast)(node.parent.parent, ts_1.isImportTypeNode);
        default:
            return undefined;
    }
}
exports.tryGetImportFromModuleSpecifier = tryGetImportFromModuleSpecifier;
/** @internal */
function getExternalModuleName(node) {
    switch (node.kind) {
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 277 /* SyntaxKind.ExportDeclaration */:
            return node.moduleSpecifier;
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            return node.moduleReference.kind === 282 /* SyntaxKind.ExternalModuleReference */ ? node.moduleReference.expression : undefined;
        case 204 /* SyntaxKind.ImportType */:
            return isLiteralImportTypeNode(node) ? node.argument.literal : undefined;
        case 212 /* SyntaxKind.CallExpression */:
            return node.arguments[0];
        case 266 /* SyntaxKind.ModuleDeclaration */:
            return node.name.kind === 11 /* SyntaxKind.StringLiteral */ ? node.name : undefined;
        default:
            return ts_1.Debug.assertNever(node);
    }
}
exports.getExternalModuleName = getExternalModuleName;
/** @internal */
function getNamespaceDeclarationNode(node) {
    switch (node.kind) {
        case 271 /* SyntaxKind.ImportDeclaration */:
            return node.importClause && (0, ts_1.tryCast)(node.importClause.namedBindings, ts_1.isNamespaceImport);
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            return node;
        case 277 /* SyntaxKind.ExportDeclaration */:
            return node.exportClause && (0, ts_1.tryCast)(node.exportClause, ts_1.isNamespaceExport);
        default:
            return ts_1.Debug.assertNever(node);
    }
}
exports.getNamespaceDeclarationNode = getNamespaceDeclarationNode;
/** @internal */
function isDefaultImport(node) {
    return node.kind === 271 /* SyntaxKind.ImportDeclaration */ && !!node.importClause && !!node.importClause.name;
}
exports.isDefaultImport = isDefaultImport;
/** @internal */
function forEachImportClauseDeclaration(node, action) {
    if (node.name) {
        var result = action(node);
        if (result)
            return result;
    }
    if (node.namedBindings) {
        var result = (0, ts_1.isNamespaceImport)(node.namedBindings)
            ? action(node.namedBindings)
            : (0, ts_1.forEach)(node.namedBindings.elements, action);
        if (result)
            return result;
    }
}
exports.forEachImportClauseDeclaration = forEachImportClauseDeclaration;
/** @internal */
function hasQuestionToken(node) {
    if (node) {
        switch (node.kind) {
            case 168 /* SyntaxKind.Parameter */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            case 302 /* SyntaxKind.PropertyAssignment */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 170 /* SyntaxKind.PropertySignature */:
                return node.questionToken !== undefined;
        }
    }
    return false;
}
exports.hasQuestionToken = hasQuestionToken;
/** @internal */
function isJSDocConstructSignature(node) {
    var param = (0, ts_1.isJSDocFunctionType)(node) ? (0, ts_1.firstOrUndefined)(node.parameters) : undefined;
    var name = (0, ts_1.tryCast)(param && param.name, ts_1.isIdentifier);
    return !!name && name.escapedText === "new";
}
exports.isJSDocConstructSignature = isJSDocConstructSignature;
/** @internal */
function isJSDocTypeAlias(node) {
    return node.kind === 352 /* SyntaxKind.JSDocTypedefTag */ || node.kind === 344 /* SyntaxKind.JSDocCallbackTag */ || node.kind === 346 /* SyntaxKind.JSDocEnumTag */;
}
exports.isJSDocTypeAlias = isJSDocTypeAlias;
/** @internal */
function isTypeAlias(node) {
    return isJSDocTypeAlias(node) || (0, ts_1.isTypeAliasDeclaration)(node);
}
exports.isTypeAlias = isTypeAlias;
function getSourceOfAssignment(node) {
    return (0, ts_1.isExpressionStatement)(node) &&
        (0, ts_1.isBinaryExpression)(node.expression) &&
        node.expression.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */
        ? getRightMostAssignedExpression(node.expression)
        : undefined;
}
function getSourceOfDefaultedAssignment(node) {
    return (0, ts_1.isExpressionStatement)(node) &&
        (0, ts_1.isBinaryExpression)(node.expression) &&
        getAssignmentDeclarationKind(node.expression) !== 0 /* AssignmentDeclarationKind.None */ &&
        (0, ts_1.isBinaryExpression)(node.expression.right) &&
        (node.expression.right.operatorToken.kind === 57 /* SyntaxKind.BarBarToken */ || node.expression.right.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */)
        ? node.expression.right.right
        : undefined;
}
/** @internal */
function getSingleInitializerOfVariableStatementOrPropertyDeclaration(node) {
    switch (node.kind) {
        case 242 /* SyntaxKind.VariableStatement */:
            var v = getSingleVariableOfVariableStatement(node);
            return v && v.initializer;
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return node.initializer;
        case 302 /* SyntaxKind.PropertyAssignment */:
            return node.initializer;
    }
}
exports.getSingleInitializerOfVariableStatementOrPropertyDeclaration = getSingleInitializerOfVariableStatementOrPropertyDeclaration;
/** @internal */
function getSingleVariableOfVariableStatement(node) {
    return (0, ts_1.isVariableStatement)(node) ? (0, ts_1.firstOrUndefined)(node.declarationList.declarations) : undefined;
}
exports.getSingleVariableOfVariableStatement = getSingleVariableOfVariableStatement;
function getNestedModuleDeclaration(node) {
    return (0, ts_1.isModuleDeclaration)(node) &&
        node.body &&
        node.body.kind === 266 /* SyntaxKind.ModuleDeclaration */
        ? node.body
        : undefined;
}
/** @internal */
function canHaveFlowNode(node) {
    if (node.kind >= 242 /* SyntaxKind.FirstStatement */ && node.kind <= 258 /* SyntaxKind.LastStatement */) {
        return true;
    }
    switch (node.kind) {
        case 80 /* SyntaxKind.Identifier */:
        case 110 /* SyntaxKind.ThisKeyword */:
        case 108 /* SyntaxKind.SuperKeyword */:
        case 165 /* SyntaxKind.QualifiedName */:
        case 235 /* SyntaxKind.MetaProperty */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 207 /* SyntaxKind.BindingElement */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
            return true;
        default:
            return false;
    }
}
exports.canHaveFlowNode = canHaveFlowNode;
/** @internal */
function canHaveJSDoc(node) {
    switch (node.kind) {
        case 218 /* SyntaxKind.ArrowFunction */:
        case 225 /* SyntaxKind.BinaryExpression */:
        case 240 /* SyntaxKind.Block */:
        case 251 /* SyntaxKind.BreakStatement */:
        case 178 /* SyntaxKind.CallSignature */:
        case 295 /* SyntaxKind.CaseClause */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
        case 175 /* SyntaxKind.Constructor */:
        case 184 /* SyntaxKind.ConstructorType */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 250 /* SyntaxKind.ContinueStatement */:
        case 258 /* SyntaxKind.DebuggerStatement */:
        case 245 /* SyntaxKind.DoStatement */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
        case 241 /* SyntaxKind.EmptyStatement */:
        case 1 /* SyntaxKind.EndOfFileToken */:
        case 265 /* SyntaxKind.EnumDeclaration */:
        case 305 /* SyntaxKind.EnumMember */:
        case 276 /* SyntaxKind.ExportAssignment */:
        case 277 /* SyntaxKind.ExportDeclaration */:
        case 280 /* SyntaxKind.ExportSpecifier */:
        case 243 /* SyntaxKind.ExpressionStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
        case 247 /* SyntaxKind.ForStatement */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 183 /* SyntaxKind.FunctionType */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 80 /* SyntaxKind.Identifier */:
        case 244 /* SyntaxKind.IfStatement */:
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 323 /* SyntaxKind.JSDocFunctionType */:
        case 329 /* SyntaxKind.JSDocSignature */:
        case 255 /* SyntaxKind.LabeledStatement */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 201 /* SyntaxKind.NamedTupleMember */:
        case 269 /* SyntaxKind.NamespaceExportDeclaration */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 168 /* SyntaxKind.Parameter */:
        case 216 /* SyntaxKind.ParenthesizedExpression */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 302 /* SyntaxKind.PropertyAssignment */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 252 /* SyntaxKind.ReturnStatement */:
        case 239 /* SyntaxKind.SemicolonClassElement */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
        case 304 /* SyntaxKind.SpreadAssignment */:
        case 254 /* SyntaxKind.SwitchStatement */:
        case 256 /* SyntaxKind.ThrowStatement */:
        case 257 /* SyntaxKind.TryStatement */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 167 /* SyntaxKind.TypeParameter */:
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 242 /* SyntaxKind.VariableStatement */:
        case 246 /* SyntaxKind.WhileStatement */:
        case 253 /* SyntaxKind.WithStatement */:
            return true;
        default:
            return false;
    }
}
exports.canHaveJSDoc = canHaveJSDoc;
function getJSDocCommentsAndTags(hostNode, noCache) {
    var result;
    // Pull parameter comments from declaring function as well
    if (isVariableLike(hostNode) && (0, ts_1.hasInitializer)(hostNode) && (0, ts_1.hasJSDocNodes)(hostNode.initializer)) {
        result = (0, ts_1.addRange)(result, filterOwnedJSDocTags(hostNode, (0, ts_1.last)(hostNode.initializer.jsDoc)));
    }
    var node = hostNode;
    while (node && node.parent) {
        if ((0, ts_1.hasJSDocNodes)(node)) {
            result = (0, ts_1.addRange)(result, filterOwnedJSDocTags(hostNode, (0, ts_1.last)(node.jsDoc)));
        }
        if (node.kind === 168 /* SyntaxKind.Parameter */) {
            result = (0, ts_1.addRange)(result, (noCache ? ts_1.getJSDocParameterTagsNoCache : ts_1.getJSDocParameterTags)(node));
            break;
        }
        if (node.kind === 167 /* SyntaxKind.TypeParameter */) {
            result = (0, ts_1.addRange)(result, (noCache ? ts_1.getJSDocTypeParameterTagsNoCache : ts_1.getJSDocTypeParameterTags)(node));
            break;
        }
        node = getNextJSDocCommentLocation(node);
    }
    return result || ts_1.emptyArray;
}
exports.getJSDocCommentsAndTags = getJSDocCommentsAndTags;
function filterOwnedJSDocTags(hostNode, jsDoc) {
    if ((0, ts_1.isJSDoc)(jsDoc)) {
        var ownedTags = (0, ts_1.filter)(jsDoc.tags, function (tag) { return ownsJSDocTag(hostNode, tag); });
        return jsDoc.tags === ownedTags ? [jsDoc] : ownedTags;
    }
    return ownsJSDocTag(hostNode, jsDoc) ? [jsDoc] : undefined;
}
/**
 * Determines whether a host node owns a jsDoc tag. A `@type`/`@satisfies` tag attached to a
 * a ParenthesizedExpression belongs only to the ParenthesizedExpression.
 */
function ownsJSDocTag(hostNode, tag) {
    return !((0, ts_1.isJSDocTypeTag)(tag) || (0, ts_1.isJSDocSatisfiesTag)(tag))
        || !tag.parent
        || !(0, ts_1.isJSDoc)(tag.parent)
        || !(0, ts_1.isParenthesizedExpression)(tag.parent.parent)
        || tag.parent.parent === hostNode;
}
/** @internal */
function getNextJSDocCommentLocation(node) {
    var parent = node.parent;
    if (parent.kind === 302 /* SyntaxKind.PropertyAssignment */ ||
        parent.kind === 276 /* SyntaxKind.ExportAssignment */ ||
        parent.kind === 171 /* SyntaxKind.PropertyDeclaration */ ||
        parent.kind === 243 /* SyntaxKind.ExpressionStatement */ && node.kind === 210 /* SyntaxKind.PropertyAccessExpression */ ||
        parent.kind === 252 /* SyntaxKind.ReturnStatement */ ||
        getNestedModuleDeclaration(parent) ||
        (0, ts_1.isBinaryExpression)(node) && node.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */) {
        return parent;
    }
    // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
    // /**
    //   * @param {number} name
    //   * @returns {number}
    //   */
    // var x = function(name) { return name.length; }
    else if (parent.parent &&
        (getSingleVariableOfVariableStatement(parent.parent) === node ||
            (0, ts_1.isBinaryExpression)(parent) && parent.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */)) {
        return parent.parent;
    }
    else if (parent.parent && parent.parent.parent &&
        (getSingleVariableOfVariableStatement(parent.parent.parent) ||
            getSingleInitializerOfVariableStatementOrPropertyDeclaration(parent.parent.parent) === node ||
            getSourceOfDefaultedAssignment(parent.parent.parent))) {
        return parent.parent.parent;
    }
}
exports.getNextJSDocCommentLocation = getNextJSDocCommentLocation;
/**
 * Does the opposite of `getJSDocParameterTags`: given a JSDoc parameter, finds the parameter corresponding to it.
 *
 * @internal
 */
function getParameterSymbolFromJSDoc(node) {
    if (node.symbol) {
        return node.symbol;
    }
    if (!(0, ts_1.isIdentifier)(node.name)) {
        return undefined;
    }
    var name = node.name.escapedText;
    var decl = getHostSignatureFromJSDoc(node);
    if (!decl) {
        return undefined;
    }
    var parameter = (0, ts_1.find)(decl.parameters, function (p) { return p.name.kind === 80 /* SyntaxKind.Identifier */ && p.name.escapedText === name; });
    return parameter && parameter.symbol;
}
exports.getParameterSymbolFromJSDoc = getParameterSymbolFromJSDoc;
/** @internal */
function getEffectiveContainerForJSDocTemplateTag(node) {
    if ((0, ts_1.isJSDoc)(node.parent) && node.parent.tags) {
        // A @template tag belongs to any @typedef, @callback, or @enum tags in the same comment block, if they exist.
        var typeAlias = (0, ts_1.find)(node.parent.tags, isJSDocTypeAlias);
        if (typeAlias) {
            return typeAlias;
        }
    }
    // otherwise it belongs to the host it annotates
    return getHostSignatureFromJSDoc(node);
}
exports.getEffectiveContainerForJSDocTemplateTag = getEffectiveContainerForJSDocTemplateTag;
/** @internal */
function getHostSignatureFromJSDoc(node) {
    var host = getEffectiveJSDocHost(node);
    if (host) {
        return (0, ts_1.isPropertySignature)(host) && host.type && (0, ts_1.isFunctionLike)(host.type) ? host.type :
            (0, ts_1.isFunctionLike)(host) ? host : undefined;
    }
    return undefined;
}
exports.getHostSignatureFromJSDoc = getHostSignatureFromJSDoc;
/** @internal */
function getEffectiveJSDocHost(node) {
    var host = getJSDocHost(node);
    if (host) {
        return getSourceOfDefaultedAssignment(host)
            || getSourceOfAssignment(host)
            || getSingleInitializerOfVariableStatementOrPropertyDeclaration(host)
            || getSingleVariableOfVariableStatement(host)
            || getNestedModuleDeclaration(host)
            || host;
    }
}
exports.getEffectiveJSDocHost = getEffectiveJSDocHost;
/**
 * Use getEffectiveJSDocHost if you additionally need to look for jsdoc on parent nodes, like assignments.
 *
 * @internal
 */
function getJSDocHost(node) {
    var jsDoc = getJSDocRoot(node);
    if (!jsDoc) {
        return undefined;
    }
    var host = jsDoc.parent;
    if (host && host.jsDoc && jsDoc === (0, ts_1.lastOrUndefined)(host.jsDoc)) {
        return host;
    }
}
exports.getJSDocHost = getJSDocHost;
/** @internal */
function getJSDocRoot(node) {
    return (0, ts_1.findAncestor)(node.parent, ts_1.isJSDoc);
}
exports.getJSDocRoot = getJSDocRoot;
/** @internal */
function getTypeParameterFromJsDoc(node) {
    var name = node.name.escapedText;
    var typeParameters = node.parent.parent.parent.typeParameters;
    return typeParameters && (0, ts_1.find)(typeParameters, function (p) { return p.name.escapedText === name; });
}
exports.getTypeParameterFromJsDoc = getTypeParameterFromJsDoc;
/** @internal */
function hasTypeArguments(node) {
    return !!node.typeArguments;
}
exports.hasTypeArguments = hasTypeArguments;
/** @internal */
function getAssignmentTargetKind(node) {
    var parent = node.parent;
    while (true) {
        switch (parent.kind) {
            case 225 /* SyntaxKind.BinaryExpression */:
                var binaryOperator = parent.operatorToken.kind;
                return isAssignmentOperator(binaryOperator) && parent.left === node ?
                    binaryOperator === 64 /* SyntaxKind.EqualsToken */ || isLogicalOrCoalescingAssignmentOperator(binaryOperator) ? 1 /* AssignmentKind.Definite */ : 2 /* AssignmentKind.Compound */ :
                    0 /* AssignmentKind.None */;
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                var unaryOperator = parent.operator;
                return unaryOperator === 46 /* SyntaxKind.PlusPlusToken */ || unaryOperator === 47 /* SyntaxKind.MinusMinusToken */ ? 2 /* AssignmentKind.Compound */ : 0 /* AssignmentKind.None */;
            case 248 /* SyntaxKind.ForInStatement */:
            case 249 /* SyntaxKind.ForOfStatement */:
                return parent.initializer === node ? 1 /* AssignmentKind.Definite */ : 0 /* AssignmentKind.None */;
            case 216 /* SyntaxKind.ParenthesizedExpression */:
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
            case 229 /* SyntaxKind.SpreadElement */:
            case 234 /* SyntaxKind.NonNullExpression */:
                node = parent;
                break;
            case 304 /* SyntaxKind.SpreadAssignment */:
                node = parent.parent;
                break;
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                if (parent.name !== node) {
                    return 0 /* AssignmentKind.None */;
                }
                node = parent.parent;
                break;
            case 302 /* SyntaxKind.PropertyAssignment */:
                if (parent.name === node) {
                    return 0 /* AssignmentKind.None */;
                }
                node = parent.parent;
                break;
            default:
                return 0 /* AssignmentKind.None */;
        }
        parent = node.parent;
    }
}
exports.getAssignmentTargetKind = getAssignmentTargetKind;
// A node is an assignment target if it is on the left hand side of an '=' token, if it is parented by a property
// assignment in an object literal that is an assignment target, or if it is parented by an array literal that is
// an assignment target. Examples include 'a = xxx', '{ p: a } = xxx', '[{ a }] = xxx'.
// (Note that `p` is not a target in the above examples, only `a`.)
/** @internal */
function isAssignmentTarget(node) {
    return getAssignmentTargetKind(node) !== 0 /* AssignmentKind.None */;
}
exports.isAssignmentTarget = isAssignmentTarget;
/**
 * Indicates whether a node could contain a `var` VariableDeclarationList that contributes to
 * the same `var` declaration scope as the node's parent.
 *
 * @internal
 */
function isNodeWithPossibleHoistedDeclaration(node) {
    switch (node.kind) {
        case 240 /* SyntaxKind.Block */:
        case 242 /* SyntaxKind.VariableStatement */:
        case 253 /* SyntaxKind.WithStatement */:
        case 244 /* SyntaxKind.IfStatement */:
        case 254 /* SyntaxKind.SwitchStatement */:
        case 268 /* SyntaxKind.CaseBlock */:
        case 295 /* SyntaxKind.CaseClause */:
        case 296 /* SyntaxKind.DefaultClause */:
        case 255 /* SyntaxKind.LabeledStatement */:
        case 247 /* SyntaxKind.ForStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
        case 245 /* SyntaxKind.DoStatement */:
        case 246 /* SyntaxKind.WhileStatement */:
        case 257 /* SyntaxKind.TryStatement */:
        case 298 /* SyntaxKind.CatchClause */:
            return true;
    }
    return false;
}
exports.isNodeWithPossibleHoistedDeclaration = isNodeWithPossibleHoistedDeclaration;
/** @internal */
function isValueSignatureDeclaration(node) {
    return (0, ts_1.isFunctionExpression)(node) || (0, ts_1.isArrowFunction)(node) || (0, ts_1.isMethodOrAccessor)(node) || (0, ts_1.isFunctionDeclaration)(node) || (0, ts_1.isConstructorDeclaration)(node);
}
exports.isValueSignatureDeclaration = isValueSignatureDeclaration;
function walkUp(node, kind) {
    while (node && node.kind === kind) {
        node = node.parent;
    }
    return node;
}
/** @internal */
function walkUpParenthesizedTypes(node) {
    return walkUp(node, 195 /* SyntaxKind.ParenthesizedType */);
}
exports.walkUpParenthesizedTypes = walkUpParenthesizedTypes;
/** @internal */
function walkUpParenthesizedExpressions(node) {
    return walkUp(node, 216 /* SyntaxKind.ParenthesizedExpression */);
}
exports.walkUpParenthesizedExpressions = walkUpParenthesizedExpressions;
/**
 * Walks up parenthesized types.
 * It returns both the outermost parenthesized type and its parent.
 * If given node is not a parenthesiezd type, undefined is return as the former.
 *
 * @internal
 */
function walkUpParenthesizedTypesAndGetParentAndChild(node) {
    var child;
    while (node && node.kind === 195 /* SyntaxKind.ParenthesizedType */) {
        child = node;
        node = node.parent;
    }
    return [child, node];
}
exports.walkUpParenthesizedTypesAndGetParentAndChild = walkUpParenthesizedTypesAndGetParentAndChild;
/** @internal */
function skipTypeParentheses(node) {
    while ((0, ts_1.isParenthesizedTypeNode)(node))
        node = node.type;
    return node;
}
exports.skipTypeParentheses = skipTypeParentheses;
/** @internal */
function skipParentheses(node, excludeJSDocTypeAssertions) {
    var flags = excludeJSDocTypeAssertions ?
        1 /* OuterExpressionKinds.Parentheses */ | 16 /* OuterExpressionKinds.ExcludeJSDocTypeAssertion */ :
        1 /* OuterExpressionKinds.Parentheses */;
    return (0, ts_1.skipOuterExpressions)(node, flags);
}
exports.skipParentheses = skipParentheses;
// a node is delete target iff. it is PropertyAccessExpression/ElementAccessExpression with parentheses skipped
/** @internal */
function isDeleteTarget(node) {
    if (node.kind !== 210 /* SyntaxKind.PropertyAccessExpression */ && node.kind !== 211 /* SyntaxKind.ElementAccessExpression */) {
        return false;
    }
    node = walkUpParenthesizedExpressions(node.parent);
    return node && node.kind === 219 /* SyntaxKind.DeleteExpression */;
}
exports.isDeleteTarget = isDeleteTarget;
/** @internal */
function isNodeDescendantOf(node, ancestor) {
    while (node) {
        if (node === ancestor)
            return true;
        node = node.parent;
    }
    return false;
}
exports.isNodeDescendantOf = isNodeDescendantOf;
// True if `name` is the name of a declaration node
/** @internal */
function isDeclarationName(name) {
    return !(0, ts_1.isSourceFile)(name) && !(0, ts_1.isBindingPattern)(name) && (0, ts_1.isDeclaration)(name.parent) && name.parent.name === name;
}
exports.isDeclarationName = isDeclarationName;
// See GH#16030
/** @internal */
function getDeclarationFromName(name) {
    var parent = name.parent;
    switch (name.kind) {
        case 11 /* SyntaxKind.StringLiteral */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 9 /* SyntaxKind.NumericLiteral */:
            if ((0, ts_1.isComputedPropertyName)(parent))
                return parent.parent;
        // falls through
        case 80 /* SyntaxKind.Identifier */:
            if ((0, ts_1.isDeclaration)(parent)) {
                return parent.name === name ? parent : undefined;
            }
            else if ((0, ts_1.isQualifiedName)(parent)) {
                var tag = parent.parent;
                return (0, ts_1.isJSDocParameterTag)(tag) && tag.name === parent ? tag : undefined;
            }
            else {
                var binExp = parent.parent;
                return (0, ts_1.isBinaryExpression)(binExp) &&
                    getAssignmentDeclarationKind(binExp) !== 0 /* AssignmentDeclarationKind.None */ &&
                    (binExp.left.symbol || binExp.symbol) &&
                    (0, ts_1.getNameOfDeclaration)(binExp) === name
                    ? binExp
                    : undefined;
            }
        case 81 /* SyntaxKind.PrivateIdentifier */:
            return (0, ts_1.isDeclaration)(parent) && parent.name === name ? parent : undefined;
        default:
            return undefined;
    }
}
exports.getDeclarationFromName = getDeclarationFromName;
/** @internal */
function isLiteralComputedPropertyDeclarationName(node) {
    return isStringOrNumericLiteralLike(node) &&
        node.parent.kind === 166 /* SyntaxKind.ComputedPropertyName */ &&
        (0, ts_1.isDeclaration)(node.parent.parent);
}
exports.isLiteralComputedPropertyDeclarationName = isLiteralComputedPropertyDeclarationName;
// Return true if the given identifier is classified as an IdentifierName
/** @internal */
function isIdentifierName(node) {
    var parent = node.parent;
    switch (parent.kind) {
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 305 /* SyntaxKind.EnumMember */:
        case 302 /* SyntaxKind.PropertyAssignment */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
            // Name in member declaration or property name in property access
            return parent.name === node;
        case 165 /* SyntaxKind.QualifiedName */:
            // Name on right hand side of dot in a type query or type reference
            return parent.right === node;
        case 207 /* SyntaxKind.BindingElement */:
        case 275 /* SyntaxKind.ImportSpecifier */:
            // Property name in binding element or import specifier
            return parent.propertyName === node;
        case 280 /* SyntaxKind.ExportSpecifier */:
        case 290 /* SyntaxKind.JsxAttribute */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
        case 285 /* SyntaxKind.JsxOpeningElement */:
        case 286 /* SyntaxKind.JsxClosingElement */:
            // Any name in an export specifier or JSX Attribute or Jsx Element
            return true;
    }
    return false;
}
exports.isIdentifierName = isIdentifierName;
// An alias symbol is created by one of the following declarations:
// import <symbol> = ...
// import <symbol> from ...
// import * as <symbol> from ...
// import { x as <symbol> } from ...
// export { x as <symbol> } from ...
// export * as ns <symbol> from ...
// export = <EntityNameExpression>
// export default <EntityNameExpression>
// module.exports = <EntityNameExpression>
// module.exports.x = <EntityNameExpression>
// const x = require("...")
// const { x } = require("...")
// const x = require("...").y
// const { x } = require("...").y
/** @internal */
function isAliasSymbolDeclaration(node) {
    if (node.kind === 270 /* SyntaxKind.ImportEqualsDeclaration */ ||
        node.kind === 269 /* SyntaxKind.NamespaceExportDeclaration */ ||
        node.kind === 272 /* SyntaxKind.ImportClause */ && !!node.name ||
        node.kind === 273 /* SyntaxKind.NamespaceImport */ ||
        node.kind === 279 /* SyntaxKind.NamespaceExport */ ||
        node.kind === 275 /* SyntaxKind.ImportSpecifier */ ||
        node.kind === 280 /* SyntaxKind.ExportSpecifier */ ||
        node.kind === 276 /* SyntaxKind.ExportAssignment */ && exportAssignmentIsAlias(node)) {
        return true;
    }
    return isInJSFile(node) && ((0, ts_1.isBinaryExpression)(node) && getAssignmentDeclarationKind(node) === 2 /* AssignmentDeclarationKind.ModuleExports */ && exportAssignmentIsAlias(node) ||
        (0, ts_1.isPropertyAccessExpression)(node)
            && (0, ts_1.isBinaryExpression)(node.parent)
            && node.parent.left === node
            && node.parent.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */
            && isAliasableExpression(node.parent.right));
}
exports.isAliasSymbolDeclaration = isAliasSymbolDeclaration;
/** @internal */
function getAliasDeclarationFromName(node) {
    switch (node.parent.kind) {
        case 272 /* SyntaxKind.ImportClause */:
        case 275 /* SyntaxKind.ImportSpecifier */:
        case 273 /* SyntaxKind.NamespaceImport */:
        case 280 /* SyntaxKind.ExportSpecifier */:
        case 276 /* SyntaxKind.ExportAssignment */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
        case 279 /* SyntaxKind.NamespaceExport */:
            return node.parent;
        case 165 /* SyntaxKind.QualifiedName */:
            do {
                node = node.parent;
            } while (node.parent.kind === 165 /* SyntaxKind.QualifiedName */);
            return getAliasDeclarationFromName(node);
    }
}
exports.getAliasDeclarationFromName = getAliasDeclarationFromName;
/** @internal */
function isAliasableExpression(e) {
    return isEntityNameExpression(e) || (0, ts_1.isClassExpression)(e);
}
exports.isAliasableExpression = isAliasableExpression;
/** @internal */
function exportAssignmentIsAlias(node) {
    var e = getExportAssignmentExpression(node);
    return isAliasableExpression(e);
}
exports.exportAssignmentIsAlias = exportAssignmentIsAlias;
/** @internal */
function getExportAssignmentExpression(node) {
    return (0, ts_1.isExportAssignment)(node) ? node.expression : node.right;
}
exports.getExportAssignmentExpression = getExportAssignmentExpression;
/** @internal */
function getPropertyAssignmentAliasLikeExpression(node) {
    return node.kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */ ? node.name : node.kind === 302 /* SyntaxKind.PropertyAssignment */ ? node.initializer :
        node.parent.right;
}
exports.getPropertyAssignmentAliasLikeExpression = getPropertyAssignmentAliasLikeExpression;
/** @internal */
function getEffectiveBaseTypeNode(node) {
    var baseType = getClassExtendsHeritageElement(node);
    if (baseType && isInJSFile(node)) {
        // Prefer an @augments tag because it may have type parameters.
        var tag = (0, ts_1.getJSDocAugmentsTag)(node);
        if (tag) {
            return tag.class;
        }
    }
    return baseType;
}
exports.getEffectiveBaseTypeNode = getEffectiveBaseTypeNode;
/** @internal */
function getClassExtendsHeritageElement(node) {
    var heritageClause = getHeritageClause(node.heritageClauses, 96 /* SyntaxKind.ExtendsKeyword */);
    return heritageClause && heritageClause.types.length > 0 ? heritageClause.types[0] : undefined;
}
exports.getClassExtendsHeritageElement = getClassExtendsHeritageElement;
/** @internal */
function getEffectiveImplementsTypeNodes(node) {
    if (isInJSFile(node)) {
        return (0, ts_1.getJSDocImplementsTags)(node).map(function (n) { return n.class; });
    }
    else {
        var heritageClause = getHeritageClause(node.heritageClauses, 119 /* SyntaxKind.ImplementsKeyword */);
        return heritageClause === null || heritageClause === void 0 ? void 0 : heritageClause.types;
    }
}
exports.getEffectiveImplementsTypeNodes = getEffectiveImplementsTypeNodes;
/**
 * Returns the node in an `extends` or `implements` clause of a class or interface.
 *
 * @internal
 */
function getAllSuperTypeNodes(node) {
    return (0, ts_1.isInterfaceDeclaration)(node) ? getInterfaceBaseTypeNodes(node) || ts_1.emptyArray :
        (0, ts_1.isClassLike)(node) ? (0, ts_1.concatenate)((0, ts_1.singleElementArray)(getEffectiveBaseTypeNode(node)), getEffectiveImplementsTypeNodes(node)) || ts_1.emptyArray :
            ts_1.emptyArray;
}
exports.getAllSuperTypeNodes = getAllSuperTypeNodes;
/** @internal */
function getInterfaceBaseTypeNodes(node) {
    var heritageClause = getHeritageClause(node.heritageClauses, 96 /* SyntaxKind.ExtendsKeyword */);
    return heritageClause ? heritageClause.types : undefined;
}
exports.getInterfaceBaseTypeNodes = getInterfaceBaseTypeNodes;
/** @internal */
function getHeritageClause(clauses, kind) {
    if (clauses) {
        for (var _i = 0, clauses_1 = clauses; _i < clauses_1.length; _i++) {
            var clause = clauses_1[_i];
            if (clause.token === kind) {
                return clause;
            }
        }
    }
    return undefined;
}
exports.getHeritageClause = getHeritageClause;
/** @internal */
function getAncestor(node, kind) {
    while (node) {
        if (node.kind === kind) {
            return node;
        }
        node = node.parent;
    }
    return undefined;
}
exports.getAncestor = getAncestor;
/** @internal */
function isKeyword(token) {
    return 83 /* SyntaxKind.FirstKeyword */ <= token && token <= 164 /* SyntaxKind.LastKeyword */;
}
exports.isKeyword = isKeyword;
/** @internal */
function isPunctuation(token) {
    return 19 /* SyntaxKind.FirstPunctuation */ <= token && token <= 79 /* SyntaxKind.LastPunctuation */;
}
exports.isPunctuation = isPunctuation;
/** @internal */
function isKeywordOrPunctuation(token) {
    return isKeyword(token) || isPunctuation(token);
}
exports.isKeywordOrPunctuation = isKeywordOrPunctuation;
/** @internal */
function isContextualKeyword(token) {
    return 128 /* SyntaxKind.FirstContextualKeyword */ <= token && token <= 164 /* SyntaxKind.LastContextualKeyword */;
}
exports.isContextualKeyword = isContextualKeyword;
/** @internal */
function isNonContextualKeyword(token) {
    return isKeyword(token) && !isContextualKeyword(token);
}
exports.isNonContextualKeyword = isNonContextualKeyword;
/** @internal */
function isFutureReservedKeyword(token) {
    return 119 /* SyntaxKind.FirstFutureReservedWord */ <= token && token <= 127 /* SyntaxKind.LastFutureReservedWord */;
}
exports.isFutureReservedKeyword = isFutureReservedKeyword;
/** @internal */
function isStringANonContextualKeyword(name) {
    var token = (0, ts_1.stringToToken)(name);
    return token !== undefined && isNonContextualKeyword(token);
}
exports.isStringANonContextualKeyword = isStringANonContextualKeyword;
/** @internal */
function isStringAKeyword(name) {
    var token = (0, ts_1.stringToToken)(name);
    return token !== undefined && isKeyword(token);
}
exports.isStringAKeyword = isStringAKeyword;
/** @internal */
function isIdentifierANonContextualKeyword(node) {
    var originalKeywordKind = (0, ts_1.identifierToKeywordKind)(node);
    return !!originalKeywordKind && !isContextualKeyword(originalKeywordKind);
}
exports.isIdentifierANonContextualKeyword = isIdentifierANonContextualKeyword;
/** @internal */
function isTrivia(token) {
    return 2 /* SyntaxKind.FirstTriviaToken */ <= token && token <= 7 /* SyntaxKind.LastTriviaToken */;
}
exports.isTrivia = isTrivia;
/** @internal */
function getFunctionFlags(node) {
    if (!node) {
        return 4 /* FunctionFlags.Invalid */;
    }
    var flags = 0 /* FunctionFlags.Normal */;
    switch (node.kind) {
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 173 /* SyntaxKind.MethodDeclaration */:
            if (node.asteriskToken) {
                flags |= 1 /* FunctionFlags.Generator */;
            }
        // falls through
        case 218 /* SyntaxKind.ArrowFunction */:
            if (hasSyntacticModifier(node, 512 /* ModifierFlags.Async */)) {
                flags |= 2 /* FunctionFlags.Async */;
            }
            break;
    }
    if (!node.body) {
        flags |= 4 /* FunctionFlags.Invalid */;
    }
    return flags;
}
exports.getFunctionFlags = getFunctionFlags;
/** @internal */
function isAsyncFunction(node) {
    switch (node.kind) {
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
        case 173 /* SyntaxKind.MethodDeclaration */:
            return node.body !== undefined
                && node.asteriskToken === undefined
                && hasSyntacticModifier(node, 512 /* ModifierFlags.Async */);
    }
    return false;
}
exports.isAsyncFunction = isAsyncFunction;
/** @internal */
function isStringOrNumericLiteralLike(node) {
    return (0, ts_1.isStringLiteralLike)(node) || (0, ts_1.isNumericLiteral)(node);
}
exports.isStringOrNumericLiteralLike = isStringOrNumericLiteralLike;
/** @internal */
function isSignedNumericLiteral(node) {
    return (0, ts_1.isPrefixUnaryExpression)(node) && (node.operator === 40 /* SyntaxKind.PlusToken */ || node.operator === 41 /* SyntaxKind.MinusToken */) && (0, ts_1.isNumericLiteral)(node.operand);
}
exports.isSignedNumericLiteral = isSignedNumericLiteral;
/**
 * A declaration has a dynamic name if all of the following are true:
 *   1. The declaration has a computed property name.
 *   2. The computed name is *not* expressed as a StringLiteral.
 *   3. The computed name is *not* expressed as a NumericLiteral.
 *   4. The computed name is *not* expressed as a PlusToken or MinusToken
 *      immediately followed by a NumericLiteral.
 *
 * @internal
 */
function hasDynamicName(declaration) {
    var name = (0, ts_1.getNameOfDeclaration)(declaration);
    return !!name && isDynamicName(name);
}
exports.hasDynamicName = hasDynamicName;
/** @internal */
function isDynamicName(name) {
    if (!(name.kind === 166 /* SyntaxKind.ComputedPropertyName */ || name.kind === 211 /* SyntaxKind.ElementAccessExpression */)) {
        return false;
    }
    var expr = (0, ts_1.isElementAccessExpression)(name) ? skipParentheses(name.argumentExpression) : name.expression;
    return !isStringOrNumericLiteralLike(expr) &&
        !isSignedNumericLiteral(expr);
}
exports.isDynamicName = isDynamicName;
/** @internal */
function getPropertyNameForPropertyNameNode(name) {
    switch (name.kind) {
        case 80 /* SyntaxKind.Identifier */:
        case 81 /* SyntaxKind.PrivateIdentifier */:
            return name.escapedText;
        case 11 /* SyntaxKind.StringLiteral */:
        case 9 /* SyntaxKind.NumericLiteral */:
            return (0, ts_1.escapeLeadingUnderscores)(name.text);
        case 166 /* SyntaxKind.ComputedPropertyName */:
            var nameExpression = name.expression;
            if (isStringOrNumericLiteralLike(nameExpression)) {
                return (0, ts_1.escapeLeadingUnderscores)(nameExpression.text);
            }
            else if (isSignedNumericLiteral(nameExpression)) {
                if (nameExpression.operator === 41 /* SyntaxKind.MinusToken */) {
                    return (0, ts_1.tokenToString)(nameExpression.operator) + nameExpression.operand.text;
                }
                return nameExpression.operand.text;
            }
            return undefined;
        case 294 /* SyntaxKind.JsxNamespacedName */:
            return getEscapedTextOfJsxNamespacedName(name);
        default:
            return ts_1.Debug.assertNever(name);
    }
}
exports.getPropertyNameForPropertyNameNode = getPropertyNameForPropertyNameNode;
/** @internal */
function isPropertyNameLiteral(node) {
    switch (node.kind) {
        case 80 /* SyntaxKind.Identifier */:
        case 11 /* SyntaxKind.StringLiteral */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 9 /* SyntaxKind.NumericLiteral */:
            return true;
        default:
            return false;
    }
}
exports.isPropertyNameLiteral = isPropertyNameLiteral;
/** @internal */
function getTextOfIdentifierOrLiteral(node) {
    return (0, ts_1.isMemberName)(node) ? (0, ts_1.idText)(node) : (0, ts_1.isJsxNamespacedName)(node) ? getTextOfJsxNamespacedName(node) : node.text;
}
exports.getTextOfIdentifierOrLiteral = getTextOfIdentifierOrLiteral;
/** @internal */
function getEscapedTextOfIdentifierOrLiteral(node) {
    return (0, ts_1.isMemberName)(node) ? node.escapedText : (0, ts_1.isJsxNamespacedName)(node) ? getEscapedTextOfJsxNamespacedName(node) : (0, ts_1.escapeLeadingUnderscores)(node.text);
}
exports.getEscapedTextOfIdentifierOrLiteral = getEscapedTextOfIdentifierOrLiteral;
/** @internal */
function getPropertyNameForUniqueESSymbol(symbol) {
    return "__@".concat((0, ts_1.getSymbolId)(symbol), "@").concat(symbol.escapedName);
}
exports.getPropertyNameForUniqueESSymbol = getPropertyNameForUniqueESSymbol;
/** @internal */
function getSymbolNameForPrivateIdentifier(containingClassSymbol, description) {
    return "__#".concat((0, ts_1.getSymbolId)(containingClassSymbol), "@").concat(description);
}
exports.getSymbolNameForPrivateIdentifier = getSymbolNameForPrivateIdentifier;
/** @internal */
function isKnownSymbol(symbol) {
    return (0, ts_1.startsWith)(symbol.escapedName, "__@");
}
exports.isKnownSymbol = isKnownSymbol;
/** @internal */
function isPrivateIdentifierSymbol(symbol) {
    return (0, ts_1.startsWith)(symbol.escapedName, "__#");
}
exports.isPrivateIdentifierSymbol = isPrivateIdentifierSymbol;
/**
 * Includes the word "Symbol" with unicode escapes
 *
 * @internal
 */
function isESSymbolIdentifier(node) {
    return node.kind === 80 /* SyntaxKind.Identifier */ && node.escapedText === "Symbol";
}
exports.isESSymbolIdentifier = isESSymbolIdentifier;
/**
 * Indicates whether a property name is the special `__proto__` property.
 * Per the ECMA-262 spec, this only matters for property assignments whose name is
 * the Identifier `__proto__`, or the string literal `"__proto__"`, but not for
 * computed property names.
 *
 * @internal
 */
function isProtoSetter(node) {
    return (0, ts_1.isIdentifier)(node) ? (0, ts_1.idText)(node) === "__proto__" :
        (0, ts_1.isStringLiteral)(node) && node.text === "__proto__";
}
exports.isProtoSetter = isProtoSetter;
/**
 * Indicates whether an expression is an anonymous function definition.
 *
 * @see https://tc39.es/ecma262/#sec-isanonymousfunctiondefinition
 * @internal
 */
function isAnonymousFunctionDefinition(node, cb) {
    node = (0, ts_1.skipOuterExpressions)(node);
    switch (node.kind) {
        case 230 /* SyntaxKind.ClassExpression */:
        case 217 /* SyntaxKind.FunctionExpression */:
            if (node.name) {
                return false;
            }
            break;
        case 218 /* SyntaxKind.ArrowFunction */:
            break;
        default:
            return false;
    }
    return typeof cb === "function" ? cb(node) : true;
}
exports.isAnonymousFunctionDefinition = isAnonymousFunctionDefinition;
/**
 * Indicates whether a node is a potential source of an assigned name for a class, function, or arrow function.
 *
 * @internal
 */
function isNamedEvaluationSource(node) {
    switch (node.kind) {
        case 302 /* SyntaxKind.PropertyAssignment */:
            return !isProtoSetter(node.name);
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            return !!node.objectAssignmentInitializer;
        case 259 /* SyntaxKind.VariableDeclaration */:
            return (0, ts_1.isIdentifier)(node.name) && !!node.initializer;
        case 168 /* SyntaxKind.Parameter */:
            return (0, ts_1.isIdentifier)(node.name) && !!node.initializer && !node.dotDotDotToken;
        case 207 /* SyntaxKind.BindingElement */:
            return (0, ts_1.isIdentifier)(node.name) && !!node.initializer && !node.dotDotDotToken;
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return !!node.initializer;
        case 225 /* SyntaxKind.BinaryExpression */:
            switch (node.operatorToken.kind) {
                case 64 /* SyntaxKind.EqualsToken */:
                case 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */:
                case 76 /* SyntaxKind.BarBarEqualsToken */:
                case 78 /* SyntaxKind.QuestionQuestionEqualsToken */:
                    return (0, ts_1.isIdentifier)(node.left);
            }
            break;
        case 276 /* SyntaxKind.ExportAssignment */:
            return true;
    }
    return false;
}
exports.isNamedEvaluationSource = isNamedEvaluationSource;
/** @internal */
function isNamedEvaluation(node, cb) {
    if (!isNamedEvaluationSource(node))
        return false;
    switch (node.kind) {
        case 302 /* SyntaxKind.PropertyAssignment */:
            return isAnonymousFunctionDefinition(node.initializer, cb);
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            return isAnonymousFunctionDefinition(node.objectAssignmentInitializer, cb);
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 168 /* SyntaxKind.Parameter */:
        case 207 /* SyntaxKind.BindingElement */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return isAnonymousFunctionDefinition(node.initializer, cb);
        case 225 /* SyntaxKind.BinaryExpression */:
            return isAnonymousFunctionDefinition(node.right, cb);
        case 276 /* SyntaxKind.ExportAssignment */:
            return isAnonymousFunctionDefinition(node.expression, cb);
    }
}
exports.isNamedEvaluation = isNamedEvaluation;
/** @internal */
function isPushOrUnshiftIdentifier(node) {
    return node.escapedText === "push" || node.escapedText === "unshift";
}
exports.isPushOrUnshiftIdentifier = isPushOrUnshiftIdentifier;
// TODO(jakebailey): this function should not be named this. While it does technically
// return true if the argument is a ParameterDeclaration, it also returns true for nodes
// that are children of ParameterDeclarations inside binding elements.
// Probably, this should be called `rootDeclarationIsParameter`.
/**
 * This function returns true if the this node's root declaration is a parameter.
 * For example, passing a `ParameterDeclaration` will return true, as will passing a
 * binding element that is a child of a `ParameterDeclaration`.
 *
 * If you are looking to test that a `Node` is a `ParameterDeclaration`, use `isParameter`.
 *
 * @internal
 */
function isParameterDeclaration(node) {
    var root = getRootDeclaration(node);
    return root.kind === 168 /* SyntaxKind.Parameter */;
}
exports.isParameterDeclaration = isParameterDeclaration;
/** @internal */
function getRootDeclaration(node) {
    while (node.kind === 207 /* SyntaxKind.BindingElement */) {
        node = node.parent.parent;
    }
    return node;
}
exports.getRootDeclaration = getRootDeclaration;
/** @internal */
function nodeStartsNewLexicalEnvironment(node) {
    var kind = node.kind;
    return kind === 175 /* SyntaxKind.Constructor */
        || kind === 217 /* SyntaxKind.FunctionExpression */
        || kind === 261 /* SyntaxKind.FunctionDeclaration */
        || kind === 218 /* SyntaxKind.ArrowFunction */
        || kind === 173 /* SyntaxKind.MethodDeclaration */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */
        || kind === 311 /* SyntaxKind.SourceFile */;
}
exports.nodeStartsNewLexicalEnvironment = nodeStartsNewLexicalEnvironment;
/** @internal */
function nodeIsSynthesized(range) {
    return positionIsSynthesized(range.pos)
        || positionIsSynthesized(range.end);
}
exports.nodeIsSynthesized = nodeIsSynthesized;
/** @internal */
function getOriginalSourceFile(sourceFile) {
    return (0, ts_1.getParseTreeNode)(sourceFile, ts_1.isSourceFile) || sourceFile;
}
exports.getOriginalSourceFile = getOriginalSourceFile;
/** @internal */
function getExpressionAssociativity(expression) {
    var operator = getOperator(expression);
    var hasArguments = expression.kind === 213 /* SyntaxKind.NewExpression */ && expression.arguments !== undefined;
    return getOperatorAssociativity(expression.kind, operator, hasArguments);
}
exports.getExpressionAssociativity = getExpressionAssociativity;
/** @internal */
function getOperatorAssociativity(kind, operator, hasArguments) {
    switch (kind) {
        case 213 /* SyntaxKind.NewExpression */:
            return hasArguments ? 0 /* Associativity.Left */ : 1 /* Associativity.Right */;
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
        case 220 /* SyntaxKind.TypeOfExpression */:
        case 221 /* SyntaxKind.VoidExpression */:
        case 219 /* SyntaxKind.DeleteExpression */:
        case 222 /* SyntaxKind.AwaitExpression */:
        case 226 /* SyntaxKind.ConditionalExpression */:
        case 228 /* SyntaxKind.YieldExpression */:
            return 1 /* Associativity.Right */;
        case 225 /* SyntaxKind.BinaryExpression */:
            switch (operator) {
                case 43 /* SyntaxKind.AsteriskAsteriskToken */:
                case 64 /* SyntaxKind.EqualsToken */:
                case 65 /* SyntaxKind.PlusEqualsToken */:
                case 66 /* SyntaxKind.MinusEqualsToken */:
                case 68 /* SyntaxKind.AsteriskAsteriskEqualsToken */:
                case 67 /* SyntaxKind.AsteriskEqualsToken */:
                case 69 /* SyntaxKind.SlashEqualsToken */:
                case 70 /* SyntaxKind.PercentEqualsToken */:
                case 71 /* SyntaxKind.LessThanLessThanEqualsToken */:
                case 72 /* SyntaxKind.GreaterThanGreaterThanEqualsToken */:
                case 73 /* SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken */:
                case 74 /* SyntaxKind.AmpersandEqualsToken */:
                case 79 /* SyntaxKind.CaretEqualsToken */:
                case 75 /* SyntaxKind.BarEqualsToken */:
                case 76 /* SyntaxKind.BarBarEqualsToken */:
                case 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */:
                case 78 /* SyntaxKind.QuestionQuestionEqualsToken */:
                    return 1 /* Associativity.Right */;
            }
    }
    return 0 /* Associativity.Left */;
}
exports.getOperatorAssociativity = getOperatorAssociativity;
/** @internal */
function getExpressionPrecedence(expression) {
    var operator = getOperator(expression);
    var hasArguments = expression.kind === 213 /* SyntaxKind.NewExpression */ && expression.arguments !== undefined;
    return getOperatorPrecedence(expression.kind, operator, hasArguments);
}
exports.getExpressionPrecedence = getExpressionPrecedence;
/** @internal */
function getOperator(expression) {
    if (expression.kind === 225 /* SyntaxKind.BinaryExpression */) {
        return expression.operatorToken.kind;
    }
    else if (expression.kind === 223 /* SyntaxKind.PrefixUnaryExpression */ || expression.kind === 224 /* SyntaxKind.PostfixUnaryExpression */) {
        return expression.operator;
    }
    else {
        return expression.kind;
    }
}
exports.getOperator = getOperator;
/** @internal */
function getOperatorPrecedence(nodeKind, operatorKind, hasArguments) {
    switch (nodeKind) {
        case 360 /* SyntaxKind.CommaListExpression */:
            return 0 /* OperatorPrecedence.Comma */;
        case 229 /* SyntaxKind.SpreadElement */:
            return 1 /* OperatorPrecedence.Spread */;
        case 228 /* SyntaxKind.YieldExpression */:
            return 2 /* OperatorPrecedence.Yield */;
        case 226 /* SyntaxKind.ConditionalExpression */:
            return 4 /* OperatorPrecedence.Conditional */;
        case 225 /* SyntaxKind.BinaryExpression */:
            switch (operatorKind) {
                case 28 /* SyntaxKind.CommaToken */:
                    return 0 /* OperatorPrecedence.Comma */;
                case 64 /* SyntaxKind.EqualsToken */:
                case 65 /* SyntaxKind.PlusEqualsToken */:
                case 66 /* SyntaxKind.MinusEqualsToken */:
                case 68 /* SyntaxKind.AsteriskAsteriskEqualsToken */:
                case 67 /* SyntaxKind.AsteriskEqualsToken */:
                case 69 /* SyntaxKind.SlashEqualsToken */:
                case 70 /* SyntaxKind.PercentEqualsToken */:
                case 71 /* SyntaxKind.LessThanLessThanEqualsToken */:
                case 72 /* SyntaxKind.GreaterThanGreaterThanEqualsToken */:
                case 73 /* SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken */:
                case 74 /* SyntaxKind.AmpersandEqualsToken */:
                case 79 /* SyntaxKind.CaretEqualsToken */:
                case 75 /* SyntaxKind.BarEqualsToken */:
                case 76 /* SyntaxKind.BarBarEqualsToken */:
                case 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */:
                case 78 /* SyntaxKind.QuestionQuestionEqualsToken */:
                    return 3 /* OperatorPrecedence.Assignment */;
                default:
                    return getBinaryOperatorPrecedence(operatorKind);
            }
        // TODO: Should prefix `++` and `--` be moved to the `Update` precedence?
        case 215 /* SyntaxKind.TypeAssertionExpression */:
        case 234 /* SyntaxKind.NonNullExpression */:
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
        case 220 /* SyntaxKind.TypeOfExpression */:
        case 221 /* SyntaxKind.VoidExpression */:
        case 219 /* SyntaxKind.DeleteExpression */:
        case 222 /* SyntaxKind.AwaitExpression */:
            return 16 /* OperatorPrecedence.Unary */;
        case 224 /* SyntaxKind.PostfixUnaryExpression */:
            return 17 /* OperatorPrecedence.Update */;
        case 212 /* SyntaxKind.CallExpression */:
            return 18 /* OperatorPrecedence.LeftHandSide */;
        case 213 /* SyntaxKind.NewExpression */:
            return hasArguments ? 19 /* OperatorPrecedence.Member */ : 18 /* OperatorPrecedence.LeftHandSide */;
        case 214 /* SyntaxKind.TaggedTemplateExpression */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
        case 235 /* SyntaxKind.MetaProperty */:
            return 19 /* OperatorPrecedence.Member */;
        case 233 /* SyntaxKind.AsExpression */:
        case 237 /* SyntaxKind.SatisfiesExpression */:
            return 11 /* OperatorPrecedence.Relational */;
        case 110 /* SyntaxKind.ThisKeyword */:
        case 108 /* SyntaxKind.SuperKeyword */:
        case 80 /* SyntaxKind.Identifier */:
        case 81 /* SyntaxKind.PrivateIdentifier */:
        case 106 /* SyntaxKind.NullKeyword */:
        case 112 /* SyntaxKind.TrueKeyword */:
        case 97 /* SyntaxKind.FalseKeyword */:
        case 9 /* SyntaxKind.NumericLiteral */:
        case 10 /* SyntaxKind.BigIntLiteral */:
        case 11 /* SyntaxKind.StringLiteral */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 14 /* SyntaxKind.RegularExpressionLiteral */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 227 /* SyntaxKind.TemplateExpression */:
        case 216 /* SyntaxKind.ParenthesizedExpression */:
        case 231 /* SyntaxKind.OmittedExpression */:
        case 283 /* SyntaxKind.JsxElement */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
        case 287 /* SyntaxKind.JsxFragment */:
            return 20 /* OperatorPrecedence.Primary */;
        default:
            return -1 /* OperatorPrecedence.Invalid */;
    }
}
exports.getOperatorPrecedence = getOperatorPrecedence;
/** @internal */
function getBinaryOperatorPrecedence(kind) {
    switch (kind) {
        case 61 /* SyntaxKind.QuestionQuestionToken */:
            return 4 /* OperatorPrecedence.Coalesce */;
        case 57 /* SyntaxKind.BarBarToken */:
            return 5 /* OperatorPrecedence.LogicalOR */;
        case 56 /* SyntaxKind.AmpersandAmpersandToken */:
            return 6 /* OperatorPrecedence.LogicalAND */;
        case 52 /* SyntaxKind.BarToken */:
            return 7 /* OperatorPrecedence.BitwiseOR */;
        case 53 /* SyntaxKind.CaretToken */:
            return 8 /* OperatorPrecedence.BitwiseXOR */;
        case 51 /* SyntaxKind.AmpersandToken */:
            return 9 /* OperatorPrecedence.BitwiseAND */;
        case 35 /* SyntaxKind.EqualsEqualsToken */:
        case 36 /* SyntaxKind.ExclamationEqualsToken */:
        case 37 /* SyntaxKind.EqualsEqualsEqualsToken */:
        case 38 /* SyntaxKind.ExclamationEqualsEqualsToken */:
            return 10 /* OperatorPrecedence.Equality */;
        case 30 /* SyntaxKind.LessThanToken */:
        case 32 /* SyntaxKind.GreaterThanToken */:
        case 33 /* SyntaxKind.LessThanEqualsToken */:
        case 34 /* SyntaxKind.GreaterThanEqualsToken */:
        case 104 /* SyntaxKind.InstanceOfKeyword */:
        case 103 /* SyntaxKind.InKeyword */:
        case 130 /* SyntaxKind.AsKeyword */:
        case 152 /* SyntaxKind.SatisfiesKeyword */:
            return 11 /* OperatorPrecedence.Relational */;
        case 48 /* SyntaxKind.LessThanLessThanToken */:
        case 49 /* SyntaxKind.GreaterThanGreaterThanToken */:
        case 50 /* SyntaxKind.GreaterThanGreaterThanGreaterThanToken */:
            return 12 /* OperatorPrecedence.Shift */;
        case 40 /* SyntaxKind.PlusToken */:
        case 41 /* SyntaxKind.MinusToken */:
            return 13 /* OperatorPrecedence.Additive */;
        case 42 /* SyntaxKind.AsteriskToken */:
        case 44 /* SyntaxKind.SlashToken */:
        case 45 /* SyntaxKind.PercentToken */:
            return 14 /* OperatorPrecedence.Multiplicative */;
        case 43 /* SyntaxKind.AsteriskAsteriskToken */:
            return 15 /* OperatorPrecedence.Exponentiation */;
    }
    // -1 is lower than all other precedences.  Returning it will cause binary expression
    // parsing to stop.
    return -1;
}
exports.getBinaryOperatorPrecedence = getBinaryOperatorPrecedence;
/** @internal */
function getSemanticJsxChildren(children) {
    return (0, ts_1.filter)(children, function (i) {
        switch (i.kind) {
            case 293 /* SyntaxKind.JsxExpression */:
                return !!i.expression;
            case 12 /* SyntaxKind.JsxText */:
                return !i.containsOnlyTriviaWhiteSpaces;
            default:
                return true;
        }
    });
}
exports.getSemanticJsxChildren = getSemanticJsxChildren;
/** @internal */
function createDiagnosticCollection() {
    var nonFileDiagnostics = []; // See GH#19873
    var filesWithDiagnostics = [];
    var fileDiagnostics = new Map();
    var hasReadNonFileDiagnostics = false;
    return {
        add: add,
        lookup: lookup,
        getGlobalDiagnostics: getGlobalDiagnostics,
        getDiagnostics: getDiagnostics,
    };
    function lookup(diagnostic) {
        var diagnostics;
        if (diagnostic.file) {
            diagnostics = fileDiagnostics.get(diagnostic.file.fileName);
        }
        else {
            diagnostics = nonFileDiagnostics;
        }
        if (!diagnostics) {
            return undefined;
        }
        var result = (0, ts_1.binarySearch)(diagnostics, diagnostic, ts_1.identity, compareDiagnosticsSkipRelatedInformation);
        if (result >= 0) {
            return diagnostics[result];
        }
        return undefined;
    }
    function add(diagnostic) {
        var diagnostics;
        if (diagnostic.file) {
            diagnostics = fileDiagnostics.get(diagnostic.file.fileName);
            if (!diagnostics) {
                diagnostics = []; // See GH#19873
                fileDiagnostics.set(diagnostic.file.fileName, diagnostics);
                (0, ts_1.insertSorted)(filesWithDiagnostics, diagnostic.file.fileName, ts_1.compareStringsCaseSensitive);
            }
        }
        else {
            // If we've already read the non-file diagnostics, do not modify the existing array.
            if (hasReadNonFileDiagnostics) {
                hasReadNonFileDiagnostics = false;
                nonFileDiagnostics = nonFileDiagnostics.slice();
            }
            diagnostics = nonFileDiagnostics;
        }
        (0, ts_1.insertSorted)(diagnostics, diagnostic, compareDiagnosticsSkipRelatedInformation);
    }
    function getGlobalDiagnostics() {
        hasReadNonFileDiagnostics = true;
        return nonFileDiagnostics;
    }
    function getDiagnostics(fileName) {
        if (fileName) {
            return fileDiagnostics.get(fileName) || [];
        }
        var fileDiags = (0, ts_1.flatMapToMutable)(filesWithDiagnostics, function (f) { return fileDiagnostics.get(f); });
        if (!nonFileDiagnostics.length) {
            return fileDiags;
        }
        fileDiags.unshift.apply(fileDiags, nonFileDiagnostics);
        return fileDiags;
    }
}
exports.createDiagnosticCollection = createDiagnosticCollection;
var templateSubstitutionRegExp = /\$\{/g;
function escapeTemplateSubstitution(str) {
    return str.replace(templateSubstitutionRegExp, "\\${");
}
/** @internal */
function hasInvalidEscape(template) {
    return template && !!((0, ts_1.isNoSubstitutionTemplateLiteral)(template)
        ? template.templateFlags
        : (template.head.templateFlags || (0, ts_1.some)(template.templateSpans, function (span) { return !!span.literal.templateFlags; })));
}
exports.hasInvalidEscape = hasInvalidEscape;
// This consists of the first 19 unprintable ASCII characters, canonical escapes, lineSeparator,
// paragraphSeparator, and nextLine. The latter three are just desirable to suppress new lines in
// the language service. These characters should be escaped when printing, and if any characters are added,
// the map below must be updated. Note that this regexp *does not* include the 'delete' character.
// There is no reason for this other than that JSON.stringify does not handle it either.
var doubleQuoteEscapedCharsRegExp = /[\\\"\u0000-\u001f\t\v\f\b\r\n\u2028\u2029\u0085]/g;
var singleQuoteEscapedCharsRegExp = /[\\\'\u0000-\u001f\t\v\f\b\r\n\u2028\u2029\u0085]/g;
// Template strings preserve simple LF newlines, still encode CRLF (or CR)
var backtickQuoteEscapedCharsRegExp = /\r\n|[\\\`\u0000-\u001f\t\v\f\b\r\u2028\u2029\u0085]/g;
var escapedCharsMap = new Map(Object.entries({
    "\t": "\\t",
    "\v": "\\v",
    "\f": "\\f",
    "\b": "\\b",
    "\r": "\\r",
    "\n": "\\n",
    "\\": "\\\\",
    "\"": "\\\"",
    "\'": "\\\'",
    "\`": "\\\`",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
    "\u0085": "\\u0085",
    "\r\n": "\\r\\n", // special case for CRLFs in backticks
}));
function encodeUtf16EscapeSequence(charCode) {
    var hexCharCode = charCode.toString(16).toUpperCase();
    var paddedHexCode = ("0000" + hexCharCode).slice(-4);
    return "\\u" + paddedHexCode;
}
function getReplacement(c, offset, input) {
    if (c.charCodeAt(0) === 0 /* CharacterCodes.nullCharacter */) {
        var lookAhead = input.charCodeAt(offset + c.length);
        if (lookAhead >= 48 /* CharacterCodes._0 */ && lookAhead <= 57 /* CharacterCodes._9 */) {
            // If the null character is followed by digits, print as a hex escape to prevent the result from parsing as an octal (which is forbidden in strict mode)
            return "\\x00";
        }
        // Otherwise, keep printing a literal \0 for the null character
        return "\\0";
    }
    return escapedCharsMap.get(c) || encodeUtf16EscapeSequence(c.charCodeAt(0));
}
/**
 * Based heavily on the abstract 'Quote'/'QuoteJSONString' operation from ECMA-262 (24.3.2.2),
 * but augmented for a few select characters (e.g. lineSeparator, paragraphSeparator, nextLine)
 * Note that this doesn't actually wrap the input in double quotes.
 *
 * @internal
 */
function escapeString(s, quoteChar) {
    var escapedCharsRegExp = quoteChar === 96 /* CharacterCodes.backtick */ ? backtickQuoteEscapedCharsRegExp :
        quoteChar === 39 /* CharacterCodes.singleQuote */ ? singleQuoteEscapedCharsRegExp :
            doubleQuoteEscapedCharsRegExp;
    return s.replace(escapedCharsRegExp, getReplacement);
}
exports.escapeString = escapeString;
var nonAsciiCharacters = /[^\u0000-\u007F]/g;
/** @internal */
function escapeNonAsciiString(s, quoteChar) {
    s = escapeString(s, quoteChar);
    // Replace non-ASCII characters with '\uNNNN' escapes if any exist.
    // Otherwise just return the original string.
    return nonAsciiCharacters.test(s) ?
        s.replace(nonAsciiCharacters, function (c) { return encodeUtf16EscapeSequence(c.charCodeAt(0)); }) :
        s;
}
exports.escapeNonAsciiString = escapeNonAsciiString;
// This consists of the first 19 unprintable ASCII characters, JSX canonical escapes, lineSeparator,
// paragraphSeparator, and nextLine. The latter three are just desirable to suppress new lines in
// the language service. These characters should be escaped when printing, and if any characters are added,
// the map below must be updated.
var jsxDoubleQuoteEscapedCharsRegExp = /[\"\u0000-\u001f\u2028\u2029\u0085]/g;
var jsxSingleQuoteEscapedCharsRegExp = /[\'\u0000-\u001f\u2028\u2029\u0085]/g;
var jsxEscapedCharsMap = new Map(Object.entries({
    "\"": "&quot;",
    "\'": "&apos;"
}));
function encodeJsxCharacterEntity(charCode) {
    var hexCharCode = charCode.toString(16).toUpperCase();
    return "&#x" + hexCharCode + ";";
}
function getJsxAttributeStringReplacement(c) {
    if (c.charCodeAt(0) === 0 /* CharacterCodes.nullCharacter */) {
        return "&#0;";
    }
    return jsxEscapedCharsMap.get(c) || encodeJsxCharacterEntity(c.charCodeAt(0));
}
/** @internal */
function escapeJsxAttributeString(s, quoteChar) {
    var escapedCharsRegExp = quoteChar === 39 /* CharacterCodes.singleQuote */ ? jsxSingleQuoteEscapedCharsRegExp :
        jsxDoubleQuoteEscapedCharsRegExp;
    return s.replace(escapedCharsRegExp, getJsxAttributeStringReplacement);
}
exports.escapeJsxAttributeString = escapeJsxAttributeString;
/**
 * Strip off existed surrounding single quotes, double quotes, or backticks from a given string
 *
 * @return non-quoted string
 *
 * @internal
 */
function stripQuotes(name) {
    var length = name.length;
    if (length >= 2 && name.charCodeAt(0) === name.charCodeAt(length - 1) && isQuoteOrBacktick(name.charCodeAt(0))) {
        return name.substring(1, length - 1);
    }
    return name;
}
exports.stripQuotes = stripQuotes;
function isQuoteOrBacktick(charCode) {
    return charCode === 39 /* CharacterCodes.singleQuote */ ||
        charCode === 34 /* CharacterCodes.doubleQuote */ ||
        charCode === 96 /* CharacterCodes.backtick */;
}
/** @internal */
function isIntrinsicJsxName(name) {
    var ch = name.charCodeAt(0);
    return (ch >= 97 /* CharacterCodes.a */ && ch <= 122 /* CharacterCodes.z */) || (0, ts_1.stringContains)(name, "-");
}
exports.isIntrinsicJsxName = isIntrinsicJsxName;
var indentStrings = ["", "    "];
/** @internal */
function getIndentString(level) {
    // prepopulate cache
    var singleLevel = indentStrings[1];
    for (var current = indentStrings.length; current <= level; current++) {
        indentStrings.push(indentStrings[current - 1] + singleLevel);
    }
    return indentStrings[level];
}
exports.getIndentString = getIndentString;
/** @internal */
function getIndentSize() {
    return indentStrings[1].length;
}
exports.getIndentSize = getIndentSize;
/** @internal */
function isNightly() {
    return (0, ts_1.stringContains)(ts_1.version, "-dev") || (0, ts_1.stringContains)(ts_1.version, "-insiders");
}
exports.isNightly = isNightly;
/** @internal */
function createTextWriter(newLine) {
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var output;
    var indent;
    var lineStart;
    var lineCount;
    var linePos;
    var hasTrailingComment = false;
    /* eslint-enable no-var */
    function updateLineCountAndPosFor(s) {
        var lineStartsOfS = (0, ts_1.computeLineStarts)(s);
        if (lineStartsOfS.length > 1) {
            lineCount = lineCount + lineStartsOfS.length - 1;
            linePos = output.length - s.length + (0, ts_1.last)(lineStartsOfS);
            lineStart = (linePos - output.length) === 0;
        }
        else {
            lineStart = false;
        }
    }
    function writeText(s) {
        if (s && s.length) {
            if (lineStart) {
                s = getIndentString(indent) + s;
                lineStart = false;
            }
            output += s;
            updateLineCountAndPosFor(s);
        }
    }
    function write(s) {
        if (s)
            hasTrailingComment = false;
        writeText(s);
    }
    function writeComment(s) {
        if (s)
            hasTrailingComment = true;
        writeText(s);
    }
    function reset() {
        output = "";
        indent = 0;
        lineStart = true;
        lineCount = 0;
        linePos = 0;
        hasTrailingComment = false;
    }
    function rawWrite(s) {
        if (s !== undefined) {
            output += s;
            updateLineCountAndPosFor(s);
            hasTrailingComment = false;
        }
    }
    function writeLiteral(s) {
        if (s && s.length) {
            write(s);
        }
    }
    function writeLine(force) {
        if (!lineStart || force) {
            output += newLine;
            lineCount++;
            linePos = output.length;
            lineStart = true;
            hasTrailingComment = false;
        }
    }
    function getTextPosWithWriteLine() {
        return lineStart ? output.length : (output.length + newLine.length);
    }
    reset();
    return {
        write: write,
        rawWrite: rawWrite,
        writeLiteral: writeLiteral,
        writeLine: writeLine,
        increaseIndent: function () { indent++; },
        decreaseIndent: function () { indent--; },
        getIndent: function () { return indent; },
        getTextPos: function () { return output.length; },
        getLine: function () { return lineCount; },
        getColumn: function () { return lineStart ? indent * getIndentSize() : output.length - linePos; },
        getText: function () { return output; },
        isAtStartOfLine: function () { return lineStart; },
        hasTrailingComment: function () { return hasTrailingComment; },
        hasTrailingWhitespace: function () { return !!output.length && (0, ts_1.isWhiteSpaceLike)(output.charCodeAt(output.length - 1)); },
        clear: reset,
        writeKeyword: write,
        writeOperator: write,
        writeParameter: write,
        writeProperty: write,
        writePunctuation: write,
        writeSpace: write,
        writeStringLiteral: write,
        writeSymbol: function (s, _) { return write(s); },
        writeTrailingSemicolon: write,
        writeComment: writeComment,
        getTextPosWithWriteLine: getTextPosWithWriteLine
    };
}
exports.createTextWriter = createTextWriter;
/** @internal */
function getTrailingSemicolonDeferringWriter(writer) {
    var pendingTrailingSemicolon = false;
    function commitPendingTrailingSemicolon() {
        if (pendingTrailingSemicolon) {
            writer.writeTrailingSemicolon(";");
            pendingTrailingSemicolon = false;
        }
    }
    return __assign(__assign({}, writer), { writeTrailingSemicolon: function () {
            pendingTrailingSemicolon = true;
        }, writeLiteral: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeLiteral(s);
        }, writeStringLiteral: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeStringLiteral(s);
        }, writeSymbol: function (s, sym) {
            commitPendingTrailingSemicolon();
            writer.writeSymbol(s, sym);
        }, writePunctuation: function (s) {
            commitPendingTrailingSemicolon();
            writer.writePunctuation(s);
        }, writeKeyword: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeKeyword(s);
        }, writeOperator: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeOperator(s);
        }, writeParameter: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeParameter(s);
        }, writeSpace: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeSpace(s);
        }, writeProperty: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeProperty(s);
        }, writeComment: function (s) {
            commitPendingTrailingSemicolon();
            writer.writeComment(s);
        }, writeLine: function () {
            commitPendingTrailingSemicolon();
            writer.writeLine();
        }, increaseIndent: function () {
            commitPendingTrailingSemicolon();
            writer.increaseIndent();
        }, decreaseIndent: function () {
            commitPendingTrailingSemicolon();
            writer.decreaseIndent();
        } });
}
exports.getTrailingSemicolonDeferringWriter = getTrailingSemicolonDeferringWriter;
/** @internal */
function hostUsesCaseSensitiveFileNames(host) {
    return host.useCaseSensitiveFileNames ? host.useCaseSensitiveFileNames() : false;
}
exports.hostUsesCaseSensitiveFileNames = hostUsesCaseSensitiveFileNames;
/** @internal */
function hostGetCanonicalFileName(host) {
    return (0, ts_1.createGetCanonicalFileName)(hostUsesCaseSensitiveFileNames(host));
}
exports.hostGetCanonicalFileName = hostGetCanonicalFileName;
/** @internal */
function getResolvedExternalModuleName(host, file, referenceFile) {
    return file.moduleName || getExternalModuleNameFromPath(host, file.fileName, referenceFile && referenceFile.fileName);
}
exports.getResolvedExternalModuleName = getResolvedExternalModuleName;
function getCanonicalAbsolutePath(host, path) {
    return host.getCanonicalFileName((0, ts_1.getNormalizedAbsolutePath)(path, host.getCurrentDirectory()));
}
/** @internal */
function getExternalModuleNameFromDeclaration(host, resolver, declaration) {
    var file = resolver.getExternalModuleFileFromDeclaration(declaration);
    if (!file || file.isDeclarationFile) {
        return undefined;
    }
    // If the declaration already uses a non-relative name, and is outside the common source directory, continue to use it
    var specifier = getExternalModuleName(declaration);
    if (specifier && (0, ts_1.isStringLiteralLike)(specifier) && !(0, ts_1.pathIsRelative)(specifier.text) &&
        getCanonicalAbsolutePath(host, file.path).indexOf(getCanonicalAbsolutePath(host, (0, ts_1.ensureTrailingDirectorySeparator)(host.getCommonSourceDirectory()))) === -1) {
        return undefined;
    }
    return getResolvedExternalModuleName(host, file);
}
exports.getExternalModuleNameFromDeclaration = getExternalModuleNameFromDeclaration;
/**
 * Resolves a local path to a path which is absolute to the base of the emit
 *
 * @internal
 */
function getExternalModuleNameFromPath(host, fileName, referencePath) {
    var getCanonicalFileName = function (f) { return host.getCanonicalFileName(f); };
    var dir = (0, ts_1.toPath)(referencePath ? (0, ts_1.getDirectoryPath)(referencePath) : host.getCommonSourceDirectory(), host.getCurrentDirectory(), getCanonicalFileName);
    var filePath = (0, ts_1.getNormalizedAbsolutePath)(fileName, host.getCurrentDirectory());
    var relativePath = (0, ts_1.getRelativePathToDirectoryOrUrl)(dir, filePath, dir, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
    var extensionless = removeFileExtension(relativePath);
    return referencePath ? (0, ts_1.ensurePathIsNonModuleName)(extensionless) : extensionless;
}
exports.getExternalModuleNameFromPath = getExternalModuleNameFromPath;
/** @internal */
function getOwnEmitOutputFilePath(fileName, host, extension) {
    var compilerOptions = host.getCompilerOptions();
    var emitOutputFilePathWithoutExtension;
    if (compilerOptions.outDir) {
        emitOutputFilePathWithoutExtension = removeFileExtension(getSourceFilePathInNewDir(fileName, host, compilerOptions.outDir));
    }
    else {
        emitOutputFilePathWithoutExtension = removeFileExtension(fileName);
    }
    return emitOutputFilePathWithoutExtension + extension;
}
exports.getOwnEmitOutputFilePath = getOwnEmitOutputFilePath;
/** @internal */
function getDeclarationEmitOutputFilePath(fileName, host) {
    return getDeclarationEmitOutputFilePathWorker(fileName, host.getCompilerOptions(), host.getCurrentDirectory(), host.getCommonSourceDirectory(), function (f) { return host.getCanonicalFileName(f); });
}
exports.getDeclarationEmitOutputFilePath = getDeclarationEmitOutputFilePath;
/** @internal */
function getDeclarationEmitOutputFilePathWorker(fileName, options, currentDirectory, commonSourceDirectory, getCanonicalFileName) {
    var outputDir = options.declarationDir || options.outDir; // Prefer declaration folder if specified
    var path = outputDir
        ? getSourceFilePathInNewDirWorker(fileName, outputDir, currentDirectory, commonSourceDirectory, getCanonicalFileName)
        : fileName;
    var declarationExtension = getDeclarationEmitExtensionForPath(path);
    return removeFileExtension(path) + declarationExtension;
}
exports.getDeclarationEmitOutputFilePathWorker = getDeclarationEmitOutputFilePathWorker;
/** @internal */
function getDeclarationEmitExtensionForPath(path) {
    return (0, ts_1.fileExtensionIsOneOf)(path, [".mjs" /* Extension.Mjs */, ".mts" /* Extension.Mts */]) ? ".d.mts" /* Extension.Dmts */ :
        (0, ts_1.fileExtensionIsOneOf)(path, [".cjs" /* Extension.Cjs */, ".cts" /* Extension.Cts */]) ? ".d.cts" /* Extension.Dcts */ :
            (0, ts_1.fileExtensionIsOneOf)(path, [".json" /* Extension.Json */]) ? ".d.json.ts" : // Drive-by redefinition of json declaration file output name so if it's ever enabled, it behaves well
                ".d.ts" /* Extension.Dts */;
}
exports.getDeclarationEmitExtensionForPath = getDeclarationEmitExtensionForPath;
/**
 * This function is an inverse of `getDeclarationEmitExtensionForPath`.
 *
 * @internal
 */
function getPossibleOriginalInputExtensionForExtension(path) {
    return (0, ts_1.fileExtensionIsOneOf)(path, [".d.mts" /* Extension.Dmts */, ".mjs" /* Extension.Mjs */, ".mts" /* Extension.Mts */]) ? [".mts" /* Extension.Mts */, ".mjs" /* Extension.Mjs */] :
        (0, ts_1.fileExtensionIsOneOf)(path, [".d.cts" /* Extension.Dcts */, ".cjs" /* Extension.Cjs */, ".cts" /* Extension.Cts */]) ? [".cts" /* Extension.Cts */, ".cjs" /* Extension.Cjs */] :
            (0, ts_1.fileExtensionIsOneOf)(path, [".d.json.ts"]) ? [".json" /* Extension.Json */] :
                [".tsx" /* Extension.Tsx */, ".ts" /* Extension.Ts */, ".jsx" /* Extension.Jsx */, ".js" /* Extension.Js */];
}
exports.getPossibleOriginalInputExtensionForExtension = getPossibleOriginalInputExtensionForExtension;
/** @internal */
function outFile(options) {
    return options.outFile || options.out;
}
exports.outFile = outFile;
/**
 * Returns 'undefined' if and only if 'options.paths' is undefined.
 *
 * @internal
 */
function getPathsBasePath(options, host) {
    var _a, _b;
    if (!options.paths)
        return undefined;
    return (_a = options.baseUrl) !== null && _a !== void 0 ? _a : ts_1.Debug.checkDefined(options.pathsBasePath || ((_b = host.getCurrentDirectory) === null || _b === void 0 ? void 0 : _b.call(host)), "Encountered 'paths' without a 'baseUrl', config file, or host 'getCurrentDirectory'.");
}
exports.getPathsBasePath = getPathsBasePath;
/**
 * Gets the source files that are expected to have an emit output.
 *
 * Originally part of `forEachExpectedEmitFile`, this functionality was extracted to support
 * transformations.
 *
 * @param host An EmitHost.
 * @param targetSourceFile An optional target source file to emit.
 *
 * @internal
 */
function getSourceFilesToEmit(host, targetSourceFile, forceDtsEmit) {
    var options = host.getCompilerOptions();
    if (outFile(options)) {
        var moduleKind = getEmitModuleKind(options);
        var moduleEmitEnabled_1 = options.emitDeclarationOnly || moduleKind === ts_1.ModuleKind.AMD || moduleKind === ts_1.ModuleKind.System;
        // Can emit only sources that are not declaration file and are either non module code or module with --module or --target es6 specified
        return (0, ts_1.filter)(host.getSourceFiles(), function (sourceFile) {
            return (moduleEmitEnabled_1 || !(0, ts_1.isExternalModule)(sourceFile)) &&
                sourceFileMayBeEmitted(sourceFile, host, forceDtsEmit);
        });
    }
    else {
        var sourceFiles = targetSourceFile === undefined ? host.getSourceFiles() : [targetSourceFile];
        return (0, ts_1.filter)(sourceFiles, function (sourceFile) { return sourceFileMayBeEmitted(sourceFile, host, forceDtsEmit); });
    }
}
exports.getSourceFilesToEmit = getSourceFilesToEmit;
/**
 * Don't call this for `--outFile`, just for `--outDir` or plain emit. `--outFile` needs additional checks.
 *
 * @internal
 */
function sourceFileMayBeEmitted(sourceFile, host, forceDtsEmit) {
    var options = host.getCompilerOptions();
    return !(options.noEmitForJsFiles && isSourceFileJS(sourceFile)) &&
        !sourceFile.isDeclarationFile &&
        !host.isSourceFileFromExternalLibrary(sourceFile) &&
        (forceDtsEmit || (!(isJsonSourceFile(sourceFile) && host.getResolvedProjectReferenceToRedirect(sourceFile.fileName)) &&
            !host.isSourceOfProjectReferenceRedirect(sourceFile.fileName)));
}
exports.sourceFileMayBeEmitted = sourceFileMayBeEmitted;
/** @internal */
function getSourceFilePathInNewDir(fileName, host, newDirPath) {
    return getSourceFilePathInNewDirWorker(fileName, newDirPath, host.getCurrentDirectory(), host.getCommonSourceDirectory(), function (f) { return host.getCanonicalFileName(f); });
}
exports.getSourceFilePathInNewDir = getSourceFilePathInNewDir;
/** @internal */
function getSourceFilePathInNewDirWorker(fileName, newDirPath, currentDirectory, commonSourceDirectory, getCanonicalFileName) {
    var sourceFilePath = (0, ts_1.getNormalizedAbsolutePath)(fileName, currentDirectory);
    var isSourceFileInCommonSourceDirectory = getCanonicalFileName(sourceFilePath).indexOf(getCanonicalFileName(commonSourceDirectory)) === 0;
    sourceFilePath = isSourceFileInCommonSourceDirectory ? sourceFilePath.substring(commonSourceDirectory.length) : sourceFilePath;
    return (0, ts_1.combinePaths)(newDirPath, sourceFilePath);
}
exports.getSourceFilePathInNewDirWorker = getSourceFilePathInNewDirWorker;
/** @internal */
function writeFile(host, diagnostics, fileName, text, writeByteOrderMark, sourceFiles, data) {
    host.writeFile(fileName, text, writeByteOrderMark, function (hostErrorMessage) {
        diagnostics.add(createCompilerDiagnostic(ts_1.Diagnostics.Could_not_write_file_0_Colon_1, fileName, hostErrorMessage));
    }, sourceFiles, data);
}
exports.writeFile = writeFile;
function ensureDirectoriesExist(directoryPath, createDirectory, directoryExists) {
    if (directoryPath.length > (0, ts_1.getRootLength)(directoryPath) && !directoryExists(directoryPath)) {
        var parentDirectory = (0, ts_1.getDirectoryPath)(directoryPath);
        ensureDirectoriesExist(parentDirectory, createDirectory, directoryExists);
        createDirectory(directoryPath);
    }
}
/** @internal */
function writeFileEnsuringDirectories(path, data, writeByteOrderMark, writeFile, createDirectory, directoryExists) {
    // PERF: Checking for directory existence is expensive.  Instead, assume the directory exists
    // and fall back to creating it if the file write fails.
    try {
        writeFile(path, data, writeByteOrderMark);
    }
    catch (_a) {
        ensureDirectoriesExist((0, ts_1.getDirectoryPath)((0, ts_1.normalizePath)(path)), createDirectory, directoryExists);
        writeFile(path, data, writeByteOrderMark);
    }
}
exports.writeFileEnsuringDirectories = writeFileEnsuringDirectories;
/** @internal */
function getLineOfLocalPosition(sourceFile, pos) {
    var lineStarts = (0, ts_1.getLineStarts)(sourceFile);
    return (0, ts_1.computeLineOfPosition)(lineStarts, pos);
}
exports.getLineOfLocalPosition = getLineOfLocalPosition;
/** @internal */
function getLineOfLocalPositionFromLineMap(lineMap, pos) {
    return (0, ts_1.computeLineOfPosition)(lineMap, pos);
}
exports.getLineOfLocalPositionFromLineMap = getLineOfLocalPositionFromLineMap;
/** @internal */
function getFirstConstructorWithBody(node) {
    return (0, ts_1.find)(node.members, function (member) { return (0, ts_1.isConstructorDeclaration)(member) && nodeIsPresent(member.body); });
}
exports.getFirstConstructorWithBody = getFirstConstructorWithBody;
/** @internal */
function getSetAccessorValueParameter(accessor) {
    if (accessor && accessor.parameters.length > 0) {
        var hasThis = accessor.parameters.length === 2 && parameterIsThisKeyword(accessor.parameters[0]);
        return accessor.parameters[hasThis ? 1 : 0];
    }
}
exports.getSetAccessorValueParameter = getSetAccessorValueParameter;
/**
 * Get the type annotation for the value parameter.
 *
 * @internal
 */
function getSetAccessorTypeAnnotationNode(accessor) {
    var parameter = getSetAccessorValueParameter(accessor);
    return parameter && parameter.type;
}
exports.getSetAccessorTypeAnnotationNode = getSetAccessorTypeAnnotationNode;
/** @internal */
function getThisParameter(signature) {
    // callback tags do not currently support this parameters
    if (signature.parameters.length && !(0, ts_1.isJSDocSignature)(signature)) {
        var thisParameter = signature.parameters[0];
        if (parameterIsThisKeyword(thisParameter)) {
            return thisParameter;
        }
    }
}
exports.getThisParameter = getThisParameter;
/** @internal */
function parameterIsThisKeyword(parameter) {
    return isThisIdentifier(parameter.name);
}
exports.parameterIsThisKeyword = parameterIsThisKeyword;
/** @internal */
function isThisIdentifier(node) {
    return !!node && node.kind === 80 /* SyntaxKind.Identifier */ && identifierIsThisKeyword(node);
}
exports.isThisIdentifier = isThisIdentifier;
/** @internal */
function isThisInTypeQuery(node) {
    if (!isThisIdentifier(node)) {
        return false;
    }
    while ((0, ts_1.isQualifiedName)(node.parent) && node.parent.left === node) {
        node = node.parent;
    }
    return node.parent.kind === 185 /* SyntaxKind.TypeQuery */;
}
exports.isThisInTypeQuery = isThisInTypeQuery;
/** @internal */
function identifierIsThisKeyword(id) {
    return id.escapedText === "this";
}
exports.identifierIsThisKeyword = identifierIsThisKeyword;
/** @internal */
function getAllAccessorDeclarations(declarations, accessor) {
    // TODO: GH#18217
    var firstAccessor;
    var secondAccessor;
    var getAccessor;
    var setAccessor;
    if (hasDynamicName(accessor)) {
        firstAccessor = accessor;
        if (accessor.kind === 176 /* SyntaxKind.GetAccessor */) {
            getAccessor = accessor;
        }
        else if (accessor.kind === 177 /* SyntaxKind.SetAccessor */) {
            setAccessor = accessor;
        }
        else {
            ts_1.Debug.fail("Accessor has wrong kind");
        }
    }
    else {
        (0, ts_1.forEach)(declarations, function (member) {
            if ((0, ts_1.isAccessor)(member)
                && isStatic(member) === isStatic(accessor)) {
                var memberName = getPropertyNameForPropertyNameNode(member.name);
                var accessorName = getPropertyNameForPropertyNameNode(accessor.name);
                if (memberName === accessorName) {
                    if (!firstAccessor) {
                        firstAccessor = member;
                    }
                    else if (!secondAccessor) {
                        secondAccessor = member;
                    }
                    if (member.kind === 176 /* SyntaxKind.GetAccessor */ && !getAccessor) {
                        getAccessor = member;
                    }
                    if (member.kind === 177 /* SyntaxKind.SetAccessor */ && !setAccessor) {
                        setAccessor = member;
                    }
                }
            }
        });
    }
    return {
        firstAccessor: firstAccessor,
        secondAccessor: secondAccessor,
        getAccessor: getAccessor,
        setAccessor: setAccessor
    };
}
exports.getAllAccessorDeclarations = getAllAccessorDeclarations;
/**
 * Gets the effective type annotation of a variable, parameter, or property. If the node was
 * parsed in a JavaScript file, gets the type annotation from JSDoc.  Also gets the type of
 * functions only the JSDoc case.
 *
 * @internal
 */
function getEffectiveTypeAnnotationNode(node) {
    if (!isInJSFile(node) && (0, ts_1.isFunctionDeclaration)(node))
        return undefined;
    var type = node.type;
    if (type || !isInJSFile(node))
        return type;
    return (0, ts_1.isJSDocPropertyLikeTag)(node) ? node.typeExpression && node.typeExpression.type : (0, ts_1.getJSDocType)(node);
}
exports.getEffectiveTypeAnnotationNode = getEffectiveTypeAnnotationNode;
/** @internal */
function getTypeAnnotationNode(node) {
    return node.type;
}
exports.getTypeAnnotationNode = getTypeAnnotationNode;
/**
 * Gets the effective return type annotation of a signature. If the node was parsed in a
 * JavaScript file, gets the return type annotation from JSDoc.
 *
 * @internal
 */
function getEffectiveReturnTypeNode(node) {
    return (0, ts_1.isJSDocSignature)(node) ?
        node.type && node.type.typeExpression && node.type.typeExpression.type :
        node.type || (isInJSFile(node) ? (0, ts_1.getJSDocReturnType)(node) : undefined);
}
exports.getEffectiveReturnTypeNode = getEffectiveReturnTypeNode;
/** @internal */
function getJSDocTypeParameterDeclarations(node) {
    return (0, ts_1.flatMap)((0, ts_1.getJSDocTags)(node), function (tag) { return isNonTypeAliasTemplate(tag) ? tag.typeParameters : undefined; });
}
exports.getJSDocTypeParameterDeclarations = getJSDocTypeParameterDeclarations;
/** template tags are only available when a typedef isn't already using them */
function isNonTypeAliasTemplate(tag) {
    return (0, ts_1.isJSDocTemplateTag)(tag) && !(tag.parent.kind === 326 /* SyntaxKind.JSDoc */ && (tag.parent.tags.some(isJSDocTypeAlias) || tag.parent.tags.some(ts_1.isJSDocOverloadTag)));
}
/**
 * Gets the effective type annotation of the value parameter of a set accessor. If the node
 * was parsed in a JavaScript file, gets the type annotation from JSDoc.
 *
 * @internal
 */
function getEffectiveSetAccessorTypeAnnotationNode(node) {
    var parameter = getSetAccessorValueParameter(node);
    return parameter && getEffectiveTypeAnnotationNode(parameter);
}
exports.getEffectiveSetAccessorTypeAnnotationNode = getEffectiveSetAccessorTypeAnnotationNode;
/** @internal */
function emitNewLineBeforeLeadingComments(lineMap, writer, node, leadingComments) {
    emitNewLineBeforeLeadingCommentsOfPosition(lineMap, writer, node.pos, leadingComments);
}
exports.emitNewLineBeforeLeadingComments = emitNewLineBeforeLeadingComments;
/** @internal */
function emitNewLineBeforeLeadingCommentsOfPosition(lineMap, writer, pos, leadingComments) {
    // If the leading comments start on different line than the start of node, write new line
    if (leadingComments && leadingComments.length && pos !== leadingComments[0].pos &&
        getLineOfLocalPositionFromLineMap(lineMap, pos) !== getLineOfLocalPositionFromLineMap(lineMap, leadingComments[0].pos)) {
        writer.writeLine();
    }
}
exports.emitNewLineBeforeLeadingCommentsOfPosition = emitNewLineBeforeLeadingCommentsOfPosition;
/** @internal */
function emitNewLineBeforeLeadingCommentOfPosition(lineMap, writer, pos, commentPos) {
    // If the leading comments start on different line than the start of node, write new line
    if (pos !== commentPos &&
        getLineOfLocalPositionFromLineMap(lineMap, pos) !== getLineOfLocalPositionFromLineMap(lineMap, commentPos)) {
        writer.writeLine();
    }
}
exports.emitNewLineBeforeLeadingCommentOfPosition = emitNewLineBeforeLeadingCommentOfPosition;
/** @internal */
function emitComments(text, lineMap, writer, comments, leadingSeparator, trailingSeparator, newLine, writeComment) {
    if (comments && comments.length > 0) {
        if (leadingSeparator) {
            writer.writeSpace(" ");
        }
        var emitInterveningSeparator = false;
        for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
            var comment = comments_1[_i];
            if (emitInterveningSeparator) {
                writer.writeSpace(" ");
                emitInterveningSeparator = false;
            }
            writeComment(text, lineMap, writer, comment.pos, comment.end, newLine);
            if (comment.hasTrailingNewLine) {
                writer.writeLine();
            }
            else {
                emitInterveningSeparator = true;
            }
        }
        if (emitInterveningSeparator && trailingSeparator) {
            writer.writeSpace(" ");
        }
    }
}
exports.emitComments = emitComments;
/**
 * Detached comment is a comment at the top of file or function body that is separated from
 * the next statement by space.
 *
 * @internal
 */
function emitDetachedComments(text, lineMap, writer, writeComment, node, newLine, removeComments) {
    var leadingComments;
    var currentDetachedCommentInfo;
    if (removeComments) {
        // removeComments is true, only reserve pinned comment at the top of file
        // For example:
        //      /*! Pinned Comment */
        //
        //      var x = 10;
        if (node.pos === 0) {
            leadingComments = (0, ts_1.filter)((0, ts_1.getLeadingCommentRanges)(text, node.pos), isPinnedCommentLocal);
        }
    }
    else {
        // removeComments is false, just get detached as normal and bypass the process to filter comment
        leadingComments = (0, ts_1.getLeadingCommentRanges)(text, node.pos);
    }
    if (leadingComments) {
        var detachedComments = [];
        var lastComment = void 0;
        for (var _i = 0, leadingComments_1 = leadingComments; _i < leadingComments_1.length; _i++) {
            var comment = leadingComments_1[_i];
            if (lastComment) {
                var lastCommentLine = getLineOfLocalPositionFromLineMap(lineMap, lastComment.end);
                var commentLine = getLineOfLocalPositionFromLineMap(lineMap, comment.pos);
                if (commentLine >= lastCommentLine + 2) {
                    // There was a blank line between the last comment and this comment.  This
                    // comment is not part of the copyright comments.  Return what we have so
                    // far.
                    break;
                }
            }
            detachedComments.push(comment);
            lastComment = comment;
        }
        if (detachedComments.length) {
            // All comments look like they could have been part of the copyright header.  Make
            // sure there is at least one blank line between it and the node.  If not, it's not
            // a copyright header.
            var lastCommentLine = getLineOfLocalPositionFromLineMap(lineMap, (0, ts_1.last)(detachedComments).end);
            var nodeLine = getLineOfLocalPositionFromLineMap(lineMap, (0, ts_1.skipTrivia)(text, node.pos));
            if (nodeLine >= lastCommentLine + 2) {
                // Valid detachedComments
                emitNewLineBeforeLeadingComments(lineMap, writer, node, leadingComments);
                emitComments(text, lineMap, writer, detachedComments, /*leadingSeparator*/ false, /*trailingSeparator*/ true, newLine, writeComment);
                currentDetachedCommentInfo = { nodePos: node.pos, detachedCommentEndPos: (0, ts_1.last)(detachedComments).end };
            }
        }
    }
    return currentDetachedCommentInfo;
    function isPinnedCommentLocal(comment) {
        return isPinnedComment(text, comment.pos);
    }
}
exports.emitDetachedComments = emitDetachedComments;
/** @internal */
function writeCommentRange(text, lineMap, writer, commentPos, commentEnd, newLine) {
    if (text.charCodeAt(commentPos + 1) === 42 /* CharacterCodes.asterisk */) {
        var firstCommentLineAndCharacter = (0, ts_1.computeLineAndCharacterOfPosition)(lineMap, commentPos);
        var lineCount = lineMap.length;
        var firstCommentLineIndent = void 0;
        for (var pos = commentPos, currentLine = firstCommentLineAndCharacter.line; pos < commentEnd; currentLine++) {
            var nextLineStart = (currentLine + 1) === lineCount
                ? text.length + 1
                : lineMap[currentLine + 1];
            if (pos !== commentPos) {
                // If we are not emitting first line, we need to write the spaces to adjust the alignment
                if (firstCommentLineIndent === undefined) {
                    firstCommentLineIndent = calculateIndent(text, lineMap[firstCommentLineAndCharacter.line], commentPos);
                }
                // These are number of spaces writer is going to write at current indent
                var currentWriterIndentSpacing = writer.getIndent() * getIndentSize();
                // Number of spaces we want to be writing
                // eg: Assume writer indent
                // module m {
                //         /* starts at character 9 this is line 1
                //    * starts at character pos 4 line                        --1  = 8 - 8 + 3
                //   More left indented comment */                            --2  = 8 - 8 + 2
                //     class c { }
                // }
                // module m {
                //     /* this is line 1 -- Assume current writer indent 8
                //      * line                                                --3 = 8 - 4 + 5
                //            More right indented comment */                  --4 = 8 - 4 + 11
                //     class c { }
                // }
                var spacesToEmit = currentWriterIndentSpacing - firstCommentLineIndent + calculateIndent(text, pos, nextLineStart);
                if (spacesToEmit > 0) {
                    var numberOfSingleSpacesToEmit = spacesToEmit % getIndentSize();
                    var indentSizeSpaceString = getIndentString((spacesToEmit - numberOfSingleSpacesToEmit) / getIndentSize());
                    // Write indent size string ( in eg 1: = "", 2: "" , 3: string with 8 spaces 4: string with 12 spaces
                    writer.rawWrite(indentSizeSpaceString);
                    // Emit the single spaces (in eg: 1: 3 spaces, 2: 2 spaces, 3: 1 space, 4: 3 spaces)
                    while (numberOfSingleSpacesToEmit) {
                        writer.rawWrite(" ");
                        numberOfSingleSpacesToEmit--;
                    }
                }
                else {
                    // No spaces to emit write empty string
                    writer.rawWrite("");
                }
            }
            // Write the comment line text
            writeTrimmedCurrentLine(text, commentEnd, writer, newLine, pos, nextLineStart);
            pos = nextLineStart;
        }
    }
    else {
        // Single line comment of style //....
        writer.writeComment(text.substring(commentPos, commentEnd));
    }
}
exports.writeCommentRange = writeCommentRange;
function writeTrimmedCurrentLine(text, commentEnd, writer, newLine, pos, nextLineStart) {
    var end = Math.min(commentEnd, nextLineStart - 1);
    var currentLineText = (0, ts_1.trimString)(text.substring(pos, end));
    if (currentLineText) {
        // trimmed forward and ending spaces text
        writer.writeComment(currentLineText);
        if (end !== commentEnd) {
            writer.writeLine();
        }
    }
    else {
        // Empty string - make sure we write empty line
        writer.rawWrite(newLine);
    }
}
function calculateIndent(text, pos, end) {
    var currentLineIndent = 0;
    for (; pos < end && (0, ts_1.isWhiteSpaceSingleLine)(text.charCodeAt(pos)); pos++) {
        if (text.charCodeAt(pos) === 9 /* CharacterCodes.tab */) {
            // Tabs = TabSize = indent size and go to next tabStop
            currentLineIndent += getIndentSize() - (currentLineIndent % getIndentSize());
        }
        else {
            // Single space
            currentLineIndent++;
        }
    }
    return currentLineIndent;
}
/** @internal */
function hasEffectiveModifiers(node) {
    return getEffectiveModifierFlags(node) !== 0 /* ModifierFlags.None */;
}
exports.hasEffectiveModifiers = hasEffectiveModifiers;
/** @internal */
function hasSyntacticModifiers(node) {
    return getSyntacticModifierFlags(node) !== 0 /* ModifierFlags.None */;
}
exports.hasSyntacticModifiers = hasSyntacticModifiers;
/** @internal */
function hasEffectiveModifier(node, flags) {
    return !!getSelectedEffectiveModifierFlags(node, flags);
}
exports.hasEffectiveModifier = hasEffectiveModifier;
/** @internal */
function hasSyntacticModifier(node, flags) {
    return !!getSelectedSyntacticModifierFlags(node, flags);
}
exports.hasSyntacticModifier = hasSyntacticModifier;
/** @internal */
function isStatic(node) {
    // https://tc39.es/ecma262/#sec-static-semantics-isstatic
    return (0, ts_1.isClassElement)(node) && hasStaticModifier(node) || (0, ts_1.isClassStaticBlockDeclaration)(node);
}
exports.isStatic = isStatic;
/** @internal */
function hasStaticModifier(node) {
    return hasSyntacticModifier(node, 32 /* ModifierFlags.Static */);
}
exports.hasStaticModifier = hasStaticModifier;
/** @internal */
function hasOverrideModifier(node) {
    return hasEffectiveModifier(node, 16384 /* ModifierFlags.Override */);
}
exports.hasOverrideModifier = hasOverrideModifier;
/** @internal */
function hasAbstractModifier(node) {
    return hasSyntacticModifier(node, 256 /* ModifierFlags.Abstract */);
}
exports.hasAbstractModifier = hasAbstractModifier;
/** @internal */
function hasAmbientModifier(node) {
    return hasSyntacticModifier(node, 2 /* ModifierFlags.Ambient */);
}
exports.hasAmbientModifier = hasAmbientModifier;
/** @internal */
function hasAccessorModifier(node) {
    return hasSyntacticModifier(node, 128 /* ModifierFlags.Accessor */);
}
exports.hasAccessorModifier = hasAccessorModifier;
/** @internal */
function hasEffectiveReadonlyModifier(node) {
    return hasEffectiveModifier(node, 64 /* ModifierFlags.Readonly */);
}
exports.hasEffectiveReadonlyModifier = hasEffectiveReadonlyModifier;
/** @internal */
function hasDecorators(node) {
    return hasSyntacticModifier(node, 131072 /* ModifierFlags.Decorator */);
}
exports.hasDecorators = hasDecorators;
/** @internal */
function getSelectedEffectiveModifierFlags(node, flags) {
    return getEffectiveModifierFlags(node) & flags;
}
exports.getSelectedEffectiveModifierFlags = getSelectedEffectiveModifierFlags;
/** @internal */
function getSelectedSyntacticModifierFlags(node, flags) {
    return getSyntacticModifierFlags(node) & flags;
}
exports.getSelectedSyntacticModifierFlags = getSelectedSyntacticModifierFlags;
function getModifierFlagsWorker(node, includeJSDoc, alwaysIncludeJSDoc) {
    if (node.kind >= 0 /* SyntaxKind.FirstToken */ && node.kind <= 164 /* SyntaxKind.LastToken */) {
        return 0 /* ModifierFlags.None */;
    }
    if (!(node.modifierFlagsCache & 536870912 /* ModifierFlags.HasComputedFlags */)) {
        node.modifierFlagsCache = getSyntacticModifierFlagsNoCache(node) | 536870912 /* ModifierFlags.HasComputedFlags */;
    }
    if (includeJSDoc && !(node.modifierFlagsCache & 4096 /* ModifierFlags.HasComputedJSDocModifiers */) && (alwaysIncludeJSDoc || isInJSFile(node)) && node.parent) {
        node.modifierFlagsCache |= getJSDocModifierFlagsNoCache(node) | 4096 /* ModifierFlags.HasComputedJSDocModifiers */;
    }
    return node.modifierFlagsCache & ~(536870912 /* ModifierFlags.HasComputedFlags */ | 4096 /* ModifierFlags.HasComputedJSDocModifiers */);
}
/**
 * Gets the effective ModifierFlags for the provided node, including JSDoc modifiers. The modifiers will be cached on the node to improve performance.
 *
 * NOTE: This function may use `parent` pointers.
 *
 * @internal
 */
function getEffectiveModifierFlags(node) {
    return getModifierFlagsWorker(node, /*includeJSDoc*/ true);
}
exports.getEffectiveModifierFlags = getEffectiveModifierFlags;
/** @internal */
function getEffectiveModifierFlagsAlwaysIncludeJSDoc(node) {
    return getModifierFlagsWorker(node, /*includeJSDoc*/ true, /*alwaysIncludeJSDoc*/ true);
}
exports.getEffectiveModifierFlagsAlwaysIncludeJSDoc = getEffectiveModifierFlagsAlwaysIncludeJSDoc;
/**
 * Gets the ModifierFlags for syntactic modifiers on the provided node. The modifiers will be cached on the node to improve performance.
 *
 * NOTE: This function does not use `parent` pointers and will not include modifiers from JSDoc.
 *
 * @internal
 */
function getSyntacticModifierFlags(node) {
    return getModifierFlagsWorker(node, /*includeJSDoc*/ false);
}
exports.getSyntacticModifierFlags = getSyntacticModifierFlags;
function getJSDocModifierFlagsNoCache(node) {
    var flags = 0 /* ModifierFlags.None */;
    if (!!node.parent && !(0, ts_1.isParameter)(node)) {
        if (isInJSFile(node)) {
            if ((0, ts_1.getJSDocPublicTagNoCache)(node))
                flags |= 4 /* ModifierFlags.Public */;
            if ((0, ts_1.getJSDocPrivateTagNoCache)(node))
                flags |= 8 /* ModifierFlags.Private */;
            if ((0, ts_1.getJSDocProtectedTagNoCache)(node))
                flags |= 16 /* ModifierFlags.Protected */;
            if ((0, ts_1.getJSDocReadonlyTagNoCache)(node))
                flags |= 64 /* ModifierFlags.Readonly */;
            if ((0, ts_1.getJSDocOverrideTagNoCache)(node))
                flags |= 16384 /* ModifierFlags.Override */;
        }
        if ((0, ts_1.getJSDocDeprecatedTagNoCache)(node))
            flags |= 8192 /* ModifierFlags.Deprecated */;
    }
    return flags;
}
/**
 * Gets the effective ModifierFlags for the provided node, including JSDoc modifiers. The modifier flags cache on the node is ignored.
 *
 * NOTE: This function may use `parent` pointers.
 *
 * @internal
 */
function getEffectiveModifierFlagsNoCache(node) {
    return getSyntacticModifierFlagsNoCache(node) | getJSDocModifierFlagsNoCache(node);
}
exports.getEffectiveModifierFlagsNoCache = getEffectiveModifierFlagsNoCache;
/**
 * Gets the ModifierFlags for syntactic modifiers on the provided node. The modifier flags cache on the node is ignored.
 *
 * NOTE: This function does not use `parent` pointers and will not include modifiers from JSDoc.
 *
 * @internal
 */
function getSyntacticModifierFlagsNoCache(node) {
    var flags = (0, ts_1.canHaveModifiers)(node) ? modifiersToFlags(node.modifiers) : 0 /* ModifierFlags.None */;
    if (node.flags & 4 /* NodeFlags.NestedNamespace */ || node.kind === 80 /* SyntaxKind.Identifier */ && node.flags & 2048 /* NodeFlags.IdentifierIsInJSDocNamespace */) {
        flags |= 1 /* ModifierFlags.Export */;
    }
    return flags;
}
exports.getSyntacticModifierFlagsNoCache = getSyntacticModifierFlagsNoCache;
/** @internal */
function modifiersToFlags(modifiers) {
    var flags = 0 /* ModifierFlags.None */;
    if (modifiers) {
        for (var _i = 0, modifiers_1 = modifiers; _i < modifiers_1.length; _i++) {
            var modifier = modifiers_1[_i];
            flags |= modifierToFlag(modifier.kind);
        }
    }
    return flags;
}
exports.modifiersToFlags = modifiersToFlags;
/** @internal */
function modifierToFlag(token) {
    switch (token) {
        case 126 /* SyntaxKind.StaticKeyword */: return 32 /* ModifierFlags.Static */;
        case 125 /* SyntaxKind.PublicKeyword */: return 4 /* ModifierFlags.Public */;
        case 124 /* SyntaxKind.ProtectedKeyword */: return 16 /* ModifierFlags.Protected */;
        case 123 /* SyntaxKind.PrivateKeyword */: return 8 /* ModifierFlags.Private */;
        case 128 /* SyntaxKind.AbstractKeyword */: return 256 /* ModifierFlags.Abstract */;
        case 129 /* SyntaxKind.AccessorKeyword */: return 128 /* ModifierFlags.Accessor */;
        case 95 /* SyntaxKind.ExportKeyword */: return 1 /* ModifierFlags.Export */;
        case 138 /* SyntaxKind.DeclareKeyword */: return 2 /* ModifierFlags.Ambient */;
        case 87 /* SyntaxKind.ConstKeyword */: return 2048 /* ModifierFlags.Const */;
        case 90 /* SyntaxKind.DefaultKeyword */: return 1024 /* ModifierFlags.Default */;
        case 134 /* SyntaxKind.AsyncKeyword */: return 512 /* ModifierFlags.Async */;
        case 148 /* SyntaxKind.ReadonlyKeyword */: return 64 /* ModifierFlags.Readonly */;
        case 163 /* SyntaxKind.OverrideKeyword */: return 16384 /* ModifierFlags.Override */;
        case 103 /* SyntaxKind.InKeyword */: return 32768 /* ModifierFlags.In */;
        case 147 /* SyntaxKind.OutKeyword */: return 65536 /* ModifierFlags.Out */;
        case 169 /* SyntaxKind.Decorator */: return 131072 /* ModifierFlags.Decorator */;
    }
    return 0 /* ModifierFlags.None */;
}
exports.modifierToFlag = modifierToFlag;
function isBinaryLogicalOperator(token) {
    return token === 57 /* SyntaxKind.BarBarToken */ || token === 56 /* SyntaxKind.AmpersandAmpersandToken */;
}
/** @internal */
function isLogicalOperator(token) {
    return isBinaryLogicalOperator(token) || token === 54 /* SyntaxKind.ExclamationToken */;
}
exports.isLogicalOperator = isLogicalOperator;
/** @internal */
function isLogicalOrCoalescingAssignmentOperator(token) {
    return token === 76 /* SyntaxKind.BarBarEqualsToken */
        || token === 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */
        || token === 78 /* SyntaxKind.QuestionQuestionEqualsToken */;
}
exports.isLogicalOrCoalescingAssignmentOperator = isLogicalOrCoalescingAssignmentOperator;
/** @internal */
function isLogicalOrCoalescingAssignmentExpression(expr) {
    return (0, ts_1.isBinaryExpression)(expr) && isLogicalOrCoalescingAssignmentOperator(expr.operatorToken.kind);
}
exports.isLogicalOrCoalescingAssignmentExpression = isLogicalOrCoalescingAssignmentExpression;
/** @internal */
function isLogicalOrCoalescingBinaryOperator(token) {
    return isBinaryLogicalOperator(token) || token === 61 /* SyntaxKind.QuestionQuestionToken */;
}
exports.isLogicalOrCoalescingBinaryOperator = isLogicalOrCoalescingBinaryOperator;
/** @internal */
function isLogicalOrCoalescingBinaryExpression(expr) {
    return (0, ts_1.isBinaryExpression)(expr) && isLogicalOrCoalescingBinaryOperator(expr.operatorToken.kind);
}
exports.isLogicalOrCoalescingBinaryExpression = isLogicalOrCoalescingBinaryExpression;
/** @internal */
function isAssignmentOperator(token) {
    return token >= 64 /* SyntaxKind.FirstAssignment */ && token <= 79 /* SyntaxKind.LastAssignment */;
}
exports.isAssignmentOperator = isAssignmentOperator;
/**
 * Get `C` given `N` if `N` is in the position `class C extends N` where `N` is an ExpressionWithTypeArguments.
 *
 * @internal
 */
function tryGetClassExtendingExpressionWithTypeArguments(node) {
    var cls = tryGetClassImplementingOrExtendingExpressionWithTypeArguments(node);
    return cls && !cls.isImplements ? cls.class : undefined;
}
exports.tryGetClassExtendingExpressionWithTypeArguments = tryGetClassExtendingExpressionWithTypeArguments;
/** @internal */
function tryGetClassImplementingOrExtendingExpressionWithTypeArguments(node) {
    if ((0, ts_1.isExpressionWithTypeArguments)(node)) {
        if ((0, ts_1.isHeritageClause)(node.parent) && (0, ts_1.isClassLike)(node.parent.parent)) {
            return { class: node.parent.parent, isImplements: node.parent.token === 119 /* SyntaxKind.ImplementsKeyword */ };
        }
        if ((0, ts_1.isJSDocAugmentsTag)(node.parent)) {
            var host = getEffectiveJSDocHost(node.parent);
            if (host && (0, ts_1.isClassLike)(host)) {
                return { class: host, isImplements: false };
            }
        }
    }
    return undefined;
}
exports.tryGetClassImplementingOrExtendingExpressionWithTypeArguments = tryGetClassImplementingOrExtendingExpressionWithTypeArguments;
/** @internal */
function isAssignmentExpression(node, excludeCompoundAssignment) {
    return (0, ts_1.isBinaryExpression)(node)
        && (excludeCompoundAssignment
            ? node.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */
            : isAssignmentOperator(node.operatorToken.kind))
        && (0, ts_1.isLeftHandSideExpression)(node.left);
}
exports.isAssignmentExpression = isAssignmentExpression;
/** @internal */
function isLeftHandSideOfAssignment(node) {
    return isAssignmentExpression(node.parent) && node.parent.left === node;
}
exports.isLeftHandSideOfAssignment = isLeftHandSideOfAssignment;
/** @internal */
function isDestructuringAssignment(node) {
    if (isAssignmentExpression(node, /*excludeCompoundAssignment*/ true)) {
        var kind = node.left.kind;
        return kind === 209 /* SyntaxKind.ObjectLiteralExpression */
            || kind === 208 /* SyntaxKind.ArrayLiteralExpression */;
    }
    return false;
}
exports.isDestructuringAssignment = isDestructuringAssignment;
/** @internal */
function isExpressionWithTypeArgumentsInClassExtendsClause(node) {
    return tryGetClassExtendingExpressionWithTypeArguments(node) !== undefined;
}
exports.isExpressionWithTypeArgumentsInClassExtendsClause = isExpressionWithTypeArgumentsInClassExtendsClause;
/** @internal */
function isEntityNameExpression(node) {
    return node.kind === 80 /* SyntaxKind.Identifier */ || isPropertyAccessEntityNameExpression(node);
}
exports.isEntityNameExpression = isEntityNameExpression;
/** @internal */
function getFirstIdentifier(node) {
    switch (node.kind) {
        case 80 /* SyntaxKind.Identifier */:
            return node;
        case 165 /* SyntaxKind.QualifiedName */:
            do {
                node = node.left;
            } while (node.kind !== 80 /* SyntaxKind.Identifier */);
            return node;
        case 210 /* SyntaxKind.PropertyAccessExpression */:
            do {
                node = node.expression;
            } while (node.kind !== 80 /* SyntaxKind.Identifier */);
            return node;
    }
}
exports.getFirstIdentifier = getFirstIdentifier;
/** @internal */
function isDottedName(node) {
    return node.kind === 80 /* SyntaxKind.Identifier */
        || node.kind === 110 /* SyntaxKind.ThisKeyword */
        || node.kind === 108 /* SyntaxKind.SuperKeyword */
        || node.kind === 235 /* SyntaxKind.MetaProperty */
        || node.kind === 210 /* SyntaxKind.PropertyAccessExpression */ && isDottedName(node.expression)
        || node.kind === 216 /* SyntaxKind.ParenthesizedExpression */ && isDottedName(node.expression);
}
exports.isDottedName = isDottedName;
/** @internal */
function isPropertyAccessEntityNameExpression(node) {
    return (0, ts_1.isPropertyAccessExpression)(node) && (0, ts_1.isIdentifier)(node.name) && isEntityNameExpression(node.expression);
}
exports.isPropertyAccessEntityNameExpression = isPropertyAccessEntityNameExpression;
/** @internal */
function tryGetPropertyAccessOrIdentifierToString(expr) {
    if ((0, ts_1.isPropertyAccessExpression)(expr)) {
        var baseStr = tryGetPropertyAccessOrIdentifierToString(expr.expression);
        if (baseStr !== undefined) {
            return baseStr + "." + entityNameToString(expr.name);
        }
    }
    else if ((0, ts_1.isElementAccessExpression)(expr)) {
        var baseStr = tryGetPropertyAccessOrIdentifierToString(expr.expression);
        if (baseStr !== undefined && (0, ts_1.isPropertyName)(expr.argumentExpression)) {
            return baseStr + "." + getPropertyNameForPropertyNameNode(expr.argumentExpression);
        }
    }
    else if ((0, ts_1.isIdentifier)(expr)) {
        return (0, ts_1.unescapeLeadingUnderscores)(expr.escapedText);
    }
    else if ((0, ts_1.isJsxNamespacedName)(expr)) {
        return getTextOfJsxNamespacedName(expr);
    }
    return undefined;
}
exports.tryGetPropertyAccessOrIdentifierToString = tryGetPropertyAccessOrIdentifierToString;
/** @internal */
function isPrototypeAccess(node) {
    return isBindableStaticAccessExpression(node) && getElementOrPropertyAccessName(node) === "prototype";
}
exports.isPrototypeAccess = isPrototypeAccess;
/** @internal */
function isRightSideOfQualifiedNameOrPropertyAccess(node) {
    return (node.parent.kind === 165 /* SyntaxKind.QualifiedName */ && node.parent.right === node) ||
        (node.parent.kind === 210 /* SyntaxKind.PropertyAccessExpression */ && node.parent.name === node);
}
exports.isRightSideOfQualifiedNameOrPropertyAccess = isRightSideOfQualifiedNameOrPropertyAccess;
/** @internal */
function isRightSideOfAccessExpression(node) {
    return (0, ts_1.isPropertyAccessExpression)(node.parent) && node.parent.name === node
        || (0, ts_1.isElementAccessExpression)(node.parent) && node.parent.argumentExpression === node;
}
exports.isRightSideOfAccessExpression = isRightSideOfAccessExpression;
/** @internal */
function isRightSideOfQualifiedNameOrPropertyAccessOrJSDocMemberName(node) {
    return (0, ts_1.isQualifiedName)(node.parent) && node.parent.right === node
        || (0, ts_1.isPropertyAccessExpression)(node.parent) && node.parent.name === node
        || (0, ts_1.isJSDocMemberName)(node.parent) && node.parent.right === node;
}
exports.isRightSideOfQualifiedNameOrPropertyAccessOrJSDocMemberName = isRightSideOfQualifiedNameOrPropertyAccessOrJSDocMemberName;
/** @internal */
function isEmptyObjectLiteral(expression) {
    return expression.kind === 209 /* SyntaxKind.ObjectLiteralExpression */ &&
        expression.properties.length === 0;
}
exports.isEmptyObjectLiteral = isEmptyObjectLiteral;
/** @internal */
function isEmptyArrayLiteral(expression) {
    return expression.kind === 208 /* SyntaxKind.ArrayLiteralExpression */ &&
        expression.elements.length === 0;
}
exports.isEmptyArrayLiteral = isEmptyArrayLiteral;
/** @internal */
function getLocalSymbolForExportDefault(symbol) {
    if (!isExportDefaultSymbol(symbol) || !symbol.declarations)
        return undefined;
    for (var _i = 0, _a = symbol.declarations; _i < _a.length; _i++) {
        var decl = _a[_i];
        if (decl.localSymbol)
            return decl.localSymbol;
    }
    return undefined;
}
exports.getLocalSymbolForExportDefault = getLocalSymbolForExportDefault;
function isExportDefaultSymbol(symbol) {
    return symbol && (0, ts_1.length)(symbol.declarations) > 0 && hasSyntacticModifier(symbol.declarations[0], 1024 /* ModifierFlags.Default */);
}
/**
 * Return ".ts", ".d.ts", or ".tsx", if that is the extension.
 *
 * @internal
 */
function tryExtractTSExtension(fileName) {
    return (0, ts_1.find)(supportedTSExtensionsForExtractExtension, function (extension) { return (0, ts_1.fileExtensionIs)(fileName, extension); });
}
exports.tryExtractTSExtension = tryExtractTSExtension;
/**
 * Replace each instance of non-ascii characters by one, two, three, or four escape sequences
 * representing the UTF-8 encoding of the character, and return the expanded char code list.
 */
function getExpandedCharCodes(input) {
    var output = [];
    var length = input.length;
    for (var i = 0; i < length; i++) {
        var charCode = input.charCodeAt(i);
        // handle utf8
        if (charCode < 0x80) {
            output.push(charCode);
        }
        else if (charCode < 0x800) {
            output.push((charCode >> 6) | 192);
            output.push((charCode & 63) | 128);
        }
        else if (charCode < 0x10000) {
            output.push((charCode >> 12) | 224);
            output.push(((charCode >> 6) & 63) | 128);
            output.push((charCode & 63) | 128);
        }
        else if (charCode < 0x20000) {
            output.push((charCode >> 18) | 240);
            output.push(((charCode >> 12) & 63) | 128);
            output.push(((charCode >> 6) & 63) | 128);
            output.push((charCode & 63) | 128);
        }
        else {
            ts_1.Debug.assert(false, "Unexpected code point");
        }
    }
    return output;
}
var base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
/**
 * Converts a string to a base-64 encoded ASCII string.
 *
 * @internal
 */
function convertToBase64(input) {
    var result = "";
    var charCodes = getExpandedCharCodes(input);
    var i = 0;
    var length = charCodes.length;
    var byte1, byte2, byte3, byte4;
    while (i < length) {
        // Convert every 6-bits in the input 3 character points
        // into a base64 digit
        byte1 = charCodes[i] >> 2;
        byte2 = (charCodes[i] & 3) << 4 | charCodes[i + 1] >> 4;
        byte3 = (charCodes[i + 1] & 15) << 2 | charCodes[i + 2] >> 6;
        byte4 = charCodes[i + 2] & 63;
        // We are out of characters in the input, set the extra
        // digits to 64 (padding character).
        if (i + 1 >= length) {
            byte3 = byte4 = 64;
        }
        else if (i + 2 >= length) {
            byte4 = 64;
        }
        // Write to the output
        result += base64Digits.charAt(byte1) + base64Digits.charAt(byte2) + base64Digits.charAt(byte3) + base64Digits.charAt(byte4);
        i += 3;
    }
    return result;
}
exports.convertToBase64 = convertToBase64;
function getStringFromExpandedCharCodes(codes) {
    var output = "";
    var i = 0;
    var length = codes.length;
    while (i < length) {
        var charCode = codes[i];
        if (charCode < 0x80) {
            output += String.fromCharCode(charCode);
            i++;
        }
        else if ((charCode & 192) === 192) {
            var value = charCode & 63;
            i++;
            var nextCode = codes[i];
            while ((nextCode & 192) === 128) {
                value = (value << 6) | (nextCode & 63);
                i++;
                nextCode = codes[i];
            }
            // `value` may be greater than 10FFFF (the maximum unicode codepoint) - JS will just make this into an invalid character for us
            output += String.fromCharCode(value);
        }
        else {
            // We don't want to kill the process when decoding fails (due to a following char byte not
            // following a leading char), so we just print the (bad) value
            output += String.fromCharCode(charCode);
            i++;
        }
    }
    return output;
}
/** @internal */
function base64encode(host, input) {
    if (host && host.base64encode) {
        return host.base64encode(input);
    }
    return convertToBase64(input);
}
exports.base64encode = base64encode;
/** @internal */
function base64decode(host, input) {
    if (host && host.base64decode) {
        return host.base64decode(input);
    }
    var length = input.length;
    var expandedCharCodes = [];
    var i = 0;
    while (i < length) {
        // Stop decoding once padding characters are present
        if (input.charCodeAt(i) === base64Digits.charCodeAt(64)) {
            break;
        }
        // convert 4 input digits into three characters, ignoring padding characters at the end
        var ch1 = base64Digits.indexOf(input[i]);
        var ch2 = base64Digits.indexOf(input[i + 1]);
        var ch3 = base64Digits.indexOf(input[i + 2]);
        var ch4 = base64Digits.indexOf(input[i + 3]);
        var code1 = ((ch1 & 63) << 2) | ((ch2 >> 4) & 3);
        var code2 = ((ch2 & 15) << 4) | ((ch3 >> 2) & 15);
        var code3 = ((ch3 & 3) << 6) | (ch4 & 63);
        if (code2 === 0 && ch3 !== 0) { // code2 decoded to zero, but ch3 was padding - elide code2 and code3
            expandedCharCodes.push(code1);
        }
        else if (code3 === 0 && ch4 !== 0) { // code3 decoded to zero, but ch4 was padding, elide code3
            expandedCharCodes.push(code1, code2);
        }
        else {
            expandedCharCodes.push(code1, code2, code3);
        }
        i += 4;
    }
    return getStringFromExpandedCharCodes(expandedCharCodes);
}
exports.base64decode = base64decode;
/** @internal */
function readJsonOrUndefined(path, hostOrText) {
    var jsonText = (0, ts_1.isString)(hostOrText) ? hostOrText : hostOrText.readFile(path);
    if (!jsonText)
        return undefined;
    // gracefully handle if readFile fails or returns not JSON
    var result = (0, ts_1.parseConfigFileTextToJson)(path, jsonText);
    return !result.error ? result.config : undefined;
}
exports.readJsonOrUndefined = readJsonOrUndefined;
/** @internal */
function readJson(path, host) {
    return readJsonOrUndefined(path, host) || {};
}
exports.readJson = readJson;
/** @internal */
function directoryProbablyExists(directoryName, host) {
    // if host does not support 'directoryExists' assume that directory will exist
    return !host.directoryExists || host.directoryExists(directoryName);
}
exports.directoryProbablyExists = directoryProbablyExists;
var carriageReturnLineFeed = "\r\n";
var lineFeed = "\n";
/** @internal */
function getNewLineCharacter(options) {
    switch (options.newLine) {
        case 0 /* NewLineKind.CarriageReturnLineFeed */:
            return carriageReturnLineFeed;
        case 1 /* NewLineKind.LineFeed */:
        case undefined:
            return lineFeed;
    }
}
exports.getNewLineCharacter = getNewLineCharacter;
/**
 * Creates a new TextRange from the provided pos and end.
 *
 * @param pos The start position.
 * @param end The end position.
 *
 * @internal
 */
function createRange(pos, end) {
    if (end === void 0) { end = pos; }
    ts_1.Debug.assert(end >= pos || end === -1);
    return { pos: pos, end: end };
}
exports.createRange = createRange;
/**
 * Creates a new TextRange from a provided range with a new end position.
 *
 * @param range A TextRange.
 * @param end The new end position.
 *
 * @internal
 */
function moveRangeEnd(range, end) {
    return createRange(range.pos, end);
}
exports.moveRangeEnd = moveRangeEnd;
/**
 * Creates a new TextRange from a provided range with a new start position.
 *
 * @param range A TextRange.
 * @param pos The new Start position.
 *
 * @internal
 */
function moveRangePos(range, pos) {
    return createRange(pos, range.end);
}
exports.moveRangePos = moveRangePos;
/**
 * Moves the start position of a range past any decorators.
 *
 * @internal
 */
function moveRangePastDecorators(node) {
    var lastDecorator = (0, ts_1.canHaveModifiers)(node) ? (0, ts_1.findLast)(node.modifiers, ts_1.isDecorator) : undefined;
    return lastDecorator && !positionIsSynthesized(lastDecorator.end)
        ? moveRangePos(node, lastDecorator.end)
        : node;
}
exports.moveRangePastDecorators = moveRangePastDecorators;
/**
 * Moves the start position of a range past any decorators or modifiers.
 *
 * @internal
 */
function moveRangePastModifiers(node) {
    if ((0, ts_1.isPropertyDeclaration)(node) || (0, ts_1.isMethodDeclaration)(node)) {
        return moveRangePos(node, node.name.pos);
    }
    var lastModifier = (0, ts_1.canHaveModifiers)(node) ? (0, ts_1.lastOrUndefined)(node.modifiers) : undefined;
    return lastModifier && !positionIsSynthesized(lastModifier.end)
        ? moveRangePos(node, lastModifier.end)
        : moveRangePastDecorators(node);
}
exports.moveRangePastModifiers = moveRangePastModifiers;
/**
 * Determines whether a TextRange has the same start and end positions.
 *
 * @param range A TextRange.
 *
 * @internal
 */
function isCollapsedRange(range) {
    return range.pos === range.end;
}
exports.isCollapsedRange = isCollapsedRange;
/**
 * Creates a new TextRange for a token at the provides start position.
 *
 * @param pos The start position.
 * @param token The token.
 *
 * @internal
 */
function createTokenRange(pos, token) {
    return createRange(pos, pos + (0, ts_1.tokenToString)(token).length);
}
exports.createTokenRange = createTokenRange;
/** @internal */
function rangeIsOnSingleLine(range, sourceFile) {
    return rangeStartIsOnSameLineAsRangeEnd(range, range, sourceFile);
}
exports.rangeIsOnSingleLine = rangeIsOnSingleLine;
/** @internal */
function rangeStartPositionsAreOnSameLine(range1, range2, sourceFile) {
    return positionsAreOnSameLine(getStartPositionOfRange(range1, sourceFile, /*includeComments*/ false), getStartPositionOfRange(range2, sourceFile, /*includeComments*/ false), sourceFile);
}
exports.rangeStartPositionsAreOnSameLine = rangeStartPositionsAreOnSameLine;
/** @internal */
function rangeEndPositionsAreOnSameLine(range1, range2, sourceFile) {
    return positionsAreOnSameLine(range1.end, range2.end, sourceFile);
}
exports.rangeEndPositionsAreOnSameLine = rangeEndPositionsAreOnSameLine;
/** @internal */
function rangeStartIsOnSameLineAsRangeEnd(range1, range2, sourceFile) {
    return positionsAreOnSameLine(getStartPositionOfRange(range1, sourceFile, /*includeComments*/ false), range2.end, sourceFile);
}
exports.rangeStartIsOnSameLineAsRangeEnd = rangeStartIsOnSameLineAsRangeEnd;
/** @internal */
function rangeEndIsOnSameLineAsRangeStart(range1, range2, sourceFile) {
    return positionsAreOnSameLine(range1.end, getStartPositionOfRange(range2, sourceFile, /*includeComments*/ false), sourceFile);
}
exports.rangeEndIsOnSameLineAsRangeStart = rangeEndIsOnSameLineAsRangeStart;
/** @internal */
function getLinesBetweenRangeEndAndRangeStart(range1, range2, sourceFile, includeSecondRangeComments) {
    var range2Start = getStartPositionOfRange(range2, sourceFile, includeSecondRangeComments);
    return (0, ts_1.getLinesBetweenPositions)(sourceFile, range1.end, range2Start);
}
exports.getLinesBetweenRangeEndAndRangeStart = getLinesBetweenRangeEndAndRangeStart;
/** @internal */
function getLinesBetweenRangeEndPositions(range1, range2, sourceFile) {
    return (0, ts_1.getLinesBetweenPositions)(sourceFile, range1.end, range2.end);
}
exports.getLinesBetweenRangeEndPositions = getLinesBetweenRangeEndPositions;
/** @internal */
function isNodeArrayMultiLine(list, sourceFile) {
    return !positionsAreOnSameLine(list.pos, list.end, sourceFile);
}
exports.isNodeArrayMultiLine = isNodeArrayMultiLine;
/** @internal */
function positionsAreOnSameLine(pos1, pos2, sourceFile) {
    return (0, ts_1.getLinesBetweenPositions)(sourceFile, pos1, pos2) === 0;
}
exports.positionsAreOnSameLine = positionsAreOnSameLine;
/** @internal */
function getStartPositionOfRange(range, sourceFile, includeComments) {
    return positionIsSynthesized(range.pos) ? -1 : (0, ts_1.skipTrivia)(sourceFile.text, range.pos, /*stopAfterLineBreak*/ false, includeComments);
}
exports.getStartPositionOfRange = getStartPositionOfRange;
/** @internal */
function getLinesBetweenPositionAndPrecedingNonWhitespaceCharacter(pos, stopPos, sourceFile, includeComments) {
    var startPos = (0, ts_1.skipTrivia)(sourceFile.text, pos, /*stopAfterLineBreak*/ false, includeComments);
    var prevPos = getPreviousNonWhitespacePosition(startPos, stopPos, sourceFile);
    return (0, ts_1.getLinesBetweenPositions)(sourceFile, prevPos !== null && prevPos !== void 0 ? prevPos : stopPos, startPos);
}
exports.getLinesBetweenPositionAndPrecedingNonWhitespaceCharacter = getLinesBetweenPositionAndPrecedingNonWhitespaceCharacter;
/** @internal */
function getLinesBetweenPositionAndNextNonWhitespaceCharacter(pos, stopPos, sourceFile, includeComments) {
    var nextPos = (0, ts_1.skipTrivia)(sourceFile.text, pos, /*stopAfterLineBreak*/ false, includeComments);
    return (0, ts_1.getLinesBetweenPositions)(sourceFile, pos, Math.min(stopPos, nextPos));
}
exports.getLinesBetweenPositionAndNextNonWhitespaceCharacter = getLinesBetweenPositionAndNextNonWhitespaceCharacter;
function getPreviousNonWhitespacePosition(pos, stopPos, sourceFile) {
    if (stopPos === void 0) { stopPos = 0; }
    while (pos-- > stopPos) {
        if (!(0, ts_1.isWhiteSpaceLike)(sourceFile.text.charCodeAt(pos))) {
            return pos;
        }
    }
}
/**
 * Determines whether a name was originally the declaration name of an enum or namespace
 * declaration.
 *
 * @internal
 */
function isDeclarationNameOfEnumOrNamespace(node) {
    var parseNode = (0, ts_1.getParseTreeNode)(node);
    if (parseNode) {
        switch (parseNode.parent.kind) {
            case 265 /* SyntaxKind.EnumDeclaration */:
            case 266 /* SyntaxKind.ModuleDeclaration */:
                return parseNode === parseNode.parent.name;
        }
    }
    return false;
}
exports.isDeclarationNameOfEnumOrNamespace = isDeclarationNameOfEnumOrNamespace;
/** @internal */
function getInitializedVariables(node) {
    return (0, ts_1.filter)(node.declarations, isInitializedVariable);
}
exports.getInitializedVariables = getInitializedVariables;
/** @internal */
function isInitializedVariable(node) {
    return (0, ts_1.isVariableDeclaration)(node) && node.initializer !== undefined;
}
exports.isInitializedVariable = isInitializedVariable;
/** @internal */
function isWatchSet(options) {
    // Firefox has Object.prototype.watch
    return options.watch && (0, ts_1.hasProperty)(options, "watch");
}
exports.isWatchSet = isWatchSet;
/** @internal */
function closeFileWatcher(watcher) {
    watcher.close();
}
exports.closeFileWatcher = closeFileWatcher;
/** @internal */
function getCheckFlags(symbol) {
    return symbol.flags & 33554432 /* SymbolFlags.Transient */ ? symbol.links.checkFlags : 0;
}
exports.getCheckFlags = getCheckFlags;
/** @internal */
function getDeclarationModifierFlagsFromSymbol(s, isWrite) {
    if (isWrite === void 0) { isWrite = false; }
    if (s.valueDeclaration) {
        var declaration = (isWrite && s.declarations && (0, ts_1.find)(s.declarations, ts_1.isSetAccessorDeclaration))
            || (s.flags & 32768 /* SymbolFlags.GetAccessor */ && (0, ts_1.find)(s.declarations, ts_1.isGetAccessorDeclaration)) || s.valueDeclaration;
        var flags = (0, ts_1.getCombinedModifierFlags)(declaration);
        return s.parent && s.parent.flags & 32 /* SymbolFlags.Class */ ? flags : flags & ~28 /* ModifierFlags.AccessibilityModifier */;
    }
    if (getCheckFlags(s) & 6 /* CheckFlags.Synthetic */) {
        // NOTE: potentially unchecked cast to TransientSymbol
        var checkFlags = s.links.checkFlags;
        var accessModifier = checkFlags & 1024 /* CheckFlags.ContainsPrivate */ ? 8 /* ModifierFlags.Private */ :
            checkFlags & 256 /* CheckFlags.ContainsPublic */ ? 4 /* ModifierFlags.Public */ :
                16 /* ModifierFlags.Protected */;
        var staticModifier = checkFlags & 2048 /* CheckFlags.ContainsStatic */ ? 32 /* ModifierFlags.Static */ : 0;
        return accessModifier | staticModifier;
    }
    if (s.flags & 4194304 /* SymbolFlags.Prototype */) {
        return 4 /* ModifierFlags.Public */ | 32 /* ModifierFlags.Static */;
    }
    return 0;
}
exports.getDeclarationModifierFlagsFromSymbol = getDeclarationModifierFlagsFromSymbol;
/** @internal */
function skipAlias(symbol, checker) {
    return symbol.flags & 2097152 /* SymbolFlags.Alias */ ? checker.getAliasedSymbol(symbol) : symbol;
}
exports.skipAlias = skipAlias;
/**
 * See comment on `declareModuleMember` in `binder.ts`.
 *
 * @internal
 */
function getCombinedLocalAndExportSymbolFlags(symbol) {
    return symbol.exportSymbol ? symbol.exportSymbol.flags | symbol.flags : symbol.flags;
}
exports.getCombinedLocalAndExportSymbolFlags = getCombinedLocalAndExportSymbolFlags;
/** @internal */
function isWriteOnlyAccess(node) {
    return accessKind(node) === 1 /* AccessKind.Write */;
}
exports.isWriteOnlyAccess = isWriteOnlyAccess;
/** @internal */
function isWriteAccess(node) {
    return accessKind(node) !== 0 /* AccessKind.Read */;
}
exports.isWriteAccess = isWriteAccess;
function accessKind(node) {
    var parent = node.parent;
    switch (parent === null || parent === void 0 ? void 0 : parent.kind) {
        case 216 /* SyntaxKind.ParenthesizedExpression */:
            return accessKind(parent);
        case 224 /* SyntaxKind.PostfixUnaryExpression */:
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
            var operator = parent.operator;
            return operator === 46 /* SyntaxKind.PlusPlusToken */ || operator === 47 /* SyntaxKind.MinusMinusToken */ ? 2 /* AccessKind.ReadWrite */ : 0 /* AccessKind.Read */;
        case 225 /* SyntaxKind.BinaryExpression */:
            var _a = parent, left = _a.left, operatorToken = _a.operatorToken;
            return left === node && isAssignmentOperator(operatorToken.kind) ?
                operatorToken.kind === 64 /* SyntaxKind.EqualsToken */ ? 1 /* AccessKind.Write */ : 2 /* AccessKind.ReadWrite */
                : 0 /* AccessKind.Read */;
        case 210 /* SyntaxKind.PropertyAccessExpression */:
            return parent.name !== node ? 0 /* AccessKind.Read */ : accessKind(parent);
        case 302 /* SyntaxKind.PropertyAssignment */: {
            var parentAccess = accessKind(parent.parent);
            // In `({ x: varname }) = { x: 1 }`, the left `x` is a read, the right `x` is a write.
            return node === parent.name ? reverseAccessKind(parentAccess) : parentAccess;
        }
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            // Assume it's the local variable being accessed, since we don't check public properties for --noUnusedLocals.
            return node === parent.objectAssignmentInitializer ? 0 /* AccessKind.Read */ : accessKind(parent.parent);
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
            return accessKind(parent);
        default:
            return 0 /* AccessKind.Read */;
    }
}
function reverseAccessKind(a) {
    switch (a) {
        case 0 /* AccessKind.Read */:
            return 1 /* AccessKind.Write */;
        case 1 /* AccessKind.Write */:
            return 0 /* AccessKind.Read */;
        case 2 /* AccessKind.ReadWrite */:
            return 2 /* AccessKind.ReadWrite */;
        default:
            return ts_1.Debug.assertNever(a);
    }
}
/** @internal */
function compareDataObjects(dst, src) {
    if (!dst || !src || Object.keys(dst).length !== Object.keys(src).length) {
        return false;
    }
    for (var e in dst) {
        if (typeof dst[e] === "object") {
            if (!compareDataObjects(dst[e], src[e])) {
                return false;
            }
        }
        else if (typeof dst[e] !== "function") {
            if (dst[e] !== src[e]) {
                return false;
            }
        }
    }
    return true;
}
exports.compareDataObjects = compareDataObjects;
/**
 * clears already present map by calling onDeleteExistingValue callback before deleting that key/value
 *
 * @internal
 */
function clearMap(map, onDeleteValue) {
    // Remove all
    map.forEach(onDeleteValue);
    map.clear();
}
exports.clearMap = clearMap;
/**
 * Mutates the map with newMap such that keys in map will be same as newMap.
 *
 * @internal
 */
function mutateMapSkippingNewValues(map, newMap, options) {
    var onDeleteValue = options.onDeleteValue, onExistingValue = options.onExistingValue;
    // Needs update
    map.forEach(function (existingValue, key) {
        var valueInNewMap = newMap.get(key);
        // Not present any more in new map, remove it
        if (valueInNewMap === undefined) {
            map.delete(key);
            onDeleteValue(existingValue, key);
        }
        // If present notify about existing values
        else if (onExistingValue) {
            onExistingValue(existingValue, valueInNewMap, key);
        }
    });
}
exports.mutateMapSkippingNewValues = mutateMapSkippingNewValues;
/**
 * Mutates the map with newMap such that keys in map will be same as newMap.
 *
 * @internal
 */
function mutateMap(map, newMap, options) {
    // Needs update
    mutateMapSkippingNewValues(map, newMap, options);
    var createNewValue = options.createNewValue;
    // Add new values that are not already present
    newMap.forEach(function (valueInNewMap, key) {
        if (!map.has(key)) {
            // New values
            map.set(key, createNewValue(key, valueInNewMap));
        }
    });
}
exports.mutateMap = mutateMap;
/** @internal */
function isAbstractConstructorSymbol(symbol) {
    if (symbol.flags & 32 /* SymbolFlags.Class */) {
        var declaration = getClassLikeDeclarationOfSymbol(symbol);
        return !!declaration && hasSyntacticModifier(declaration, 256 /* ModifierFlags.Abstract */);
    }
    return false;
}
exports.isAbstractConstructorSymbol = isAbstractConstructorSymbol;
/** @internal */
function getClassLikeDeclarationOfSymbol(symbol) {
    var _a;
    return (_a = symbol.declarations) === null || _a === void 0 ? void 0 : _a.find(ts_1.isClassLike);
}
exports.getClassLikeDeclarationOfSymbol = getClassLikeDeclarationOfSymbol;
/** @internal */
function getObjectFlags(type) {
    return type.flags & 138117121 /* TypeFlags.ObjectFlagsType */ ? type.objectFlags : 0;
}
exports.getObjectFlags = getObjectFlags;
/** @internal */
function forSomeAncestorDirectory(directory, callback) {
    return !!(0, ts_1.forEachAncestorDirectory)(directory, function (d) { return callback(d) ? true : undefined; });
}
exports.forSomeAncestorDirectory = forSomeAncestorDirectory;
/** @internal */
function isUMDExportSymbol(symbol) {
    return !!symbol && !!symbol.declarations && !!symbol.declarations[0] && (0, ts_1.isNamespaceExportDeclaration)(symbol.declarations[0]);
}
exports.isUMDExportSymbol = isUMDExportSymbol;
/** @internal */
function showModuleSpecifier(_a) {
    var moduleSpecifier = _a.moduleSpecifier;
    return (0, ts_1.isStringLiteral)(moduleSpecifier) ? moduleSpecifier.text : getTextOfNode(moduleSpecifier);
}
exports.showModuleSpecifier = showModuleSpecifier;
/** @internal */
function getLastChild(node) {
    var lastChild;
    (0, ts_1.forEachChild)(node, function (child) {
        if (nodeIsPresent(child))
            lastChild = child;
    }, function (children) {
        // As an optimization, jump straight to the end of the list.
        for (var i = children.length - 1; i >= 0; i--) {
            if (nodeIsPresent(children[i])) {
                lastChild = children[i];
                break;
            }
        }
    });
    return lastChild;
}
exports.getLastChild = getLastChild;
/** @internal */
function addToSeen(seen, key, value) {
    if (value === void 0) { value = true; }
    if (seen.has(key)) {
        return false;
    }
    seen.set(key, value);
    return true;
}
exports.addToSeen = addToSeen;
/** @internal */
function isObjectTypeDeclaration(node) {
    return (0, ts_1.isClassLike)(node) || (0, ts_1.isInterfaceDeclaration)(node) || (0, ts_1.isTypeLiteralNode)(node);
}
exports.isObjectTypeDeclaration = isObjectTypeDeclaration;
/** @internal */
function isTypeNodeKind(kind) {
    return (kind >= 181 /* SyntaxKind.FirstTypeNode */ && kind <= 204 /* SyntaxKind.LastTypeNode */)
        || kind === 133 /* SyntaxKind.AnyKeyword */
        || kind === 159 /* SyntaxKind.UnknownKeyword */
        || kind === 150 /* SyntaxKind.NumberKeyword */
        || kind === 162 /* SyntaxKind.BigIntKeyword */
        || kind === 151 /* SyntaxKind.ObjectKeyword */
        || kind === 136 /* SyntaxKind.BooleanKeyword */
        || kind === 154 /* SyntaxKind.StringKeyword */
        || kind === 155 /* SyntaxKind.SymbolKeyword */
        || kind === 116 /* SyntaxKind.VoidKeyword */
        || kind === 157 /* SyntaxKind.UndefinedKeyword */
        || kind === 146 /* SyntaxKind.NeverKeyword */
        || kind === 141 /* SyntaxKind.IntrinsicKeyword */
        || kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */
        || kind === 318 /* SyntaxKind.JSDocAllType */
        || kind === 319 /* SyntaxKind.JSDocUnknownType */
        || kind === 320 /* SyntaxKind.JSDocNullableType */
        || kind === 321 /* SyntaxKind.JSDocNonNullableType */
        || kind === 322 /* SyntaxKind.JSDocOptionalType */
        || kind === 323 /* SyntaxKind.JSDocFunctionType */
        || kind === 324 /* SyntaxKind.JSDocVariadicType */;
}
exports.isTypeNodeKind = isTypeNodeKind;
/** @internal */
function isAccessExpression(node) {
    return node.kind === 210 /* SyntaxKind.PropertyAccessExpression */ || node.kind === 211 /* SyntaxKind.ElementAccessExpression */;
}
exports.isAccessExpression = isAccessExpression;
/** @internal */
function getNameOfAccessExpression(node) {
    if (node.kind === 210 /* SyntaxKind.PropertyAccessExpression */) {
        return node.name;
    }
    ts_1.Debug.assert(node.kind === 211 /* SyntaxKind.ElementAccessExpression */);
    return node.argumentExpression;
}
exports.getNameOfAccessExpression = getNameOfAccessExpression;
/** @deprecated @internal */
function isBundleFileTextLike(section) {
    switch (section.kind) {
        case "text" /* BundleFileSectionKind.Text */:
        case "internal" /* BundleFileSectionKind.Internal */:
            return true;
        default:
            return false;
    }
}
exports.isBundleFileTextLike = isBundleFileTextLike;
/** @internal */
function isNamedImportsOrExports(node) {
    return node.kind === 274 /* SyntaxKind.NamedImports */ || node.kind === 278 /* SyntaxKind.NamedExports */;
}
exports.isNamedImportsOrExports = isNamedImportsOrExports;
/** @internal */
function getLeftmostAccessExpression(expr) {
    while (isAccessExpression(expr)) {
        expr = expr.expression;
    }
    return expr;
}
exports.getLeftmostAccessExpression = getLeftmostAccessExpression;
/** @internal */
function forEachNameInAccessChainWalkingLeft(name, action) {
    if (isAccessExpression(name.parent) && isRightSideOfAccessExpression(name)) {
        return walkAccessExpression(name.parent);
    }
    function walkAccessExpression(access) {
        if (access.kind === 210 /* SyntaxKind.PropertyAccessExpression */) {
            var res = action(access.name);
            if (res !== undefined) {
                return res;
            }
        }
        else if (access.kind === 211 /* SyntaxKind.ElementAccessExpression */) {
            if ((0, ts_1.isIdentifier)(access.argumentExpression) || (0, ts_1.isStringLiteralLike)(access.argumentExpression)) {
                var res = action(access.argumentExpression);
                if (res !== undefined) {
                    return res;
                }
            }
            else {
                // Chain interrupted by non-static-name access 'x[expr()].y.z'
                return undefined;
            }
        }
        if (isAccessExpression(access.expression)) {
            return walkAccessExpression(access.expression);
        }
        if ((0, ts_1.isIdentifier)(access.expression)) {
            // End of chain at Identifier 'x.y.z'
            return action(access.expression);
        }
        // End of chain at non-Identifier 'x().y.z'
        return undefined;
    }
}
exports.forEachNameInAccessChainWalkingLeft = forEachNameInAccessChainWalkingLeft;
/** @internal */
function getLeftmostExpression(node, stopAtCallExpressions) {
    while (true) {
        switch (node.kind) {
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                node = node.operand;
                continue;
            case 225 /* SyntaxKind.BinaryExpression */:
                node = node.left;
                continue;
            case 226 /* SyntaxKind.ConditionalExpression */:
                node = node.condition;
                continue;
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                node = node.tag;
                continue;
            case 212 /* SyntaxKind.CallExpression */:
                if (stopAtCallExpressions) {
                    return node;
                }
            // falls through
            case 233 /* SyntaxKind.AsExpression */:
            case 211 /* SyntaxKind.ElementAccessExpression */:
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 234 /* SyntaxKind.NonNullExpression */:
            case 359 /* SyntaxKind.PartiallyEmittedExpression */:
            case 237 /* SyntaxKind.SatisfiesExpression */:
                node = node.expression;
                continue;
        }
        return node;
    }
}
exports.getLeftmostExpression = getLeftmostExpression;
function Symbol(flags, name) {
    this.flags = flags;
    this.escapedName = name;
    this.declarations = undefined;
    this.valueDeclaration = undefined;
    this.id = 0;
    this.mergeId = 0;
    this.parent = undefined;
    this.members = undefined;
    this.exports = undefined;
    this.exportSymbol = undefined;
    this.constEnumOnlyModule = undefined;
    this.isReferenced = undefined;
    this.isAssigned = undefined;
    this.links = undefined; // used by TransientSymbol
}
function Type(checker, flags) {
    this.flags = flags;
    if (ts_1.Debug.isDebugging || ts_1.tracing) {
        this.checker = checker;
    }
}
function Signature(checker, flags) {
    this.flags = flags;
    if (ts_1.Debug.isDebugging) {
        this.checker = checker;
    }
}
function Node(kind, pos, end) {
    this.pos = pos;
    this.end = end;
    this.kind = kind;
    this.id = 0;
    this.flags = 0 /* NodeFlags.None */;
    this.modifierFlagsCache = 0 /* ModifierFlags.None */;
    this.transformFlags = 0 /* TransformFlags.None */;
    this.parent = undefined;
    this.original = undefined;
    this.emitNode = undefined;
}
function Token(kind, pos, end) {
    this.pos = pos;
    this.end = end;
    this.kind = kind;
    this.id = 0;
    this.flags = 0 /* NodeFlags.None */;
    this.transformFlags = 0 /* TransformFlags.None */;
    this.parent = undefined;
    this.emitNode = undefined;
}
function Identifier(kind, pos, end) {
    this.pos = pos;
    this.end = end;
    this.kind = kind;
    this.id = 0;
    this.flags = 0 /* NodeFlags.None */;
    this.transformFlags = 0 /* TransformFlags.None */;
    this.parent = undefined;
    this.original = undefined;
    this.emitNode = undefined;
}
function SourceMapSource(fileName, text, skipTrivia) {
    this.fileName = fileName;
    this.text = text;
    this.skipTrivia = skipTrivia || (function (pos) { return pos; });
}
/** @internal */
exports.objectAllocator = {
    getNodeConstructor: function () { return Node; },
    getTokenConstructor: function () { return Token; },
    getIdentifierConstructor: function () { return Identifier; },
    getPrivateIdentifierConstructor: function () { return Node; },
    getSourceFileConstructor: function () { return Node; },
    getSymbolConstructor: function () { return Symbol; },
    getTypeConstructor: function () { return Type; },
    getSignatureConstructor: function () { return Signature; },
    getSourceMapSourceConstructor: function () { return SourceMapSource; },
};
var objectAllocatorPatchers = [];
/**
 * Used by `deprecatedCompat` to patch the object allocator to apply deprecations.
 * @internal
 */
function addObjectAllocatorPatcher(fn) {
    objectAllocatorPatchers.push(fn);
    fn(exports.objectAllocator);
}
exports.addObjectAllocatorPatcher = addObjectAllocatorPatcher;
/** @internal */
function setObjectAllocator(alloc) {
    Object.assign(exports.objectAllocator, alloc);
    (0, ts_1.forEach)(objectAllocatorPatchers, function (fn) { return fn(exports.objectAllocator); });
}
exports.setObjectAllocator = setObjectAllocator;
/** @internal */
function formatStringFromArgs(text, args, baseIndex) {
    if (baseIndex === void 0) { baseIndex = 0; }
    return text.replace(/{(\d+)}/g, function (_match, index) { return "" + ts_1.Debug.checkDefined(args[+index + baseIndex]); });
}
exports.formatStringFromArgs = formatStringFromArgs;
var localizedDiagnosticMessages;
/** @internal */
function setLocalizedDiagnosticMessages(messages) {
    localizedDiagnosticMessages = messages;
}
exports.setLocalizedDiagnosticMessages = setLocalizedDiagnosticMessages;
/** @internal */
// If the localized messages json is unset, and if given function use it to set the json
function maybeSetLocalizedDiagnosticMessages(getMessages) {
    if (!localizedDiagnosticMessages && getMessages) {
        localizedDiagnosticMessages = getMessages();
    }
}
exports.maybeSetLocalizedDiagnosticMessages = maybeSetLocalizedDiagnosticMessages;
/** @internal */
function getLocaleSpecificMessage(message) {
    return localizedDiagnosticMessages && localizedDiagnosticMessages[message.key] || message.message;
}
exports.getLocaleSpecificMessage = getLocaleSpecificMessage;
/** @internal */
function createDetachedDiagnostic(fileName, start, length, message) {
    assertDiagnosticLocation(/*file*/ undefined, start, length);
    var text = getLocaleSpecificMessage(message);
    if (arguments.length > 4) {
        text = formatStringFromArgs(text, arguments, 4);
    }
    return {
        file: undefined,
        start: start,
        length: length,
        messageText: text,
        category: message.category,
        code: message.code,
        reportsUnnecessary: message.reportsUnnecessary,
        fileName: fileName,
    };
}
exports.createDetachedDiagnostic = createDetachedDiagnostic;
function isDiagnosticWithDetachedLocation(diagnostic) {
    return diagnostic.file === undefined
        && diagnostic.start !== undefined
        && diagnostic.length !== undefined
        && typeof diagnostic.fileName === "string";
}
function attachFileToDiagnostic(diagnostic, file) {
    var fileName = file.fileName || "";
    var length = file.text.length;
    ts_1.Debug.assertEqual(diagnostic.fileName, fileName);
    ts_1.Debug.assertLessThanOrEqual(diagnostic.start, length);
    ts_1.Debug.assertLessThanOrEqual(diagnostic.start + diagnostic.length, length);
    var diagnosticWithLocation = {
        file: file,
        start: diagnostic.start,
        length: diagnostic.length,
        messageText: diagnostic.messageText,
        category: diagnostic.category,
        code: diagnostic.code,
        reportsUnnecessary: diagnostic.reportsUnnecessary
    };
    if (diagnostic.relatedInformation) {
        diagnosticWithLocation.relatedInformation = [];
        for (var _i = 0, _a = diagnostic.relatedInformation; _i < _a.length; _i++) {
            var related = _a[_i];
            if (isDiagnosticWithDetachedLocation(related) && related.fileName === fileName) {
                ts_1.Debug.assertLessThanOrEqual(related.start, length);
                ts_1.Debug.assertLessThanOrEqual(related.start + related.length, length);
                diagnosticWithLocation.relatedInformation.push(attachFileToDiagnostic(related, file));
            }
            else {
                diagnosticWithLocation.relatedInformation.push(related);
            }
        }
    }
    return diagnosticWithLocation;
}
/** @internal */
function attachFileToDiagnostics(diagnostics, file) {
    var diagnosticsWithLocation = [];
    for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
        var diagnostic = diagnostics_1[_i];
        diagnosticsWithLocation.push(attachFileToDiagnostic(diagnostic, file));
    }
    return diagnosticsWithLocation;
}
exports.attachFileToDiagnostics = attachFileToDiagnostics;
/** @internal */
function createFileDiagnostic(file, start, length, message) {
    assertDiagnosticLocation(file, start, length);
    var text = getLocaleSpecificMessage(message);
    if (arguments.length > 4) {
        text = formatStringFromArgs(text, arguments, 4);
    }
    return {
        file: file,
        start: start,
        length: length,
        messageText: text,
        category: message.category,
        code: message.code,
        reportsUnnecessary: message.reportsUnnecessary,
        reportsDeprecated: message.reportsDeprecated
    };
}
exports.createFileDiagnostic = createFileDiagnostic;
/** @internal */
function formatMessage(_dummy, message) {
    var text = getLocaleSpecificMessage(message);
    if (arguments.length > 2) {
        text = formatStringFromArgs(text, arguments, 2);
    }
    return text;
}
exports.formatMessage = formatMessage;
/** @internal */
function createCompilerDiagnostic(message) {
    var text = getLocaleSpecificMessage(message);
    if (arguments.length > 1) {
        text = formatStringFromArgs(text, arguments, 1);
    }
    return {
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: text,
        category: message.category,
        code: message.code,
        reportsUnnecessary: message.reportsUnnecessary,
        reportsDeprecated: message.reportsDeprecated
    };
}
exports.createCompilerDiagnostic = createCompilerDiagnostic;
/** @internal */
function createCompilerDiagnosticFromMessageChain(chain, relatedInformation) {
    return {
        file: undefined,
        start: undefined,
        length: undefined,
        code: chain.code,
        category: chain.category,
        messageText: chain.next ? chain : chain.messageText,
        relatedInformation: relatedInformation
    };
}
exports.createCompilerDiagnosticFromMessageChain = createCompilerDiagnosticFromMessageChain;
/** @internal */
function chainDiagnosticMessages(details, message) {
    var text = getLocaleSpecificMessage(message);
    if (arguments.length > 2) {
        text = formatStringFromArgs(text, arguments, 2);
    }
    return {
        messageText: text,
        category: message.category,
        code: message.code,
        next: details === undefined || Array.isArray(details) ? details : [details]
    };
}
exports.chainDiagnosticMessages = chainDiagnosticMessages;
/** @internal */
function concatenateDiagnosticMessageChains(headChain, tailChain) {
    var lastChain = headChain;
    while (lastChain.next) {
        lastChain = lastChain.next[0];
    }
    lastChain.next = [tailChain];
}
exports.concatenateDiagnosticMessageChains = concatenateDiagnosticMessageChains;
function getDiagnosticFilePath(diagnostic) {
    return diagnostic.file ? diagnostic.file.path : undefined;
}
/** @internal */
function compareDiagnostics(d1, d2) {
    return compareDiagnosticsSkipRelatedInformation(d1, d2) ||
        compareRelatedInformation(d1, d2) ||
        0 /* Comparison.EqualTo */;
}
exports.compareDiagnostics = compareDiagnostics;
/** @internal */
function compareDiagnosticsSkipRelatedInformation(d1, d2) {
    return (0, ts_1.compareStringsCaseSensitive)(getDiagnosticFilePath(d1), getDiagnosticFilePath(d2)) ||
        (0, ts_1.compareValues)(d1.start, d2.start) ||
        (0, ts_1.compareValues)(d1.length, d2.length) ||
        (0, ts_1.compareValues)(d1.code, d2.code) ||
        compareMessageText(d1.messageText, d2.messageText) ||
        0 /* Comparison.EqualTo */;
}
exports.compareDiagnosticsSkipRelatedInformation = compareDiagnosticsSkipRelatedInformation;
function compareRelatedInformation(d1, d2) {
    if (!d1.relatedInformation && !d2.relatedInformation) {
        return 0 /* Comparison.EqualTo */;
    }
    if (d1.relatedInformation && d2.relatedInformation) {
        return (0, ts_1.compareValues)(d1.relatedInformation.length, d2.relatedInformation.length) || (0, ts_1.forEach)(d1.relatedInformation, function (d1i, index) {
            var d2i = d2.relatedInformation[index];
            return compareDiagnostics(d1i, d2i); // EqualTo is 0, so falsy, and will cause the next item to be compared
        }) || 0 /* Comparison.EqualTo */;
    }
    return d1.relatedInformation ? -1 /* Comparison.LessThan */ : 1 /* Comparison.GreaterThan */;
}
function compareMessageText(t1, t2) {
    if (typeof t1 === "string" && typeof t2 === "string") {
        return (0, ts_1.compareStringsCaseSensitive)(t1, t2);
    }
    else if (typeof t1 === "string") {
        return -1 /* Comparison.LessThan */;
    }
    else if (typeof t2 === "string") {
        return 1 /* Comparison.GreaterThan */;
    }
    var res = (0, ts_1.compareStringsCaseSensitive)(t1.messageText, t2.messageText);
    if (res) {
        return res;
    }
    if (!t1.next && !t2.next) {
        return 0 /* Comparison.EqualTo */;
    }
    if (!t1.next) {
        return -1 /* Comparison.LessThan */;
    }
    if (!t2.next) {
        return 1 /* Comparison.GreaterThan */;
    }
    var len = Math.min(t1.next.length, t2.next.length);
    for (var i = 0; i < len; i++) {
        res = compareMessageText(t1.next[i], t2.next[i]);
        if (res) {
            return res;
        }
    }
    if (t1.next.length < t2.next.length) {
        return -1 /* Comparison.LessThan */;
    }
    else if (t1.next.length > t2.next.length) {
        return 1 /* Comparison.GreaterThan */;
    }
    return 0 /* Comparison.EqualTo */;
}
/** @internal */
function getLanguageVariant(scriptKind) {
    // .tsx and .jsx files are treated as jsx language variant.
    return scriptKind === 4 /* ScriptKind.TSX */ || scriptKind === 2 /* ScriptKind.JSX */ || scriptKind === 1 /* ScriptKind.JS */ || scriptKind === 6 /* ScriptKind.JSON */ ? 1 /* LanguageVariant.JSX */ : 0 /* LanguageVariant.Standard */;
}
exports.getLanguageVariant = getLanguageVariant;
/**
 * This is a somewhat unavoidable full tree walk to locate a JSX tag - `import.meta` requires the same,
 * but we avoid that walk (or parts of it) if at all possible using the `PossiblyContainsImportMeta` node flag.
 * Unfortunately, there's no `NodeFlag` space to do the same for JSX.
 */
function walkTreeForJSXTags(node) {
    if (!(node.transformFlags & 2 /* TransformFlags.ContainsJsx */))
        return undefined;
    return (0, ts_1.isJsxOpeningLikeElement)(node) || (0, ts_1.isJsxFragment)(node) ? node : (0, ts_1.forEachChild)(node, walkTreeForJSXTags);
}
function isFileModuleFromUsingJSXTag(file) {
    // Excludes declaration files - they still require an explicit `export {}` or the like
    // for back compat purposes. (not that declaration files should contain JSX tags!)
    return !file.isDeclarationFile ? walkTreeForJSXTags(file) : undefined;
}
/**
 * Note that this requires file.impliedNodeFormat be set already; meaning it must be set very early on
 * in SourceFile construction.
 */
function isFileForcedToBeModuleByFormat(file) {
    // Excludes declaration files - they still require an explicit `export {}` or the like
    // for back compat purposes. The only non-declaration files _not_ forced to be a module are `.js` files
    // that aren't esm-mode (meaning not in a `type: module` scope).
    return (file.impliedNodeFormat === ts_1.ModuleKind.ESNext || ((0, ts_1.fileExtensionIsOneOf)(file.fileName, [".cjs" /* Extension.Cjs */, ".cts" /* Extension.Cts */, ".mjs" /* Extension.Mjs */, ".mts" /* Extension.Mts */]))) && !file.isDeclarationFile ? true : undefined;
}
/** @internal */
function getSetExternalModuleIndicator(options) {
    // TODO: Should this callback be cached?
    switch (getEmitModuleDetectionKind(options)) {
        case ts_1.ModuleDetectionKind.Force:
            // All non-declaration files are modules, declaration files still do the usual isFileProbablyExternalModule
            return function (file) {
                file.externalModuleIndicator = (0, ts_1.isFileProbablyExternalModule)(file) || !file.isDeclarationFile || undefined;
            };
        case ts_1.ModuleDetectionKind.Legacy:
            // Files are modules if they have imports, exports, or import.meta
            return function (file) {
                file.externalModuleIndicator = (0, ts_1.isFileProbablyExternalModule)(file);
            };
        case ts_1.ModuleDetectionKind.Auto:
            // If module is nodenext or node16, all esm format files are modules
            // If jsx is react-jsx or react-jsxdev then jsx tags force module-ness
            // otherwise, the presence of import or export statments (or import.meta) implies module-ness
            var checks = [ts_1.isFileProbablyExternalModule];
            if (options.jsx === 4 /* JsxEmit.ReactJSX */ || options.jsx === 5 /* JsxEmit.ReactJSXDev */) {
                checks.push(isFileModuleFromUsingJSXTag);
            }
            checks.push(isFileForcedToBeModuleByFormat);
            var combined_1 = ts_1.or.apply(void 0, checks);
            var callback = function (file) { return void (file.externalModuleIndicator = combined_1(file)); };
            return callback;
    }
}
exports.getSetExternalModuleIndicator = getSetExternalModuleIndicator;
/** @internal */
function getEmitScriptTarget(compilerOptions) {
    var _a;
    return (_a = compilerOptions.target) !== null && _a !== void 0 ? _a : ((compilerOptions.module === ts_1.ModuleKind.Node16 && 9 /* ScriptTarget.ES2022 */) ||
        (compilerOptions.module === ts_1.ModuleKind.NodeNext && 99 /* ScriptTarget.ESNext */) ||
        1 /* ScriptTarget.ES5 */);
}
exports.getEmitScriptTarget = getEmitScriptTarget;
/** @internal */
function getEmitModuleKind(compilerOptions) {
    return typeof compilerOptions.module === "number" ?
        compilerOptions.module :
        getEmitScriptTarget(compilerOptions) >= 2 /* ScriptTarget.ES2015 */ ? ts_1.ModuleKind.ES2015 : ts_1.ModuleKind.CommonJS;
}
exports.getEmitModuleKind = getEmitModuleKind;
/** @internal */
function emitModuleKindIsNonNodeESM(moduleKind) {
    return moduleKind >= ts_1.ModuleKind.ES2015 && moduleKind <= ts_1.ModuleKind.ESNext;
}
exports.emitModuleKindIsNonNodeESM = emitModuleKindIsNonNodeESM;
/** @internal */
function getEmitModuleResolutionKind(compilerOptions) {
    var moduleResolution = compilerOptions.moduleResolution;
    if (moduleResolution === undefined) {
        switch (getEmitModuleKind(compilerOptions)) {
            case ts_1.ModuleKind.CommonJS:
                moduleResolution = ts_1.ModuleResolutionKind.Node10;
                break;
            case ts_1.ModuleKind.Node16:
                moduleResolution = ts_1.ModuleResolutionKind.Node16;
                break;
            case ts_1.ModuleKind.NodeNext:
                moduleResolution = ts_1.ModuleResolutionKind.NodeNext;
                break;
            default:
                moduleResolution = ts_1.ModuleResolutionKind.Classic;
                break;
        }
    }
    return moduleResolution;
}
exports.getEmitModuleResolutionKind = getEmitModuleResolutionKind;
/** @internal */
function getEmitModuleDetectionKind(options) {
    return options.moduleDetection ||
        (getEmitModuleKind(options) === ts_1.ModuleKind.Node16 || getEmitModuleKind(options) === ts_1.ModuleKind.NodeNext ? ts_1.ModuleDetectionKind.Force : ts_1.ModuleDetectionKind.Auto);
}
exports.getEmitModuleDetectionKind = getEmitModuleDetectionKind;
/** @internal */
function hasJsonModuleEmitEnabled(options) {
    switch (getEmitModuleKind(options)) {
        case ts_1.ModuleKind.CommonJS:
        case ts_1.ModuleKind.AMD:
        case ts_1.ModuleKind.ES2015:
        case ts_1.ModuleKind.ES2020:
        case ts_1.ModuleKind.ES2022:
        case ts_1.ModuleKind.ESNext:
        case ts_1.ModuleKind.Node16:
        case ts_1.ModuleKind.NodeNext:
            return true;
        default:
            return false;
    }
}
exports.hasJsonModuleEmitEnabled = hasJsonModuleEmitEnabled;
/** @internal */
function getIsolatedModules(options) {
    return !!(options.isolatedModules || options.verbatimModuleSyntax);
}
exports.getIsolatedModules = getIsolatedModules;
/** @internal */
function importNameElisionDisabled(options) {
    return options.verbatimModuleSyntax || options.isolatedModules && options.preserveValueImports;
}
exports.importNameElisionDisabled = importNameElisionDisabled;
/** @internal */
function unreachableCodeIsError(options) {
    return options.allowUnreachableCode === false;
}
exports.unreachableCodeIsError = unreachableCodeIsError;
/** @internal */
function unusedLabelIsError(options) {
    return options.allowUnusedLabels === false;
}
exports.unusedLabelIsError = unusedLabelIsError;
/** @internal */
function getAreDeclarationMapsEnabled(options) {
    return !!(getEmitDeclarations(options) && options.declarationMap);
}
exports.getAreDeclarationMapsEnabled = getAreDeclarationMapsEnabled;
/** @internal */
function getESModuleInterop(compilerOptions) {
    if (compilerOptions.esModuleInterop !== undefined) {
        return compilerOptions.esModuleInterop;
    }
    switch (getEmitModuleKind(compilerOptions)) {
        case ts_1.ModuleKind.Node16:
        case ts_1.ModuleKind.NodeNext:
            return true;
    }
    return undefined;
}
exports.getESModuleInterop = getESModuleInterop;
/** @internal */
function getAllowSyntheticDefaultImports(compilerOptions) {
    if (compilerOptions.allowSyntheticDefaultImports !== undefined) {
        return compilerOptions.allowSyntheticDefaultImports;
    }
    return getESModuleInterop(compilerOptions)
        || getEmitModuleKind(compilerOptions) === ts_1.ModuleKind.System
        || getEmitModuleResolutionKind(compilerOptions) === ts_1.ModuleResolutionKind.Bundler;
}
exports.getAllowSyntheticDefaultImports = getAllowSyntheticDefaultImports;
/** @internal */
function moduleResolutionSupportsPackageJsonExportsAndImports(moduleResolution) {
    return moduleResolution >= ts_1.ModuleResolutionKind.Node16 && moduleResolution <= ts_1.ModuleResolutionKind.NodeNext
        || moduleResolution === ts_1.ModuleResolutionKind.Bundler;
}
exports.moduleResolutionSupportsPackageJsonExportsAndImports = moduleResolutionSupportsPackageJsonExportsAndImports;
/** @internal */
function shouldResolveJsRequire(compilerOptions) {
    // `bundler` doesn't support resolving `require`, but needs to in `noDtsResolution` to support Find Source Definition
    return !!compilerOptions.noDtsResolution || getEmitModuleResolutionKind(compilerOptions) !== ts_1.ModuleResolutionKind.Bundler;
}
exports.shouldResolveJsRequire = shouldResolveJsRequire;
/** @internal */
function getResolvePackageJsonExports(compilerOptions) {
    var moduleResolution = getEmitModuleResolutionKind(compilerOptions);
    if (!moduleResolutionSupportsPackageJsonExportsAndImports(moduleResolution)) {
        return false;
    }
    if (compilerOptions.resolvePackageJsonExports !== undefined) {
        return compilerOptions.resolvePackageJsonExports;
    }
    switch (moduleResolution) {
        case ts_1.ModuleResolutionKind.Node16:
        case ts_1.ModuleResolutionKind.NodeNext:
        case ts_1.ModuleResolutionKind.Bundler:
            return true;
    }
    return false;
}
exports.getResolvePackageJsonExports = getResolvePackageJsonExports;
/** @internal */
function getResolvePackageJsonImports(compilerOptions) {
    var moduleResolution = getEmitModuleResolutionKind(compilerOptions);
    if (!moduleResolutionSupportsPackageJsonExportsAndImports(moduleResolution)) {
        return false;
    }
    if (compilerOptions.resolvePackageJsonExports !== undefined) {
        return compilerOptions.resolvePackageJsonExports;
    }
    switch (moduleResolution) {
        case ts_1.ModuleResolutionKind.Node16:
        case ts_1.ModuleResolutionKind.NodeNext:
        case ts_1.ModuleResolutionKind.Bundler:
            return true;
    }
    return false;
}
exports.getResolvePackageJsonImports = getResolvePackageJsonImports;
/** @internal */
function getResolveJsonModule(compilerOptions) {
    if (compilerOptions.resolveJsonModule !== undefined) {
        return compilerOptions.resolveJsonModule;
    }
    return getEmitModuleResolutionKind(compilerOptions) === ts_1.ModuleResolutionKind.Bundler;
}
exports.getResolveJsonModule = getResolveJsonModule;
/** @internal */
function getEmitDeclarations(compilerOptions) {
    return !!(compilerOptions.declaration || compilerOptions.composite);
}
exports.getEmitDeclarations = getEmitDeclarations;
/** @internal */
function shouldPreserveConstEnums(compilerOptions) {
    return !!(compilerOptions.preserveConstEnums || getIsolatedModules(compilerOptions));
}
exports.shouldPreserveConstEnums = shouldPreserveConstEnums;
/** @internal */
function isIncrementalCompilation(options) {
    return !!(options.incremental || options.composite);
}
exports.isIncrementalCompilation = isIncrementalCompilation;
/** @internal */
function getStrictOptionValue(compilerOptions, flag) {
    return compilerOptions[flag] === undefined ? !!compilerOptions.strict : !!compilerOptions[flag];
}
exports.getStrictOptionValue = getStrictOptionValue;
/** @internal */
function getAllowJSCompilerOption(compilerOptions) {
    return compilerOptions.allowJs === undefined ? !!compilerOptions.checkJs : compilerOptions.allowJs;
}
exports.getAllowJSCompilerOption = getAllowJSCompilerOption;
/** @internal */
function getUseDefineForClassFields(compilerOptions) {
    return compilerOptions.useDefineForClassFields === undefined ? getEmitScriptTarget(compilerOptions) >= 9 /* ScriptTarget.ES2022 */ : compilerOptions.useDefineForClassFields;
}
exports.getUseDefineForClassFields = getUseDefineForClassFields;
/** @internal */
function compilerOptionsAffectSemanticDiagnostics(newOptions, oldOptions) {
    return optionsHaveChanges(oldOptions, newOptions, ts_1.semanticDiagnosticsOptionDeclarations);
}
exports.compilerOptionsAffectSemanticDiagnostics = compilerOptionsAffectSemanticDiagnostics;
/** @internal */
function compilerOptionsAffectEmit(newOptions, oldOptions) {
    return optionsHaveChanges(oldOptions, newOptions, ts_1.affectsEmitOptionDeclarations);
}
exports.compilerOptionsAffectEmit = compilerOptionsAffectEmit;
/** @internal */
function compilerOptionsAffectDeclarationPath(newOptions, oldOptions) {
    return optionsHaveChanges(oldOptions, newOptions, ts_1.affectsDeclarationPathOptionDeclarations);
}
exports.compilerOptionsAffectDeclarationPath = compilerOptionsAffectDeclarationPath;
/** @internal */
function getCompilerOptionValue(options, option) {
    return option.strictFlag ? getStrictOptionValue(options, option.name) : options[option.name];
}
exports.getCompilerOptionValue = getCompilerOptionValue;
/** @internal */
function getJSXTransformEnabled(options) {
    var jsx = options.jsx;
    return jsx === 2 /* JsxEmit.React */ || jsx === 4 /* JsxEmit.ReactJSX */ || jsx === 5 /* JsxEmit.ReactJSXDev */;
}
exports.getJSXTransformEnabled = getJSXTransformEnabled;
/** @internal */
function getJSXImplicitImportBase(compilerOptions, file) {
    var jsxImportSourcePragmas = file === null || file === void 0 ? void 0 : file.pragmas.get("jsximportsource");
    var jsxImportSourcePragma = (0, ts_1.isArray)(jsxImportSourcePragmas) ? jsxImportSourcePragmas[jsxImportSourcePragmas.length - 1] : jsxImportSourcePragmas;
    return compilerOptions.jsx === 4 /* JsxEmit.ReactJSX */ ||
        compilerOptions.jsx === 5 /* JsxEmit.ReactJSXDev */ ||
        compilerOptions.jsxImportSource ||
        jsxImportSourcePragma ?
        (jsxImportSourcePragma === null || jsxImportSourcePragma === void 0 ? void 0 : jsxImportSourcePragma.arguments.factory) || compilerOptions.jsxImportSource || "react" :
        undefined;
}
exports.getJSXImplicitImportBase = getJSXImplicitImportBase;
/** @internal */
function getJSXRuntimeImport(base, options) {
    return base ? "".concat(base, "/").concat(options.jsx === 5 /* JsxEmit.ReactJSXDev */ ? "jsx-dev-runtime" : "jsx-runtime") : undefined;
}
exports.getJSXRuntimeImport = getJSXRuntimeImport;
/** @internal */
function hasZeroOrOneAsteriskCharacter(str) {
    var seenAsterisk = false;
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) === 42 /* CharacterCodes.asterisk */) {
            if (!seenAsterisk) {
                seenAsterisk = true;
            }
            else {
                // have already seen asterisk
                return false;
            }
        }
    }
    return true;
}
exports.hasZeroOrOneAsteriskCharacter = hasZeroOrOneAsteriskCharacter;
/** @internal */
function createSymlinkCache(cwd, getCanonicalFileName) {
    var symlinkedDirectories;
    var symlinkedDirectoriesByRealpath;
    var symlinkedFiles;
    var hasProcessedResolutions = false;
    return {
        getSymlinkedFiles: function () { return symlinkedFiles; },
        getSymlinkedDirectories: function () { return symlinkedDirectories; },
        getSymlinkedDirectoriesByRealpath: function () { return symlinkedDirectoriesByRealpath; },
        setSymlinkedFile: function (path, real) { return (symlinkedFiles || (symlinkedFiles = new Map())).set(path, real); },
        setSymlinkedDirectory: function (symlink, real) {
            // Large, interconnected dependency graphs in pnpm will have a huge number of symlinks
            // where both the realpath and the symlink path are inside node_modules/.pnpm. Since
            // this path is never a candidate for a module specifier, we can ignore it entirely.
            var symlinkPath = (0, ts_1.toPath)(symlink, cwd, getCanonicalFileName);
            if (!containsIgnoredPath(symlinkPath)) {
                symlinkPath = (0, ts_1.ensureTrailingDirectorySeparator)(symlinkPath);
                if (real !== false && !(symlinkedDirectories === null || symlinkedDirectories === void 0 ? void 0 : symlinkedDirectories.has(symlinkPath))) {
                    (symlinkedDirectoriesByRealpath || (symlinkedDirectoriesByRealpath = (0, ts_1.createMultiMap)())).add((0, ts_1.ensureTrailingDirectorySeparator)(real.realPath), symlink);
                }
                (symlinkedDirectories || (symlinkedDirectories = new Map())).set(symlinkPath, real);
            }
        },
        setSymlinksFromResolutions: function (files, typeReferenceDirectives) {
            var _this = this;
            var _a, _b;
            ts_1.Debug.assert(!hasProcessedResolutions);
            hasProcessedResolutions = true;
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                (_a = file.resolvedModules) === null || _a === void 0 ? void 0 : _a.forEach(function (resolution) { return processResolution(_this, resolution.resolvedModule); });
                (_b = file.resolvedTypeReferenceDirectiveNames) === null || _b === void 0 ? void 0 : _b.forEach(function (resolution) { return processResolution(_this, resolution.resolvedTypeReferenceDirective); });
            }
            typeReferenceDirectives.forEach(function (resolution) { return processResolution(_this, resolution.resolvedTypeReferenceDirective); });
        },
        hasProcessedResolutions: function () { return hasProcessedResolutions; },
    };
    function processResolution(cache, resolution) {
        if (!resolution || !resolution.originalPath || !resolution.resolvedFileName)
            return;
        var resolvedFileName = resolution.resolvedFileName, originalPath = resolution.originalPath;
        cache.setSymlinkedFile((0, ts_1.toPath)(originalPath, cwd, getCanonicalFileName), resolvedFileName);
        var _a = guessDirectorySymlink(resolvedFileName, originalPath, cwd, getCanonicalFileName) || ts_1.emptyArray, commonResolved = _a[0], commonOriginal = _a[1];
        if (commonResolved && commonOriginal) {
            cache.setSymlinkedDirectory(commonOriginal, { real: commonResolved, realPath: (0, ts_1.toPath)(commonResolved, cwd, getCanonicalFileName) });
        }
    }
}
exports.createSymlinkCache = createSymlinkCache;
function guessDirectorySymlink(a, b, cwd, getCanonicalFileName) {
    var aParts = (0, ts_1.getPathComponents)((0, ts_1.getNormalizedAbsolutePath)(a, cwd));
    var bParts = (0, ts_1.getPathComponents)((0, ts_1.getNormalizedAbsolutePath)(b, cwd));
    var isDirectory = false;
    while (aParts.length >= 2 && bParts.length >= 2 &&
        !isNodeModulesOrScopedPackageDirectory(aParts[aParts.length - 2], getCanonicalFileName) &&
        !isNodeModulesOrScopedPackageDirectory(bParts[bParts.length - 2], getCanonicalFileName) &&
        getCanonicalFileName(aParts[aParts.length - 1]) === getCanonicalFileName(bParts[bParts.length - 1])) {
        aParts.pop();
        bParts.pop();
        isDirectory = true;
    }
    return isDirectory ? [(0, ts_1.getPathFromPathComponents)(aParts), (0, ts_1.getPathFromPathComponents)(bParts)] : undefined;
}
// KLUDGE: Don't assume one 'node_modules' links to another. More likely a single directory inside the node_modules is the symlink.
// ALso, don't assume that an `@foo` directory is linked. More likely the contents of that are linked.
function isNodeModulesOrScopedPackageDirectory(s, getCanonicalFileName) {
    return s !== undefined && (getCanonicalFileName(s) === "node_modules" || (0, ts_1.startsWith)(s, "@"));
}
function stripLeadingDirectorySeparator(s) {
    return (0, ts_1.isAnyDirectorySeparator)(s.charCodeAt(0)) ? s.slice(1) : undefined;
}
/** @internal */
function tryRemoveDirectoryPrefix(path, dirPath, getCanonicalFileName) {
    var withoutPrefix = (0, ts_1.tryRemovePrefix)(path, dirPath, getCanonicalFileName);
    return withoutPrefix === undefined ? undefined : stripLeadingDirectorySeparator(withoutPrefix);
}
exports.tryRemoveDirectoryPrefix = tryRemoveDirectoryPrefix;
// Reserved characters, forces escaping of any non-word (or digit), non-whitespace character.
// It may be inefficient (we could just match (/[-[\]{}()*+?.,\\^$|#\s]/g), but this is future
// proof.
var reservedCharacterPattern = /[^\w\s\/]/g;
/** @internal */
function regExpEscape(text) {
    return text.replace(reservedCharacterPattern, escapeRegExpCharacter);
}
exports.regExpEscape = regExpEscape;
function escapeRegExpCharacter(match) {
    return "\\" + match;
}
var wildcardCharCodes = [42 /* CharacterCodes.asterisk */, 63 /* CharacterCodes.question */];
/** @internal */
exports.commonPackageFolders = ["node_modules", "bower_components", "jspm_packages"];
var implicitExcludePathRegexPattern = "(?!(".concat(exports.commonPackageFolders.join("|"), ")(/|$))");
var filesMatcher = {
    /**
     * Matches any single directory segment unless it is the last segment and a .min.js file
     * Breakdown:
     *  [^./]                   # matches everything up to the first . character (excluding directory separators)
     *  (\\.(?!min\\.js$))?     # matches . characters but not if they are part of the .min.js file extension
     */
    singleAsteriskRegexFragment: "([^./]|(\\.(?!min\\.js$))?)*",
    /**
     * Regex for the ** wildcard. Matches any number of subdirectories. When used for including
     * files or directories, does not match subdirectories that start with a . character
     */
    doubleAsteriskRegexFragment: "(/".concat(implicitExcludePathRegexPattern, "[^/.][^/]*)*?"),
    replaceWildcardCharacter: function (match) { return replaceWildcardCharacter(match, filesMatcher.singleAsteriskRegexFragment); }
};
var directoriesMatcher = {
    singleAsteriskRegexFragment: "[^/]*",
    /**
     * Regex for the ** wildcard. Matches any number of subdirectories. When used for including
     * files or directories, does not match subdirectories that start with a . character
     */
    doubleAsteriskRegexFragment: "(/".concat(implicitExcludePathRegexPattern, "[^/.][^/]*)*?"),
    replaceWildcardCharacter: function (match) { return replaceWildcardCharacter(match, directoriesMatcher.singleAsteriskRegexFragment); }
};
var excludeMatcher = {
    singleAsteriskRegexFragment: "[^/]*",
    doubleAsteriskRegexFragment: "(/.+?)?",
    replaceWildcardCharacter: function (match) { return replaceWildcardCharacter(match, excludeMatcher.singleAsteriskRegexFragment); }
};
var wildcardMatchers = {
    files: filesMatcher,
    directories: directoriesMatcher,
    exclude: excludeMatcher
};
/** @internal */
function getRegularExpressionForWildcard(specs, basePath, usage) {
    var patterns = getRegularExpressionsForWildcards(specs, basePath, usage);
    if (!patterns || !patterns.length) {
        return undefined;
    }
    var pattern = patterns.map(function (pattern) { return "(".concat(pattern, ")"); }).join("|");
    // If excluding, match "foo/bar/baz...", but if including, only allow "foo".
    var terminator = usage === "exclude" ? "($|/)" : "$";
    return "^(".concat(pattern, ")").concat(terminator);
}
exports.getRegularExpressionForWildcard = getRegularExpressionForWildcard;
/** @internal */
function getRegularExpressionsForWildcards(specs, basePath, usage) {
    if (specs === undefined || specs.length === 0) {
        return undefined;
    }
    return (0, ts_1.flatMap)(specs, function (spec) {
        return spec && getSubPatternFromSpec(spec, basePath, usage, wildcardMatchers[usage]);
    });
}
exports.getRegularExpressionsForWildcards = getRegularExpressionsForWildcards;
/**
 * An "includes" path "foo" is implicitly a glob "foo/** /*" (without the space) if its last component has no extension,
 * and does not contain any glob characters itself.
 *
 * @internal
 */
function isImplicitGlob(lastPathComponent) {
    return !/[.*?]/.test(lastPathComponent);
}
exports.isImplicitGlob = isImplicitGlob;
/** @internal */
function getPatternFromSpec(spec, basePath, usage) {
    var pattern = spec && getSubPatternFromSpec(spec, basePath, usage, wildcardMatchers[usage]);
    return pattern && "^(".concat(pattern, ")").concat(usage === "exclude" ? "($|/)" : "$");
}
exports.getPatternFromSpec = getPatternFromSpec;
function getSubPatternFromSpec(spec, basePath, usage, _a) {
    var singleAsteriskRegexFragment = _a.singleAsteriskRegexFragment, doubleAsteriskRegexFragment = _a.doubleAsteriskRegexFragment, replaceWildcardCharacter = _a.replaceWildcardCharacter;
    var subpattern = "";
    var hasWrittenComponent = false;
    var components = (0, ts_1.getNormalizedPathComponents)(spec, basePath);
    var lastComponent = (0, ts_1.last)(components);
    if (usage !== "exclude" && lastComponent === "**") {
        return undefined;
    }
    // getNormalizedPathComponents includes the separator for the root component.
    // We need to remove to create our regex correctly.
    components[0] = (0, ts_1.removeTrailingDirectorySeparator)(components[0]);
    if (isImplicitGlob(lastComponent)) {
        components.push("**", "*");
    }
    var optionalCount = 0;
    for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
        var component = components_1[_i];
        if (component === "**") {
            subpattern += doubleAsteriskRegexFragment;
        }
        else {
            if (usage === "directories") {
                subpattern += "(";
                optionalCount++;
            }
            if (hasWrittenComponent) {
                subpattern += ts_1.directorySeparator;
            }
            if (usage !== "exclude") {
                var componentPattern = "";
                // The * and ? wildcards should not match directories or files that start with . if they
                // appear first in a component. Dotted directories and files can be included explicitly
                // like so: **/.*/.*
                if (component.charCodeAt(0) === 42 /* CharacterCodes.asterisk */) {
                    componentPattern += "([^./]" + singleAsteriskRegexFragment + ")?";
                    component = component.substr(1);
                }
                else if (component.charCodeAt(0) === 63 /* CharacterCodes.question */) {
                    componentPattern += "[^./]";
                    component = component.substr(1);
                }
                componentPattern += component.replace(reservedCharacterPattern, replaceWildcardCharacter);
                // Patterns should not include subfolders like node_modules unless they are
                // explicitly included as part of the path.
                //
                // As an optimization, if the component pattern is the same as the component,
                // then there definitely were no wildcard characters and we do not need to
                // add the exclusion pattern.
                if (componentPattern !== component) {
                    subpattern += implicitExcludePathRegexPattern;
                }
                subpattern += componentPattern;
            }
            else {
                subpattern += component.replace(reservedCharacterPattern, replaceWildcardCharacter);
            }
        }
        hasWrittenComponent = true;
    }
    while (optionalCount > 0) {
        subpattern += ")?";
        optionalCount--;
    }
    return subpattern;
}
function replaceWildcardCharacter(match, singleAsteriskRegexFragment) {
    return match === "*" ? singleAsteriskRegexFragment : match === "?" ? "[^/]" : "\\" + match;
}
/**
 * @param path directory of the tsconfig.json
 *
 * @internal
 */
function getFileMatcherPatterns(path, excludes, includes, useCaseSensitiveFileNames, currentDirectory) {
    path = (0, ts_1.normalizePath)(path);
    currentDirectory = (0, ts_1.normalizePath)(currentDirectory);
    var absolutePath = (0, ts_1.combinePaths)(currentDirectory, path);
    return {
        includeFilePatterns: (0, ts_1.map)(getRegularExpressionsForWildcards(includes, absolutePath, "files"), function (pattern) { return "^".concat(pattern, "$"); }),
        includeFilePattern: getRegularExpressionForWildcard(includes, absolutePath, "files"),
        includeDirectoryPattern: getRegularExpressionForWildcard(includes, absolutePath, "directories"),
        excludePattern: getRegularExpressionForWildcard(excludes, absolutePath, "exclude"),
        basePaths: getBasePaths(path, includes, useCaseSensitiveFileNames)
    };
}
exports.getFileMatcherPatterns = getFileMatcherPatterns;
/** @internal */
function getRegexFromPattern(pattern, useCaseSensitiveFileNames) {
    return new RegExp(pattern, useCaseSensitiveFileNames ? "" : "i");
}
exports.getRegexFromPattern = getRegexFromPattern;
/**
 * @param path directory of the tsconfig.json
 *
 * @internal
 */
function matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory, depth, getFileSystemEntries, realpath) {
    path = (0, ts_1.normalizePath)(path);
    currentDirectory = (0, ts_1.normalizePath)(currentDirectory);
    var patterns = getFileMatcherPatterns(path, excludes, includes, useCaseSensitiveFileNames, currentDirectory);
    var includeFileRegexes = patterns.includeFilePatterns && patterns.includeFilePatterns.map(function (pattern) { return getRegexFromPattern(pattern, useCaseSensitiveFileNames); });
    var includeDirectoryRegex = patterns.includeDirectoryPattern && getRegexFromPattern(patterns.includeDirectoryPattern, useCaseSensitiveFileNames);
    var excludeRegex = patterns.excludePattern && getRegexFromPattern(patterns.excludePattern, useCaseSensitiveFileNames);
    // Associate an array of results with each include regex. This keeps results in order of the "include" order.
    // If there are no "includes", then just put everything in results[0].
    var results = includeFileRegexes ? includeFileRegexes.map(function () { return []; }) : [[]];
    var visited = new Map();
    var toCanonical = (0, ts_1.createGetCanonicalFileName)(useCaseSensitiveFileNames);
    for (var _i = 0, _a = patterns.basePaths; _i < _a.length; _i++) {
        var basePath = _a[_i];
        visitDirectory(basePath, (0, ts_1.combinePaths)(currentDirectory, basePath), depth);
    }
    return (0, ts_1.flatten)(results);
    function visitDirectory(path, absolutePath, depth) {
        var canonicalPath = toCanonical(realpath(absolutePath));
        if (visited.has(canonicalPath))
            return;
        visited.set(canonicalPath, true);
        var _a = getFileSystemEntries(path), files = _a.files, directories = _a.directories;
        var _loop_1 = function (current) {
            var name_2 = (0, ts_1.combinePaths)(path, current);
            var absoluteName = (0, ts_1.combinePaths)(absolutePath, current);
            if (extensions && !(0, ts_1.fileExtensionIsOneOf)(name_2, extensions))
                return "continue";
            if (excludeRegex && excludeRegex.test(absoluteName))
                return "continue";
            if (!includeFileRegexes) {
                results[0].push(name_2);
            }
            else {
                var includeIndex = (0, ts_1.findIndex)(includeFileRegexes, function (re) { return re.test(absoluteName); });
                if (includeIndex !== -1) {
                    results[includeIndex].push(name_2);
                }
            }
        };
        for (var _i = 0, _b = (0, ts_1.sort)(files, ts_1.compareStringsCaseSensitive); _i < _b.length; _i++) {
            var current = _b[_i];
            _loop_1(current);
        }
        if (depth !== undefined) {
            depth--;
            if (depth === 0) {
                return;
            }
        }
        for (var _c = 0, _d = (0, ts_1.sort)(directories, ts_1.compareStringsCaseSensitive); _c < _d.length; _c++) {
            var current = _d[_c];
            var name_3 = (0, ts_1.combinePaths)(path, current);
            var absoluteName = (0, ts_1.combinePaths)(absolutePath, current);
            if ((!includeDirectoryRegex || includeDirectoryRegex.test(absoluteName)) &&
                (!excludeRegex || !excludeRegex.test(absoluteName))) {
                visitDirectory(name_3, absoluteName, depth);
            }
        }
    }
}
exports.matchFiles = matchFiles;
/**
 * Computes the unique non-wildcard base paths amongst the provided include patterns.
 */
function getBasePaths(path, includes, useCaseSensitiveFileNames) {
    // Storage for our results in the form of literal paths (e.g. the paths as written by the user).
    var basePaths = [path];
    if (includes) {
        // Storage for literal base paths amongst the include patterns.
        var includeBasePaths = [];
        for (var _i = 0, includes_1 = includes; _i < includes_1.length; _i++) {
            var include = includes_1[_i];
            // We also need to check the relative paths by converting them to absolute and normalizing
            // in case they escape the base path (e.g "..\somedirectory")
            var absolute = (0, ts_1.isRootedDiskPath)(include) ? include : (0, ts_1.normalizePath)((0, ts_1.combinePaths)(path, include));
            // Append the literal and canonical candidate base paths.
            includeBasePaths.push(getIncludeBasePath(absolute));
        }
        // Sort the offsets array using either the literal or canonical path representations.
        includeBasePaths.sort((0, ts_1.getStringComparer)(!useCaseSensitiveFileNames));
        var _loop_2 = function (includeBasePath) {
            if ((0, ts_1.every)(basePaths, function (basePath) { return !(0, ts_1.containsPath)(basePath, includeBasePath, path, !useCaseSensitiveFileNames); })) {
                basePaths.push(includeBasePath);
            }
        };
        // Iterate over each include base path and include unique base paths that are not a
        // subpath of an existing base path
        for (var _a = 0, includeBasePaths_1 = includeBasePaths; _a < includeBasePaths_1.length; _a++) {
            var includeBasePath = includeBasePaths_1[_a];
            _loop_2(includeBasePath);
        }
    }
    return basePaths;
}
function getIncludeBasePath(absolute) {
    var wildcardOffset = (0, ts_1.indexOfAnyCharCode)(absolute, wildcardCharCodes);
    if (wildcardOffset < 0) {
        // No "*" or "?" in the path
        return !(0, ts_1.hasExtension)(absolute)
            ? absolute
            : (0, ts_1.removeTrailingDirectorySeparator)((0, ts_1.getDirectoryPath)(absolute));
    }
    return absolute.substring(0, absolute.lastIndexOf(ts_1.directorySeparator, wildcardOffset));
}
/** @internal */
function ensureScriptKind(fileName, scriptKind) {
    // Using scriptKind as a condition handles both:
    // - 'scriptKind' is unspecified and thus it is `undefined`
    // - 'scriptKind' is set and it is `Unknown` (0)
    // If the 'scriptKind' is 'undefined' or 'Unknown' then we attempt
    // to get the ScriptKind from the file name. If it cannot be resolved
    // from the file name then the default 'TS' script kind is returned.
    return scriptKind || getScriptKindFromFileName(fileName) || 3 /* ScriptKind.TS */;
}
exports.ensureScriptKind = ensureScriptKind;
/** @internal */
function getScriptKindFromFileName(fileName) {
    var ext = fileName.substr(fileName.lastIndexOf("."));
    switch (ext.toLowerCase()) {
        case ".js" /* Extension.Js */:
        case ".cjs" /* Extension.Cjs */:
        case ".mjs" /* Extension.Mjs */:
            return 1 /* ScriptKind.JS */;
        case ".jsx" /* Extension.Jsx */:
            return 2 /* ScriptKind.JSX */;
        case ".ts" /* Extension.Ts */:
        case ".cts" /* Extension.Cts */:
        case ".mts" /* Extension.Mts */:
            return 3 /* ScriptKind.TS */;
        case ".tsx" /* Extension.Tsx */:
            return 4 /* ScriptKind.TSX */;
        case ".json" /* Extension.Json */:
            return 6 /* ScriptKind.JSON */;
        default:
            return 0 /* ScriptKind.Unknown */;
    }
}
exports.getScriptKindFromFileName = getScriptKindFromFileName;
/**
 *  Groups of supported extensions in order of file resolution precedence. (eg, TS > TSX > DTS and seperately, CTS > DCTS)
 *
 * @internal
 */
exports.supportedTSExtensions = [[".ts" /* Extension.Ts */, ".tsx" /* Extension.Tsx */, ".d.ts" /* Extension.Dts */], [".cts" /* Extension.Cts */, ".d.cts" /* Extension.Dcts */], [".mts" /* Extension.Mts */, ".d.mts" /* Extension.Dmts */]];
/** @internal */
exports.supportedTSExtensionsFlat = (0, ts_1.flatten)(exports.supportedTSExtensions);
var supportedTSExtensionsWithJson = __spreadArray(__spreadArray([], exports.supportedTSExtensions, true), [[".json" /* Extension.Json */]], false);
/** Must have ".d.ts" first because if ".ts" goes first, that will be detected as the extension instead of ".d.ts". */
var supportedTSExtensionsForExtractExtension = [".d.ts" /* Extension.Dts */, ".d.cts" /* Extension.Dcts */, ".d.mts" /* Extension.Dmts */, ".cts" /* Extension.Cts */, ".mts" /* Extension.Mts */, ".ts" /* Extension.Ts */, ".tsx" /* Extension.Tsx */];
/** @internal */
exports.supportedJSExtensions = [[".js" /* Extension.Js */, ".jsx" /* Extension.Jsx */], [".mjs" /* Extension.Mjs */], [".cjs" /* Extension.Cjs */]];
/** @internal */
exports.supportedJSExtensionsFlat = (0, ts_1.flatten)(exports.supportedJSExtensions);
var allSupportedExtensions = [[".ts" /* Extension.Ts */, ".tsx" /* Extension.Tsx */, ".d.ts" /* Extension.Dts */, ".js" /* Extension.Js */, ".jsx" /* Extension.Jsx */], [".cts" /* Extension.Cts */, ".d.cts" /* Extension.Dcts */, ".cjs" /* Extension.Cjs */], [".mts" /* Extension.Mts */, ".d.mts" /* Extension.Dmts */, ".mjs" /* Extension.Mjs */]];
var allSupportedExtensionsWithJson = __spreadArray(__spreadArray([], allSupportedExtensions, true), [[".json" /* Extension.Json */]], false);
/** @internal */
exports.supportedDeclarationExtensions = [".d.ts" /* Extension.Dts */, ".d.cts" /* Extension.Dcts */, ".d.mts" /* Extension.Dmts */];
/** @internal */
exports.supportedTSImplementationExtensions = [".ts" /* Extension.Ts */, ".cts" /* Extension.Cts */, ".mts" /* Extension.Mts */, ".tsx" /* Extension.Tsx */];
/** @internal */
exports.extensionsNotSupportingExtensionlessResolution = [".mts" /* Extension.Mts */, ".d.mts" /* Extension.Dmts */, ".mjs" /* Extension.Mjs */, ".cts" /* Extension.Cts */, ".d.cts" /* Extension.Dcts */, ".cjs" /* Extension.Cjs */];
/** @internal */
function getSupportedExtensions(options, extraFileExtensions) {
    var needJsExtensions = options && getAllowJSCompilerOption(options);
    if (!extraFileExtensions || extraFileExtensions.length === 0) {
        return needJsExtensions ? allSupportedExtensions : exports.supportedTSExtensions;
    }
    var builtins = needJsExtensions ? allSupportedExtensions : exports.supportedTSExtensions;
    var flatBuiltins = (0, ts_1.flatten)(builtins);
    var extensions = __spreadArray(__spreadArray([], builtins, true), (0, ts_1.mapDefined)(extraFileExtensions, function (x) { return x.scriptKind === 7 /* ScriptKind.Deferred */ || needJsExtensions && isJSLike(x.scriptKind) && flatBuiltins.indexOf(x.extension) === -1 ? [x.extension] : undefined; }), true);
    return extensions;
}
exports.getSupportedExtensions = getSupportedExtensions;
/** @internal */
function getSupportedExtensionsWithJsonIfResolveJsonModule(options, supportedExtensions) {
    if (!options || !getResolveJsonModule(options))
        return supportedExtensions;
    if (supportedExtensions === allSupportedExtensions)
        return allSupportedExtensionsWithJson;
    if (supportedExtensions === exports.supportedTSExtensions)
        return supportedTSExtensionsWithJson;
    return __spreadArray(__spreadArray([], supportedExtensions, true), [[".json" /* Extension.Json */]], false);
}
exports.getSupportedExtensionsWithJsonIfResolveJsonModule = getSupportedExtensionsWithJsonIfResolveJsonModule;
function isJSLike(scriptKind) {
    return scriptKind === 1 /* ScriptKind.JS */ || scriptKind === 2 /* ScriptKind.JSX */;
}
/** @internal */
function hasJSFileExtension(fileName) {
    return (0, ts_1.some)(exports.supportedJSExtensionsFlat, function (extension) { return (0, ts_1.fileExtensionIs)(fileName, extension); });
}
exports.hasJSFileExtension = hasJSFileExtension;
/** @internal */
function hasTSFileExtension(fileName) {
    return (0, ts_1.some)(exports.supportedTSExtensionsFlat, function (extension) { return (0, ts_1.fileExtensionIs)(fileName, extension); });
}
exports.hasTSFileExtension = hasTSFileExtension;
/** @internal */
function usesExtensionsOnImports(_a, hasExtension) {
    var imports = _a.imports;
    if (hasExtension === void 0) { hasExtension = (0, ts_1.or)(hasJSFileExtension, hasTSFileExtension); }
    return (0, ts_1.firstDefined)(imports, function (_a) {
        var text = _a.text;
        return (0, ts_1.pathIsRelative)(text) && !(0, ts_1.fileExtensionIsOneOf)(text, exports.extensionsNotSupportingExtensionlessResolution)
            ? hasExtension(text)
            : undefined;
    }) || false;
}
exports.usesExtensionsOnImports = usesExtensionsOnImports;
/** @internal */
function getModuleSpecifierEndingPreference(preference, resolutionMode, compilerOptions, sourceFile) {
    if (preference === "js" || resolutionMode === ts_1.ModuleKind.ESNext) {
        // Extensions are explicitly requested or required. Now choose between .js and .ts.
        if (!(0, ts_1.shouldAllowImportingTsExtension)(compilerOptions)) {
            return 2 /* ModuleSpecifierEnding.JsExtension */;
        }
        // `allowImportingTsExtensions` is a strong signal, so use .ts unless the file
        // already uses .js extensions and no .ts extensions.
        return inferPreference() !== 2 /* ModuleSpecifierEnding.JsExtension */
            ? 3 /* ModuleSpecifierEnding.TsExtension */
            : 2 /* ModuleSpecifierEnding.JsExtension */;
    }
    if (preference === "minimal") {
        return 0 /* ModuleSpecifierEnding.Minimal */;
    }
    if (preference === "index") {
        return 1 /* ModuleSpecifierEnding.Index */;
    }
    // No preference was specified.
    // Look at imports and/or requires to guess whether .js, .ts, or extensionless imports are preferred.
    // N.B. that `Index` detection is not supported since it would require file system probing to do
    // accurately, and more importantly, literally nobody wants `Index` and its existence is a mystery.
    if (!(0, ts_1.shouldAllowImportingTsExtension)(compilerOptions)) {
        // If .ts imports are not valid, we only need to see one .js import to go with that.
        return usesExtensionsOnImports(sourceFile) ? 2 /* ModuleSpecifierEnding.JsExtension */ : 0 /* ModuleSpecifierEnding.Minimal */;
    }
    return inferPreference();
    function inferPreference() {
        var usesJsExtensions = false;
        var specifiers = sourceFile.imports.length ? sourceFile.imports.map(function (i) { return i.text; }) :
            isSourceFileJS(sourceFile) ? getRequiresAtTopOfFile(sourceFile).map(function (r) { return r.arguments[0].text; }) :
                ts_1.emptyArray;
        for (var _i = 0, specifiers_1 = specifiers; _i < specifiers_1.length; _i++) {
            var specifier = specifiers_1[_i];
            if ((0, ts_1.pathIsRelative)(specifier)) {
                if ((0, ts_1.fileExtensionIsOneOf)(specifier, exports.extensionsNotSupportingExtensionlessResolution)) {
                    // These extensions are not optional, so do not indicate a preference.
                    continue;
                }
                if (hasTSFileExtension(specifier)) {
                    return 3 /* ModuleSpecifierEnding.TsExtension */;
                }
                if (hasJSFileExtension(specifier)) {
                    usesJsExtensions = true;
                }
            }
        }
        return usesJsExtensions ? 2 /* ModuleSpecifierEnding.JsExtension */ : 0 /* ModuleSpecifierEnding.Minimal */;
    }
}
exports.getModuleSpecifierEndingPreference = getModuleSpecifierEndingPreference;
function getRequiresAtTopOfFile(sourceFile) {
    var nonRequireStatementCount = 0;
    var requires;
    for (var _i = 0, _a = sourceFile.statements; _i < _a.length; _i++) {
        var statement = _a[_i];
        if (nonRequireStatementCount > 3) {
            break;
        }
        if (isRequireVariableStatement(statement)) {
            requires = (0, ts_1.concatenate)(requires, statement.declarationList.declarations.map(function (d) { return d.initializer; }));
        }
        else if ((0, ts_1.isExpressionStatement)(statement) && isRequireCall(statement.expression, /*requireStringLiteralLikeArgument*/ true)) {
            requires = (0, ts_1.append)(requires, statement.expression);
        }
        else {
            nonRequireStatementCount++;
        }
    }
    return requires || ts_1.emptyArray;
}
/** @internal */
function isSupportedSourceFileName(fileName, compilerOptions, extraFileExtensions) {
    if (!fileName)
        return false;
    var supportedExtensions = getSupportedExtensions(compilerOptions, extraFileExtensions);
    for (var _i = 0, _a = (0, ts_1.flatten)(getSupportedExtensionsWithJsonIfResolveJsonModule(compilerOptions, supportedExtensions)); _i < _a.length; _i++) {
        var extension = _a[_i];
        if ((0, ts_1.fileExtensionIs)(fileName, extension)) {
            return true;
        }
    }
    return false;
}
exports.isSupportedSourceFileName = isSupportedSourceFileName;
function numberOfDirectorySeparators(str) {
    var match = str.match(/\//g);
    return match ? match.length : 0;
}
/** @internal */
function compareNumberOfDirectorySeparators(path1, path2) {
    return (0, ts_1.compareValues)(numberOfDirectorySeparators(path1), numberOfDirectorySeparators(path2));
}
exports.compareNumberOfDirectorySeparators = compareNumberOfDirectorySeparators;
var extensionsToRemove = [".d.ts" /* Extension.Dts */, ".d.mts" /* Extension.Dmts */, ".d.cts" /* Extension.Dcts */, ".mjs" /* Extension.Mjs */, ".mts" /* Extension.Mts */, ".cjs" /* Extension.Cjs */, ".cts" /* Extension.Cts */, ".ts" /* Extension.Ts */, ".js" /* Extension.Js */, ".tsx" /* Extension.Tsx */, ".jsx" /* Extension.Jsx */, ".json" /* Extension.Json */];
/** @internal */
function removeFileExtension(path) {
    for (var _i = 0, extensionsToRemove_1 = extensionsToRemove; _i < extensionsToRemove_1.length; _i++) {
        var ext = extensionsToRemove_1[_i];
        var extensionless = tryRemoveExtension(path, ext);
        if (extensionless !== undefined) {
            return extensionless;
        }
    }
    return path;
}
exports.removeFileExtension = removeFileExtension;
/** @internal */
function tryRemoveExtension(path, extension) {
    return (0, ts_1.fileExtensionIs)(path, extension) ? removeExtension(path, extension) : undefined;
}
exports.tryRemoveExtension = tryRemoveExtension;
/** @internal */
function removeExtension(path, extension) {
    return path.substring(0, path.length - extension.length);
}
exports.removeExtension = removeExtension;
/** @internal */
function changeExtension(path, newExtension) {
    return (0, ts_1.changeAnyExtension)(path, newExtension, extensionsToRemove, /*ignoreCase*/ false);
}
exports.changeExtension = changeExtension;
/**
 * Returns the input if there are no stars, a pattern if there is exactly one,
 * and undefined if there are more.
 *
 * @internal
 */
function tryParsePattern(pattern) {
    var indexOfStar = pattern.indexOf("*");
    if (indexOfStar === -1) {
        return pattern;
    }
    return pattern.indexOf("*", indexOfStar + 1) !== -1
        ? undefined
        : {
            prefix: pattern.substr(0, indexOfStar),
            suffix: pattern.substr(indexOfStar + 1)
        };
}
exports.tryParsePattern = tryParsePattern;
/** @internal */
function tryParsePatterns(paths) {
    return (0, ts_1.mapDefined)((0, ts_1.getOwnKeys)(paths), function (path) { return tryParsePattern(path); });
}
exports.tryParsePatterns = tryParsePatterns;
/** @internal */
function positionIsSynthesized(pos) {
    // This is a fast way of testing the following conditions:
    //  pos === undefined || pos === null || isNaN(pos) || pos < 0;
    return !(pos >= 0);
}
exports.positionIsSynthesized = positionIsSynthesized;
/**
 * True if an extension is one of the supported TypeScript extensions.
 *
 * @internal
 */
function extensionIsTS(ext) {
    return ext === ".ts" /* Extension.Ts */ || ext === ".tsx" /* Extension.Tsx */ || ext === ".d.ts" /* Extension.Dts */ || ext === ".cts" /* Extension.Cts */ || ext === ".mts" /* Extension.Mts */ || ext === ".d.mts" /* Extension.Dmts */ || ext === ".d.cts" /* Extension.Dcts */ || ((0, ts_1.startsWith)(ext, ".d.") && (0, ts_1.endsWith)(ext, ".ts"));
}
exports.extensionIsTS = extensionIsTS;
/** @internal */
function resolutionExtensionIsTSOrJson(ext) {
    return extensionIsTS(ext) || ext === ".json" /* Extension.Json */;
}
exports.resolutionExtensionIsTSOrJson = resolutionExtensionIsTSOrJson;
/**
 * Gets the extension from a path.
 * Path must have a valid extension.
 *
 * @internal
 */
function extensionFromPath(path) {
    var ext = tryGetExtensionFromPath(path);
    return ext !== undefined ? ext : ts_1.Debug.fail("File ".concat(path, " has unknown extension."));
}
exports.extensionFromPath = extensionFromPath;
/** @internal */
function isAnySupportedFileExtension(path) {
    return tryGetExtensionFromPath(path) !== undefined;
}
exports.isAnySupportedFileExtension = isAnySupportedFileExtension;
/** @internal */
function tryGetExtensionFromPath(path) {
    return (0, ts_1.find)(extensionsToRemove, function (e) { return (0, ts_1.fileExtensionIs)(path, e); });
}
exports.tryGetExtensionFromPath = tryGetExtensionFromPath;
/** @internal */
function isCheckJsEnabledForFile(sourceFile, compilerOptions) {
    return sourceFile.checkJsDirective ? sourceFile.checkJsDirective.enabled : compilerOptions.checkJs;
}
exports.isCheckJsEnabledForFile = isCheckJsEnabledForFile;
/** @internal */
exports.emptyFileSystemEntries = {
    files: ts_1.emptyArray,
    directories: ts_1.emptyArray
};
/**
 * patternOrStrings contains both patterns (containing "*") and regular strings.
 * Return an exact match if possible, or a pattern match, or undefined.
 * (These are verified by verifyCompilerOptions to have 0 or 1 "*" characters.)
 *
 * @internal
 */
function matchPatternOrExact(patternOrStrings, candidate) {
    var patterns = [];
    for (var _i = 0, patternOrStrings_1 = patternOrStrings; _i < patternOrStrings_1.length; _i++) {
        var patternOrString = patternOrStrings_1[_i];
        if (patternOrString === candidate) {
            return candidate;
        }
        if (!(0, ts_1.isString)(patternOrString)) {
            patterns.push(patternOrString);
        }
    }
    return (0, ts_1.findBestPatternMatch)(patterns, function (_) { return _; }, candidate);
}
exports.matchPatternOrExact = matchPatternOrExact;
/** @internal */
function sliceAfter(arr, value) {
    var index = arr.indexOf(value);
    ts_1.Debug.assert(index !== -1);
    return arr.slice(index);
}
exports.sliceAfter = sliceAfter;
/** @internal */
function addRelatedInfo(diagnostic) {
    var _a;
    var relatedInformation = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        relatedInformation[_i - 1] = arguments[_i];
    }
    if (!relatedInformation.length) {
        return diagnostic;
    }
    if (!diagnostic.relatedInformation) {
        diagnostic.relatedInformation = [];
    }
    ts_1.Debug.assert(diagnostic.relatedInformation !== ts_1.emptyArray, "Diagnostic had empty array singleton for related info, but is still being constructed!");
    (_a = diagnostic.relatedInformation).push.apply(_a, relatedInformation);
    return diagnostic;
}
exports.addRelatedInfo = addRelatedInfo;
/** @internal */
function minAndMax(arr, getValue) {
    ts_1.Debug.assert(arr.length !== 0);
    var min = getValue(arr[0]);
    var max = min;
    for (var i = 1; i < arr.length; i++) {
        var value = getValue(arr[i]);
        if (value < min) {
            min = value;
        }
        else if (value > max) {
            max = value;
        }
    }
    return { min: min, max: max };
}
exports.minAndMax = minAndMax;
/** @internal */
function rangeOfNode(node) {
    return { pos: getTokenPosOfNode(node), end: node.end };
}
exports.rangeOfNode = rangeOfNode;
/** @internal */
function rangeOfTypeParameters(sourceFile, typeParameters) {
    // Include the `<>`
    var pos = typeParameters.pos - 1;
    var end = Math.min(sourceFile.text.length, (0, ts_1.skipTrivia)(sourceFile.text, typeParameters.end) + 1);
    return { pos: pos, end: end };
}
exports.rangeOfTypeParameters = rangeOfTypeParameters;
/** @internal */
function skipTypeChecking(sourceFile, options, host) {
    // If skipLibCheck is enabled, skip reporting errors if file is a declaration file.
    // If skipDefaultLibCheck is enabled, skip reporting errors if file contains a
    // '/// <reference no-default-lib="true"/>' directive.
    return (options.skipLibCheck && sourceFile.isDeclarationFile ||
        options.skipDefaultLibCheck && sourceFile.hasNoDefaultLib) ||
        host.isSourceOfProjectReferenceRedirect(sourceFile.fileName);
}
exports.skipTypeChecking = skipTypeChecking;
/** @internal */
function isJsonEqual(a, b) {
    // eslint-disable-next-line no-null/no-null
    return a === b || typeof a === "object" && a !== null && typeof b === "object" && b !== null && (0, ts_1.equalOwnProperties)(a, b, isJsonEqual);
}
exports.isJsonEqual = isJsonEqual;
/**
 * Converts a bigint literal string, e.g. `0x1234n`,
 * to its decimal string representation, e.g. `4660`.
 *
 * @internal
 */
function parsePseudoBigInt(stringValue) {
    var log2Base;
    switch (stringValue.charCodeAt(1)) { // "x" in "0x123"
        case 98 /* CharacterCodes.b */:
        case 66 /* CharacterCodes.B */: // 0b or 0B
            log2Base = 1;
            break;
        case 111 /* CharacterCodes.o */:
        case 79 /* CharacterCodes.O */: // 0o or 0O
            log2Base = 3;
            break;
        case 120 /* CharacterCodes.x */:
        case 88 /* CharacterCodes.X */: // 0x or 0X
            log2Base = 4;
            break;
        default: // already in decimal; omit trailing "n"
            var nIndex = stringValue.length - 1;
            // Skip leading 0s
            var nonZeroStart = 0;
            while (stringValue.charCodeAt(nonZeroStart) === 48 /* CharacterCodes._0 */) {
                nonZeroStart++;
            }
            return stringValue.slice(nonZeroStart, nIndex) || "0";
    }
    // Omit leading "0b", "0o", or "0x", and trailing "n"
    var startIndex = 2, endIndex = stringValue.length - 1;
    var bitsNeeded = (endIndex - startIndex) * log2Base;
    // Stores the value specified by the string as a LE array of 16-bit integers
    // using Uint16 instead of Uint32 so combining steps can use bitwise operators
    var segments = new Uint16Array((bitsNeeded >>> 4) + (bitsNeeded & 15 ? 1 : 0));
    // Add the digits, one at a time
    for (var i = endIndex - 1, bitOffset = 0; i >= startIndex; i--, bitOffset += log2Base) {
        var segment = bitOffset >>> 4;
        var digitChar = stringValue.charCodeAt(i);
        // Find character range: 0-9 < A-F < a-f
        var digit = digitChar <= 57 /* CharacterCodes._9 */
            ? digitChar - 48 /* CharacterCodes._0 */
            : 10 + digitChar -
                (digitChar <= 70 /* CharacterCodes.F */ ? 65 /* CharacterCodes.A */ : 97 /* CharacterCodes.a */);
        var shiftedDigit = digit << (bitOffset & 15);
        segments[segment] |= shiftedDigit;
        var residual = shiftedDigit >>> 16;
        if (residual)
            segments[segment + 1] |= residual; // overflows segment
    }
    // Repeatedly divide segments by 10 and add remainder to base10Value
    var base10Value = "";
    var firstNonzeroSegment = segments.length - 1;
    var segmentsRemaining = true;
    while (segmentsRemaining) {
        var mod10 = 0;
        segmentsRemaining = false;
        for (var segment = firstNonzeroSegment; segment >= 0; segment--) {
            var newSegment = mod10 << 16 | segments[segment];
            var segmentValue = (newSegment / 10) | 0;
            segments[segment] = segmentValue;
            mod10 = newSegment - segmentValue * 10;
            if (segmentValue && !segmentsRemaining) {
                firstNonzeroSegment = segment;
                segmentsRemaining = true;
            }
        }
        base10Value = mod10 + base10Value;
    }
    return base10Value;
}
exports.parsePseudoBigInt = parsePseudoBigInt;
/** @internal */
function pseudoBigIntToString(_a) {
    var negative = _a.negative, base10Value = _a.base10Value;
    return (negative && base10Value !== "0" ? "-" : "") + base10Value;
}
exports.pseudoBigIntToString = pseudoBigIntToString;
/** @internal */
function parseBigInt(text) {
    if (!isValidBigIntString(text, /*roundTripOnly*/ false)) {
        return undefined;
    }
    return parseValidBigInt(text);
}
exports.parseBigInt = parseBigInt;
/**
 * @internal
 * @param text a valid bigint string excluding a trailing `n`, but including a possible prefix `-`. Use `isValidBigIntString(text, roundTripOnly)` before calling this function.
 */
function parseValidBigInt(text) {
    var negative = text.startsWith("-");
    var base10Value = parsePseudoBigInt("".concat(negative ? text.slice(1) : text, "n"));
    return { negative: negative, base10Value: base10Value };
}
exports.parseValidBigInt = parseValidBigInt;
/**
 * @internal
 * Tests whether the provided string can be parsed as a bigint.
 * @param s The string to test.
 * @param roundTripOnly Indicates the resulting bigint matches the input when converted back to a string.
 */
function isValidBigIntString(s, roundTripOnly) {
    if (s === "")
        return false;
    var scanner = (0, ts_1.createScanner)(99 /* ScriptTarget.ESNext */, /*skipTrivia*/ false);
    var success = true;
    scanner.setOnError(function () { return success = false; });
    scanner.setText(s + "n");
    var result = scanner.scan();
    var negative = result === 41 /* SyntaxKind.MinusToken */;
    if (negative) {
        result = scanner.scan();
    }
    var flags = scanner.getTokenFlags();
    // validate that
    // * scanning proceeded without error
    // * a bigint can be scanned, and that when it is scanned, it is
    // * the full length of the input string (so the scanner is one character beyond the augmented input length)
    // * it does not contain a numeric seperator (the `BigInt` constructor does not accept a numeric seperator in its input)
    return success && result === 10 /* SyntaxKind.BigIntLiteral */ && scanner.getTokenEnd() === (s.length + 1) && !(flags & 512 /* TokenFlags.ContainsSeparator */)
        && (!roundTripOnly || s === pseudoBigIntToString({ negative: negative, base10Value: parsePseudoBigInt(scanner.getTokenValue()) }));
}
exports.isValidBigIntString = isValidBigIntString;
/** @internal */
function isValidTypeOnlyAliasUseSite(useSite) {
    return !!(useSite.flags & 16777216 /* NodeFlags.Ambient */)
        || isPartOfTypeQuery(useSite)
        || isIdentifierInNonEmittingHeritageClause(useSite)
        || isPartOfPossiblyValidTypeOrAbstractComputedPropertyName(useSite)
        || !(isExpressionNode(useSite) || isShorthandPropertyNameUseSite(useSite));
}
exports.isValidTypeOnlyAliasUseSite = isValidTypeOnlyAliasUseSite;
function isShorthandPropertyNameUseSite(useSite) {
    return (0, ts_1.isIdentifier)(useSite) && (0, ts_1.isShorthandPropertyAssignment)(useSite.parent) && useSite.parent.name === useSite;
}
function isPartOfPossiblyValidTypeOrAbstractComputedPropertyName(node) {
    while (node.kind === 80 /* SyntaxKind.Identifier */ || node.kind === 210 /* SyntaxKind.PropertyAccessExpression */) {
        node = node.parent;
    }
    if (node.kind !== 166 /* SyntaxKind.ComputedPropertyName */) {
        return false;
    }
    if (hasSyntacticModifier(node.parent, 256 /* ModifierFlags.Abstract */)) {
        return true;
    }
    var containerKind = node.parent.parent.kind;
    return containerKind === 263 /* SyntaxKind.InterfaceDeclaration */ || containerKind === 186 /* SyntaxKind.TypeLiteral */;
}
/** Returns true for an identifier in 1) an `implements` clause, and 2) an `extends` clause of an interface. */
function isIdentifierInNonEmittingHeritageClause(node) {
    if (node.kind !== 80 /* SyntaxKind.Identifier */)
        return false;
    var heritageClause = (0, ts_1.findAncestor)(node.parent, function (parent) {
        switch (parent.kind) {
            case 297 /* SyntaxKind.HeritageClause */:
                return true;
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                return false;
            default:
                return "quit";
        }
    });
    return (heritageClause === null || heritageClause === void 0 ? void 0 : heritageClause.token) === 119 /* SyntaxKind.ImplementsKeyword */ || (heritageClause === null || heritageClause === void 0 ? void 0 : heritageClause.parent.kind) === 263 /* SyntaxKind.InterfaceDeclaration */;
}
/** @internal */
function isIdentifierTypeReference(node) {
    return (0, ts_1.isTypeReferenceNode)(node) && (0, ts_1.isIdentifier)(node.typeName);
}
exports.isIdentifierTypeReference = isIdentifierTypeReference;
/** @internal */
function arrayIsHomogeneous(array, comparer) {
    if (comparer === void 0) { comparer = ts_1.equateValues; }
    if (array.length < 2)
        return true;
    var first = array[0];
    for (var i = 1, length_1 = array.length; i < length_1; i++) {
        var target = array[i];
        if (!comparer(first, target))
            return false;
    }
    return true;
}
exports.arrayIsHomogeneous = arrayIsHomogeneous;
/**
 * Bypasses immutability and directly sets the `pos` property of a `TextRange` or `Node`.
 *
 * @internal
 */
function setTextRangePos(range, pos) {
    range.pos = pos;
    return range;
}
exports.setTextRangePos = setTextRangePos;
/**
 * Bypasses immutability and directly sets the `end` property of a `TextRange` or `Node`.
 *
 * @internal
 */
function setTextRangeEnd(range, end) {
    range.end = end;
    return range;
}
exports.setTextRangeEnd = setTextRangeEnd;
/**
 * Bypasses immutability and directly sets the `pos` and `end` properties of a `TextRange` or `Node`.
 *
 * @internal
 */
function setTextRangePosEnd(range, pos, end) {
    return setTextRangeEnd(setTextRangePos(range, pos), end);
}
exports.setTextRangePosEnd = setTextRangePosEnd;
/**
 * Bypasses immutability and directly sets the `pos` and `end` properties of a `TextRange` or `Node` from the
 * provided position and width.
 *
 * @internal
 */
function setTextRangePosWidth(range, pos, width) {
    return setTextRangePosEnd(range, pos, pos + width);
}
exports.setTextRangePosWidth = setTextRangePosWidth;
/** @internal */
function setNodeFlags(node, newFlags) {
    if (node) {
        node.flags = newFlags;
    }
    return node;
}
exports.setNodeFlags = setNodeFlags;
/** @internal */
function setParent(child, parent) {
    if (child && parent) {
        child.parent = parent;
    }
    return child;
}
exports.setParent = setParent;
/** @internal */
function setEachParent(children, parent) {
    if (children) {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            setParent(child, parent);
        }
    }
    return children;
}
exports.setEachParent = setEachParent;
/** @internal */
function setParentRecursive(rootNode, incremental) {
    if (!rootNode)
        return rootNode;
    (0, ts_1.forEachChildRecursively)(rootNode, (0, ts_1.isJSDocNode)(rootNode) ? bindParentToChildIgnoringJSDoc : bindParentToChild);
    return rootNode;
    function bindParentToChildIgnoringJSDoc(child, parent) {
        if (incremental && child.parent === parent) {
            return "skip";
        }
        setParent(child, parent);
    }
    function bindJSDoc(child) {
        if ((0, ts_1.hasJSDocNodes)(child)) {
            for (var _i = 0, _a = child.jsDoc; _i < _a.length; _i++) {
                var doc = _a[_i];
                bindParentToChildIgnoringJSDoc(doc, child);
                (0, ts_1.forEachChildRecursively)(doc, bindParentToChildIgnoringJSDoc);
            }
        }
    }
    function bindParentToChild(child, parent) {
        return bindParentToChildIgnoringJSDoc(child, parent) || bindJSDoc(child);
    }
}
exports.setParentRecursive = setParentRecursive;
function isPackedElement(node) {
    return !(0, ts_1.isOmittedExpression)(node);
}
/**
 * Determines whether the provided node is an ArrayLiteralExpression that contains no missing elements.
 *
 * @internal
 */
function isPackedArrayLiteral(node) {
    return (0, ts_1.isArrayLiteralExpression)(node) && (0, ts_1.every)(node.elements, isPackedElement);
}
exports.isPackedArrayLiteral = isPackedArrayLiteral;
/**
 * Indicates whether the result of an `Expression` will be unused.
 *
 * NOTE: This requires a node with a valid `parent` pointer.
 *
 * @internal
 */
function expressionResultIsUnused(node) {
    ts_1.Debug.assertIsDefined(node.parent);
    while (true) {
        var parent_4 = node.parent;
        // walk up parenthesized expressions, but keep a pointer to the top-most parenthesized expression
        if ((0, ts_1.isParenthesizedExpression)(parent_4)) {
            node = parent_4;
            continue;
        }
        // result is unused in an expression statement, `void` expression, or the initializer or incrementer of a `for` loop
        if ((0, ts_1.isExpressionStatement)(parent_4) ||
            (0, ts_1.isVoidExpression)(parent_4) ||
            (0, ts_1.isForStatement)(parent_4) && (parent_4.initializer === node || parent_4.incrementor === node)) {
            return true;
        }
        if ((0, ts_1.isCommaListExpression)(parent_4)) {
            // left side of comma is always unused
            if (node !== (0, ts_1.last)(parent_4.elements))
                return true;
            // right side of comma is unused if parent is unused
            node = parent_4;
            continue;
        }
        if ((0, ts_1.isBinaryExpression)(parent_4) && parent_4.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
            // left side of comma is always unused
            if (node === parent_4.left)
                return true;
            // right side of comma is unused if parent is unused
            node = parent_4;
            continue;
        }
        return false;
    }
}
exports.expressionResultIsUnused = expressionResultIsUnused;
/** @internal */
function containsIgnoredPath(path) {
    return (0, ts_1.some)(ts_1.ignoredPaths, function (p) { return (0, ts_1.stringContains)(path, p); });
}
exports.containsIgnoredPath = containsIgnoredPath;
/** @internal */
function getContainingNodeArray(node) {
    if (!node.parent)
        return undefined;
    switch (node.kind) {
        case 167 /* SyntaxKind.TypeParameter */:
            var parent_5 = node.parent;
            return parent_5.kind === 194 /* SyntaxKind.InferType */ ? undefined : parent_5.typeParameters;
        case 168 /* SyntaxKind.Parameter */:
            return node.parent.parameters;
        case 203 /* SyntaxKind.TemplateLiteralTypeSpan */:
            return node.parent.templateSpans;
        case 238 /* SyntaxKind.TemplateSpan */:
            return node.parent.templateSpans;
        case 169 /* SyntaxKind.Decorator */: {
            var parent_6 = node.parent;
            return (0, ts_1.canHaveDecorators)(parent_6) ? parent_6.modifiers :
                undefined;
        }
        case 297 /* SyntaxKind.HeritageClause */:
            return node.parent.heritageClauses;
    }
    var parent = node.parent;
    if ((0, ts_1.isJSDocTag)(node)) {
        return (0, ts_1.isJSDocTypeLiteral)(node.parent) ? undefined : node.parent.tags;
    }
    switch (parent.kind) {
        case 186 /* SyntaxKind.TypeLiteral */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
            return (0, ts_1.isTypeElement)(node) ? parent.members : undefined;
        case 191 /* SyntaxKind.UnionType */:
        case 192 /* SyntaxKind.IntersectionType */:
            return parent.types;
        case 188 /* SyntaxKind.TupleType */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
        case 360 /* SyntaxKind.CommaListExpression */:
        case 274 /* SyntaxKind.NamedImports */:
        case 278 /* SyntaxKind.NamedExports */:
            return parent.elements;
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 291 /* SyntaxKind.JsxAttributes */:
            return parent.properties;
        case 212 /* SyntaxKind.CallExpression */:
        case 213 /* SyntaxKind.NewExpression */:
            return (0, ts_1.isTypeNode)(node) ? parent.typeArguments :
                parent.expression === node ? undefined :
                    parent.arguments;
        case 283 /* SyntaxKind.JsxElement */:
        case 287 /* SyntaxKind.JsxFragment */:
            return (0, ts_1.isJsxChild)(node) ? parent.children : undefined;
        case 285 /* SyntaxKind.JsxOpeningElement */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
            return (0, ts_1.isTypeNode)(node) ? parent.typeArguments : undefined;
        case 240 /* SyntaxKind.Block */:
        case 295 /* SyntaxKind.CaseClause */:
        case 296 /* SyntaxKind.DefaultClause */:
        case 267 /* SyntaxKind.ModuleBlock */:
            return parent.statements;
        case 268 /* SyntaxKind.CaseBlock */:
            return parent.clauses;
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
            return (0, ts_1.isClassElement)(node) ? parent.members : undefined;
        case 265 /* SyntaxKind.EnumDeclaration */:
            return (0, ts_1.isEnumMember)(node) ? parent.members : undefined;
        case 311 /* SyntaxKind.SourceFile */:
            return parent.statements;
    }
}
exports.getContainingNodeArray = getContainingNodeArray;
/** @internal */
function hasContextSensitiveParameters(node) {
    // Functions with type parameters are not context sensitive.
    if (!node.typeParameters) {
        // Functions with any parameters that lack type annotations are context sensitive.
        if ((0, ts_1.some)(node.parameters, function (p) { return !getEffectiveTypeAnnotationNode(p); })) {
            return true;
        }
        if (node.kind !== 218 /* SyntaxKind.ArrowFunction */) {
            // If the first parameter is not an explicit 'this' parameter, then the function has
            // an implicit 'this' parameter which is subject to contextual typing.
            var parameter = (0, ts_1.firstOrUndefined)(node.parameters);
            if (!(parameter && parameterIsThisKeyword(parameter))) {
                return true;
            }
        }
    }
    return false;
}
exports.hasContextSensitiveParameters = hasContextSensitiveParameters;
/** @internal */
function isInfinityOrNaNString(name) {
    return name === "Infinity" || name === "-Infinity" || name === "NaN";
}
exports.isInfinityOrNaNString = isInfinityOrNaNString;
/** @internal */
function isCatchClauseVariableDeclaration(node) {
    return node.kind === 259 /* SyntaxKind.VariableDeclaration */ && node.parent.kind === 298 /* SyntaxKind.CatchClause */;
}
exports.isCatchClauseVariableDeclaration = isCatchClauseVariableDeclaration;
/** @internal */
function isParameterOrCatchClauseVariable(symbol) {
    var declaration = symbol.valueDeclaration && getRootDeclaration(symbol.valueDeclaration);
    return !!declaration && ((0, ts_1.isParameter)(declaration) || isCatchClauseVariableDeclaration(declaration));
}
exports.isParameterOrCatchClauseVariable = isParameterOrCatchClauseVariable;
/** @internal */
function isFunctionExpressionOrArrowFunction(node) {
    return node.kind === 217 /* SyntaxKind.FunctionExpression */ || node.kind === 218 /* SyntaxKind.ArrowFunction */;
}
exports.isFunctionExpressionOrArrowFunction = isFunctionExpressionOrArrowFunction;
/** @internal */
function escapeSnippetText(text) {
    return text.replace(/\$/gm, function () { return "\\$"; });
}
exports.escapeSnippetText = escapeSnippetText;
/** @internal */
function isNumericLiteralName(name) {
    // The intent of numeric names is that
    //     - they are names with text in a numeric form, and that
    //     - setting properties/indexing with them is always equivalent to doing so with the numeric literal 'numLit',
    //         acquired by applying the abstract 'ToNumber' operation on the name's text.
    //
    // The subtlety is in the latter portion, as we cannot reliably say that anything that looks like a numeric literal is a numeric name.
    // In fact, it is the case that the text of the name must be equal to 'ToString(numLit)' for this to hold.
    //
    // Consider the property name '"0xF00D"'. When one indexes with '0xF00D', they are actually indexing with the value of 'ToString(0xF00D)'
    // according to the ECMAScript specification, so it is actually as if the user indexed with the string '"61453"'.
    // Thus, the text of all numeric literals equivalent to '61543' such as '0xF00D', '0xf00D', '0170015', etc. are not valid numeric names
    // because their 'ToString' representation is not equal to their original text.
    // This is motivated by ECMA-262 sections 9.3.1, 9.8.1, 11.1.5, and 11.2.1.
    //
    // Here, we test whether 'ToString(ToNumber(name))' is exactly equal to 'name'.
    // The '+' prefix operator is equivalent here to applying the abstract ToNumber operation.
    // Applying the 'toString()' method on a number gives us the abstract ToString operation on a number.
    //
    // Note that this accepts the values 'Infinity', '-Infinity', and 'NaN', and that this is intentional.
    // This is desired behavior, because when indexing with them as numeric entities, you are indexing
    // with the strings '"Infinity"', '"-Infinity"', and '"NaN"' respectively.
    return (+name).toString() === name;
}
exports.isNumericLiteralName = isNumericLiteralName;
/** @internal */
function createPropertyNameNodeForIdentifierOrLiteral(name, target, singleQuote, stringNamed) {
    return (0, ts_1.isIdentifierText)(name, target) ? ts_1.factory.createIdentifier(name) :
        !stringNamed && isNumericLiteralName(name) && +name >= 0 ? ts_1.factory.createNumericLiteral(+name) :
            ts_1.factory.createStringLiteral(name, !!singleQuote);
}
exports.createPropertyNameNodeForIdentifierOrLiteral = createPropertyNameNodeForIdentifierOrLiteral;
/** @internal */
function isThisTypeParameter(type) {
    return !!(type.flags & 262144 /* TypeFlags.TypeParameter */ && type.isThisType);
}
exports.isThisTypeParameter = isThisTypeParameter;
/** @internal */
function getNodeModulePathParts(fullPath) {
    // If fullPath can't be valid module file within node_modules, returns undefined.
    // Example of expected pattern: /base/path/node_modules/[@scope/otherpackage/@otherscope/node_modules/]package/[subdirectory/]file.js
    // Returns indices:                       ^            ^                                                      ^             ^
    var topLevelNodeModulesIndex = 0;
    var topLevelPackageNameIndex = 0;
    var packageRootIndex = 0;
    var fileNameIndex = 0;
    var partStart = 0;
    var partEnd = 0;
    var state = 0 /* States.BeforeNodeModules */;
    while (partEnd >= 0) {
        partStart = partEnd;
        partEnd = fullPath.indexOf("/", partStart + 1);
        switch (state) {
            case 0 /* States.BeforeNodeModules */:
                if (fullPath.indexOf(ts_1.nodeModulesPathPart, partStart) === partStart) {
                    topLevelNodeModulesIndex = partStart;
                    topLevelPackageNameIndex = partEnd;
                    state = 1 /* States.NodeModules */;
                }
                break;
            case 1 /* States.NodeModules */:
            case 2 /* States.Scope */:
                if (state === 1 /* States.NodeModules */ && fullPath.charAt(partStart + 1) === "@") {
                    state = 2 /* States.Scope */;
                }
                else {
                    packageRootIndex = partEnd;
                    state = 3 /* States.PackageContent */;
                }
                break;
            case 3 /* States.PackageContent */:
                if (fullPath.indexOf(ts_1.nodeModulesPathPart, partStart) === partStart) {
                    state = 1 /* States.NodeModules */;
                }
                else {
                    state = 3 /* States.PackageContent */;
                }
                break;
        }
    }
    fileNameIndex = partStart;
    return state > 1 /* States.NodeModules */ ? { topLevelNodeModulesIndex: topLevelNodeModulesIndex, topLevelPackageNameIndex: topLevelPackageNameIndex, packageRootIndex: packageRootIndex, fileNameIndex: fileNameIndex } : undefined;
}
exports.getNodeModulePathParts = getNodeModulePathParts;
/** @internal */
function getParameterTypeNode(parameter) {
    var _a;
    return parameter.kind === 347 /* SyntaxKind.JSDocParameterTag */ ? (_a = parameter.typeExpression) === null || _a === void 0 ? void 0 : _a.type : parameter.type;
}
exports.getParameterTypeNode = getParameterTypeNode;
/** @internal */
function isTypeDeclaration(node) {
    switch (node.kind) {
        case 167 /* SyntaxKind.TypeParameter */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 265 /* SyntaxKind.EnumDeclaration */:
        case 352 /* SyntaxKind.JSDocTypedefTag */:
        case 344 /* SyntaxKind.JSDocCallbackTag */:
        case 346 /* SyntaxKind.JSDocEnumTag */:
            return true;
        case 272 /* SyntaxKind.ImportClause */:
            return node.isTypeOnly;
        case 275 /* SyntaxKind.ImportSpecifier */:
        case 280 /* SyntaxKind.ExportSpecifier */:
            return node.parent.parent.isTypeOnly;
        default:
            return false;
    }
}
exports.isTypeDeclaration = isTypeDeclaration;
/** @internal */
function canHaveExportModifier(node) {
    return (0, ts_1.isEnumDeclaration)(node) || (0, ts_1.isVariableStatement)(node) || (0, ts_1.isFunctionDeclaration)(node) || (0, ts_1.isClassDeclaration)(node)
        || (0, ts_1.isInterfaceDeclaration)(node) || isTypeDeclaration(node) || ((0, ts_1.isModuleDeclaration)(node) && !isExternalModuleAugmentation(node) && !isGlobalScopeAugmentation(node));
}
exports.canHaveExportModifier = canHaveExportModifier;
/** @internal */
function isOptionalJSDocPropertyLikeTag(node) {
    if (!(0, ts_1.isJSDocPropertyLikeTag)(node)) {
        return false;
    }
    var isBracketed = node.isBracketed, typeExpression = node.typeExpression;
    return isBracketed || !!typeExpression && typeExpression.type.kind === 322 /* SyntaxKind.JSDocOptionalType */;
}
exports.isOptionalJSDocPropertyLikeTag = isOptionalJSDocPropertyLikeTag;
/** @internal */
function canUsePropertyAccess(name, languageVersion) {
    if (name.length === 0) {
        return false;
    }
    var firstChar = name.charCodeAt(0);
    return firstChar === 35 /* CharacterCodes.hash */ ?
        name.length > 1 && (0, ts_1.isIdentifierStart)(name.charCodeAt(1), languageVersion) :
        (0, ts_1.isIdentifierStart)(firstChar, languageVersion);
}
exports.canUsePropertyAccess = canUsePropertyAccess;
/** @internal */
function hasTabstop(node) {
    var _a;
    return ((_a = (0, ts_1.getSnippetElement)(node)) === null || _a === void 0 ? void 0 : _a.kind) === 0 /* SnippetKind.TabStop */;
}
exports.hasTabstop = hasTabstop;
/** @internal */
function isJSDocOptionalParameter(node) {
    return isInJSFile(node) && (
    // node.type should only be a JSDocOptionalType when node is a parameter of a JSDocFunctionType
    node.type && node.type.kind === 322 /* SyntaxKind.JSDocOptionalType */
        || (0, ts_1.getJSDocParameterTags)(node).some(function (_a) {
            var isBracketed = _a.isBracketed, typeExpression = _a.typeExpression;
            return isBracketed || !!typeExpression && typeExpression.type.kind === 322 /* SyntaxKind.JSDocOptionalType */;
        }));
}
exports.isJSDocOptionalParameter = isJSDocOptionalParameter;
/** @internal */
function isOptionalDeclaration(declaration) {
    switch (declaration.kind) {
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
            return !!declaration.questionToken;
        case 168 /* SyntaxKind.Parameter */:
            return !!declaration.questionToken || isJSDocOptionalParameter(declaration);
        case 354 /* SyntaxKind.JSDocPropertyTag */:
        case 347 /* SyntaxKind.JSDocParameterTag */:
            return isOptionalJSDocPropertyLikeTag(declaration);
        default:
            return false;
    }
}
exports.isOptionalDeclaration = isOptionalDeclaration;
/** @internal */
function isNonNullAccess(node) {
    var kind = node.kind;
    return (kind === 210 /* SyntaxKind.PropertyAccessExpression */
        || kind === 211 /* SyntaxKind.ElementAccessExpression */) && (0, ts_1.isNonNullExpression)(node.expression);
}
exports.isNonNullAccess = isNonNullAccess;
/** @internal */
function isJSDocSatisfiesExpression(node) {
    return isInJSFile(node) && (0, ts_1.isParenthesizedExpression)(node) && (0, ts_1.hasJSDocNodes)(node) && !!(0, ts_1.getJSDocSatisfiesTag)(node);
}
exports.isJSDocSatisfiesExpression = isJSDocSatisfiesExpression;
/** @internal */
function getJSDocSatisfiesExpressionType(node) {
    return ts_1.Debug.checkDefined(tryGetJSDocSatisfiesTypeNode(node));
}
exports.getJSDocSatisfiesExpressionType = getJSDocSatisfiesExpressionType;
/** @internal */
function tryGetJSDocSatisfiesTypeNode(node) {
    var tag = (0, ts_1.getJSDocSatisfiesTag)(node);
    return tag && tag.typeExpression && tag.typeExpression.type;
}
exports.tryGetJSDocSatisfiesTypeNode = tryGetJSDocSatisfiesTypeNode;
/** @internal */
function getEscapedTextOfJsxAttributeName(node) {
    return (0, ts_1.isIdentifier)(node) ? node.escapedText : getEscapedTextOfJsxNamespacedName(node);
}
exports.getEscapedTextOfJsxAttributeName = getEscapedTextOfJsxAttributeName;
/** @internal */
function getTextOfJsxAttributeName(node) {
    return (0, ts_1.isIdentifier)(node) ? (0, ts_1.idText)(node) : getTextOfJsxNamespacedName(node);
}
exports.getTextOfJsxAttributeName = getTextOfJsxAttributeName;
/** @internal */
function isJsxAttributeName(node) {
    var kind = node.kind;
    return kind === 80 /* SyntaxKind.Identifier */
        || kind === 294 /* SyntaxKind.JsxNamespacedName */;
}
exports.isJsxAttributeName = isJsxAttributeName;
/** @internal */
function getEscapedTextOfJsxNamespacedName(node) {
    return "".concat(node.namespace.escapedText, ":").concat((0, ts_1.idText)(node.name));
}
exports.getEscapedTextOfJsxNamespacedName = getEscapedTextOfJsxNamespacedName;
/** @internal */
function getTextOfJsxNamespacedName(node) {
    return "".concat((0, ts_1.idText)(node.namespace), ":").concat((0, ts_1.idText)(node.name));
}
exports.getTextOfJsxNamespacedName = getTextOfJsxNamespacedName;
/** @internal */
function intrinsicTagNameToString(node) {
    return (0, ts_1.isIdentifier)(node) ? (0, ts_1.idText)(node) : getTextOfJsxNamespacedName(node);
}
exports.intrinsicTagNameToString = intrinsicTagNameToString;
