"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenDestructuringBinding = exports.flattenDestructuringAssignment = void 0;
var ts_1 = require("../_namespaces/ts");
/**
 * Flattens a DestructuringAssignment or a VariableDeclaration to an expression.
 *
 * @param node The node to flatten.
 * @param visitor An optional visitor used to visit initializers.
 * @param context The transformation context.
 * @param level Indicates the extent to which flattening should occur.
 * @param needsValue An optional value indicating whether the value from the right-hand-side of
 * the destructuring assignment is needed as part of a larger expression.
 * @param createAssignmentCallback An optional callback used to create the assignment expression.
 *
 * @internal
 */
function flattenDestructuringAssignment(node, visitor, context, level, needsValue, createAssignmentCallback) {
    var location = node;
    var value;
    if ((0, ts_1.isDestructuringAssignment)(node)) {
        value = node.right;
        while ((0, ts_1.isEmptyArrayLiteral)(node.left) || (0, ts_1.isEmptyObjectLiteral)(node.left)) {
            if ((0, ts_1.isDestructuringAssignment)(value)) {
                location = node = value;
                value = node.right;
            }
            else {
                return ts_1.Debug.checkDefined((0, ts_1.visitNode)(value, visitor, ts_1.isExpression));
            }
        }
    }
    var expressions;
    var flattenContext = {
        context: context,
        level: level,
        downlevelIteration: !!context.getCompilerOptions().downlevelIteration,
        hoistTempVariables: true,
        emitExpression: emitExpression,
        emitBindingOrAssignment: emitBindingOrAssignment,
        createArrayBindingOrAssignmentPattern: function (elements) { return makeArrayAssignmentPattern(context.factory, elements); },
        createObjectBindingOrAssignmentPattern: function (elements) { return makeObjectAssignmentPattern(context.factory, elements); },
        createArrayBindingOrAssignmentElement: makeAssignmentElement,
        visitor: visitor
    };
    if (value) {
        value = (0, ts_1.visitNode)(value, visitor, ts_1.isExpression);
        ts_1.Debug.assert(value);
        if ((0, ts_1.isIdentifier)(value) && bindingOrAssignmentElementAssignsToName(node, value.escapedText) ||
            bindingOrAssignmentElementContainsNonLiteralComputedName(node)) {
            // If the right-hand value of the assignment is also an assignment target then
            // we need to cache the right-hand value.
            value = ensureIdentifier(flattenContext, value, /*reuseIdentifierExpressions*/ false, location);
        }
        else if (needsValue) {
            // If the right-hand value of the destructuring assignment needs to be preserved (as
            // is the case when the destructuring assignment is part of a larger expression),
            // then we need to cache the right-hand value.
            //
            // The source map location for the assignment should point to the entire binary
            // expression.
            value = ensureIdentifier(flattenContext, value, /*reuseIdentifierExpressions*/ true, location);
        }
        else if ((0, ts_1.nodeIsSynthesized)(node)) {
            // Generally, the source map location for a destructuring assignment is the root
            // expression.
            //
            // However, if the root expression is synthesized (as in the case
            // of the initializer when transforming a ForOfStatement), then the source map
            // location should point to the right-hand value of the expression.
            location = value;
        }
    }
    flattenBindingOrAssignmentElement(flattenContext, node, value, location, /*skipInitializer*/ (0, ts_1.isDestructuringAssignment)(node));
    if (value && needsValue) {
        if (!(0, ts_1.some)(expressions)) {
            return value;
        }
        expressions.push(value);
    }
    return context.factory.inlineExpressions(expressions) || context.factory.createOmittedExpression();
    function emitExpression(expression) {
        expressions = (0, ts_1.append)(expressions, expression);
    }
    function emitBindingOrAssignment(target, value, location, original) {
        ts_1.Debug.assertNode(target, createAssignmentCallback ? ts_1.isIdentifier : ts_1.isExpression);
        var expression = createAssignmentCallback
            ? createAssignmentCallback(target, value, location)
            : (0, ts_1.setTextRange)(context.factory.createAssignment(ts_1.Debug.checkDefined((0, ts_1.visitNode)(target, visitor, ts_1.isExpression)), value), location);
        expression.original = original;
        emitExpression(expression);
    }
}
exports.flattenDestructuringAssignment = flattenDestructuringAssignment;
function bindingOrAssignmentElementAssignsToName(element, escapedName) {
    var target = (0, ts_1.getTargetOfBindingOrAssignmentElement)(element); // TODO: GH#18217
    if ((0, ts_1.isBindingOrAssignmentPattern)(target)) {
        return bindingOrAssignmentPatternAssignsToName(target, escapedName);
    }
    else if ((0, ts_1.isIdentifier)(target)) {
        return target.escapedText === escapedName;
    }
    return false;
}
function bindingOrAssignmentPatternAssignsToName(pattern, escapedName) {
    var elements = (0, ts_1.getElementsOfBindingOrAssignmentPattern)(pattern);
    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
        var element = elements_1[_i];
        if (bindingOrAssignmentElementAssignsToName(element, escapedName)) {
            return true;
        }
    }
    return false;
}
function bindingOrAssignmentElementContainsNonLiteralComputedName(element) {
    var propertyName = (0, ts_1.tryGetPropertyNameOfBindingOrAssignmentElement)(element);
    if (propertyName && (0, ts_1.isComputedPropertyName)(propertyName) && !(0, ts_1.isLiteralExpression)(propertyName.expression)) {
        return true;
    }
    var target = (0, ts_1.getTargetOfBindingOrAssignmentElement)(element);
    return !!target && (0, ts_1.isBindingOrAssignmentPattern)(target) && bindingOrAssignmentPatternContainsNonLiteralComputedName(target);
}
function bindingOrAssignmentPatternContainsNonLiteralComputedName(pattern) {
    return !!(0, ts_1.forEach)((0, ts_1.getElementsOfBindingOrAssignmentPattern)(pattern), bindingOrAssignmentElementContainsNonLiteralComputedName);
}
/**
 * Flattens a VariableDeclaration or ParameterDeclaration to one or more variable declarations.
 *
 * @param node The node to flatten.
 * @param visitor An optional visitor used to visit initializers.
 * @param context The transformation context.
 * @param boundValue The value bound to the declaration.
 * @param skipInitializer A value indicating whether to ignore the initializer of `node`.
 * @param hoistTempVariables Indicates whether temporary variables should not be recorded in-line.
 * @param level Indicates the extent to which flattening should occur.
 *
 * @internal
 */
