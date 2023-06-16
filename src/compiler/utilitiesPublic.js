"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSDocParameterTags = exports.getModifiers = exports.getDecorators = exports.getAssignedName = exports.getNameOfDeclaration = exports.getNonAssignedNameOfDeclaration = exports.isNamedDeclaration = exports.getNameOfJSDocTypedef = exports.nodeHasName = exports.symbolName = exports.identifierToKeywordKind = exports.idText = exports.unescapeLeadingUnderscores = exports.escapeLeadingUnderscores = exports.getParseTreeNode = exports.isParseTreeNode = exports.findAncestor = exports.getOriginalNode = exports.validateLocaleAndSetLanguage = exports.supportedLocaleDirectories = exports.getCombinedNodeFlags = exports.getCombinedNodeFlagsAlwaysIncludeJSDoc = exports.getCombinedModifierFlags = exports.walkUpBindingElementsAndPatterns = exports.isEmptyBindingElement = exports.isEmptyBindingPattern = exports.isParameterPropertyDeclaration = exports.getTypeParameterOwner = exports.collapseTextChangeRangesAcrossMultipleVersions = exports.unchangedTextChangeRange = exports.createTextChangeRange = exports.textChangeRangeIsUnchanged = exports.textChangeRangeNewSpan = exports.createTextSpanFromBounds = exports.createTextSpan = exports.textSpanIntersection = exports.textSpanIntersectsWithPosition = exports.decodedTextSpanIntersectsWith = exports.textSpanIntersectsWith = exports.textSpanIntersectsWithTextSpan = exports.textSpanOverlap = exports.textSpanOverlapsWith = exports.textSpanContainsTextSpan = exports.textRangeContainsPositionInclusive = exports.textSpanContainsPosition = exports.textSpanIsEmpty = exports.textSpanEnd = exports.getDefaultLibFileName = exports.sortAndDeduplicateDiagnostics = exports.isExternalModuleNameRelative = void 0;
exports.isUnparsedNode = exports.isUnparsedTextLike = exports.isNamedExportBindings = exports.isBreakOrContinueStatement = exports.isNonNullChain = exports.skipPartiallyEmittedExpressions = exports.isConstTypeReference = exports.isNullishCoalesce = exports.isOutermostOptionalChain = exports.isExpressionOfOptionalChainRoot = exports.isOptionalChainRoot = exports.isOptionalChain = exports.isCallChain = exports.isElementAccessChain = exports.isPropertyAccessChain = exports.isGetOrSetAccessorDeclaration = exports.isMemberName = exports.getEffectiveConstraintOfTypeParameter = exports.getEffectiveTypeParameterDeclarations = exports.getTextOfJSDocComment = exports.getAllJSDocTagsOfKind = exports.getAllJSDocTags = exports.getJSDocTagsNoCache = exports.getJSDocTags = exports.getJSDocReturnType = exports.getJSDocType = exports.getJSDocTypeTag = exports.getJSDocSatisfiesTag = exports.getJSDocTemplateTag = exports.getJSDocReturnTag = exports.getJSDocThisTag = exports.getJSDocEnumTag = exports.getJSDocDeprecatedTagNoCache = exports.getJSDocDeprecatedTag = exports.getJSDocOverrideTagNoCache = exports.getJSDocReadonlyTagNoCache = exports.getJSDocReadonlyTag = exports.getJSDocProtectedTagNoCache = exports.getJSDocProtectedTag = exports.getJSDocPrivateTagNoCache = exports.getJSDocPrivateTag = exports.getJSDocPublicTagNoCache = exports.getJSDocPublicTag = exports.getJSDocClassTag = exports.getJSDocImplementsTags = exports.getJSDocAugmentsTag = exports.hasJSDocParameterTags = exports.getJSDocTypeParameterTagsNoCache = exports.getJSDocTypeParameterTags = exports.getJSDocParameterTagsNoCache = void 0;
exports.isArrayBindingElement = exports.isAssignmentPattern = exports.isBindingPattern = exports.isFunctionOrConstructorTypeNode = exports.isTypeNode = exports.isObjectLiteralElementLike = exports.isClassOrTypeElement = exports.isTypeElement = exports.isModifierLike = exports.isNamedClassElement = exports.isMethodOrAccessor = exports.isAutoAccessorPropertyDeclaration = exports.isAccessor = exports.isClassLike = exports.isClassElement = exports.isFunctionOrModuleBlock = exports.isFunctionLikeKind = exports.isBooleanLiteral = exports.isFunctionLikeDeclaration = exports.isFunctionLikeOrClassStaticBlockDeclaration = exports.isFunctionLike = exports.isBindingName = exports.isPropertyName = exports.isEntityName = exports.isModifier = exports.isClassMemberModifier = exports.isParameterPropertyModifier = exports.isModifierKind = exports.isPrivateIdentifierPropertyAccessExpression = exports.isPrivateIdentifierClassElementDeclaration = exports.isGeneratedPrivateIdentifier = exports.isGeneratedIdentifier = exports.isStringTextContainingNode = exports.isAssertionKey = exports.isTypeOnlyImportOrExportDeclaration = exports.isTypeOnlyExportDeclaration = exports.isTypeOnlyImportDeclaration = exports.isImportOrExportSpecifier = exports.isTemplateMiddleOrTemplateTail = exports.isTemplateLiteralToken = exports.isTemplateLiteralKind = exports.isLiteralExpressionOfObject = exports.isLiteralExpression = exports.isLiteralKind = exports.isNodeArray = exports.isToken = exports.isTokenKind = exports.isNodeKind = exports.isNode = exports.isJSDocPropertyLikeTag = void 0;
exports.isJSDocTag = exports.isJSDocCommentContainingNode = exports.isJSDocNode = exports.isCaseOrDefaultClause = exports.isJsxOpeningLikeElement = exports.isStringLiteralOrJsxExpression = exports.isJsxAttributeLike = exports.isJsxChild = exports.isJsxTagNameExpression = exports.isModuleReference = exports.isStatementOrBlock = exports.isStatement = exports.isStatementButNotDeclaration = exports.isDeclarationStatement = exports.isDeclaration = exports.canHaveLocals = exports.canHaveSymbol = exports.isModuleOrEnumDeclaration = exports.isNamedImportBindings = exports.isJSDocNamespaceBody = exports.isNamespaceBody = exports.isModuleBody = exports.isForInitializer = exports.isFunctionBody = exports.isConciseBody = exports.isForInOrOfStatement = exports.isExternalModuleIndicator = exports.needsScopeMarker = exports.hasScopeMarker = exports.isScopeMarker = exports.isIterationStatement = exports.isNotEmittedOrPartiallyEmittedNode = exports.isAssertionExpression = exports.isExpression = exports.isLiteralTypeLiteral = exports.isUnaryExpressionWithWrite = exports.isUnaryExpression = exports.isLeftHandSideExpression = exports.isTemplateLiteral = exports.isCallOrNewExpression = exports.isCallLikeExpression = exports.isPropertyAccessOrQualifiedName = exports.isPropertyAccessOrQualifiedNameOrImportTypeNode = exports.isArrayBindingOrAssignmentElement = exports.isArrayBindingOrAssignmentPattern = exports.isObjectBindingOrAssignmentElement = exports.isObjectBindingOrAssignmentPattern = exports.isBindingOrAssignmentPattern = exports.isBindingOrAssignmentElement = exports.isDeclarationBindingElement = void 0;
exports.isRestParameter = exports.hasRestParameter = exports.isJSDocLinkLike = exports.isStringLiteralLike = exports.guessIndentation = exports.isTypeReferenceType = exports.isObjectLiteralElement = exports.hasOnlyExpressionInitializer = exports.hasInitializer = exports.hasType = exports.hasJSDocNodes = exports.isGetAccessor = exports.isSetAccessor = void 0;
var ts_1 = require("./_namespaces/ts");
function isExternalModuleNameRelative(moduleName) {
    // TypeScript 1.0 spec (April 2014): 11.2.1
    // An external module name is "relative" if the first term is "." or "..".
    // Update: We also consider a path like `C:\foo.ts` "relative" because we do not search for it in `node_modules` or treat it as an ambient module.
    return (0, ts_1.pathIsRelative)(moduleName) || (0, ts_1.isRootedDiskPath)(moduleName);
}
exports.isExternalModuleNameRelative = isExternalModuleNameRelative;
function sortAndDeduplicateDiagnostics(diagnostics) {
    return (0, ts_1.sortAndDeduplicate)(diagnostics, ts_1.compareDiagnostics);
}
exports.sortAndDeduplicateDiagnostics = sortAndDeduplicateDiagnostics;
function getDefaultLibFileName(options) {
    switch ((0, ts_1.getEmitScriptTarget)(options)) {
        case 99 /* ScriptTarget.ESNext */:
            return "lib.esnext.full.d.ts";
        case 9 /* ScriptTarget.ES2022 */:
            return "lib.es2022.full.d.ts";
        case 8 /* ScriptTarget.ES2021 */:
            return "lib.es2021.full.d.ts";
        case 7 /* ScriptTarget.ES2020 */:
            return "lib.es2020.full.d.ts";
        case 6 /* ScriptTarget.ES2019 */:
            return "lib.es2019.full.d.ts";
        case 5 /* ScriptTarget.ES2018 */:
            return "lib.es2018.full.d.ts";
        case 4 /* ScriptTarget.ES2017 */:
            return "lib.es2017.full.d.ts";
        case 3 /* ScriptTarget.ES2016 */:
            return "lib.es2016.full.d.ts";
        case 2 /* ScriptTarget.ES2015 */:
            return "lib.es6.d.ts"; // We don't use lib.es2015.full.d.ts due to breaking change.
        default:
            return "lib.d.ts";
    }
}
exports.getDefaultLibFileName = getDefaultLibFileName;
function textSpanEnd(span) {
    return span.start + span.length;
}
exports.textSpanEnd = textSpanEnd;
function textSpanIsEmpty(span) {
    return span.length === 0;
}
exports.textSpanIsEmpty = textSpanIsEmpty;
function textSpanContainsPosition(span, position) {
    return position >= span.start && position < textSpanEnd(span);
}
exports.textSpanContainsPosition = textSpanContainsPosition;
/** @internal */
function textRangeContainsPositionInclusive(span, position) {
    return position >= span.pos && position <= span.end;
}
exports.textRangeContainsPositionInclusive = textRangeContainsPositionInclusive;
// Returns true if 'span' contains 'other'.
function textSpanContainsTextSpan(span, other) {
    return other.start >= span.start && textSpanEnd(other) <= textSpanEnd(span);
}
exports.textSpanContainsTextSpan = textSpanContainsTextSpan;
function textSpanOverlapsWith(span, other) {
    return textSpanOverlap(span, other) !== undefined;
}
exports.textSpanOverlapsWith = textSpanOverlapsWith;
function textSpanOverlap(span1, span2) {
    var overlap = textSpanIntersection(span1, span2);
    return overlap && overlap.length === 0 ? undefined : overlap;
}
exports.textSpanOverlap = textSpanOverlap;
function textSpanIntersectsWithTextSpan(span, other) {
    return decodedTextSpanIntersectsWith(span.start, span.length, other.start, other.length);
}
exports.textSpanIntersectsWithTextSpan = textSpanIntersectsWithTextSpan;
function textSpanIntersectsWith(span, start, length) {
    return decodedTextSpanIntersectsWith(span.start, span.length, start, length);
}
exports.textSpanIntersectsWith = textSpanIntersectsWith;
function decodedTextSpanIntersectsWith(start1, length1, start2, length2) {
    var end1 = start1 + length1;
    var end2 = start2 + length2;
    return start2 <= end1 && end2 >= start1;
}
exports.decodedTextSpanIntersectsWith = decodedTextSpanIntersectsWith;
function textSpanIntersectsWithPosition(span, position) {
    return position <= textSpanEnd(span) && position >= span.start;
}
exports.textSpanIntersectsWithPosition = textSpanIntersectsWithPosition;
function textSpanIntersection(span1, span2) {
    var start = Math.max(span1.start, span2.start);
    var end = Math.min(textSpanEnd(span1), textSpanEnd(span2));
    return start <= end ? createTextSpanFromBounds(start, end) : undefined;
}
exports.textSpanIntersection = textSpanIntersection;
function createTextSpan(start, length) {
    if (start < 0) {
        throw new Error("start < 0");
    }
    if (length < 0) {
        throw new Error("length < 0");
    }
    return { start: start, length: length };
}
exports.createTextSpan = createTextSpan;
function createTextSpanFromBounds(start, end) {
    return createTextSpan(start, end - start);
}
exports.createTextSpanFromBounds = createTextSpanFromBounds;
function textChangeRangeNewSpan(range) {
    return createTextSpan(range.span.start, range.newLength);
}
exports.textChangeRangeNewSpan = textChangeRangeNewSpan;
function textChangeRangeIsUnchanged(range) {
    return textSpanIsEmpty(range.span) && range.newLength === 0;
}
exports.textChangeRangeIsUnchanged = textChangeRangeIsUnchanged;
function createTextChangeRange(span, newLength) {
    if (newLength < 0) {
        throw new Error("newLength < 0");
    }
    return { span: span, newLength: newLength };
}
exports.createTextChangeRange = createTextChangeRange;
exports.unchangedTextChangeRange = createTextChangeRange(createTextSpan(0, 0), 0); // eslint-disable-line prefer-const
/**
 * Called to merge all the changes that occurred across several versions of a script snapshot
 * into a single change.  i.e. if a user keeps making successive edits to a script we will
 * have a text change from V1 to V2, V2 to V3, ..., Vn.
 *
 * This function will then merge those changes into a single change range valid between V1 and
 * Vn.
 */
