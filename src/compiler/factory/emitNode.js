"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentifierGeneratedImportReference = exports.setIdentifierGeneratedImportReference = exports.getIdentifierAutoGenerate = exports.setIdentifierAutoGenerate = exports.getIdentifierTypeArguments = exports.setIdentifierTypeArguments = exports.getTypeNode = exports.setTypeNode = exports.ignoreSourceNewlines = exports.setSnippetElement = exports.getSnippetElement = exports.moveEmitHelpers = exports.getEmitHelpers = exports.removeEmitHelper = exports.addEmitHelpers = exports.addEmitHelper = exports.setConstantValue = exports.getConstantValue = exports.moveSyntheticComments = exports.addSyntheticTrailingComment = exports.setSyntheticTrailingComments = exports.getSyntheticTrailingComments = exports.addSyntheticLeadingComment = exports.setSyntheticLeadingComments = exports.getSyntheticLeadingComments = exports.setCommentRange = exports.getCommentRange = exports.setStartsOnNewLine = exports.getStartsOnNewLine = exports.setTokenSourceMapRange = exports.getTokenSourceMapRange = exports.setSourceMapRange = exports.getSourceMapRange = exports.addInternalEmitFlags = exports.setInternalEmitFlags = exports.addEmitFlags = exports.setEmitFlags = exports.removeAllComments = exports.disposeEmitNodes = exports.getOrCreateEmitNode = void 0;
var ts_1 = require("../_namespaces/ts");
/**
 * Associates a node with the current transformation, initializing
 * various transient transformation properties.
 * @internal
 */
function getOrCreateEmitNode(node) {
    var _a;
    if (!node.emitNode) {
        if ((0, ts_1.isParseTreeNode)(node)) {
            // To avoid holding onto transformation artifacts, we keep track of any
            // parse tree node we are annotating. This allows us to clean them up after
            // all transformations have completed.
            if (node.kind === 311 /* SyntaxKind.SourceFile */) {
                return node.emitNode = { annotatedNodes: [node] };
            }
            var sourceFile = (_a = (0, ts_1.getSourceFileOfNode)((0, ts_1.getParseTreeNode)((0, ts_1.getSourceFileOfNode)(node)))) !== null && _a !== void 0 ? _a : ts_1.Debug.fail("Could not determine parsed source file.");
            getOrCreateEmitNode(sourceFile).annotatedNodes.push(node);
        }
        node.emitNode = {};
    }
    else {
        ts_1.Debug.assert(!(node.emitNode.internalFlags & 8 /* InternalEmitFlags.Immutable */), "Invalid attempt to mutate an immutable node.");
    }
    return node.emitNode;
}
exports.getOrCreateEmitNode = getOrCreateEmitNode;
/**
 * Clears any `EmitNode` entries from parse-tree nodes.
 * @param sourceFile A source file.
 */
function disposeEmitNodes(sourceFile) {
    var _a, _b;
    // During transformation we may need to annotate a parse tree node with transient
    // transformation properties. As parse tree nodes live longer than transformation
    // nodes, we need to make sure we reclaim any memory allocated for custom ranges
    // from these nodes to ensure we do not hold onto entire subtrees just for position
    // information. We also need to reset these nodes to a pre-transformation state
    // for incremental parsing scenarios so that we do not impact later emit.
    var annotatedNodes = (_b = (_a = (0, ts_1.getSourceFileOfNode)((0, ts_1.getParseTreeNode)(sourceFile))) === null || _a === void 0 ? void 0 : _a.emitNode) === null || _b === void 0 ? void 0 : _b.annotatedNodes;
    if (annotatedNodes) {
        for (var _i = 0, annotatedNodes_1 = annotatedNodes; _i < annotatedNodes_1.length; _i++) {
            var node = annotatedNodes_1[_i];
            node.emitNode = undefined;
        }
    }
}
exports.disposeEmitNodes = disposeEmitNodes;
/**
 * Sets `EmitFlags.NoComments` on a node and removes any leading and trailing synthetic comments.
 * @internal
 */
function removeAllComments(node) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.flags |= 3072 /* EmitFlags.NoComments */;
    emitNode.leadingComments = undefined;
    emitNode.trailingComments = undefined;
    return node;
}
exports.removeAllComments = removeAllComments;
/**
 * Sets flags that control emit behavior of a node.
 */
function setEmitFlags(node, emitFlags) {
    getOrCreateEmitNode(node).flags = emitFlags;
    return node;
}
exports.setEmitFlags = setEmitFlags;
/**
 * Sets flags that control emit behavior of a node.
 *
 * @internal
 */
function addEmitFlags(node, emitFlags) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.flags = emitNode.flags | emitFlags;
    return node;
}
exports.addEmitFlags = addEmitFlags;
/**
 * Sets flags that control emit behavior of a node.
 *
 * @internal
 */