function flattenDestructuringBinding(node, visitor, context, level, rval, hoistTempVariables, skipInitializer) {
    if (hoistTempVariables === void 0) { hoistTempVariables = false; }
    var pendingExpressions;
    var pendingDeclarations = [];
    var declarations = [];
    var flattenContext = {
        context: context,
        level: level,
        downlevelIteration: !!context.getCompilerOptions().downlevelIteration,
        hoistTempVariables: hoistTempVariables,
        emitExpression: emitExpression,
        emitBindingOrAssignment: emitBindingOrAssignment,
        createArrayBindingOrAssignmentPattern: function (elements) { return makeArrayBindingPattern(context.factory, elements); },
        createObjectBindingOrAssignmentPattern: function (elements) { return makeObjectBindingPattern(context.factory, elements); },
        createArrayBindingOrAssignmentElement: function (name) { return makeBindingElement(context.factory, name); },
        visitor: visitor
    };
    if ((0, ts_1.isVariableDeclaration)(node)) {
        var initializer = (0, ts_1.getInitializerOfBindingOrAssignmentElement)(node);
        if (initializer && ((0, ts_1.isIdentifier)(initializer) && bindingOrAssignmentElementAssignsToName(node, initializer.escapedText) ||
            bindingOrAssignmentElementContainsNonLiteralComputedName(node))) {
            // If the right-hand value of the assignment is also an assignment target then
            // we need to cache the right-hand value.
            initializer = ensureIdentifier(flattenContext, ts_1.Debug.checkDefined((0, ts_1.visitNode)(initializer, flattenContext.visitor, ts_1.isExpression)), /*reuseIdentifierExpressions*/ false, initializer);
            node = context.factory.updateVariableDeclaration(node, node.name, /*exclamationToken*/ undefined, /*type*/ undefined, initializer);
        }
    }
    flattenBindingOrAssignmentElement(flattenContext, node, rval, node, skipInitializer);
    if (pendingExpressions) {
        var temp = context.factory.createTempVariable(/*recordTempVariable*/ undefined);
        if (hoistTempVariables) {
            var value = context.factory.inlineExpressions(pendingExpressions);
            pendingExpressions = undefined;
            emitBindingOrAssignment(temp, value, /*location*/ undefined, /*original*/ undefined);
        }
        else {
            context.hoistVariableDeclaration(temp);
            var pendingDeclaration = (0, ts_1.last)(pendingDeclarations);
            pendingDeclaration.pendingExpressions = (0, ts_1.append)(pendingDeclaration.pendingExpressions, context.factory.createAssignment(temp, pendingDeclaration.value));
            (0, ts_1.addRange)(pendingDeclaration.pendingExpressions, pendingExpressions);
            pendingDeclaration.value = temp;
        }
    }
    for (var _i = 0, pendingDeclarations_1 = pendingDeclarations; _i < pendingDeclarations_1.length; _i++) {
        var _a = pendingDeclarations_1[_i], pendingExpressions_1 = _a.pendingExpressions, name_1 = _a.name, value = _a.value, location_1 = _a.location, original = _a.original;
        var variable = context.factory.createVariableDeclaration(name_1, 
        /*exclamationToken*/ undefined, 
        /*type*/ undefined, pendingExpressions_1 ? context.factory.inlineExpressions((0, ts_1.append)(pendingExpressions_1, value)) : value);
        variable.original = original;
        (0, ts_1.setTextRange)(variable, location_1);
        declarations.push(variable);
    }
    return declarations;
    function emitExpression(value) {
        pendingExpressions = (0, ts_1.append)(pendingExpressions, value);
    }
    function emitBindingOrAssignment(target, value, location, original) {
        ts_1.Debug.assertNode(target, ts_1.isBindingName);
        if (pendingExpressions) {
            value = context.factory.inlineExpressions((0, ts_1.append)(pendingExpressions, value));
            pendingExpressions = undefined;
        }
        pendingDeclarations.push({ pendingExpressions: pendingExpressions, name: target, value: value, location: location, original: original });
    }
}
exports.flattenDestructuringBinding = flattenDestructuringBinding;
/**
 * Flattens a BindingOrAssignmentElement into zero or more bindings or assignments.
 *
 * @param flattenContext Options used to control flattening.
 * @param element The element to flatten.
 * @param value The current RHS value to assign to the element.
 * @param location The location to use for source maps and comments.
 * @param skipInitializer An optional value indicating whether to include the initializer
 * for the element.
 */