function collapseTextChangeRangesAcrossMultipleVersions(changes) {
    if (changes.length === 0) {
        return exports.unchangedTextChangeRange;
    }
    if (changes.length === 1) {
        return changes[0];
    }
    // We change from talking about { { oldStart, oldLength }, newLength } to { oldStart, oldEnd, newEnd }
    // as it makes things much easier to reason about.
    var change0 = changes[0];
    var oldStartN = change0.span.start;
    var oldEndN = textSpanEnd(change0.span);
    var newEndN = oldStartN + change0.newLength;
    for (var i = 1; i < changes.length; i++) {
        var nextChange = changes[i];
        // Consider the following case:
        // i.e. two edits.  The first represents the text change range { { 10, 50 }, 30 }.  i.e. The span starting
        // at 10, with length 50 is reduced to length 30.  The second represents the text change range { { 30, 30 }, 40 }.
        // i.e. the span starting at 30 with length 30 is increased to length 40.
        //
        //      0         10        20        30        40        50        60        70        80        90        100
        //      -------------------------------------------------------------------------------------------------------
        //                |                                                 /
        //                |                                            /----
        //  T1            |                                       /----
        //                |                                  /----
        //                |                             /----
        //      -------------------------------------------------------------------------------------------------------
        //                                     |                            \
        //                                     |                               \
        //   T2                                |                                 \
        //                                     |                                   \
        //                                     |                                      \
        //      -------------------------------------------------------------------------------------------------------
        //
        // Merging these turns out to not be too difficult.  First, determining the new start of the change is trivial
        // it's just the min of the old and new starts.  i.e.:
        //
        //      0         10        20        30        40        50        60        70        80        90        100
        //      ------------------------------------------------------------*------------------------------------------
        //                |                                                 /
        //                |                                            /----
        //  T1            |                                       /----
        //                |                                  /----
        //                |                             /----
        //      ----------------------------------------$-------------------$------------------------------------------
        //                .                    |                            \
        //                .                    |                               \
        //   T2           .                    |                                 \
        //                .                    |                                   \
        //                .                    |                                      \
        //      ----------------------------------------------------------------------*--------------------------------
        //
        // (Note the dots represent the newly inferred start.
        // Determining the new and old end is also pretty simple.  Basically it boils down to paying attention to the
        // absolute positions at the asterisks, and the relative change between the dollar signs. Basically, we see
        // which if the two $'s precedes the other, and we move that one forward until they line up.  in this case that
        // means:
        //
        //      0         10        20        30        40        50        60        70        80        90        100
        //      --------------------------------------------------------------------------------*----------------------
        //                |                                                                     /
        //                |                                                                /----
        //  T1            |                                                           /----
        //                |                                                      /----
        //                |                                                 /----
        //      ------------------------------------------------------------$------------------------------------------
        //                .                    |                            \
        //                .                    |                               \
        //   T2           .                    |                                 \
        //                .                    |                                   \
        //                .                    |                                      \
        //      ----------------------------------------------------------------------*--------------------------------
        //
        // In other words (in this case), we're recognizing that the second edit happened after where the first edit
        // ended with a delta of 20 characters (60 - 40).  Thus, if we go back in time to where the first edit started
        // that's the same as if we started at char 80 instead of 60.
        //
        // As it so happens, the same logic applies if the second edit precedes the first edit.  In that case rather
        // than pushing the first edit forward to match the second, we'll push the second edit forward to match the
        // first.
        //
        // In this case that means we have { oldStart: 10, oldEnd: 80, newEnd: 70 } or, in TextChangeRange
        // semantics: { { start: 10, length: 70 }, newLength: 60 }
        //
        // The math then works out as follows.
        // If we have { oldStart1, oldEnd1, newEnd1 } and { oldStart2, oldEnd2, newEnd2 } then we can compute the
        // final result like so:
        //
        // {
        //      oldStart3: Min(oldStart1, oldStart2),
        //      oldEnd3: Max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1)),
        //      newEnd3: Max(newEnd2, newEnd2 + (newEnd1 - oldEnd2))
        // }
        var oldStart1 = oldStartN;
        var oldEnd1 = oldEndN;
        var newEnd1 = newEndN;
        var oldStart2 = nextChange.span.start;
        var oldEnd2 = textSpanEnd(nextChange.span);
        var newEnd2 = oldStart2 + nextChange.newLength;
        oldStartN = Math.min(oldStart1, oldStart2);
        oldEndN = Math.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
        newEndN = Math.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
    }
    return createTextChangeRange(createTextSpanFromBounds(oldStartN, oldEndN), /*newLength*/ newEndN - oldStartN);
}
exports.collapseTextChangeRangesAcrossMultipleVersions = collapseTextChangeRangesAcrossMultipleVersions;
function getTypeParameterOwner(d) {
    if (d && d.kind === 167 /* SyntaxKind.TypeParameter */) {
        for (var current = d; current; current = current.parent) {
            if (isFunctionLike(current) || isClassLike(current) || current.kind === 263 /* SyntaxKind.InterfaceDeclaration */) {
                return current;
            }
        }
    }
}
exports.getTypeParameterOwner = getTypeParameterOwner;
function isParameterPropertyDeclaration(node, parent) {
    return (0, ts_1.isParameter)(node) && (0, ts_1.hasSyntacticModifier)(node, 16476 /* ModifierFlags.ParameterPropertyModifier */) && parent.kind === 175 /* SyntaxKind.Constructor */;
}
exports.isParameterPropertyDeclaration = isParameterPropertyDeclaration;
function isEmptyBindingPattern(node) {
    if (isBindingPattern(node)) {
        return (0, ts_1.every)(node.elements, isEmptyBindingElement);
    }
    return false;
}
exports.isEmptyBindingPattern = isEmptyBindingPattern;
// TODO(jakebailey): It is very weird that we have BindingElement and ArrayBindingElement;
// we should have ObjectBindingElement and ArrayBindingElement, which are both BindingElement,
// just like BindingPattern is a ObjectBindingPattern or a ArrayBindingPattern.
function isEmptyBindingElement(node) {
    if ((0, ts_1.isOmittedExpression)(node)) {
        return true;
    }
    return isEmptyBindingPattern(node.name);
}
exports.isEmptyBindingElement = isEmptyBindingElement;
function walkUpBindingElementsAndPatterns(binding) {
    var node = binding.parent;
    while ((0, ts_1.isBindingElement)(node.parent)) {
        node = node.parent.parent;
    }
    return node.parent;
}
exports.walkUpBindingElementsAndPatterns = walkUpBindingElementsAndPatterns;
function getCombinedFlags(node, getFlags) {
    if ((0, ts_1.isBindingElement)(node)) {
        node = walkUpBindingElementsAndPatterns(node);
    }
    var flags = getFlags(node);
    if (node.kind === 259 /* SyntaxKind.VariableDeclaration */) {
        node = node.parent;
    }
    if (node && node.kind === 260 /* SyntaxKind.VariableDeclarationList */) {
        flags |= getFlags(node);
        node = node.parent;
    }
    if (node && node.kind === 242 /* SyntaxKind.VariableStatement */) {
        flags |= getFlags(node);
    }
    return flags;
}
function getCombinedModifierFlags(node) {
    return getCombinedFlags(node, ts_1.getEffectiveModifierFlags);
}
exports.getCombinedModifierFlags = getCombinedModifierFlags;
/** @internal */
function getCombinedNodeFlagsAlwaysIncludeJSDoc(node) {
    return getCombinedFlags(node, ts_1.getEffectiveModifierFlagsAlwaysIncludeJSDoc);
}
exports.getCombinedNodeFlagsAlwaysIncludeJSDoc = getCombinedNodeFlagsAlwaysIncludeJSDoc;
// Returns the node flags for this node and all relevant parent nodes.  This is done so that
// nodes like variable declarations and binding elements can returned a view of their flags
// that includes the modifiers from their container.  i.e. flags like export/declare aren't
// stored on the variable declaration directly, but on the containing variable statement
// (if it has one).  Similarly, flags for let/const are stored on the variable declaration
// list.  By calling this function, all those flags are combined so that the client can treat
// the node as if it actually had those flags.
function getCombinedNodeFlags(node) {
    return getCombinedFlags(node, function (n) { return n.flags; });
}
exports.getCombinedNodeFlags = getCombinedNodeFlags;
/** @internal */
exports.supportedLocaleDirectories = ["cs", "de", "es", "fr", "it", "ja", "ko", "pl", "pt-br", "ru", "tr", "zh-cn", "zh-tw"];
/**
 * Checks to see if the locale is in the appropriate format,
 * and if it is, attempts to set the appropriate language.
 */
function validateLocaleAndSetLanguage(locale, sys, errors) {
    var lowerCaseLocale = locale.toLowerCase();
    var matchResult = /^([a-z]+)([_\-]([a-z]+))?$/.exec(lowerCaseLocale);
    if (!matchResult) {
        if (errors) {
            errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1, "en", "ja-jp"));
        }
        return;
    }
    var language = matchResult[1];
    var territory = matchResult[3];
    // First try the entire locale, then fall back to just language if that's all we have.
    // Either ways do not fail, and fallback to the English diagnostic strings.
    if ((0, ts_1.contains)(exports.supportedLocaleDirectories, lowerCaseLocale) && !trySetLanguageAndTerritory(language, territory, errors)) {
        trySetLanguageAndTerritory(language, /*territory*/ undefined, errors);
    }
    // Set the UI locale for string collation
    (0, ts_1.setUILocale)(locale);
    function trySetLanguageAndTerritory(language, territory, errors) {
        var compilerFilePath = (0, ts_1.normalizePath)(sys.getExecutingFilePath());
        var containingDirectoryPath = (0, ts_1.getDirectoryPath)(compilerFilePath);
        var filePath = (0, ts_1.combinePaths)(containingDirectoryPath, language);
        if (territory) {
            filePath = filePath + "-" + territory;
        }
        filePath = sys.resolvePath((0, ts_1.combinePaths)(filePath, "diagnosticMessages.generated.json"));
        if (!sys.fileExists(filePath)) {
            return false;
        }
        // TODO: Add codePage support for readFile?
        var fileContents = "";
        try {
            fileContents = sys.readFile(filePath);
        }
        catch (e) {
            if (errors) {
                errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Unable_to_open_file_0, filePath));
            }
            return false;
        }
        try {
            // this is a global mutation (or live binding update)!
            (0, ts_1.setLocalizedDiagnosticMessages)(JSON.parse(fileContents));
        }
        catch (_a) {
            if (errors) {
                errors.push((0, ts_1.createCompilerDiagnostic)(ts_1.Diagnostics.Corrupted_locale_file_0, filePath));
            }
            return false;
        }
        return true;
    }
}
exports.validateLocaleAndSetLanguage = validateLocaleAndSetLanguage;
function getOriginalNode(node, nodeTest) {
    if (node) {
        while (node.original !== undefined) {
            node = node.original;
        }
    }
    if (!node || !nodeTest) {
        return node;
    }
    return nodeTest(node) ? node : undefined;
}
exports.getOriginalNode = getOriginalNode;
function findAncestor(node, callback) {
    while (node) {
        var result = callback(node);
        if (result === "quit") {
            return undefined;
        }
        else if (result) {
            return node;
        }
        node = node.parent;
    }
    return undefined;
}
exports.findAncestor = findAncestor;
/**
 * Gets a value indicating whether a node originated in the parse tree.
 *
 * @param node The node to test.
 */
