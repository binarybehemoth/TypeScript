"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsx = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformJsx(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory;
    var compilerOptions = context.getCompilerOptions();
    var currentSourceFile;
    var currentFileState;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function getCurrentFileNameExpression() {
        if (currentFileState.filenameDeclaration) {
            return currentFileState.filenameDeclaration.name;
        }
        var declaration = factory.createVariableDeclaration(factory.createUniqueName("_jsxFileName", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), /*exclamationToken*/ undefined, /*type*/ undefined, factory.createStringLiteral(currentSourceFile.fileName));
        currentFileState.filenameDeclaration = declaration;
        return currentFileState.filenameDeclaration.name;
    }
    function getJsxFactoryCalleePrimitive(isStaticChildren) {
        return compilerOptions.jsx === 5 /* JsxEmit.ReactJSXDev */ ? "jsxDEV" : isStaticChildren ? "jsxs" : "jsx";
    }
    function getJsxFactoryCallee(isStaticChildren) {
        var type = getJsxFactoryCalleePrimitive(isStaticChildren);
        return getImplicitImportForName(type);
    }
    function getImplicitJsxFragmentReference() {
        return getImplicitImportForName("Fragment");
    }
    function getImplicitImportForName(name) {
        var _a, _b;
        var importSource = name === "createElement"
            ? currentFileState.importSpecifier
            : (0, ts_1.getJSXRuntimeImport)(currentFileState.importSpecifier, compilerOptions);
        var existing = (_b = (_a = currentFileState.utilizedImplicitRuntimeImports) === null || _a === void 0 ? void 0 : _a.get(importSource)) === null || _b === void 0 ? void 0 : _b.get(name);
        if (existing) {
            return existing.name;
        }
        if (!currentFileState.utilizedImplicitRuntimeImports) {
            currentFileState.utilizedImplicitRuntimeImports = new Map();
        }
        var specifierSourceImports = currentFileState.utilizedImplicitRuntimeImports.get(importSource);
        if (!specifierSourceImports) {
            specifierSourceImports = new Map();
            currentFileState.utilizedImplicitRuntimeImports.set(importSource, specifierSourceImports);
        }
        var generatedName = factory.createUniqueName("_".concat(name), 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */ | 64 /* GeneratedIdentifierFlags.AllowNameSubstitution */);
        var specifier = factory.createImportSpecifier(/*isTypeOnly*/ false, factory.createIdentifier(name), generatedName);
        (0, ts_1.setIdentifierGeneratedImportReference)(generatedName, specifier);
        specifierSourceImports.set(name, specifier);
        return generatedName;
    }
    /**
     * Transform JSX-specific syntax in a SourceFile.
     *
     * @param node A SourceFile node.
     */
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        currentSourceFile = node;
        currentFileState = {};
        currentFileState.importSpecifier = (0, ts_1.getJSXImplicitImportBase)(compilerOptions, node);
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        var statements = visited.statements;
        if (currentFileState.filenameDeclaration) {
            statements = (0, ts_1.insertStatementAfterCustomPrologue)(statements.slice(), factory.createVariableStatement(/*modifiers*/ undefined, factory.createVariableDeclarationList([currentFileState.filenameDeclaration], 2 /* NodeFlags.Const */)));
        }
        if (currentFileState.utilizedImplicitRuntimeImports) {
            for (var _i = 0, _a = (0, ts_1.arrayFrom)(currentFileState.utilizedImplicitRuntimeImports.entries()); _i < _a.length; _i++) {
                var _b = _a[_i], importSource = _b[0], importSpecifiersMap = _b[1];
                if ((0, ts_1.isExternalModule)(node)) {
                    // Add `import` statement
                    var importStatement = factory.createImportDeclaration(/*modifiers*/ undefined, factory.createImportClause(/*isTypeOnly*/ false, /*name*/ undefined, factory.createNamedImports((0, ts_1.arrayFrom)(importSpecifiersMap.values()))), factory.createStringLiteral(importSource), /*assertClause*/ undefined);
                    (0, ts_1.setParentRecursive)(importStatement, /*incremental*/ false);
                    statements = (0, ts_1.insertStatementAfterCustomPrologue)(statements.slice(), importStatement);
                }
                else if ((0, ts_1.isExternalOrCommonJsModule)(node)) {
                    // Add `require` statement
                    var requireStatement = factory.createVariableStatement(/*modifiers*/ undefined, factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(factory.createObjectBindingPattern((0, ts_1.arrayFrom)(importSpecifiersMap.values(), function (s) { return factory.createBindingElement(/*dotDotDotToken*/ undefined, s.propertyName, s.name); })), 
                        /*exclamationToken*/ undefined, 
                        /*type*/ undefined, factory.createCallExpression(factory.createIdentifier("require"), /*typeArguments*/ undefined, [factory.createStringLiteral(importSource)]))
                    ], 2 /* NodeFlags.Const */));
                    (0, ts_1.setParentRecursive)(requireStatement, /*incremental*/ false);
                    statements = (0, ts_1.insertStatementAfterCustomPrologue)(statements.slice(), requireStatement);
                }
                else {
                    // Do nothing (script file) - consider an error in the checker?
                }
            }
        }
        if (statements !== visited.statements) {
            visited = factory.updateSourceFile(visited, statements);
        }
        currentFileState = undefined;
        return visited;
    }
    function visitor(node) {
        if (node.transformFlags & 2 /* TransformFlags.ContainsJsx */) {
            return visitorWorker(node);
        }
        else {
            return node;
        }
    }
    function visitorWorker(node) {
        switch (node.kind) {
            case 283 /* SyntaxKind.JsxElement */:
                return visitJsxElement(node, /*isChild*/ false);
            case 284 /* SyntaxKind.JsxSelfClosingElement */:
                return visitJsxSelfClosingElement(node, /*isChild*/ false);
            case 287 /* SyntaxKind.JsxFragment */:
                return visitJsxFragment(node, /*isChild*/ false);
            case 293 /* SyntaxKind.JsxExpression */:
                return visitJsxExpression(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function transformJsxChildToExpression(node) {
        switch (node.kind) {
            case 12 /* SyntaxKind.JsxText */:
                return visitJsxText(node);
            case 293 /* SyntaxKind.JsxExpression */:
                return visitJsxExpression(node);
            case 283 /* SyntaxKind.JsxElement */:
                return visitJsxElement(node, /*isChild*/ true);
            case 284 /* SyntaxKind.JsxSelfClosingElement */:
                return visitJsxSelfClosingElement(node, /*isChild*/ true);
            case 287 /* SyntaxKind.JsxFragment */:
                return visitJsxFragment(node, /*isChild*/ true);
            default:
                return ts_1.Debug.failBadSyntaxKind(node);
        }
    }
    function hasProto(obj) {
        return obj.properties.some(function (p) { return (0, ts_1.isPropertyAssignment)(p) &&
            ((0, ts_1.isIdentifier)(p.name) && (0, ts_1.idText)(p.name) === "__proto__" || (0, ts_1.isStringLiteral)(p.name) && p.name.text === "__proto__"); });
    }
    /**
     * The react jsx/jsxs transform falls back to `createElement` when an explicit `key` argument comes after a spread
     */
    function hasKeyAfterPropsSpread(node) {
        var spread = false;
        for (var _i = 0, _a = node.attributes.properties; _i < _a.length; _i++) {
            var elem = _a[_i];
            if ((0, ts_1.isJsxSpreadAttribute)(elem) && (!(0, ts_1.isObjectLiteralExpression)(elem.expression) || elem.expression.properties.some(ts_1.isSpreadAssignment))) {
                spread = true;
            }
            else if (spread && (0, ts_1.isJsxAttribute)(elem) && (0, ts_1.isIdentifier)(elem.name) && elem.name.escapedText === "key") {
                return true;
            }
        }
        return false;
    }
    function shouldUseCreateElement(node) {
        return currentFileState.importSpecifier === undefined || hasKeyAfterPropsSpread(node);
    }
    function visitJsxElement(node, isChild) {
        var tagTransform = shouldUseCreateElement(node.openingElement) ? visitJsxOpeningLikeElementCreateElement : visitJsxOpeningLikeElementJSX;
        return tagTransform(node.openingElement, node.children, isChild, /*location*/ node);
    }
    function visitJsxSelfClosingElement(node, isChild) {
        var tagTransform = shouldUseCreateElement(node) ? visitJsxOpeningLikeElementCreateElement : visitJsxOpeningLikeElementJSX;
        return tagTransform(node, /*children*/ undefined, isChild, /*location*/ node);
    }
    function visitJsxFragment(node, isChild) {
        var tagTransform = currentFileState.importSpecifier === undefined ? visitJsxOpeningFragmentCreateElement : visitJsxOpeningFragmentJSX;
        return tagTransform(node.openingFragment, node.children, isChild, /*location*/ node);
    }
    function convertJsxChildrenToChildrenPropObject(children) {
        var prop = convertJsxChildrenToChildrenPropAssignment(children);
        return prop && factory.createObjectLiteralExpression([prop]);
    }
    function convertJsxChildrenToChildrenPropAssignment(children) {
        var nonWhitespaceChildren = (0, ts_1.getSemanticJsxChildren)(children);
        if ((0, ts_1.length)(nonWhitespaceChildren) === 1 && !nonWhitespaceChildren[0].dotDotDotToken) {
            var result_1 = transformJsxChildToExpression(nonWhitespaceChildren[0]);
            return result_1 && factory.createPropertyAssignment("children", result_1);
        }
        var result = (0, ts_1.mapDefined)(children, transformJsxChildToExpression);
        return (0, ts_1.length)(result) ? factory.createPropertyAssignment("children", factory.createArrayLiteralExpression(result)) : undefined;
    }
    function visitJsxOpeningLikeElementJSX(node, children, isChild, location) {
        var tagName = getTagName(node);
        var childrenProp = children && children.length ? convertJsxChildrenToChildrenPropAssignment(children) : undefined;
        var keyAttr = (0, ts_1.find)(node.attributes.properties, function (p) { return !!p.name && (0, ts_1.isIdentifier)(p.name) && p.name.escapedText === "key"; });
        var attrs = keyAttr ? (0, ts_1.filter)(node.attributes.properties, function (p) { return p !== keyAttr; }) : node.attributes.properties;
        var objectProperties = (0, ts_1.length)(attrs) ? transformJsxAttributesToObjectProps(attrs, childrenProp) :
            factory.createObjectLiteralExpression(childrenProp ? [childrenProp] : ts_1.emptyArray); // When there are no attributes, React wants {}
        return visitJsxOpeningLikeElementOrFragmentJSX(tagName, objectProperties, keyAttr, children || ts_1.emptyArray, isChild, location);
    }
    function visitJsxOpeningLikeElementOrFragmentJSX(tagName, objectProperties, keyAttr, children, isChild, location) {
        var _a;
        var nonWhitespaceChildren = (0, ts_1.getSemanticJsxChildren)(children);
        var isStaticChildren = (0, ts_1.length)(nonWhitespaceChildren) > 1 || !!((_a = nonWhitespaceChildren[0]) === null || _a === void 0 ? void 0 : _a.dotDotDotToken);
        var args = [tagName, objectProperties];
        // function jsx(type, config, maybeKey) {}
        // "maybeKey" is optional. It is acceptable to use "_jsx" without a third argument
        if (keyAttr) {
            args.push(transformJsxAttributeInitializer(keyAttr.initializer));
        }
        if (compilerOptions.jsx === 5 /* JsxEmit.ReactJSXDev */) {
            var originalFile = (0, ts_1.getOriginalNode)(currentSourceFile);
            if (originalFile && (0, ts_1.isSourceFile)(originalFile)) {
                // "maybeKey" has to be replaced with "void 0" to not break the jsxDEV signature
                if (keyAttr === undefined) {
                    args.push(factory.createVoidZero());
                }
                // isStaticChildren development flag
                args.push(isStaticChildren ? factory.createTrue() : factory.createFalse());
                // __source development flag
                var lineCol = (0, ts_1.getLineAndCharacterOfPosition)(originalFile, location.pos);
                args.push(factory.createObjectLiteralExpression([
                    factory.createPropertyAssignment("fileName", getCurrentFileNameExpression()),
                    factory.createPropertyAssignment("lineNumber", factory.createNumericLiteral(lineCol.line + 1)),
                    factory.createPropertyAssignment("columnNumber", factory.createNumericLiteral(lineCol.character + 1))
                ]));
                // __self development flag
                args.push(factory.createThis());
            }
        }
        var element = (0, ts_1.setTextRange)(factory.createCallExpression(getJsxFactoryCallee(isStaticChildren), /*typeArguments*/ undefined, args), location);
        if (isChild) {
            (0, ts_1.startOnNewLine)(element);
        }
        return element;
    }
    function visitJsxOpeningLikeElementCreateElement(node, children, isChild, location) {
        var tagName = getTagName(node);
        var attrs = node.attributes.properties;
        var objectProperties = (0, ts_1.length)(attrs) ? transformJsxAttributesToObjectProps(attrs) :
            factory.createNull(); // When there are no attributes, React wants "null"
        var callee = currentFileState.importSpecifier === undefined
            ? (0, ts_1.createJsxFactoryExpression)(factory, context.getEmitResolver().getJsxFactoryEntity(currentSourceFile), compilerOptions.reactNamespace, // TODO: GH#18217
            node)
            : getImplicitImportForName("createElement");
        var element = (0, ts_1.createExpressionForJsxElement)(factory, callee, tagName, objectProperties, (0, ts_1.mapDefined)(children, transformJsxChildToExpression), location);
        if (isChild) {
            (0, ts_1.startOnNewLine)(element);
        }
        return element;
    }
    function visitJsxOpeningFragmentJSX(_node, children, isChild, location) {
        var childrenProps;
        if (children && children.length) {
            var result = convertJsxChildrenToChildrenPropObject(children);
            if (result) {
                childrenProps = result;
            }
        }
        return visitJsxOpeningLikeElementOrFragmentJSX(getImplicitJsxFragmentReference(), childrenProps || factory.createObjectLiteralExpression([]), 
        /*keyAttr*/ undefined, children, isChild, location);
    }
    function visitJsxOpeningFragmentCreateElement(node, children, isChild, location) {
        var element = (0, ts_1.createExpressionForJsxFragment)(factory, context.getEmitResolver().getJsxFactoryEntity(currentSourceFile), context.getEmitResolver().getJsxFragmentFactoryEntity(currentSourceFile), compilerOptions.reactNamespace, // TODO: GH#18217
        (0, ts_1.mapDefined)(children, transformJsxChildToExpression), node, location);
        if (isChild) {
            (0, ts_1.startOnNewLine)(element);
        }
        return element;
    }
    function transformJsxSpreadAttributeToProps(node) {
        if ((0, ts_1.isObjectLiteralExpression)(node.expression) && !hasProto(node.expression)) {
            return node.expression.properties;
        }
        return factory.createSpreadAssignment(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
    }
    function transformJsxAttributesToObjectProps(attrs, children) {
        var target = (0, ts_1.getEmitScriptTarget)(compilerOptions);
        return target && target >= 5 /* ScriptTarget.ES2018 */ ? factory.createObjectLiteralExpression(transformJsxAttributesToProps(attrs, children)) :
            transformJsxAttributesToExpression(attrs, children);
    }
    function transformJsxAttributesToProps(attrs, children) {
        var props = (0, ts_1.flatten)((0, ts_1.spanMap)(attrs, ts_1.isJsxSpreadAttribute, function (attrs, isSpread) {
            return (0, ts_1.flatten)((0, ts_1.map)(attrs, function (attr) { return isSpread ? transformJsxSpreadAttributeToProps(attr) : transformJsxAttributeToObjectLiteralElement(attr); }));
        }));
        if (children) {
            props.push(children);
        }
        return props;
    }
    function transformJsxAttributesToExpression(attrs, children) {
        var expressions = [];
        var properties = [];
        for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
            var attr = attrs_1[_i];
            if ((0, ts_1.isJsxSpreadAttribute)(attr)) {
                // as an optimization we try to flatten the first level of spread inline object
                // as if its props would be passed as JSX attributes
                if ((0, ts_1.isObjectLiteralExpression)(attr.expression) && !hasProto(attr.expression)) {
                    for (var _a = 0, _b = attr.expression.properties; _a < _b.length; _a++) {
                        var prop = _b[_a];
                        if ((0, ts_1.isSpreadAssignment)(prop)) {
                            finishObjectLiteralIfNeeded();
                            expressions.push(prop.expression);
                            continue;
                        }
                        properties.push(prop);
                    }
                    continue;
                }
                finishObjectLiteralIfNeeded();
                expressions.push(ts_1.Debug.checkDefined((0, ts_1.visitNode)(attr.expression, visitor, ts_1.isExpression)));
                continue;
            }
            properties.push(transformJsxAttributeToObjectLiteralElement(attr));
        }
        if (children) {
            properties.push(children);
        }
        finishObjectLiteralIfNeeded();
        if (expressions.length && !(0, ts_1.isObjectLiteralExpression)(expressions[0])) {
            // We must always emit at least one object literal before a spread attribute
            // as the JSX always factory expects a fresh object, so we need to make a copy here
            // we also avoid mutating an external reference by doing this (first expression is used as assign's target)
            expressions.unshift(factory.createObjectLiteralExpression());
        }
        return (0, ts_1.singleOrUndefined)(expressions) || emitHelpers().createAssignHelper(expressions);
        function finishObjectLiteralIfNeeded() {
            if (properties.length) {
                expressions.push(factory.createObjectLiteralExpression(properties));
                properties = [];
            }
        }
    }
    function transformJsxAttributeToObjectLiteralElement(node) {
        var name = getAttributeName(node);
        var expression = transformJsxAttributeInitializer(node.initializer);
        return factory.createPropertyAssignment(name, expression);
    }
    function transformJsxAttributeInitializer(node) {
        if (node === undefined) {
            return factory.createTrue();
        }
        if (node.kind === 11 /* SyntaxKind.StringLiteral */) {
            // Always recreate the literal to escape any escape sequences or newlines which may be in the original jsx string and which
            // Need to be escaped to be handled correctly in a normal string
            var singleQuote = node.singleQuote !== undefined ? node.singleQuote : !(0, ts_1.isStringDoubleQuoted)(node, currentSourceFile);
            var literal = factory.createStringLiteral(tryDecodeEntities(node.text) || node.text, singleQuote);
            return (0, ts_1.setTextRange)(literal, node);
        }
        if (node.kind === 293 /* SyntaxKind.JsxExpression */) {
            if (node.expression === undefined) {
                return factory.createTrue();
            }
            return ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression));
        }
        if ((0, ts_1.isJsxElement)(node)) {
            return visitJsxElement(node, /*isChild*/ false);
        }
        if ((0, ts_1.isJsxSelfClosingElement)(node)) {
            return visitJsxSelfClosingElement(node, /*isChild*/ false);
        }
        if ((0, ts_1.isJsxFragment)(node)) {
            return visitJsxFragment(node, /*isChild*/ false);
        }
        return ts_1.Debug.failBadSyntaxKind(node);
    }
    function visitJsxText(node) {
        var fixed = fixupWhitespaceAndDecodeEntities(node.text);
        return fixed === undefined ? undefined : factory.createStringLiteral(fixed);
    }
    /**
     * JSX trims whitespace at the end and beginning of lines, except that the
     * start/end of a tag is considered a start/end of a line only if that line is
     * on the same line as the closing tag. See examples in
     * tests/cases/conformance/jsx/tsxReactEmitWhitespace.tsx
     * See also https://www.w3.org/TR/html4/struct/text.html#h-9.1 and https://www.w3.org/TR/CSS2/text.html#white-space-model
     *
     * An equivalent algorithm would be:
     * - If there is only one line, return it.
     * - If there is only whitespace (but multiple lines), return `undefined`.
     * - Split the text into lines.
     * - 'trimRight' the first line, 'trimLeft' the last line, 'trim' middle lines.
     * - Decode entities on each line (individually).
     * - Remove empty lines and join the rest with " ".
     */
    function fixupWhitespaceAndDecodeEntities(text) {
        var acc;
        // First non-whitespace character on this line.
        var firstNonWhitespace = 0;
        // Last non-whitespace character on this line.
        var lastNonWhitespace = -1;
        // These initial values are special because the first line is:
        // firstNonWhitespace = 0 to indicate that we want leading whitsepace,
        // but lastNonWhitespace = -1 as a special flag to indicate that we *don't* include the line if it's all whitespace.
        for (var i = 0; i < text.length; i++) {
            var c = text.charCodeAt(i);
            if ((0, ts_1.isLineBreak)(c)) {
                // If we've seen any non-whitespace characters on this line, add the 'trim' of the line.
                // (lastNonWhitespace === -1 is a special flag to detect whether the first line is all whitespace.)
                if (firstNonWhitespace !== -1 && lastNonWhitespace !== -1) {
                    acc = addLineOfJsxText(acc, text.substr(firstNonWhitespace, lastNonWhitespace - firstNonWhitespace + 1));
                }
                // Reset firstNonWhitespace for the next line.
                // Don't bother to reset lastNonWhitespace because we ignore it if firstNonWhitespace = -1.
                firstNonWhitespace = -1;
            }
            else if (!(0, ts_1.isWhiteSpaceSingleLine)(c)) {
                lastNonWhitespace = i;
                if (firstNonWhitespace === -1) {
                    firstNonWhitespace = i;
                }
            }
        }
        return firstNonWhitespace !== -1
            // Last line had a non-whitespace character. Emit the 'trimLeft', meaning keep trailing whitespace.
            ? addLineOfJsxText(acc, text.substr(firstNonWhitespace))
            // Last line was all whitespace, so ignore it
            : acc;
    }
    function addLineOfJsxText(acc, trimmedLine) {
        // We do not escape the string here as that is handled by the printer
        // when it emits the literal. We do, however, need to decode JSX entities.
        var decoded = decodeEntities(trimmedLine);
        return acc === undefined ? decoded : acc + " " + decoded;
    }
    /**
     * Replace entities like "&nbsp;", "&#123;", and "&#xDEADBEEF;" with the characters they encode.
     * See https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references
     */
    function decodeEntities(text) {
        return text.replace(/&((#((\d+)|x([\da-fA-F]+)))|(\w+));/g, function (match, _all, _number, _digits, decimal, hex, word) {
            if (decimal) {
                return (0, ts_1.utf16EncodeAsString)(parseInt(decimal, 10));
            }
            else if (hex) {
                return (0, ts_1.utf16EncodeAsString)(parseInt(hex, 16));
            }
            else {
                var ch = entities.get(word);
                // If this is not a valid entity, then just use `match` (replace it with itself, i.e. don't replace)
                return ch ? (0, ts_1.utf16EncodeAsString)(ch) : match;
            }
        });
    }
    /** Like `decodeEntities` but returns `undefined` if there were no entities to decode. */
    function tryDecodeEntities(text) {
        var decoded = decodeEntities(text);
        return decoded === text ? undefined : decoded;
    }
    function getTagName(node) {
        if (node.kind === 283 /* SyntaxKind.JsxElement */) {
            return getTagName(node.openingElement);
        }
        else {
            var tagName = node.tagName;
            if ((0, ts_1.isIdentifier)(tagName) && (0, ts_1.isIntrinsicJsxName)(tagName.escapedText)) {
                return factory.createStringLiteral((0, ts_1.idText)(tagName));
            }
            else if ((0, ts_1.isJsxNamespacedName)(tagName)) {
                return factory.createStringLiteral((0, ts_1.idText)(tagName.namespace) + ":" + (0, ts_1.idText)(tagName.name));
            }
            else {
                return (0, ts_1.createExpressionFromEntityName)(factory, tagName);
            }
        }
    }
    /**
     * Emit an attribute name, which is quoted if it needs to be quoted. Because
     * these emit into an object literal property name, we don't need to be worried
     * about keywords, just non-identifier characters
     */
    function getAttributeName(node) {
        var name = node.name;
        if ((0, ts_1.isIdentifier)(name)) {
            var text = (0, ts_1.idText)(name);
            return (/^[A-Za-z_]\w*$/.test(text)) ? name : factory.createStringLiteral(text);
        }
        return factory.createStringLiteral((0, ts_1.idText)(name.namespace) + ":" + (0, ts_1.idText)(name.name));
    }
    function visitJsxExpression(node) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        return node.dotDotDotToken ? factory.createSpreadElement(expression) : expression;
    }
}
exports.transformJsx = transformJsx;
var entities = new Map(Object.entries({
    quot: 0x0022,
    amp: 0x0026,
    apos: 0x0027,
    lt: 0x003C,
    gt: 0x003E,
    nbsp: 0x00A0,
    iexcl: 0x00A1,
    cent: 0x00A2,
    pound: 0x00A3,
    curren: 0x00A4,
    yen: 0x00A5,
    brvbar: 0x00A6,
    sect: 0x00A7,
    uml: 0x00A8,
    copy: 0x00A9,
    ordf: 0x00AA,
    laquo: 0x00AB,
    not: 0x00AC,
    shy: 0x00AD,
    reg: 0x00AE,
    macr: 0x00AF,
    deg: 0x00B0,
    plusmn: 0x00B1,
    sup2: 0x00B2,
    sup3: 0x00B3,
    acute: 0x00B4,
    micro: 0x00B5,
    para: 0x00B6,
    middot: 0x00B7,
    cedil: 0x00B8,
    sup1: 0x00B9,
    ordm: 0x00BA,
    raquo: 0x00BB,
    frac14: 0x00BC,
    frac12: 0x00BD,
    frac34: 0x00BE,
    iquest: 0x00BF,
    Agrave: 0x00C0,
    Aacute: 0x00C1,
    Acirc: 0x00C2,
    Atilde: 0x00C3,
    Auml: 0x00C4,
    Aring: 0x00C5,
    AElig: 0x00C6,
    Ccedil: 0x00C7,
    Egrave: 0x00C8,
    Eacute: 0x00C9,
    Ecirc: 0x00CA,
    Euml: 0x00CB,
    Igrave: 0x00CC,
    Iacute: 0x00CD,
    Icirc: 0x00CE,
    Iuml: 0x00CF,
    ETH: 0x00D0,
    Ntilde: 0x00D1,
    Ograve: 0x00D2,
    Oacute: 0x00D3,
    Ocirc: 0x00D4,
    Otilde: 0x00D5,
    Ouml: 0x00D6,
    times: 0x00D7,
    Oslash: 0x00D8,
    Ugrave: 0x00D9,
    Uacute: 0x00DA,
    Ucirc: 0x00DB,
    Uuml: 0x00DC,
    Yacute: 0x00DD,
    THORN: 0x00DE,
    szlig: 0x00DF,
    agrave: 0x00E0,
    aacute: 0x00E1,
    acirc: 0x00E2,
    atilde: 0x00E3,
    auml: 0x00E4,
    aring: 0x00E5,
    aelig: 0x00E6,
    ccedil: 0x00E7,
    egrave: 0x00E8,
    eacute: 0x00E9,
    ecirc: 0x00EA,
    euml: 0x00EB,
    igrave: 0x00EC,
    iacute: 0x00ED,
    icirc: 0x00EE,
    iuml: 0x00EF,
    eth: 0x00F0,
    ntilde: 0x00F1,
    ograve: 0x00F2,
    oacute: 0x00F3,
    ocirc: 0x00F4,
    otilde: 0x00F5,
    ouml: 0x00F6,
    divide: 0x00F7,
    oslash: 0x00F8,
    ugrave: 0x00F9,
    uacute: 0x00FA,
    ucirc: 0x00FB,
    uuml: 0x00FC,
    yacute: 0x00FD,
    thorn: 0x00FE,
    yuml: 0x00FF,
    OElig: 0x0152,
    oelig: 0x0153,
    Scaron: 0x0160,
    scaron: 0x0161,
    Yuml: 0x0178,
    fnof: 0x0192,
    circ: 0x02C6,
    tilde: 0x02DC,
    Alpha: 0x0391,
    Beta: 0x0392,
    Gamma: 0x0393,
    Delta: 0x0394,
    Epsilon: 0x0395,
    Zeta: 0x0396,
    Eta: 0x0397,
    Theta: 0x0398,
    Iota: 0x0399,
    Kappa: 0x039A,
    Lambda: 0x039B,
    Mu: 0x039C,
    Nu: 0x039D,
    Xi: 0x039E,
    Omicron: 0x039F,
    Pi: 0x03A0,
    Rho: 0x03A1,
    Sigma: 0x03A3,
    Tau: 0x03A4,
    Upsilon: 0x03A5,
    Phi: 0x03A6,
    Chi: 0x03A7,
    Psi: 0x03A8,
    Omega: 0x03A9,
    alpha: 0x03B1,
    beta: 0x03B2,
    gamma: 0x03B3,
    delta: 0x03B4,
    epsilon: 0x03B5,
    zeta: 0x03B6,
    eta: 0x03B7,
    theta: 0x03B8,
    iota: 0x03B9,
    kappa: 0x03BA,
    lambda: 0x03BB,
    mu: 0x03BC,
    nu: 0x03BD,
    xi: 0x03BE,
    omicron: 0x03BF,
    pi: 0x03C0,
    rho: 0x03C1,
    sigmaf: 0x03C2,
    sigma: 0x03C3,
    tau: 0x03C4,
    upsilon: 0x03C5,
    phi: 0x03C6,
    chi: 0x03C7,
    psi: 0x03C8,
    omega: 0x03C9,
    thetasym: 0x03D1,
    upsih: 0x03D2,
    piv: 0x03D6,
    ensp: 0x2002,
    emsp: 0x2003,
    thinsp: 0x2009,
    zwnj: 0x200C,
    zwj: 0x200D,
    lrm: 0x200E,
    rlm: 0x200F,
    ndash: 0x2013,
    mdash: 0x2014,
    lsquo: 0x2018,
    rsquo: 0x2019,
    sbquo: 0x201A,
    ldquo: 0x201C,
    rdquo: 0x201D,
    bdquo: 0x201E,
    dagger: 0x2020,
    Dagger: 0x2021,
    bull: 0x2022,
    hellip: 0x2026,
    permil: 0x2030,
    prime: 0x2032,
    Prime: 0x2033,
    lsaquo: 0x2039,
    rsaquo: 0x203A,
    oline: 0x203E,
    frasl: 0x2044,
    euro: 0x20AC,
    image: 0x2111,
    weierp: 0x2118,
    real: 0x211C,
    trade: 0x2122,
    alefsym: 0x2135,
    larr: 0x2190,
    uarr: 0x2191,
    rarr: 0x2192,
    darr: 0x2193,
    harr: 0x2194,
    crarr: 0x21B5,
    lArr: 0x21D0,
    uArr: 0x21D1,
    rArr: 0x21D2,
    dArr: 0x21D3,
    hArr: 0x21D4,
    forall: 0x2200,
    part: 0x2202,
    exist: 0x2203,
    empty: 0x2205,
    nabla: 0x2207,
    isin: 0x2208,
    notin: 0x2209,
    ni: 0x220B,
    prod: 0x220F,
    sum: 0x2211,
    minus: 0x2212,
    lowast: 0x2217,
    radic: 0x221A,
    prop: 0x221D,
    infin: 0x221E,
    ang: 0x2220,
    and: 0x2227,
    or: 0x2228,
    cap: 0x2229,
    cup: 0x222A,
    int: 0x222B,
    there4: 0x2234,
    sim: 0x223C,
    cong: 0x2245,
    asymp: 0x2248,
    ne: 0x2260,
    equiv: 0x2261,
    le: 0x2264,
    ge: 0x2265,
    sub: 0x2282,
    sup: 0x2283,
    nsub: 0x2284,
    sube: 0x2286,
    supe: 0x2287,
    oplus: 0x2295,
    otimes: 0x2297,
    perp: 0x22A5,
    sdot: 0x22C5,
    lceil: 0x2308,
    rceil: 0x2309,
    lfloor: 0x230A,
    rfloor: 0x230B,
    lang: 0x2329,
    rang: 0x232A,
    loz: 0x25CA,
    spades: 0x2660,
    clubs: 0x2663,
    hearts: 0x2665,
    diams: 0x2666
}));