function flattenBindingOrAssignmentElement(flattenContext, element, value, location, skipInitializer) {
    var bindingTarget = (0, ts_1.getTargetOfBindingOrAssignmentElement)(element); // TODO: GH#18217
    if (!skipInitializer) {
        var initializer = (0, ts_1.visitNode)((0, ts_1.getInitializerOfBindingOrAssignmentElement)(element), flattenContext.visitor, ts_1.isExpression);
        if (initializer) {
            // Combine value and initializer
            if (value) {
                value = createDefaultValueCheck(flattenContext, value, initializer, location);
                // If 'value' is not a simple expression, it could contain side-effecting code that should evaluate before an object or array binding pattern.
                if (!(0, ts_1.isSimpleInlineableExpression)(initializer) && (0, ts_1.isBindingOrAssignmentPattern)(bindingTarget)) {
                    value = ensureIdentifier(flattenContext, value, /*reuseIdentifierExpressions*/ true, location);
                }
            }
            else {
                value = initializer;
            }
        }
        else if (!value) {
            // Use 'void 0' in absence of value and initializer
            value = flattenContext.context.factory.createVoidZero();
        }
    }
    if ((0, ts_1.isObjectBindingOrAssignmentPattern)(bindingTarget)) {
        flattenObjectBindingOrAssignmentPattern(flattenContext, element, bindingTarget, value, location);
    }
    else if ((0, ts_1.isArrayBindingOrAssignmentPattern)(bindingTarget)) {
        flattenArrayBindingOrAssignmentPattern(flattenContext, element, bindingTarget, value, location);
    }
    else {
        flattenContext.emitBindingOrAssignment(bindingTarget, value, location, /*original*/ element); // TODO: GH#18217
    }
}
/**
 * Flattens an ObjectBindingOrAssignmentPattern into zero or more bindings or assignments.
 *
 * @param flattenContext Options used to control flattening.
 * @param parent The parent element of the pattern.
 * @param pattern The ObjectBindingOrAssignmentPattern to flatten.
 * @param value The current RHS value to assign to the element.
 * @param location The location to use for source maps and comments.
 */