function isParseTreeNode(node) {
    return (node.flags & 8 /* NodeFlags.Synthesized */) === 0;
}
exports.isParseTreeNode = isParseTreeNode;
function getParseTreeNode(node, nodeTest) {
    if (node === undefined || isParseTreeNode(node)) {
        return node;
    }
    node = node.original;
    while (node) {
        if (isParseTreeNode(node)) {
            return !nodeTest || nodeTest(node) ? node : undefined;
        }
        node = node.original;
    }
}
exports.getParseTreeNode = getParseTreeNode;
/** Add an extra underscore to identifiers that start with two underscores to avoid issues with magic names like '__proto__' */
function escapeLeadingUnderscores(identifier) {
    return (identifier.length >= 2 && identifier.charCodeAt(0) === 95 /* CharacterCodes._ */ && identifier.charCodeAt(1) === 95 /* CharacterCodes._ */ ? "_" + identifier : identifier);
}
exports.escapeLeadingUnderscores = escapeLeadingUnderscores;
/**
 * Remove extra underscore from escaped identifier text content.
 *
 * @param identifier The escaped identifier text.
 * @returns The unescaped identifier text.
 */
function unescapeLeadingUnderscores(identifier) {
    var id = identifier;
    return id.length >= 3 && id.charCodeAt(0) === 95 /* CharacterCodes._ */ && id.charCodeAt(1) === 95 /* CharacterCodes._ */ && id.charCodeAt(2) === 95 /* CharacterCodes._ */ ? id.substr(1) : id;
}
exports.unescapeLeadingUnderscores = unescapeLeadingUnderscores;
function idText(identifierOrPrivateName) {
    return unescapeLeadingUnderscores(identifierOrPrivateName.escapedText);
}
exports.idText = idText;
/**
 * If the text of an Identifier matches a keyword (including contextual and TypeScript-specific keywords), returns the
 * SyntaxKind for the matching keyword.
 */
function identifierToKeywordKind(node) {
    var token = (0, ts_1.stringToToken)(node.escapedText);
    return token ? (0, ts_1.tryCast)(token, ts_1.isKeyword) : undefined;
}
exports.identifierToKeywordKind = identifierToKeywordKind;
function symbolName(symbol) {
    if (symbol.valueDeclaration && isPrivateIdentifierClassElementDeclaration(symbol.valueDeclaration)) {
        return idText(symbol.valueDeclaration.name);
    }
    return unescapeLeadingUnderscores(symbol.escapedName);
}
exports.symbolName = symbolName;
/**
 * A JSDocTypedef tag has an _optional_ name field - if a name is not directly present, we should
 * attempt to draw the name from the node the declaration is on (as that declaration is what its' symbol
 * will be merged with)
 */
function nameForNamelessJSDocTypedef(declaration) {
    var hostNode = declaration.parent.parent;
    if (!hostNode) {
        return undefined;
    }
    // Covers classes, functions - any named declaration host node
    if (isDeclaration(hostNode)) {
        return getDeclarationIdentifier(hostNode);
    }
    // Covers remaining cases (returning undefined if none match).
    switch (hostNode.kind) {
        case 242 /* SyntaxKind.VariableStatement */:
            if (hostNode.declarationList && hostNode.declarationList.declarations[0]) {
                return getDeclarationIdentifier(hostNode.declarationList.declarations[0]);
            }
            break;
        case 243 /* SyntaxKind.ExpressionStatement */:
            var expr = hostNode.expression;
            if (expr.kind === 225 /* SyntaxKind.BinaryExpression */ && expr.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */) {
                expr = expr.left;
            }
            switch (expr.kind) {
                case 210 /* SyntaxKind.PropertyAccessExpression */:
                    return expr.name;
                case 211 /* SyntaxKind.ElementAccessExpression */:
                    var arg = expr.argumentExpression;
                    if ((0, ts_1.isIdentifier)(arg)) {
                        return arg;
                    }
            }
            break;
        case 216 /* SyntaxKind.ParenthesizedExpression */: {
            return getDeclarationIdentifier(hostNode.expression);
        }
        case 255 /* SyntaxKind.LabeledStatement */: {
            if (isDeclaration(hostNode.statement) || isExpression(hostNode.statement)) {
                return getDeclarationIdentifier(hostNode.statement);
            }
            break;
        }
    }
}
function getDeclarationIdentifier(node) {
    var name = getNameOfDeclaration(node);
    return name && (0, ts_1.isIdentifier)(name) ? name : undefined;
}
/** @internal */
function nodeHasName(statement, name) {
    if (isNamedDeclaration(statement) && (0, ts_1.isIdentifier)(statement.name) && idText(statement.name) === idText(name)) {
        return true;
    }
    if ((0, ts_1.isVariableStatement)(statement) && (0, ts_1.some)(statement.declarationList.declarations, function (d) { return nodeHasName(d, name); })) {
        return true;
    }
    return false;
}
exports.nodeHasName = nodeHasName;
function getNameOfJSDocTypedef(declaration) {
    return declaration.name || nameForNamelessJSDocTypedef(declaration);
}
exports.getNameOfJSDocTypedef = getNameOfJSDocTypedef;
/** @internal */
function isNamedDeclaration(node) {
    return !!node.name; // A 'name' property should always be a DeclarationName.
}
exports.isNamedDeclaration = isNamedDeclaration;
/** @internal */
function getNonAssignedNameOfDeclaration(declaration) {
    switch (declaration.kind) {
        case 80 /* SyntaxKind.Identifier */:
            return declaration;
        case 354 /* SyntaxKind.JSDocPropertyTag */:
        case 347 /* SyntaxKind.JSDocParameterTag */: {
            var name_1 = declaration.name;
            if (name_1.kind === 165 /* SyntaxKind.QualifiedName */) {
                return name_1.right;
            }
            break;
        }
        case 212 /* SyntaxKind.CallExpression */:
        case 225 /* SyntaxKind.BinaryExpression */: {
            var expr_1 = declaration;
            switch ((0, ts_1.getAssignmentDeclarationKind)(expr_1)) {
                case 1 /* AssignmentDeclarationKind.ExportsProperty */:
                case 4 /* AssignmentDeclarationKind.ThisProperty */:
                case 5 /* AssignmentDeclarationKind.Property */:
                case 3 /* AssignmentDeclarationKind.PrototypeProperty */:
                    return (0, ts_1.getElementOrPropertyAccessArgumentExpressionOrName)(expr_1.left);
                case 7 /* AssignmentDeclarationKind.ObjectDefinePropertyValue */:
                case 8 /* AssignmentDeclarationKind.ObjectDefinePropertyExports */:
                case 9 /* AssignmentDeclarationKind.ObjectDefinePrototypeProperty */:
                    return expr_1.arguments[1];
                default:
                    return undefined;
            }
        }
        case 352 /* SyntaxKind.JSDocTypedefTag */:
            return getNameOfJSDocTypedef(declaration);
        case 346 /* SyntaxKind.JSDocEnumTag */:
            return nameForNamelessJSDocTypedef(declaration);
        case 276 /* SyntaxKind.ExportAssignment */: {
            var expression = declaration.expression;
            return (0, ts_1.isIdentifier)(expression) ? expression : undefined;
        }
        case 211 /* SyntaxKind.ElementAccessExpression */:
            var expr = declaration;
            if ((0, ts_1.isBindableStaticElementAccessExpression)(expr)) {
                return expr.argumentExpression;
            }
    }
    return declaration.name;
}
exports.getNonAssignedNameOfDeclaration = getNonAssignedNameOfDeclaration;
function getNameOfDeclaration(declaration) {
    if (declaration === undefined)
        return undefined;
    return getNonAssignedNameOfDeclaration(declaration) ||
        ((0, ts_1.isFunctionExpression)(declaration) || (0, ts_1.isArrowFunction)(declaration) || (0, ts_1.isClassExpression)(declaration) ? getAssignedName(declaration) : undefined);
}
exports.getNameOfDeclaration = getNameOfDeclaration;
/** @internal */
function getAssignedName(node) {
    if (!node.parent) {
        return undefined;
    }
    else if ((0, ts_1.isPropertyAssignment)(node.parent) || (0, ts_1.isBindingElement)(node.parent)) {
        return node.parent.name;
    }
    else if ((0, ts_1.isBinaryExpression)(node.parent) && node === node.parent.right) {
        if ((0, ts_1.isIdentifier)(node.parent.left)) {
            return node.parent.left;
        }
        else if ((0, ts_1.isAccessExpression)(node.parent.left)) {
            return (0, ts_1.getElementOrPropertyAccessArgumentExpressionOrName)(node.parent.left);
        }
    }
    else if ((0, ts_1.isVariableDeclaration)(node.parent) && (0, ts_1.isIdentifier)(node.parent.name)) {
        return node.parent.name;
    }
}
exports.getAssignedName = getAssignedName;
function getDecorators(node) {
    if ((0, ts_1.hasDecorators)(node)) {
        return (0, ts_1.filter)(node.modifiers, ts_1.isDecorator);
    }
}
exports.getDecorators = getDecorators;
function getModifiers(node) {
    if ((0, ts_1.hasSyntacticModifier)(node, 126975 /* ModifierFlags.Modifier */)) {
        return (0, ts_1.filter)(node.modifiers, isModifier);
    }
}
exports.getModifiers = getModifiers;
function getJSDocParameterTagsWorker(param, noCache) {
    if (param.name) {
        if ((0, ts_1.isIdentifier)(param.name)) {
            var name_2 = param.name.escapedText;
            return getJSDocTagsWorker(param.parent, noCache).filter(function (tag) { return (0, ts_1.isJSDocParameterTag)(tag) && (0, ts_1.isIdentifier)(tag.name) && tag.name.escapedText === name_2; });
        }
        else {
            var i = param.parent.parameters.indexOf(param);
            ts_1.Debug.assert(i > -1, "Parameters should always be in their parents' parameter list");
            var paramTags = getJSDocTagsWorker(param.parent, noCache).filter(ts_1.isJSDocParameterTag);
            if (i < paramTags.length) {
                return [paramTags[i]];
            }
        }
    }
    // return empty array for: out-of-order binding patterns and JSDoc function syntax, which has un-named parameters
    return ts_1.emptyArray;
}
/**
 * Gets the JSDoc parameter tags for the node if present.
 *
 * @remarks Returns any JSDoc param tag whose name matches the provided
 * parameter, whether a param tag on a containing function
 * expression, or a param tag on a variable declaration whose
 * initializer is the containing function. The tags closest to the
 * node are returned first, so in the previous example, the param
 * tag on the containing function expression would be first.
 *
 * For binding patterns, parameter tags are matched by position.
 */
function getJSDocParameterTags(param) {
    return getJSDocParameterTagsWorker(param, /*noCache*/ false);
}
exports.getJSDocParameterTags = getJSDocParameterTags;
/** @internal */
function getJSDocParameterTagsNoCache(param) {
    return getJSDocParameterTagsWorker(param, /*noCache*/ true);
}
exports.getJSDocParameterTagsNoCache = getJSDocParameterTagsNoCache;
function getJSDocTypeParameterTagsWorker(param, noCache) {
    var name = param.name.escapedText;
    return getJSDocTagsWorker(param.parent, noCache).filter(function (tag) {
        return (0, ts_1.isJSDocTemplateTag)(tag) && tag.typeParameters.some(function (tp) { return tp.name.escapedText === name; });
    });
}
/**
 * Gets the JSDoc type parameter tags for the node if present.
 *
 * @remarks Returns any JSDoc template tag whose names match the provided
 * parameter, whether a template tag on a containing function
 * expression, or a template tag on a variable declaration whose
 * initializer is the containing function. The tags closest to the
 * node are returned first, so in the previous example, the template
 * tag on the containing function expression would be first.
 */
function getJSDocTypeParameterTags(param) {
    return getJSDocTypeParameterTagsWorker(param, /*noCache*/ false);
}
exports.getJSDocTypeParameterTags = getJSDocTypeParameterTags;
/** @internal */
function getJSDocTypeParameterTagsNoCache(param) {
    return getJSDocTypeParameterTagsWorker(param, /*noCache*/ true);
}
exports.getJSDocTypeParameterTagsNoCache = getJSDocTypeParameterTagsNoCache;
/**
 * Return true if the node has JSDoc parameter tags.
 *
 * @remarks Includes parameter tags that are not directly on the node,
 * for example on a variable declaration whose initializer is a function expression.
 */
