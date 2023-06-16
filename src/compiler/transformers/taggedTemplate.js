"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTaggedTemplateExpression = exports.ProcessLevel = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
var ProcessLevel;
(function (ProcessLevel) {
    ProcessLevel[ProcessLevel["LiftRestriction"] = 0] = "LiftRestriction";
    ProcessLevel[ProcessLevel["All"] = 1] = "All";
})(ProcessLevel || (exports.ProcessLevel = ProcessLevel = {}));
/** @internal */
function processTaggedTemplateExpression(context, node, visitor, currentSourceFile, recordTaggedTemplateString, level) {
    // Visit the tag expression
    var tag = (0, ts_1.visitNode)(node.tag, visitor, ts_1.isExpression);
    ts_1.Debug.assert(tag);
    // Build up the template arguments and the raw and cooked strings for the template.
    // We start out with 'undefined' for the first argument and revisit later
    // to avoid walking over the template string twice and shifting all our arguments over after the fact.
    var templateArguments = [undefined];
    var cookedStrings = [];
    var rawStrings = [];
    var template = node.template;
    if (level === ProcessLevel.LiftRestriction && !(0, ts_1.hasInvalidEscape)(template)) {
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    var factory = context.factory;
    if ((0, ts_1.isNoSubstitutionTemplateLiteral)(template)) {
        cookedStrings.push(createTemplateCooked(factory, template));
        rawStrings.push(getRawLiteral(factory, template, currentSourceFile));
    }
    else {
        cookedStrings.push(createTemplateCooked(factory, template.head));
        rawStrings.push(getRawLiteral(factory, template.head, currentSourceFile));
        for (var _i = 0, _a = template.templateSpans; _i < _a.length; _i++) {
            var templateSpan = _a[_i];
            cookedStrings.push(createTemplateCooked(factory, templateSpan.literal));
            rawStrings.push(getRawLiteral(factory, templateSpan.literal, currentSourceFile));
            templateArguments.push(ts_1.Debug.checkDefined((0, ts_1.visitNode)(templateSpan.expression, visitor, ts_1.isExpression)));
        }
    }
    var helperCall = context.getEmitHelperFactory().createTemplateObjectHelper(factory.createArrayLiteralExpression(cookedStrings), factory.createArrayLiteralExpression(rawStrings));
    // Create a variable to cache the template object if we're in a module.
    // Do not do this in the global scope, as any variable we currently generate could conflict with
    // variables from outside of the current compilation. In the future, we can revisit this behavior.
    if ((0, ts_1.isExternalModule)(currentSourceFile)) {
        var tempVar = factory.createUniqueName("templateObject");
        recordTaggedTemplateString(tempVar);
        templateArguments[0] = factory.createLogicalOr(tempVar, factory.createAssignment(tempVar, helperCall));
    }
    else {
        templateArguments[0] = helperCall;
    }
    return factory.createCallExpression(tag, /*typeArguments*/ undefined, templateArguments);
}
exports.processTaggedTemplateExpression = processTaggedTemplateExpression;
function createTemplateCooked(factory, template) {
    return template.templateFlags & 26656 /* TokenFlags.IsInvalid */ ? factory.createVoidZero() : factory.createStringLiteral(template.text);
}
/**
 * Creates an ES5 compatible literal from an ES6 template literal.
 *
 * @param node The ES6 template literal.
 */
function getRawLiteral(factory, node, currentSourceFile) {
    // Find original source text, since we need to emit the raw strings of the tagged template.
    // The raw strings contain the (escaped) strings of what the user wrote.
    // Examples: `\n` is converted to "\\n", a template string with a newline to "\n".
    var text = node.rawText;
    if (text === undefined) {
        ts_1.Debug.assertIsDefined(currentSourceFile, "Template literal node is missing 'rawText' and does not have a source file. Possibly bad transform.");
        text = (0, ts_1.getSourceTextOfNodeFromSourceFile)(currentSourceFile, node);
        // text contains the original source, it will also contain quotes ("`"), dolar signs and braces ("${" and "}"),
        // thus we need to remove those characters.
        // First template piece starts with "`", others with "}"
        // Last template piece ends with "`", others with "${"
        var isLast = node.kind === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */ || node.kind === 18 /* SyntaxKind.TemplateTail */;
        text = text.substring(1, text.length - (isLast ? 1 : 2));
    }
    // Newline normalization:
    // ES6 Spec 11.8.6.1 - Static Semantics of TV's and TRV's
    // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF> for both TV and TRV.
    text = text.replace(/\r\n?/g, "\n");
    return (0, ts_1.setTextRange)(factory.createStringLiteral(text), node);
}