function flattenObjectBindingOrAssignmentPattern(flattenContext, parent, pattern, value, location) {
    var elements = (0, ts_1.getElementsOfBindingOrAssignmentPattern)(pattern);
    var numElements = elements.length;
    if (numElements !== 1) {
        // For anything other than a single-element destructuring we need to generate a temporary
        // to ensure value is evaluated exactly once. Additionally, if we have zero elements
        // we need to emit *something* to ensure that in case a 'var' keyword was already emitted,
        // so in that case, we'll intentionally create that temporary.
        var reuseIdentifierExpressions = !(0, ts_1.isDeclarationBindingElement)(parent) || numElements !== 0;
        value = ensureIdentifier(flattenContext, value, reuseIdentifierExpressions, location);
    }
    var bindingElements;
    var computedTempVariables;
    for (var i = 0; i < numElements; i++) {
        var element = elements[i];
        if (!(0, ts_1.getRestIndicatorOfBindingOrAssignmentElement)(element)) {
            var propertyName = (0, ts_1.getPropertyNameOfBindingOrAssignmentElement)(element);
            if (flattenContext.level >= 1 /* FlattenLevel.ObjectRest */
                && !(element.transformFlags & (32768 /* TransformFlags.ContainsRestOrSpread */ | 65536 /* TransformFlags.ContainsObjectRestOrSpread */))
                && !((0, ts_1.getTargetOfBindingOrAssignmentElement)(element).transformFlags & (32768 /* TransformFlags.ContainsRestOrSpread */ | 65536 /* TransformFlags.ContainsObjectRestOrSpread */))
                && !(0, ts_1.isComputedPropertyName)(propertyName)) {
                bindingElements = (0, ts_1.append)(bindingElements, (0, ts_1.visitNode)(element, flattenContext.visitor, ts_1.isBindingOrAssignmentElement));
            }
            else {
                if (bindingElements) {
                    flattenContext.emitBindingOrAssignment(flattenContext.createObjectBindingOrAssignmentPattern(bindingElements), value, location, pattern);
                    bindingElements = undefined;
                }
                var rhsValue = createDestructuringPropertyAccess(flattenContext, value, propertyName);
                if ((0, ts_1.isComputedPropertyName)(propertyName)) {
                    computedTempVariables = (0, ts_1.append)(computedTempVariables, rhsValue.argumentExpression);
                }
                flattenBindingOrAssignmentElement(flattenContext, element, rhsValue, /*location*/ element);
            }
        }
        else if (i === numElements - 1) {
            if (bindingElements) {
                flattenContext.emitBindingOrAssignment(flattenContext.createObjectBindingOrAssignmentPattern(bindingElements), value, location, pattern);
                bindingElements = undefined;
            }
            var rhsValue = flattenContext.context.getEmitHelperFactory().createRestHelper(value, elements, computedTempVariables, pattern);
            flattenBindingOrAssignmentElement(flattenContext, element, rhsValue, element);
        }
    }
    if (bindingElements) {
        flattenContext.emitBindingOrAssignment(flattenContext.createObjectBindingOrAssignmentPattern(bindingElements), value, location, pattern);
    }
}
/**
 * Flattens an ArrayBindingOrAssignmentPattern into zero or more bindings or assignments.
 *
 * @param flattenContext Options used to control flattening.
 * @param parent The parent element of the pattern.
 * @param pattern The ArrayBindingOrAssignmentPattern to flatten.
 * @param value The current RHS value to assign to the element.
 * @param location The location to use for source maps and comments.
 */