function hasJSDocParameterTags(node) {
    return !!getFirstJSDocTag(node, ts_1.isJSDocParameterTag);
}
exports.hasJSDocParameterTags = hasJSDocParameterTags;
/** Gets the JSDoc augments tag for the node if present */
function getJSDocAugmentsTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocAugmentsTag);
}
exports.getJSDocAugmentsTag = getJSDocAugmentsTag;
/** Gets the JSDoc implements tags for the node if present */
function getJSDocImplementsTags(node) {
    return getAllJSDocTags(node, ts_1.isJSDocImplementsTag);
}
exports.getJSDocImplementsTags = getJSDocImplementsTags;
/** Gets the JSDoc class tag for the node if present */
function getJSDocClassTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocClassTag);
}
exports.getJSDocClassTag = getJSDocClassTag;
/** Gets the JSDoc public tag for the node if present */
function getJSDocPublicTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocPublicTag);
}
exports.getJSDocPublicTag = getJSDocPublicTag;
/** @internal */
function getJSDocPublicTagNoCache(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocPublicTag, /*noCache*/ true);
}
exports.getJSDocPublicTagNoCache = getJSDocPublicTagNoCache;
/** Gets the JSDoc private tag for the node if present */
function getJSDocPrivateTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocPrivateTag);
}
exports.getJSDocPrivateTag = getJSDocPrivateTag;
/** @internal */
function getJSDocPrivateTagNoCache(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocPrivateTag, /*noCache*/ true);
}
exports.getJSDocPrivateTagNoCache = getJSDocPrivateTagNoCache;
/** Gets the JSDoc protected tag for the node if present */
function getJSDocProtectedTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocProtectedTag);
}
exports.getJSDocProtectedTag = getJSDocProtectedTag;
/** @internal */
function getJSDocProtectedTagNoCache(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocProtectedTag, /*noCache*/ true);
}
exports.getJSDocProtectedTagNoCache = getJSDocProtectedTagNoCache;
/** Gets the JSDoc protected tag for the node if present */
function getJSDocReadonlyTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocReadonlyTag);
}
exports.getJSDocReadonlyTag = getJSDocReadonlyTag;
/** @internal */
function getJSDocReadonlyTagNoCache(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocReadonlyTag, /*noCache*/ true);
}
exports.getJSDocReadonlyTagNoCache = getJSDocReadonlyTagNoCache;
function getJSDocOverrideTagNoCache(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocOverrideTag, /*noCache*/ true);
}
exports.getJSDocOverrideTagNoCache = getJSDocOverrideTagNoCache;
/** Gets the JSDoc deprecated tag for the node if present */
function getJSDocDeprecatedTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocDeprecatedTag);
}
exports.getJSDocDeprecatedTag = getJSDocDeprecatedTag;
/** @internal */
function getJSDocDeprecatedTagNoCache(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocDeprecatedTag, /*noCache*/ true);
}
exports.getJSDocDeprecatedTagNoCache = getJSDocDeprecatedTagNoCache;
/** Gets the JSDoc enum tag for the node if present */
function getJSDocEnumTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocEnumTag);
}
exports.getJSDocEnumTag = getJSDocEnumTag;
/** Gets the JSDoc this tag for the node if present */
function getJSDocThisTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocThisTag);
}
exports.getJSDocThisTag = getJSDocThisTag;
/** Gets the JSDoc return tag for the node if present */
function getJSDocReturnTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocReturnTag);
}
exports.getJSDocReturnTag = getJSDocReturnTag;
/** Gets the JSDoc template tag for the node if present */
function getJSDocTemplateTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocTemplateTag);
}
exports.getJSDocTemplateTag = getJSDocTemplateTag;
function getJSDocSatisfiesTag(node) {
    return getFirstJSDocTag(node, ts_1.isJSDocSatisfiesTag);
}
exports.getJSDocSatisfiesTag = getJSDocSatisfiesTag;
/** Gets the JSDoc type tag for the node if present and valid */
function getJSDocTypeTag(node) {
    // We should have already issued an error if there were multiple type jsdocs, so just use the first one.
    var tag = getFirstJSDocTag(node, ts_1.isJSDocTypeTag);
    if (tag && tag.typeExpression && tag.typeExpression.type) {
        return tag;
    }
    return undefined;
}
exports.getJSDocTypeTag = getJSDocTypeTag;
/**
 * Gets the type node for the node if provided via JSDoc.
 *
 * @remarks The search includes any JSDoc param tag that relates
 * to the provided parameter, for example a type tag on the
 * parameter itself, or a param tag on a containing function
 * expression, or a param tag on a variable declaration whose
 * initializer is the containing function. The tags closest to the
 * node are examined first, so in the previous example, the type
 * tag directly on the node would be returned.
 */
function getJSDocType(node) {
    var tag = getFirstJSDocTag(node, ts_1.isJSDocTypeTag);
    if (!tag && (0, ts_1.isParameter)(node)) {
        tag = (0, ts_1.find)(getJSDocParameterTags(node), function (tag) { return !!tag.typeExpression; });
    }
    return tag && tag.typeExpression && tag.typeExpression.type;
}
exports.getJSDocType = getJSDocType;
/**
 * Gets the return type node for the node if provided via JSDoc return tag or type tag.
 *
 * @remarks `getJSDocReturnTag` just gets the whole JSDoc tag. This function
 * gets the type from inside the braces, after the fat arrow, etc.
 */
function getJSDocReturnType(node) {
    var returnTag = getJSDocReturnTag(node);
    if (returnTag && returnTag.typeExpression) {
        return returnTag.typeExpression.type;
    }
    var typeTag = getJSDocTypeTag(node);
    if (typeTag && typeTag.typeExpression) {
        var type = typeTag.typeExpression.type;
        if ((0, ts_1.isTypeLiteralNode)(type)) {
            var sig = (0, ts_1.find)(type.members, ts_1.isCallSignatureDeclaration);
            return sig && sig.type;
        }
        if ((0, ts_1.isFunctionTypeNode)(type) || (0, ts_1.isJSDocFunctionType)(type)) {
            return type.type;
        }
    }
}
exports.getJSDocReturnType = getJSDocReturnType;
function getJSDocTagsWorker(node, noCache) {
    var _a, _b;
    if (!(0, ts_1.canHaveJSDoc)(node))
        return ts_1.emptyArray;
    var tags = (_a = node.jsDoc) === null || _a === void 0 ? void 0 : _a.jsDocCache;
    // If cache is 'null', that means we did the work of searching for JSDoc tags and came up with nothing.
    if (tags === undefined || noCache) {
        var comments = (0, ts_1.getJSDocCommentsAndTags)(node, noCache);
        ts_1.Debug.assert(comments.length < 2 || comments[0] !== comments[1]);
        tags = (0, ts_1.flatMap)(comments, function (j) { return (0, ts_1.isJSDoc)(j) ? j.tags : j; });
        if (!noCache) {
            (_b = node.jsDoc) !== null && _b !== void 0 ? _b : (node.jsDoc = []);
            node.jsDoc.jsDocCache = tags;
        }
    }
    return tags;
}
/** Get all JSDoc tags related to a node, including those on parent nodes. */
function getJSDocTags(node) {
    return getJSDocTagsWorker(node, /*noCache*/ false);
}
exports.getJSDocTags = getJSDocTags;
/** @internal */
function getJSDocTagsNoCache(node) {
    return getJSDocTagsWorker(node, /*noCache*/ true);
}
exports.getJSDocTagsNoCache = getJSDocTagsNoCache;
/** Get the first JSDoc tag of a specified kind, or undefined if not present. */
function getFirstJSDocTag(node, predicate, noCache) {
    return (0, ts_1.find)(getJSDocTagsWorker(node, noCache), predicate);
}
/** Gets all JSDoc tags that match a specified predicate */
function getAllJSDocTags(node, predicate) {
    return getJSDocTags(node).filter(predicate);
}
exports.getAllJSDocTags = getAllJSDocTags;
/** Gets all JSDoc tags of a specified kind */
function getAllJSDocTagsOfKind(node, kind) {
    return getJSDocTags(node).filter(function (doc) { return doc.kind === kind; });
}
exports.getAllJSDocTagsOfKind = getAllJSDocTagsOfKind;
/** Gets the text of a jsdoc comment, flattening links to their text. */
function getTextOfJSDocComment(comment) {
    return typeof comment === "string" ? comment
        : comment === null || comment === void 0 ? void 0 : comment.map(function (c) { return c.kind === 327 /* SyntaxKind.JSDocText */ ? c.text : formatJSDocLink(c); }).join("");
}
exports.getTextOfJSDocComment = getTextOfJSDocComment;
function formatJSDocLink(link) {
    var kind = link.kind === 330 /* SyntaxKind.JSDocLink */ ? "link"
        : link.kind === 331 /* SyntaxKind.JSDocLinkCode */ ? "linkcode"
            : "linkplain";
    var name = link.name ? (0, ts_1.entityNameToString)(link.name) : "";
    var space = link.name && link.text.startsWith("://") ? "" : " ";
    return "{@".concat(kind, " ").concat(name).concat(space).concat(link.text, "}");
}
/**
 * Gets the effective type parameters. If the node was parsed in a
 * JavaScript file, gets the type parameters from the `@template` tag from JSDoc.
 *
 * This does *not* return type parameters from a jsdoc reference to a generic type, eg
 *
 * type Id = <T>(x: T) => T
 * /** @type {Id} /
 * function id(x) { return x }
 */
function getEffectiveTypeParameterDeclarations(node) {
    if ((0, ts_1.isJSDocSignature)(node)) {
        if ((0, ts_1.isJSDocOverloadTag)(node.parent)) {
            var jsDoc = (0, ts_1.getJSDocRoot)(node.parent);
            if (jsDoc && (0, ts_1.length)(jsDoc.tags)) {
                return (0, ts_1.flatMap)(jsDoc.tags, function (tag) { return (0, ts_1.isJSDocTemplateTag)(tag) ? tag.typeParameters : undefined; });
            }
        }
        return ts_1.emptyArray;
    }
    if ((0, ts_1.isJSDocTypeAlias)(node)) {
        ts_1.Debug.assert(node.parent.kind === 326 /* SyntaxKind.JSDoc */);
        return (0, ts_1.flatMap)(node.parent.tags, function (tag) { return (0, ts_1.isJSDocTemplateTag)(tag) ? tag.typeParameters : undefined; });
    }
    if (node.typeParameters) {
        return node.typeParameters;
    }
    if ((0, ts_1.canHaveIllegalTypeParameters)(node) && node.typeParameters) {
        return node.typeParameters;
    }
    if ((0, ts_1.isInJSFile)(node)) {
        var decls = (0, ts_1.getJSDocTypeParameterDeclarations)(node);
        if (decls.length) {
            return decls;
        }
        var typeTag = getJSDocType(node);
        if (typeTag && (0, ts_1.isFunctionTypeNode)(typeTag) && typeTag.typeParameters) {
            return typeTag.typeParameters;
        }
    }
    return ts_1.emptyArray;
}
exports.getEffectiveTypeParameterDeclarations = getEffectiveTypeParameterDeclarations;
function getEffectiveConstraintOfTypeParameter(node) {
    return node.constraint ? node.constraint :
        (0, ts_1.isJSDocTemplateTag)(node.parent) && node === node.parent.typeParameters[0] ? node.parent.constraint :
            undefined;
}
exports.getEffectiveConstraintOfTypeParameter = getEffectiveConstraintOfTypeParameter;
// #region
function isMemberName(node) {
    return node.kind === 80 /* SyntaxKind.Identifier */ || node.kind === 81 /* SyntaxKind.PrivateIdentifier */;
}
exports.isMemberName = isMemberName;
/** @internal */
function isGetOrSetAccessorDeclaration(node) {
    return node.kind === 177 /* SyntaxKind.SetAccessor */ || node.kind === 176 /* SyntaxKind.GetAccessor */;
}
exports.isGetOrSetAccessorDeclaration = isGetOrSetAccessorDeclaration;
function isPropertyAccessChain(node) {
    return (0, ts_1.isPropertyAccessExpression)(node) && !!(node.flags & 32 /* NodeFlags.OptionalChain */);
}
exports.isPropertyAccessChain = isPropertyAccessChain;
function isElementAccessChain(node) {
    return (0, ts_1.isElementAccessExpression)(node) && !!(node.flags & 32 /* NodeFlags.OptionalChain */);
}
exports.isElementAccessChain = isElementAccessChain;
function isCallChain(node) {
    return (0, ts_1.isCallExpression)(node) && !!(node.flags & 32 /* NodeFlags.OptionalChain */);
}
exports.isCallChain = isCallChain;
function isOptionalChain(node) {
    var kind = node.kind;
    return !!(node.flags & 32 /* NodeFlags.OptionalChain */) &&
        (kind === 210 /* SyntaxKind.PropertyAccessExpression */
            || kind === 211 /* SyntaxKind.ElementAccessExpression */
            || kind === 212 /* SyntaxKind.CallExpression */
            || kind === 234 /* SyntaxKind.NonNullExpression */);
}
exports.isOptionalChain = isOptionalChain;
/** @internal */
function isOptionalChainRoot(node) {
    return isOptionalChain(node) && !(0, ts_1.isNonNullExpression)(node) && !!node.questionDotToken;
}
exports.isOptionalChainRoot = isOptionalChainRoot;
/**
 * Determines whether a node is the expression preceding an optional chain (i.e. `a` in `a?.b`).
 *
 * @internal
 */