function setInternalEmitFlags(node, emitFlags) {
    getOrCreateEmitNode(node).internalFlags = emitFlags;
    return node;
}
exports.setInternalEmitFlags = setInternalEmitFlags;
/**
 * Sets flags that control emit behavior of a node.
 *
 * @internal
 */
function addInternalEmitFlags(node, emitFlags) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.internalFlags = emitNode.internalFlags | emitFlags;
    return node;
}
exports.addInternalEmitFlags = addInternalEmitFlags;
/**
 * Gets a custom text range to use when emitting source maps.
 */
function getSourceMapRange(node) {
    var _a, _b;
    return (_b = (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.sourceMapRange) !== null && _b !== void 0 ? _b : node;
}
exports.getSourceMapRange = getSourceMapRange;
/**
 * Sets a custom text range to use when emitting source maps.
 */
function setSourceMapRange(node, range) {
    getOrCreateEmitNode(node).sourceMapRange = range;
    return node;
}
exports.setSourceMapRange = setSourceMapRange;
/**
 * Gets the TextRange to use for source maps for a token of a node.
 */
function getTokenSourceMapRange(node, token) {
    var _a, _b;
    return (_b = (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.tokenSourceMapRanges) === null || _b === void 0 ? void 0 : _b[token];
}
exports.getTokenSourceMapRange = getTokenSourceMapRange;
/**
 * Sets the TextRange to use for source maps for a token of a node.
 */
function setTokenSourceMapRange(node, token, range) {
    var _a;
    var emitNode = getOrCreateEmitNode(node);
    var tokenSourceMapRanges = (_a = emitNode.tokenSourceMapRanges) !== null && _a !== void 0 ? _a : (emitNode.tokenSourceMapRanges = []);
    tokenSourceMapRanges[token] = range;
    return node;
}
exports.setTokenSourceMapRange = setTokenSourceMapRange;
/**
 * Gets a custom text range to use when emitting comments.
 *
 * @internal
 */
function getStartsOnNewLine(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.startsOnNewLine;
}
exports.getStartsOnNewLine = getStartsOnNewLine;
/**
 * Sets a custom text range to use when emitting comments.
 *
 * @internal
 */
function setStartsOnNewLine(node, newLine) {
    getOrCreateEmitNode(node).startsOnNewLine = newLine;
    return node;
}
exports.setStartsOnNewLine = setStartsOnNewLine;
/**
 * Gets a custom text range to use when emitting comments.
 */
function getCommentRange(node) {
    var _a, _b;
    return (_b = (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.commentRange) !== null && _b !== void 0 ? _b : node;
}
exports.getCommentRange = getCommentRange;
/**
 * Sets a custom text range to use when emitting comments.
 */
function setCommentRange(node, range) {
    getOrCreateEmitNode(node).commentRange = range;
    return node;
}
exports.setCommentRange = setCommentRange;
function getSyntheticLeadingComments(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.leadingComments;
}
exports.getSyntheticLeadingComments = getSyntheticLeadingComments;
function setSyntheticLeadingComments(node, comments) {
    getOrCreateEmitNode(node).leadingComments = comments;
    return node;
}
exports.setSyntheticLeadingComments = setSyntheticLeadingComments;
function addSyntheticLeadingComment(node, kind, text, hasTrailingNewLine) {
    return setSyntheticLeadingComments(node, (0, ts_1.append)(getSyntheticLeadingComments(node), { kind: kind, pos: -1, end: -1, hasTrailingNewLine: hasTrailingNewLine, text: text }));
}
exports.addSyntheticLeadingComment = addSyntheticLeadingComment;
function getSyntheticTrailingComments(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.trailingComments;
}
exports.getSyntheticTrailingComments = getSyntheticTrailingComments;
function setSyntheticTrailingComments(node, comments) {
    getOrCreateEmitNode(node).trailingComments = comments;
    return node;
}
exports.setSyntheticTrailingComments = setSyntheticTrailingComments;
function addSyntheticTrailingComment(node, kind, text, hasTrailingNewLine) {
    return setSyntheticTrailingComments(node, (0, ts_1.append)(getSyntheticTrailingComments(node), { kind: kind, pos: -1, end: -1, hasTrailingNewLine: hasTrailingNewLine, text: text }));
}
exports.addSyntheticTrailingComment = addSyntheticTrailingComment;
function moveSyntheticComments(node, original) {
    setSyntheticLeadingComments(node, getSyntheticLeadingComments(original));
    setSyntheticTrailingComments(node, getSyntheticTrailingComments(original));
    var emit = getOrCreateEmitNode(original);
    emit.leadingComments = undefined;
    emit.trailingComments = undefined;
    return node;
}
exports.moveSyntheticComments = moveSyntheticComments;
/**
 * Gets the constant value to emit for an expression representing an enum.
 */
function getConstantValue(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.constantValue;
}
exports.getConstantValue = getConstantValue;
/**
 * Sets the constant value to emit for an expression.
 */
function setConstantValue(node, value) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.constantValue = value;
    return node;
}
exports.setConstantValue = setConstantValue;
/**
 * Adds an EmitHelper to a node.
 */
function addEmitHelper(node, helper) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.helpers = (0, ts_1.append)(emitNode.helpers, helper);
    return node;
}
exports.addEmitHelper = addEmitHelper;
/**
 * Add EmitHelpers to a node.
 */
function addEmitHelpers(node, helpers) {
    if ((0, ts_1.some)(helpers)) {
        var emitNode = getOrCreateEmitNode(node);
        for (var _i = 0, helpers_1 = helpers; _i < helpers_1.length; _i++) {
            var helper = helpers_1[_i];
            emitNode.helpers = (0, ts_1.appendIfUnique)(emitNode.helpers, helper);
        }
    }
    return node;
}
exports.addEmitHelpers = addEmitHelpers;
/**
 * Removes an EmitHelper from a node.
 */
function removeEmitHelper(node, helper) {
    var _a;
    var helpers = (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.helpers;
    if (helpers) {
        return (0, ts_1.orderedRemoveItem)(helpers, helper);
    }
    return false;
}
exports.removeEmitHelper = removeEmitHelper;
/**
 * Gets the EmitHelpers of a node.
 */
function getEmitHelpers(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.helpers;
}
exports.getEmitHelpers = getEmitHelpers;
/**
 * Moves matching emit helpers from a source node to a target node.
 */
function moveEmitHelpers(source, target, predicate) {
    var sourceEmitNode = source.emitNode;
    var sourceEmitHelpers = sourceEmitNode && sourceEmitNode.helpers;
    if (!(0, ts_1.some)(sourceEmitHelpers))
        return;
    var targetEmitNode = getOrCreateEmitNode(target);
    var helpersRemoved = 0;
    for (var i = 0; i < sourceEmitHelpers.length; i++) {
        var helper = sourceEmitHelpers[i];
        if (predicate(helper)) {
            helpersRemoved++;
            targetEmitNode.helpers = (0, ts_1.appendIfUnique)(targetEmitNode.helpers, helper);
        }
        else if (helpersRemoved > 0) {
            sourceEmitHelpers[i - helpersRemoved] = helper;
        }
    }
    if (helpersRemoved > 0) {
        sourceEmitHelpers.length -= helpersRemoved;
    }
}
exports.moveEmitHelpers = moveEmitHelpers;
/**
 * Gets the SnippetElement of a node.
 *
 * @internal
 */
function getSnippetElement(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.snippetElement;
}
exports.getSnippetElement = getSnippetElement;
/**
 * Sets the SnippetElement of a node.
 *
 * @internal
 */
function setSnippetElement(node, snippet) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.snippetElement = snippet;
    return node;
}
exports.setSnippetElement = setSnippetElement;
/** @internal */
function ignoreSourceNewlines(node) {
    getOrCreateEmitNode(node).internalFlags |= 4 /* InternalEmitFlags.IgnoreSourceNewlines */;
    return node;
}
exports.ignoreSourceNewlines = ignoreSourceNewlines;
/** @internal */
function setTypeNode(node, type) {
    var emitNode = getOrCreateEmitNode(node);
    emitNode.typeNode = type;
    return node;
}
exports.setTypeNode = setTypeNode;
/** @internal */
function getTypeNode(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.typeNode;
}
exports.getTypeNode = getTypeNode;
/** @internal */
function setIdentifierTypeArguments(node, typeArguments) {
    getOrCreateEmitNode(node).identifierTypeArguments = typeArguments;
    return node;
}
exports.setIdentifierTypeArguments = setIdentifierTypeArguments;
/** @internal */
function getIdentifierTypeArguments(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.identifierTypeArguments;
}
exports.getIdentifierTypeArguments = getIdentifierTypeArguments;
/** @internal */
function setIdentifierAutoGenerate(node, autoGenerate) {
    getOrCreateEmitNode(node).autoGenerate = autoGenerate;
    return node;
}
exports.setIdentifierAutoGenerate = setIdentifierAutoGenerate;
/** @internal */
function getIdentifierAutoGenerate(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.autoGenerate;
}
exports.getIdentifierAutoGenerate = getIdentifierAutoGenerate;
/** @internal */
function setIdentifierGeneratedImportReference(node, value) {
    getOrCreateEmitNode(node).generatedImportReference = value;
    return node;
}
exports.setIdentifierGeneratedImportReference = setIdentifierGeneratedImportReference;
/** @internal */
function getIdentifierGeneratedImportReference(node) {
    var _a;
    return (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.generatedImportReference;
}
exports.getIdentifierGeneratedImportReference = getIdentifierGeneratedImportReference;