function flattenArrayBindingOrAssignmentPattern(flattenContext, parent, pattern, value, location) {
    var elements = (0, ts_1.getElementsOfBindingOrAssignmentPattern)(pattern);
    var numElements = elements.length;
    if (flattenContext.level < 1 /* FlattenLevel.ObjectRest */ && flattenContext.downlevelIteration) {
        // Read the elements of the iterable into an array
        value = ensureIdentifier(flattenContext, (0, ts_1.setTextRange)(flattenContext.context.getEmitHelperFactory().createReadHelper(value, numElements > 0 && (0, ts_1.getRestIndicatorOfBindingOrAssignmentElement)(elements[numElements - 1])
            ? undefined
            : numElements), location), 
        /*reuseIdentifierExpressions*/ false, location);
    }
    else if (numElements !== 1 && (flattenContext.level < 1 /* FlattenLevel.ObjectRest */ || numElements === 0)
        || (0, ts_1.every)(elements, ts_1.isOmittedExpression)) {
        // For anything other than a single-element destructuring we need to generate a temporary
        // to ensure value is evaluated exactly once. Additionally, if we have zero elements
        // we need to emit *something* to ensure that in case a 'var' keyword was already emitted,
        // so in that case, we'll intentionally create that temporary.
        // Or all the elements of the binding pattern are omitted expression such as "var [,] = [1,2]",
        // then we will create temporary variable.
        var reuseIdentifierExpressions = !(0, ts_1.isDeclarationBindingElement)(parent) || numElements !== 0;
        value = ensureIdentifier(flattenContext, value, reuseIdentifierExpressions, location);
    }
    var bindingElements;
    var restContainingElements;
    for (var i = 0; i < numElements; i++) {
        var element = elements[i];
        if (flattenContext.level >= 1 /* FlattenLevel.ObjectRest */) {
            // If an array pattern contains an ObjectRest, we must cache the result so that we
            // can perform the ObjectRest destructuring in a different declaration
            if (element.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */ || flattenContext.hasTransformedPriorElement && !isSimpleBindingOrAssignmentElement(element)) {
                flattenContext.hasTransformedPriorElement = true;
                var temp = flattenContext.context.factory.createTempVariable(/*recordTempVariable*/ undefined);
                if (flattenContext.hoistTempVariables) {
                    flattenContext.context.hoistVariableDeclaration(temp);
                }
                restContainingElements = (0, ts_1.append)(restContainingElements, [temp, element]);
                bindingElements = (0, ts_1.append)(bindingElements, flattenContext.createArrayBindingOrAssignmentElement(temp));
            }
            else {
                bindingElements = (0, ts_1.append)(bindingElements, element);
            }
        }
        else if ((0, ts_1.isOmittedExpression)(element)) {
            continue;
        }
        else if (!(0, ts_1.getRestIndicatorOfBindingOrAssignmentElement)(element)) {
            var rhsValue = flattenContext.context.factory.createElementAccessExpression(value, i);
            flattenBindingOrAssignmentElement(flattenContext, element, rhsValue, /*location*/ element);
        }
        else if (i === numElements - 1) {
            var rhsValue = flattenContext.context.factory.createArraySliceCall(value, i);
            flattenBindingOrAssignmentElement(flattenContext, element, rhsValue, /*location*/ element);
        }
    }
    if (bindingElements) {
        flattenContext.emitBindingOrAssignment(flattenContext.createArrayBindingOrAssignmentPattern(bindingElements), value, location, pattern);
    }
    if (restContainingElements) {
        for (var _i = 0, restContainingElements_1 = restContainingElements; _i < restContainingElements_1.length; _i++) {
            var _a = restContainingElements_1[_i], id = _a[0], element = _a[1];
            flattenBindingOrAssignmentElement(flattenContext, element, id, element);
        }
    }
}
function isSimpleBindingOrAssignmentElement(element) {
    var target = (0, ts_1.getTargetOfBindingOrAssignmentElement)(element);
    if (!target || (0, ts_1.isOmittedExpression)(target))
        return true;
    var propertyName = (0, ts_1.tryGetPropertyNameOfBindingOrAssignmentElement)(element);
    if (propertyName && !(0, ts_1.isPropertyNameLiteral)(propertyName))
        return false;
    var initializer = (0, ts_1.getInitializerOfBindingOrAssignmentElement)(element);
    if (initializer && !(0, ts_1.isSimpleInlineableExpression)(initializer))
        return false;
    if ((0, ts_1.isBindingOrAssignmentPattern)(target))
        return (0, ts_1.every)((0, ts_1.getElementsOfBindingOrAssignmentPattern)(target), isSimpleBindingOrAssignmentElement);
    return (0, ts_1.isIdentifier)(target);
}
/**
 * Creates an expression used to provide a default value if a value is `undefined` at runtime.
 *
 * @param flattenContext Options used to control flattening.
 * @param value The RHS value to test.
 * @param defaultValue The default value to use if `value` is `undefined` at runtime.
 * @param location The location to use for source maps and comments.
 */