function isExpressionOfOptionalChainRoot(node) {
    return isOptionalChainRoot(node.parent) && node.parent.expression === node;
}
exports.isExpressionOfOptionalChainRoot = isExpressionOfOptionalChainRoot;
/**
 * Determines whether a node is the outermost `OptionalChain` in an ECMAScript `OptionalExpression`:
 *
 * 1. For `a?.b.c`, the outermost chain is `a?.b.c` (`c` is the end of the chain starting at `a?.`)
 * 2. For `a?.b!`, the outermost chain is `a?.b` (`b` is the end of the chain starting at `a?.`)
 * 3. For `(a?.b.c).d`, the outermost chain is `a?.b.c` (`c` is the end of the chain starting at `a?.` since parens end the chain)
 * 4. For `a?.b.c?.d`, both `a?.b.c` and `a?.b.c?.d` are outermost (`c` is the end of the chain starting at `a?.`, and `d` is
 *   the end of the chain starting at `c?.`)
 * 5. For `a?.(b?.c).d`, both `b?.c` and `a?.(b?.c)d` are outermost (`c` is the end of the chain starting at `b`, and `d` is
 *   the end of the chain starting at `a?.`)
 *
 * @internal
 */
function isOutermostOptionalChain(node) {
    return !isOptionalChain(node.parent) // cases 1, 2, and 3
        || isOptionalChainRoot(node.parent) // case 4
        || node !== node.parent.expression; // case 5
}
exports.isOutermostOptionalChain = isOutermostOptionalChain;
function isNullishCoalesce(node) {
    return node.kind === 225 /* SyntaxKind.BinaryExpression */ && node.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */;
}
exports.isNullishCoalesce = isNullishCoalesce;
function isConstTypeReference(node) {
    return (0, ts_1.isTypeReferenceNode)(node) && (0, ts_1.isIdentifier)(node.typeName) &&
        node.typeName.escapedText === "const" && !node.typeArguments;
}
exports.isConstTypeReference = isConstTypeReference;
function skipPartiallyEmittedExpressions(node) {
    return (0, ts_1.skipOuterExpressions)(node, 8 /* OuterExpressionKinds.PartiallyEmittedExpressions */);
}
exports.skipPartiallyEmittedExpressions = skipPartiallyEmittedExpressions;
function isNonNullChain(node) {
    return (0, ts_1.isNonNullExpression)(node) && !!(node.flags & 32 /* NodeFlags.OptionalChain */);
}
exports.isNonNullChain = isNonNullChain;
function isBreakOrContinueStatement(node) {
    return node.kind === 251 /* SyntaxKind.BreakStatement */ || node.kind === 250 /* SyntaxKind.ContinueStatement */;
}
exports.isBreakOrContinueStatement = isBreakOrContinueStatement;
function isNamedExportBindings(node) {
    return node.kind === 279 /* SyntaxKind.NamespaceExport */ || node.kind === 278 /* SyntaxKind.NamedExports */;
}
exports.isNamedExportBindings = isNamedExportBindings;
/** @deprecated */
function isUnparsedTextLike(node) {
    switch (node.kind) {
        case 308 /* SyntaxKind.UnparsedText */:
        case 309 /* SyntaxKind.UnparsedInternalText */:
            return true;
        default:
            return false;
    }
}
exports.isUnparsedTextLike = isUnparsedTextLike;
/** @deprecated */
function isUnparsedNode(node) {
    return isUnparsedTextLike(node) ||
        node.kind === 306 /* SyntaxKind.UnparsedPrologue */ ||
        node.kind === 310 /* SyntaxKind.UnparsedSyntheticReference */;
}
exports.isUnparsedNode = isUnparsedNode;
function isJSDocPropertyLikeTag(node) {
    return node.kind === 354 /* SyntaxKind.JSDocPropertyTag */ || node.kind === 347 /* SyntaxKind.JSDocParameterTag */;
}
exports.isJSDocPropertyLikeTag = isJSDocPropertyLikeTag;
// #endregion
// #region
// Node tests
//
// All node tests in the following list should *not* reference parent pointers so that
// they may be used with transformations.
/** @internal */
function isNode(node) {
    return isNodeKind(node.kind);
}
exports.isNode = isNode;
/** @internal */
function isNodeKind(kind) {
    return kind >= 165 /* SyntaxKind.FirstNode */;
}
exports.isNodeKind = isNodeKind;
/**
 * True if kind is of some token syntax kind.
 * For example, this is true for an IfKeyword but not for an IfStatement.
 * Literals are considered tokens, except TemplateLiteral, but does include TemplateHead/Middle/Tail.
 */
function isTokenKind(kind) {
    return kind >= 0 /* SyntaxKind.FirstToken */ && kind <= 164 /* SyntaxKind.LastToken */;
}
exports.isTokenKind = isTokenKind;
/**
 * True if node is of some token syntax kind.
 * For example, this is true for an IfKeyword but not for an IfStatement.
 * Literals are considered tokens, except TemplateLiteral, but does include TemplateHead/Middle/Tail.
 */
function isToken(n) {
    return isTokenKind(n.kind);
}
exports.isToken = isToken;
// Node Arrays
/** @internal */
function isNodeArray(array) {
    return (0, ts_1.hasProperty)(array, "pos") && (0, ts_1.hasProperty)(array, "end");
}
exports.isNodeArray = isNodeArray;
// Literals
/** @internal */
function isLiteralKind(kind) {
    return 9 /* SyntaxKind.FirstLiteralToken */ <= kind && kind <= 15 /* SyntaxKind.LastLiteralToken */;
}
exports.isLiteralKind = isLiteralKind;
function isLiteralExpression(node) {
    return isLiteralKind(node.kind);
}
exports.isLiteralExpression = isLiteralExpression;
/** @internal */
function isLiteralExpressionOfObject(node) {
    switch (node.kind) {
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
        case 14 /* SyntaxKind.RegularExpressionLiteral */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 230 /* SyntaxKind.ClassExpression */:
            return true;
    }
    return false;
}
exports.isLiteralExpressionOfObject = isLiteralExpressionOfObject;
// Pseudo-literals
/** @internal */
function isTemplateLiteralKind(kind) {
    return 15 /* SyntaxKind.FirstTemplateToken */ <= kind && kind <= 18 /* SyntaxKind.LastTemplateToken */;
}
exports.isTemplateLiteralKind = isTemplateLiteralKind;
function isTemplateLiteralToken(node) {
    return isTemplateLiteralKind(node.kind);
}
exports.isTemplateLiteralToken = isTemplateLiteralToken;
function isTemplateMiddleOrTemplateTail(node) {
    var kind = node.kind;
    return kind === 17 /* SyntaxKind.TemplateMiddle */
        || kind === 18 /* SyntaxKind.TemplateTail */;
}
exports.isTemplateMiddleOrTemplateTail = isTemplateMiddleOrTemplateTail;
function isImportOrExportSpecifier(node) {
    return (0, ts_1.isImportSpecifier)(node) || (0, ts_1.isExportSpecifier)(node);
}
exports.isImportOrExportSpecifier = isImportOrExportSpecifier;
function isTypeOnlyImportDeclaration(node) {
    switch (node.kind) {
        case 275 /* SyntaxKind.ImportSpecifier */:
            return node.isTypeOnly || node.parent.parent.isTypeOnly;
        case 273 /* SyntaxKind.NamespaceImport */:
            return node.parent.isTypeOnly;
        case 272 /* SyntaxKind.ImportClause */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            return node.isTypeOnly;
    }
    return false;
}
exports.isTypeOnlyImportDeclaration = isTypeOnlyImportDeclaration;
function isTypeOnlyExportDeclaration(node) {
    switch (node.kind) {
        case 280 /* SyntaxKind.ExportSpecifier */:
            return node.isTypeOnly || node.parent.parent.isTypeOnly;
        case 277 /* SyntaxKind.ExportDeclaration */:
            return node.isTypeOnly && !!node.moduleSpecifier && !node.exportClause;
        case 279 /* SyntaxKind.NamespaceExport */:
            return node.parent.isTypeOnly;
    }
    return false;
}
exports.isTypeOnlyExportDeclaration = isTypeOnlyExportDeclaration;
function isTypeOnlyImportOrExportDeclaration(node) {
    return isTypeOnlyImportDeclaration(node) || isTypeOnlyExportDeclaration(node);
}
exports.isTypeOnlyImportOrExportDeclaration = isTypeOnlyImportOrExportDeclaration;
function isAssertionKey(node) {
    return (0, ts_1.isStringLiteral)(node) || (0, ts_1.isIdentifier)(node);
}
exports.isAssertionKey = isAssertionKey;
function isStringTextContainingNode(node) {
    return node.kind === 11 /* SyntaxKind.StringLiteral */ || isTemplateLiteralKind(node.kind);
}
exports.isStringTextContainingNode = isStringTextContainingNode;
// Identifiers
/** @internal */
function isGeneratedIdentifier(node) {
    var _a;
    return (0, ts_1.isIdentifier)(node) && ((_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.autoGenerate) !== undefined;
}
exports.isGeneratedIdentifier = isGeneratedIdentifier;
/** @internal */
function isGeneratedPrivateIdentifier(node) {
    var _a;
    return (0, ts_1.isPrivateIdentifier)(node) && ((_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.autoGenerate) !== undefined;
}
exports.isGeneratedPrivateIdentifier = isGeneratedPrivateIdentifier;
// Private Identifiers
/** @internal */
function isPrivateIdentifierClassElementDeclaration(node) {
    return ((0, ts_1.isPropertyDeclaration)(node) || isMethodOrAccessor(node)) && (0, ts_1.isPrivateIdentifier)(node.name);
}
exports.isPrivateIdentifierClassElementDeclaration = isPrivateIdentifierClassElementDeclaration;
/** @internal */
function isPrivateIdentifierPropertyAccessExpression(node) {
    return (0, ts_1.isPropertyAccessExpression)(node) && (0, ts_1.isPrivateIdentifier)(node.name);
}
exports.isPrivateIdentifierPropertyAccessExpression = isPrivateIdentifierPropertyAccessExpression;
// Keywords
/** @internal */
function isModifierKind(token) {
    switch (token) {
        case 128 /* SyntaxKind.AbstractKeyword */:
        case 129 /* SyntaxKind.AccessorKeyword */:
        case 134 /* SyntaxKind.AsyncKeyword */:
        case 87 /* SyntaxKind.ConstKeyword */:
        case 138 /* SyntaxKind.DeclareKeyword */:
        case 90 /* SyntaxKind.DefaultKeyword */:
        case 95 /* SyntaxKind.ExportKeyword */:
        case 103 /* SyntaxKind.InKeyword */:
        case 125 /* SyntaxKind.PublicKeyword */:
        case 123 /* SyntaxKind.PrivateKeyword */:
        case 124 /* SyntaxKind.ProtectedKeyword */:
        case 148 /* SyntaxKind.ReadonlyKeyword */:
        case 126 /* SyntaxKind.StaticKeyword */:
        case 147 /* SyntaxKind.OutKeyword */:
        case 163 /* SyntaxKind.OverrideKeyword */:
            return true;
    }
    return false;
}
exports.isModifierKind = isModifierKind;
/** @internal */
function isParameterPropertyModifier(kind) {
    return !!((0, ts_1.modifierToFlag)(kind) & 16476 /* ModifierFlags.ParameterPropertyModifier */);
}
exports.isParameterPropertyModifier = isParameterPropertyModifier;
/** @internal */
function isClassMemberModifier(idToken) {
    return isParameterPropertyModifier(idToken) ||
        idToken === 126 /* SyntaxKind.StaticKeyword */ ||
        idToken === 163 /* SyntaxKind.OverrideKeyword */ ||
        idToken === 129 /* SyntaxKind.AccessorKeyword */;
}
exports.isClassMemberModifier = isClassMemberModifier;
function isModifier(node) {
    return isModifierKind(node.kind);
}
exports.isModifier = isModifier;
function isEntityName(node) {
    var kind = node.kind;
    return kind === 165 /* SyntaxKind.QualifiedName */
        || kind === 80 /* SyntaxKind.Identifier */;
}
exports.isEntityName = isEntityName;
function isPropertyName(node) {
    var kind = node.kind;
    return kind === 80 /* SyntaxKind.Identifier */
        || kind === 81 /* SyntaxKind.PrivateIdentifier */
        || kind === 11 /* SyntaxKind.StringLiteral */
        || kind === 9 /* SyntaxKind.NumericLiteral */
        || kind === 166 /* SyntaxKind.ComputedPropertyName */;
}
exports.isPropertyName = isPropertyName;
function isBindingName(node) {
    var kind = node.kind;
    return kind === 80 /* SyntaxKind.Identifier */
        || kind === 205 /* SyntaxKind.ObjectBindingPattern */
        || kind === 206 /* SyntaxKind.ArrayBindingPattern */;
}
exports.isBindingName = isBindingName;
// Functions
function isFunctionLike(node) {
    return !!node && isFunctionLikeKind(node.kind);
}
exports.isFunctionLike = isFunctionLike;
/** @internal */
function isFunctionLikeOrClassStaticBlockDeclaration(node) {
    return !!node && (isFunctionLikeKind(node.kind) || (0, ts_1.isClassStaticBlockDeclaration)(node));
}
exports.isFunctionLikeOrClassStaticBlockDeclaration = isFunctionLikeOrClassStaticBlockDeclaration;
/** @internal */
function isFunctionLikeDeclaration(node) {
    return node && isFunctionLikeDeclarationKind(node.kind);
}
exports.isFunctionLikeDeclaration = isFunctionLikeDeclaration;
/** @internal */
function isBooleanLiteral(node) {
    return node.kind === 112 /* SyntaxKind.TrueKeyword */ || node.kind === 97 /* SyntaxKind.FalseKeyword */;
}
exports.isBooleanLiteral = isBooleanLiteral;
function isFunctionLikeDeclarationKind(kind) {
    switch (kind) {
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 175 /* SyntaxKind.Constructor */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
            return true;
        default:
            return false;
    }
}
/** @internal */
function isFunctionLikeKind(kind) {
    switch (kind) {
        case 172 /* SyntaxKind.MethodSignature */:
        case 178 /* SyntaxKind.CallSignature */:
        case 329 /* SyntaxKind.JSDocSignature */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 183 /* SyntaxKind.FunctionType */:
        case 323 /* SyntaxKind.JSDocFunctionType */:
        case 184 /* SyntaxKind.ConstructorType */:
            return true;
        default:
            return isFunctionLikeDeclarationKind(kind);
    }
}
exports.isFunctionLikeKind = isFunctionLikeKind;
/** @internal */
function isFunctionOrModuleBlock(node) {
    return (0, ts_1.isSourceFile)(node) || (0, ts_1.isModuleBlock)(node) || (0, ts_1.isBlock)(node) && isFunctionLike(node.parent);
}
exports.isFunctionOrModuleBlock = isFunctionOrModuleBlock;
// Classes
function isClassElement(node) {
    var kind = node.kind;
    return kind === 175 /* SyntaxKind.Constructor */
        || kind === 171 /* SyntaxKind.PropertyDeclaration */
        || kind === 173 /* SyntaxKind.MethodDeclaration */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */
        || kind === 180 /* SyntaxKind.IndexSignature */
        || kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */
        || kind === 239 /* SyntaxKind.SemicolonClassElement */;
}
exports.isClassElement = isClassElement;
function isClassLike(node) {
    return node && (node.kind === 262 /* SyntaxKind.ClassDeclaration */ || node.kind === 230 /* SyntaxKind.ClassExpression */);
}
exports.isClassLike = isClassLike;
function isAccessor(node) {
    return node && (node.kind === 176 /* SyntaxKind.GetAccessor */ || node.kind === 177 /* SyntaxKind.SetAccessor */);
}
exports.isAccessor = isAccessor;
function isAutoAccessorPropertyDeclaration(node) {
    return (0, ts_1.isPropertyDeclaration)(node) && (0, ts_1.hasAccessorModifier)(node);
}
exports.isAutoAccessorPropertyDeclaration = isAutoAccessorPropertyDeclaration;
/** @internal */
function isMethodOrAccessor(node) {
    switch (node.kind) {
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
            return true;
        default:
            return false;
    }
}
exports.isMethodOrAccessor = isMethodOrAccessor;
/** @internal */
function isNamedClassElement(node) {
    switch (node.kind) {
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return true;
        default:
            return false;
    }
}
exports.isNamedClassElement = isNamedClassElement;
// Type members
function isModifierLike(node) {
    return isModifier(node) || (0, ts_1.isDecorator)(node);
}
exports.isModifierLike = isModifierLike;
function isTypeElement(node) {
    var kind = node.kind;
    return kind === 179 /* SyntaxKind.ConstructSignature */
        || kind === 178 /* SyntaxKind.CallSignature */
        || kind === 170 /* SyntaxKind.PropertySignature */
        || kind === 172 /* SyntaxKind.MethodSignature */
        || kind === 180 /* SyntaxKind.IndexSignature */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */;
}
exports.isTypeElement = isTypeElement;
function isClassOrTypeElement(node) {
    return isTypeElement(node) || isClassElement(node);
}
exports.isClassOrTypeElement = isClassOrTypeElement;
function isObjectLiteralElementLike(node) {
    var kind = node.kind;
    return kind === 302 /* SyntaxKind.PropertyAssignment */
        || kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */
        || kind === 304 /* SyntaxKind.SpreadAssignment */
        || kind === 173 /* SyntaxKind.MethodDeclaration */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */;
}
exports.isObjectLiteralElementLike = isObjectLiteralElementLike;
// Type
/**
 * Node test that determines whether a node is a valid type node.
 * This differs from the `isPartOfTypeNode` function which determines whether a node is *part*
 * of a TypeNode.
 */
function isTypeNode(node) {
    return (0, ts_1.isTypeNodeKind)(node.kind);
}
exports.isTypeNode = isTypeNode;
function isFunctionOrConstructorTypeNode(node) {
    switch (node.kind) {
        case 183 /* SyntaxKind.FunctionType */:
        case 184 /* SyntaxKind.ConstructorType */:
            return true;
    }
    return false;
}
exports.isFunctionOrConstructorTypeNode = isFunctionOrConstructorTypeNode;
// Binding patterns
/** @internal */
function isBindingPattern(node) {
    if (node) {
        var kind = node.kind;
        return kind === 206 /* SyntaxKind.ArrayBindingPattern */
            || kind === 205 /* SyntaxKind.ObjectBindingPattern */;
    }
    return false;
}
exports.isBindingPattern = isBindingPattern;
/** @internal */
function isAssignmentPattern(node) {
    var kind = node.kind;
    return kind === 208 /* SyntaxKind.ArrayLiteralExpression */
        || kind === 209 /* SyntaxKind.ObjectLiteralExpression */;
}
exports.isAssignmentPattern = isAssignmentPattern;
function isArrayBindingElement(node) {
    var kind = node.kind;
    return kind === 207 /* SyntaxKind.BindingElement */
        || kind === 231 /* SyntaxKind.OmittedExpression */;
}
exports.isArrayBindingElement = isArrayBindingElement;
/**
 * Determines whether the BindingOrAssignmentElement is a BindingElement-like declaration
 *
 * @internal
 */
function isDeclarationBindingElement(bindingElement) {
    switch (bindingElement.kind) {
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 168 /* SyntaxKind.Parameter */:
        case 207 /* SyntaxKind.BindingElement */:
            return true;
    }
    return false;
}
exports.isDeclarationBindingElement = isDeclarationBindingElement;
/** @internal */
function isBindingOrAssignmentElement(node) {
    return (0, ts_1.isVariableDeclaration)(node)
        || (0, ts_1.isParameter)(node)
        || isObjectBindingOrAssignmentElement(node)
        || isArrayBindingOrAssignmentElement(node);
}
exports.isBindingOrAssignmentElement = isBindingOrAssignmentElement;
/**
 * Determines whether a node is a BindingOrAssignmentPattern
 *
 * @internal
 */
function isBindingOrAssignmentPattern(node) {
    return isObjectBindingOrAssignmentPattern(node)
        || isArrayBindingOrAssignmentPattern(node);
}
exports.isBindingOrAssignmentPattern = isBindingOrAssignmentPattern;
/**
 * Determines whether a node is an ObjectBindingOrAssignmentPattern
 *
 * @internal
 */
function isObjectBindingOrAssignmentPattern(node) {
    switch (node.kind) {
        case 205 /* SyntaxKind.ObjectBindingPattern */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
            return true;
    }
    return false;
}
exports.isObjectBindingOrAssignmentPattern = isObjectBindingOrAssignmentPattern;
/** @internal */
function isObjectBindingOrAssignmentElement(node) {
    switch (node.kind) {
        case 207 /* SyntaxKind.BindingElement */:
        case 302 /* SyntaxKind.PropertyAssignment */: // AssignmentProperty
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */: // AssignmentProperty
        case 304 /* SyntaxKind.SpreadAssignment */: // AssignmentRestProperty
            return true;
    }
    return false;
}
exports.isObjectBindingOrAssignmentElement = isObjectBindingOrAssignmentElement;
/**
 * Determines whether a node is an ArrayBindingOrAssignmentPattern
 *
 * @internal
 */
function isArrayBindingOrAssignmentPattern(node) {
    switch (node.kind) {
        case 206 /* SyntaxKind.ArrayBindingPattern */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
            return true;
    }
    return false;
}
exports.isArrayBindingOrAssignmentPattern = isArrayBindingOrAssignmentPattern;
/** @internal */
function isArrayBindingOrAssignmentElement(node) {
    switch (node.kind) {
        case 207 /* SyntaxKind.BindingElement */:
        case 231 /* SyntaxKind.OmittedExpression */: // Elision
        case 229 /* SyntaxKind.SpreadElement */: // AssignmentRestElement
        case 208 /* SyntaxKind.ArrayLiteralExpression */: // ArrayAssignmentPattern
        case 209 /* SyntaxKind.ObjectLiteralExpression */: // ObjectAssignmentPattern
        case 80 /* SyntaxKind.Identifier */: // DestructuringAssignmentTarget
        case 210 /* SyntaxKind.PropertyAccessExpression */: // DestructuringAssignmentTarget
        case 211 /* SyntaxKind.ElementAccessExpression */: // DestructuringAssignmentTarget
            return true;
    }
    return (0, ts_1.isAssignmentExpression)(node, /*excludeCompoundAssignment*/ true); // AssignmentElement
}
exports.isArrayBindingOrAssignmentElement = isArrayBindingOrAssignmentElement;
/** @internal */
function isPropertyAccessOrQualifiedNameOrImportTypeNode(node) {
    var kind = node.kind;
    return kind === 210 /* SyntaxKind.PropertyAccessExpression */
        || kind === 165 /* SyntaxKind.QualifiedName */
        || kind === 204 /* SyntaxKind.ImportType */;
}
exports.isPropertyAccessOrQualifiedNameOrImportTypeNode = isPropertyAccessOrQualifiedNameOrImportTypeNode;
// Expression
function isPropertyAccessOrQualifiedName(node) {
    var kind = node.kind;
    return kind === 210 /* SyntaxKind.PropertyAccessExpression */
        || kind === 165 /* SyntaxKind.QualifiedName */;
}
exports.isPropertyAccessOrQualifiedName = isPropertyAccessOrQualifiedName;
function isCallLikeExpression(node) {
    switch (node.kind) {
        case 285 /* SyntaxKind.JsxOpeningElement */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
        case 212 /* SyntaxKind.CallExpression */:
        case 213 /* SyntaxKind.NewExpression */:
        case 214 /* SyntaxKind.TaggedTemplateExpression */:
        case 169 /* SyntaxKind.Decorator */:
            return true;
        default:
            return false;
    }
}
exports.isCallLikeExpression = isCallLikeExpression;
function isCallOrNewExpression(node) {
    return node.kind === 212 /* SyntaxKind.CallExpression */ || node.kind === 213 /* SyntaxKind.NewExpression */;
}
exports.isCallOrNewExpression = isCallOrNewExpression;
function isTemplateLiteral(node) {
    var kind = node.kind;
    return kind === 227 /* SyntaxKind.TemplateExpression */
        || kind === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */;
}
exports.isTemplateLiteral = isTemplateLiteral;
function isLeftHandSideExpression(node) {
    return isLeftHandSideExpressionKind(skipPartiallyEmittedExpressions(node).kind);
}
exports.isLeftHandSideExpression = isLeftHandSideExpression;
function isLeftHandSideExpressionKind(kind) {
    switch (kind) {
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
        case 213 /* SyntaxKind.NewExpression */:
        case 212 /* SyntaxKind.CallExpression */:
        case 283 /* SyntaxKind.JsxElement */:
        case 284 /* SyntaxKind.JsxSelfClosingElement */:
        case 287 /* SyntaxKind.JsxFragment */:
        case 214 /* SyntaxKind.TaggedTemplateExpression */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
        case 216 /* SyntaxKind.ParenthesizedExpression */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 80 /* SyntaxKind.Identifier */:
        case 81 /* SyntaxKind.PrivateIdentifier */: // technically this is only an Expression if it's in a `#field in expr` BinaryExpression
        case 14 /* SyntaxKind.RegularExpressionLiteral */:
        case 9 /* SyntaxKind.NumericLiteral */:
        case 10 /* SyntaxKind.BigIntLiteral */:
        case 11 /* SyntaxKind.StringLiteral */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 227 /* SyntaxKind.TemplateExpression */:
        case 97 /* SyntaxKind.FalseKeyword */:
        case 106 /* SyntaxKind.NullKeyword */:
        case 110 /* SyntaxKind.ThisKeyword */:
        case 112 /* SyntaxKind.TrueKeyword */:
        case 108 /* SyntaxKind.SuperKeyword */:
        case 234 /* SyntaxKind.NonNullExpression */:
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
        case 235 /* SyntaxKind.MetaProperty */:
        case 102 /* SyntaxKind.ImportKeyword */: // technically this is only an Expression if it's in a CallExpression
        case 281 /* SyntaxKind.MissingDeclaration */:
            return true;
        default:
            return false;
    }
}
/** @internal */
function isUnaryExpression(node) {
    return isUnaryExpressionKind(skipPartiallyEmittedExpressions(node).kind);
}
exports.isUnaryExpression = isUnaryExpression;
function isUnaryExpressionKind(kind) {
    switch (kind) {
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
        case 224 /* SyntaxKind.PostfixUnaryExpression */:
        case 219 /* SyntaxKind.DeleteExpression */:
        case 220 /* SyntaxKind.TypeOfExpression */:
        case 221 /* SyntaxKind.VoidExpression */:
        case 222 /* SyntaxKind.AwaitExpression */:
        case 215 /* SyntaxKind.TypeAssertionExpression */:
            return true;
        default:
            return isLeftHandSideExpressionKind(kind);
    }
}
/** @internal */
function isUnaryExpressionWithWrite(expr) {
    switch (expr.kind) {
        case 224 /* SyntaxKind.PostfixUnaryExpression */:
            return true;
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
            return expr.operator === 46 /* SyntaxKind.PlusPlusToken */ ||
                expr.operator === 47 /* SyntaxKind.MinusMinusToken */;
        default:
            return false;
    }
}
exports.isUnaryExpressionWithWrite = isUnaryExpressionWithWrite;
function isLiteralTypeLiteral(node) {
    switch (node.kind) {
        case 106 /* SyntaxKind.NullKeyword */:
        case 112 /* SyntaxKind.TrueKeyword */:
        case 97 /* SyntaxKind.FalseKeyword */:
        case 223 /* SyntaxKind.PrefixUnaryExpression */:
            return true;
        default:
            return isLiteralExpression(node);
    }
}
exports.isLiteralTypeLiteral = isLiteralTypeLiteral;
/**
 * Determines whether a node is an expression based only on its kind.
 */
function isExpression(node) {
    return isExpressionKind(skipPartiallyEmittedExpressions(node).kind);
}
exports.isExpression = isExpression;
function isExpressionKind(kind) {
    switch (kind) {
        case 226 /* SyntaxKind.ConditionalExpression */:
        case 228 /* SyntaxKind.YieldExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
        case 225 /* SyntaxKind.BinaryExpression */:
        case 229 /* SyntaxKind.SpreadElement */:
        case 233 /* SyntaxKind.AsExpression */:
        case 231 /* SyntaxKind.OmittedExpression */:
        case 360 /* SyntaxKind.CommaListExpression */:
        case 359 /* SyntaxKind.PartiallyEmittedExpression */:
        case 237 /* SyntaxKind.SatisfiesExpression */:
            return true;
        default:
            return isUnaryExpressionKind(kind);
    }
}
function isAssertionExpression(node) {
    var kind = node.kind;
    return kind === 215 /* SyntaxKind.TypeAssertionExpression */
        || kind === 233 /* SyntaxKind.AsExpression */;
}
exports.isAssertionExpression = isAssertionExpression;
/** @internal */
function isNotEmittedOrPartiallyEmittedNode(node) {
    return (0, ts_1.isNotEmittedStatement)(node)
        || (0, ts_1.isPartiallyEmittedExpression)(node);
}
exports.isNotEmittedOrPartiallyEmittedNode = isNotEmittedOrPartiallyEmittedNode;
function isIterationStatement(node, lookInLabeledStatements) {
    switch (node.kind) {
        case 247 /* SyntaxKind.ForStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
        case 245 /* SyntaxKind.DoStatement */:
        case 246 /* SyntaxKind.WhileStatement */:
            return true;
        case 255 /* SyntaxKind.LabeledStatement */:
            return lookInLabeledStatements && isIterationStatement(node.statement, lookInLabeledStatements);
    }
    return false;
}
exports.isIterationStatement = isIterationStatement;
/** @internal */
function isScopeMarker(node) {
    return (0, ts_1.isExportAssignment)(node) || (0, ts_1.isExportDeclaration)(node);
}
exports.isScopeMarker = isScopeMarker;
/** @internal */
function hasScopeMarker(statements) {
    return (0, ts_1.some)(statements, isScopeMarker);
}
exports.hasScopeMarker = hasScopeMarker;
/** @internal */
function needsScopeMarker(result) {
    return !(0, ts_1.isAnyImportOrReExport)(result) && !(0, ts_1.isExportAssignment)(result) && !(0, ts_1.hasSyntacticModifier)(result, 1 /* ModifierFlags.Export */) && !(0, ts_1.isAmbientModule)(result);
}
exports.needsScopeMarker = needsScopeMarker;
/** @internal */
function isExternalModuleIndicator(result) {
    // Exported top-level member indicates moduleness
    return (0, ts_1.isAnyImportOrReExport)(result) || (0, ts_1.isExportAssignment)(result) || (0, ts_1.hasSyntacticModifier)(result, 1 /* ModifierFlags.Export */);
}
exports.isExternalModuleIndicator = isExternalModuleIndicator;
/** @internal */
function isForInOrOfStatement(node) {
    return node.kind === 248 /* SyntaxKind.ForInStatement */ || node.kind === 249 /* SyntaxKind.ForOfStatement */;
}
exports.isForInOrOfStatement = isForInOrOfStatement;
// Element
function isConciseBody(node) {
    return (0, ts_1.isBlock)(node)
        || isExpression(node);
}
exports.isConciseBody = isConciseBody;
/** @internal */
function isFunctionBody(node) {
    return (0, ts_1.isBlock)(node);
}
exports.isFunctionBody = isFunctionBody;
function isForInitializer(node) {
    return (0, ts_1.isVariableDeclarationList)(node)
        || isExpression(node);
}
exports.isForInitializer = isForInitializer;
function isModuleBody(node) {
    var kind = node.kind;
    return kind === 267 /* SyntaxKind.ModuleBlock */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */
        || kind === 80 /* SyntaxKind.Identifier */;
}
exports.isModuleBody = isModuleBody;
/** @internal */
function isNamespaceBody(node) {
    var kind = node.kind;
    return kind === 267 /* SyntaxKind.ModuleBlock */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */;
}
exports.isNamespaceBody = isNamespaceBody;
/** @internal */
function isJSDocNamespaceBody(node) {
    var kind = node.kind;
    return kind === 80 /* SyntaxKind.Identifier */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */;
}
exports.isJSDocNamespaceBody = isJSDocNamespaceBody;
function isNamedImportBindings(node) {
    var kind = node.kind;
    return kind === 274 /* SyntaxKind.NamedImports */
        || kind === 273 /* SyntaxKind.NamespaceImport */;
}
exports.isNamedImportBindings = isNamedImportBindings;
/** @internal */
function isModuleOrEnumDeclaration(node) {
    return node.kind === 266 /* SyntaxKind.ModuleDeclaration */ || node.kind === 265 /* SyntaxKind.EnumDeclaration */;
}
exports.isModuleOrEnumDeclaration = isModuleOrEnumDeclaration;
/** @internal */
function canHaveSymbol(node) {
    // NOTE: This should cover all possible declarations except MissingDeclaration and SemicolonClassElement
    //       since they aren't actually declarations and can't have a symbol.
    switch (node.kind) {
        case 218 /* SyntaxKind.ArrowFunction */:
        case 225 /* SyntaxKind.BinaryExpression */:
        case 207 /* SyntaxKind.BindingElement */:
        case 212 /* SyntaxKind.CallExpression */:
        case 178 /* SyntaxKind.CallSignature */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
        case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
        case 175 /* SyntaxKind.Constructor */:
        case 184 /* SyntaxKind.ConstructorType */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
        case 265 /* SyntaxKind.EnumDeclaration */:
        case 305 /* SyntaxKind.EnumMember */:
        case 276 /* SyntaxKind.ExportAssignment */:
        case 277 /* SyntaxKind.ExportDeclaration */:
        case 280 /* SyntaxKind.ExportSpecifier */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 183 /* SyntaxKind.FunctionType */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 80 /* SyntaxKind.Identifier */:
        case 272 /* SyntaxKind.ImportClause */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
        case 275 /* SyntaxKind.ImportSpecifier */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 344 /* SyntaxKind.JSDocCallbackTag */:
        case 346 /* SyntaxKind.JSDocEnumTag */:
        case 323 /* SyntaxKind.JSDocFunctionType */:
        case 347 /* SyntaxKind.JSDocParameterTag */:
        case 354 /* SyntaxKind.JSDocPropertyTag */:
        case 329 /* SyntaxKind.JSDocSignature */:
        case 352 /* SyntaxKind.JSDocTypedefTag */:
        case 328 /* SyntaxKind.JSDocTypeLiteral */:
        case 290 /* SyntaxKind.JsxAttribute */:
        case 291 /* SyntaxKind.JsxAttributes */:
        case 292 /* SyntaxKind.JsxSpreadAttribute */:
        case 199 /* SyntaxKind.MappedType */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 201 /* SyntaxKind.NamedTupleMember */:
        case 279 /* SyntaxKind.NamespaceExport */:
        case 269 /* SyntaxKind.NamespaceExportDeclaration */:
        case 273 /* SyntaxKind.NamespaceImport */:
        case 213 /* SyntaxKind.NewExpression */:
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 9 /* SyntaxKind.NumericLiteral */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 168 /* SyntaxKind.Parameter */:
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 302 /* SyntaxKind.PropertyAssignment */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
        case 311 /* SyntaxKind.SourceFile */:
        case 304 /* SyntaxKind.SpreadAssignment */:
        case 11 /* SyntaxKind.StringLiteral */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 186 /* SyntaxKind.TypeLiteral */:
        case 167 /* SyntaxKind.TypeParameter */:
        case 259 /* SyntaxKind.VariableDeclaration */:
            return true;
        default:
            return false;
    }
}
exports.canHaveSymbol = canHaveSymbol;
/** @internal */
function canHaveLocals(node) {
    switch (node.kind) {
        case 218 /* SyntaxKind.ArrowFunction */:
        case 240 /* SyntaxKind.Block */:
        case 178 /* SyntaxKind.CallSignature */:
        case 268 /* SyntaxKind.CaseBlock */:
        case 298 /* SyntaxKind.CatchClause */:
        case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
        case 193 /* SyntaxKind.ConditionalType */:
        case 175 /* SyntaxKind.Constructor */:
        case 184 /* SyntaxKind.ConstructorType */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 247 /* SyntaxKind.ForStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 217 /* SyntaxKind.FunctionExpression */:
        case 183 /* SyntaxKind.FunctionType */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 344 /* SyntaxKind.JSDocCallbackTag */:
        case 346 /* SyntaxKind.JSDocEnumTag */:
        case 323 /* SyntaxKind.JSDocFunctionType */:
        case 329 /* SyntaxKind.JSDocSignature */:
        case 352 /* SyntaxKind.JSDocTypedefTag */:
        case 199 /* SyntaxKind.MappedType */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 311 /* SyntaxKind.SourceFile */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
            return true;
        default:
            return false;
    }
}
exports.canHaveLocals = canHaveLocals;
function isDeclarationKind(kind) {
    return kind === 218 /* SyntaxKind.ArrowFunction */
        || kind === 207 /* SyntaxKind.BindingElement */
        || kind === 262 /* SyntaxKind.ClassDeclaration */
        || kind === 230 /* SyntaxKind.ClassExpression */
        || kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */
        || kind === 175 /* SyntaxKind.Constructor */
        || kind === 265 /* SyntaxKind.EnumDeclaration */
        || kind === 305 /* SyntaxKind.EnumMember */
        || kind === 280 /* SyntaxKind.ExportSpecifier */
        || kind === 261 /* SyntaxKind.FunctionDeclaration */
        || kind === 217 /* SyntaxKind.FunctionExpression */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 272 /* SyntaxKind.ImportClause */
        || kind === 270 /* SyntaxKind.ImportEqualsDeclaration */
        || kind === 275 /* SyntaxKind.ImportSpecifier */
        || kind === 263 /* SyntaxKind.InterfaceDeclaration */
        || kind === 290 /* SyntaxKind.JsxAttribute */
        || kind === 173 /* SyntaxKind.MethodDeclaration */
        || kind === 172 /* SyntaxKind.MethodSignature */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */
        || kind === 269 /* SyntaxKind.NamespaceExportDeclaration */
        || kind === 273 /* SyntaxKind.NamespaceImport */
        || kind === 279 /* SyntaxKind.NamespaceExport */
        || kind === 168 /* SyntaxKind.Parameter */
        || kind === 302 /* SyntaxKind.PropertyAssignment */
        || kind === 171 /* SyntaxKind.PropertyDeclaration */
        || kind === 170 /* SyntaxKind.PropertySignature */
        || kind === 177 /* SyntaxKind.SetAccessor */
        || kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */
        || kind === 264 /* SyntaxKind.TypeAliasDeclaration */
        || kind === 167 /* SyntaxKind.TypeParameter */
        || kind === 259 /* SyntaxKind.VariableDeclaration */
        || kind === 352 /* SyntaxKind.JSDocTypedefTag */
        || kind === 344 /* SyntaxKind.JSDocCallbackTag */
        || kind === 354 /* SyntaxKind.JSDocPropertyTag */;
}
function isDeclarationStatementKind(kind) {
    return kind === 261 /* SyntaxKind.FunctionDeclaration */
        || kind === 281 /* SyntaxKind.MissingDeclaration */
        || kind === 262 /* SyntaxKind.ClassDeclaration */
        || kind === 263 /* SyntaxKind.InterfaceDeclaration */
        || kind === 264 /* SyntaxKind.TypeAliasDeclaration */
        || kind === 265 /* SyntaxKind.EnumDeclaration */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */
        || kind === 271 /* SyntaxKind.ImportDeclaration */
        || kind === 270 /* SyntaxKind.ImportEqualsDeclaration */
        || kind === 277 /* SyntaxKind.ExportDeclaration */
        || kind === 276 /* SyntaxKind.ExportAssignment */
        || kind === 269 /* SyntaxKind.NamespaceExportDeclaration */;
}
function isStatementKindButNotDeclarationKind(kind) {
    return kind === 251 /* SyntaxKind.BreakStatement */
        || kind === 250 /* SyntaxKind.ContinueStatement */
        || kind === 258 /* SyntaxKind.DebuggerStatement */
        || kind === 245 /* SyntaxKind.DoStatement */
        || kind === 243 /* SyntaxKind.ExpressionStatement */
        || kind === 241 /* SyntaxKind.EmptyStatement */
        || kind === 248 /* SyntaxKind.ForInStatement */
        || kind === 249 /* SyntaxKind.ForOfStatement */
        || kind === 247 /* SyntaxKind.ForStatement */
        || kind === 244 /* SyntaxKind.IfStatement */
        || kind === 255 /* SyntaxKind.LabeledStatement */
        || kind === 252 /* SyntaxKind.ReturnStatement */
        || kind === 254 /* SyntaxKind.SwitchStatement */
        || kind === 256 /* SyntaxKind.ThrowStatement */
        || kind === 257 /* SyntaxKind.TryStatement */
        || kind === 242 /* SyntaxKind.VariableStatement */
        || kind === 246 /* SyntaxKind.WhileStatement */
        || kind === 253 /* SyntaxKind.WithStatement */
        || kind === 358 /* SyntaxKind.NotEmittedStatement */;
}
/** @internal */
function isDeclaration(node) {
    if (node.kind === 167 /* SyntaxKind.TypeParameter */) {
        return (node.parent && node.parent.kind !== 351 /* SyntaxKind.JSDocTemplateTag */) || (0, ts_1.isInJSFile)(node);
    }
    return isDeclarationKind(node.kind);
}
exports.isDeclaration = isDeclaration;
/** @internal */
function isDeclarationStatement(node) {
    return isDeclarationStatementKind(node.kind);
}
exports.isDeclarationStatement = isDeclarationStatement;
/**
 * Determines whether the node is a statement that is not also a declaration
 *
 * @internal
 */
function isStatementButNotDeclaration(node) {
    return isStatementKindButNotDeclarationKind(node.kind);
}
exports.isStatementButNotDeclaration = isStatementButNotDeclaration;
function isStatement(node) {
    var kind = node.kind;
    return isStatementKindButNotDeclarationKind(kind)
        || isDeclarationStatementKind(kind)
        || isBlockStatement(node);
}
exports.isStatement = isStatement;
function isBlockStatement(node) {
    if (node.kind !== 240 /* SyntaxKind.Block */)
        return false;
    if (node.parent !== undefined) {
        if (node.parent.kind === 257 /* SyntaxKind.TryStatement */ || node.parent.kind === 298 /* SyntaxKind.CatchClause */) {
            return false;
        }
    }
    return !(0, ts_1.isFunctionBlock)(node);
}
// TODO(jakebailey): should we be exporting this function and not isStatement?
/**
 * NOTE: This is similar to `isStatement` but does not access parent pointers.
 *
 * @internal
 */
function isStatementOrBlock(node) {
    var kind = node.kind;
    return isStatementKindButNotDeclarationKind(kind)
        || isDeclarationStatementKind(kind)
        || kind === 240 /* SyntaxKind.Block */;
}
exports.isStatementOrBlock = isStatementOrBlock;
// Module references
function isModuleReference(node) {
    var kind = node.kind;
    return kind === 282 /* SyntaxKind.ExternalModuleReference */
        || kind === 165 /* SyntaxKind.QualifiedName */
        || kind === 80 /* SyntaxKind.Identifier */;
}
exports.isModuleReference = isModuleReference;
// JSX
function isJsxTagNameExpression(node) {
    var kind = node.kind;
    return kind === 110 /* SyntaxKind.ThisKeyword */
        || kind === 80 /* SyntaxKind.Identifier */
        || kind === 210 /* SyntaxKind.PropertyAccessExpression */
        || kind === 294 /* SyntaxKind.JsxNamespacedName */;
}
exports.isJsxTagNameExpression = isJsxTagNameExpression;
function isJsxChild(node) {
    var kind = node.kind;
    return kind === 283 /* SyntaxKind.JsxElement */
        || kind === 293 /* SyntaxKind.JsxExpression */
        || kind === 284 /* SyntaxKind.JsxSelfClosingElement */
        || kind === 12 /* SyntaxKind.JsxText */
        || kind === 287 /* SyntaxKind.JsxFragment */;
}
exports.isJsxChild = isJsxChild;
function isJsxAttributeLike(node) {
    var kind = node.kind;
    return kind === 290 /* SyntaxKind.JsxAttribute */
        || kind === 292 /* SyntaxKind.JsxSpreadAttribute */;
}
exports.isJsxAttributeLike = isJsxAttributeLike;
function isStringLiteralOrJsxExpression(node) {
    var kind = node.kind;
    return kind === 11 /* SyntaxKind.StringLiteral */
        || kind === 293 /* SyntaxKind.JsxExpression */;
}
exports.isStringLiteralOrJsxExpression = isStringLiteralOrJsxExpression;
function isJsxOpeningLikeElement(node) {
    var kind = node.kind;
    return kind === 285 /* SyntaxKind.JsxOpeningElement */
        || kind === 284 /* SyntaxKind.JsxSelfClosingElement */;
}
exports.isJsxOpeningLikeElement = isJsxOpeningLikeElement;
// Clauses
function isCaseOrDefaultClause(node) {
    var kind = node.kind;
    return kind === 295 /* SyntaxKind.CaseClause */
        || kind === 296 /* SyntaxKind.DefaultClause */;
}
exports.isCaseOrDefaultClause = isCaseOrDefaultClause;
// JSDoc
/**
 * True if node is of some JSDoc syntax kind.
 *
 * @internal
 */
function isJSDocNode(node) {
    return node.kind >= 315 /* SyntaxKind.FirstJSDocNode */ && node.kind <= 356 /* SyntaxKind.LastJSDocNode */;
}
exports.isJSDocNode = isJSDocNode;
/** True if node is of a kind that may contain comment text. */
function isJSDocCommentContainingNode(node) {
    return node.kind === 326 /* SyntaxKind.JSDoc */
        || node.kind === 325 /* SyntaxKind.JSDocNamepathType */
        || node.kind === 327 /* SyntaxKind.JSDocText */
        || isJSDocLinkLike(node)
        || isJSDocTag(node)
        || (0, ts_1.isJSDocTypeLiteral)(node)
        || (0, ts_1.isJSDocSignature)(node);
}
exports.isJSDocCommentContainingNode = isJSDocCommentContainingNode;
// TODO: determine what this does before making it public.
/** @internal */
function isJSDocTag(node) {
    return node.kind >= 333 /* SyntaxKind.FirstJSDocTagNode */ && node.kind <= 356 /* SyntaxKind.LastJSDocTagNode */;
}
exports.isJSDocTag = isJSDocTag;
function isSetAccessor(node) {
    return node.kind === 177 /* SyntaxKind.SetAccessor */;
}
exports.isSetAccessor = isSetAccessor;
function isGetAccessor(node) {
    return node.kind === 176 /* SyntaxKind.GetAccessor */;
}
exports.isGetAccessor = isGetAccessor;
/**
 * True if has jsdoc nodes attached to it.
 *
 * @internal
 */
// TODO: GH#19856 Would like to return `node is Node & { jsDoc: JSDoc[] }` but it causes long compile times
function hasJSDocNodes(node) {
    if (!(0, ts_1.canHaveJSDoc)(node))
        return false;
    var jsDoc = node.jsDoc;
    return !!jsDoc && jsDoc.length > 0;
}
exports.hasJSDocNodes = hasJSDocNodes;
/**
 * True if has type node attached to it.
 *
 * @internal
 */
function hasType(node) {
    return !!node.type;
}
exports.hasType = hasType;
/**
 * True if has initializer node attached to it.
 *
 * @internal
 */
function hasInitializer(node) {
    return !!node.initializer;
}
exports.hasInitializer = hasInitializer;
/** True if has initializer node attached to it. */
function hasOnlyExpressionInitializer(node) {
    switch (node.kind) {
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 168 /* SyntaxKind.Parameter */:
        case 207 /* SyntaxKind.BindingElement */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 302 /* SyntaxKind.PropertyAssignment */:
        case 305 /* SyntaxKind.EnumMember */:
            return true;
        default:
            return false;
    }
}
exports.hasOnlyExpressionInitializer = hasOnlyExpressionInitializer;
function isObjectLiteralElement(node) {
    return node.kind === 290 /* SyntaxKind.JsxAttribute */ || node.kind === 292 /* SyntaxKind.JsxSpreadAttribute */ || isObjectLiteralElementLike(node);
}
exports.isObjectLiteralElement = isObjectLiteralElement;
/** @internal */
function isTypeReferenceType(node) {
    return node.kind === 182 /* SyntaxKind.TypeReference */ || node.kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */;
}
exports.isTypeReferenceType = isTypeReferenceType;
var MAX_SMI_X86 = 1073741823;
/** @internal */
function guessIndentation(lines) {
    var indentation = MAX_SMI_X86;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (!line.length) {
            continue;
        }
        var i = 0;
        for (; i < line.length && i < indentation; i++) {
            if (!(0, ts_1.isWhiteSpaceLike)(line.charCodeAt(i))) {
                break;
            }
        }
        if (i < indentation) {
            indentation = i;
        }
        if (indentation === 0) {
            return 0;
        }
    }
    return indentation === MAX_SMI_X86 ? undefined : indentation;
}
exports.guessIndentation = guessIndentation;
function isStringLiteralLike(node) {
    return node.kind === 11 /* SyntaxKind.StringLiteral */ || node.kind === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */;
}
exports.isStringLiteralLike = isStringLiteralLike;
function isJSDocLinkLike(node) {
    return node.kind === 330 /* SyntaxKind.JSDocLink */ || node.kind === 331 /* SyntaxKind.JSDocLinkCode */ || node.kind === 332 /* SyntaxKind.JSDocLinkPlain */;
}
exports.isJSDocLinkLike = isJSDocLinkLike;
function hasRestParameter(s) {
    var last = (0, ts_1.lastOrUndefined)(s.parameters);
    return !!last && isRestParameter(last);
}
exports.hasRestParameter = hasRestParameter;
function isRestParameter(node) {
    var type = (0, ts_1.isJSDocParameterTag)(node) ? (node.typeExpression && node.typeExpression.type) : node.type;
    return node.dotDotDotToken !== undefined || !!type && type.kind === 324 /* SyntaxKind.JSDocVariadicType */;
}
exports.isRestParameter = isRestParameter;