function createDefaultValueCheck(flattenContext, value, defaultValue, location) {
    value = ensureIdentifier(flattenContext, value, /*reuseIdentifierExpressions*/ true, location);
    return flattenContext.context.factory.createConditionalExpression(flattenContext.context.factory.createTypeCheck(value, "undefined"), /*questionToken*/ undefined, defaultValue, /*colonToken*/ undefined, value);
}
/**
 * Creates either a PropertyAccessExpression or an ElementAccessExpression for the
 * right-hand side of a transformed destructuring assignment.
 *
 * @link https://tc39.github.io/ecma262/#sec-runtime-semantics-keyeddestructuringassignmentevaluation
 *
 * @param flattenContext Options used to control flattening.
 * @param value The RHS value that is the source of the property.
 * @param propertyName The destructuring property name.
 */
function createDestructuringPropertyAccess(flattenContext, value, propertyName) {
    var factory = flattenContext.context.factory;
    if ((0, ts_1.isComputedPropertyName)(propertyName)) {
        var argumentExpression = ensureIdentifier(flattenContext, ts_1.Debug.checkDefined((0, ts_1.visitNode)(propertyName.expression, flattenContext.visitor, ts_1.isExpression)), /*reuseIdentifierExpressions*/ false, /*location*/ propertyName);
        return flattenContext.context.factory.createElementAccessExpression(value, argumentExpression);
    }
    else if ((0, ts_1.isStringOrNumericLiteralLike)(propertyName)) {
        var argumentExpression = factory.cloneNode(propertyName);
        return flattenContext.context.factory.createElementAccessExpression(value, argumentExpression);
    }
    else {
        var name_2 = flattenContext.context.factory.createIdentifier((0, ts_1.idText)(propertyName));
        return flattenContext.context.factory.createPropertyAccessExpression(value, name_2);
    }
}
/**
 * Ensures that there exists a declared identifier whose value holds the given expression.
 * This function is useful to ensure that the expression's value can be read from in subsequent expressions.
 * Unless 'reuseIdentifierExpressions' is false, 'value' will be returned if it is just an identifier.
 *
 * @param flattenContext Options used to control flattening.
 * @param value the expression whose value needs to be bound.
 * @param reuseIdentifierExpressions true if identifier expressions can simply be returned;
 * false if it is necessary to always emit an identifier.
 * @param location The location to use for source maps and comments.
 */
function ensureIdentifier(flattenContext, value, reuseIdentifierExpressions, location) {
    if ((0, ts_1.isIdentifier)(value) && reuseIdentifierExpressions) {
        return value;
    }
    else {
        var temp = flattenContext.context.factory.createTempVariable(/*recordTempVariable*/ undefined);
        if (flattenContext.hoistTempVariables) {
            flattenContext.context.hoistVariableDeclaration(temp);
            flattenContext.emitExpression((0, ts_1.setTextRange)(flattenContext.context.factory.createAssignment(temp, value), location));
        }
        else {
            flattenContext.emitBindingOrAssignment(temp, value, location, /*original*/ undefined);
        }
        return temp;
    }
}
function makeArrayBindingPattern(factory, elements) {
    ts_1.Debug.assertEachNode(elements, ts_1.isArrayBindingElement);
    return factory.createArrayBindingPattern(elements);
}
function makeArrayAssignmentPattern(factory, elements) {
    ts_1.Debug.assertEachNode(elements, ts_1.isArrayBindingOrAssignmentElement);
    return factory.createArrayLiteralExpression((0, ts_1.map)(elements, factory.converters.convertToArrayAssignmentElement));
}
function makeObjectBindingPattern(factory, elements) {
    ts_1.Debug.assertEachNode(elements, ts_1.isBindingElement);
    return factory.createObjectBindingPattern(elements);
}
function makeObjectAssignmentPattern(factory, elements) {
    ts_1.Debug.assertEachNode(elements, ts_1.isObjectBindingOrAssignmentElement);
    return factory.createObjectLiteralExpression((0, ts_1.map)(elements, factory.converters.convertToObjectAssignmentElement));
}
function makeBindingElement(factory, name) {
    return factory.createBindingElement(/*dotDotDotToken*/ undefined, /*propertyName*/ undefined, name);
}
function makeAssignmentElement(name) {
    return name;
}
