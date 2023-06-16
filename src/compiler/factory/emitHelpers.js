"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.isCallToHelper = exports.advancedAsyncSuperHelper = exports.asyncSuperHelper = exports.getAllUnscopedEmitHelpers = exports.classPrivateFieldInHelper = exports.classPrivateFieldSetHelper = exports.classPrivateFieldGetHelper = exports.exportStarHelper = exports.importDefaultHelper = exports.importStarHelper = exports.setModuleDefaultHelper = exports.createBindingHelper = exports.generatorHelper = exports.valuesHelper = exports.setFunctionNameHelper = exports.propKeyHelper = exports.spreadArrayHelper = exports.readHelper = exports.templateObjectHelper = exports.extendsHelper = exports.awaiterHelper = exports.restHelper = exports.asyncValues = exports.asyncDelegator = exports.asyncGeneratorHelper = exports.awaitHelper = exports.assignHelper = exports.runInitializersHelper = exports.esDecorateHelper = exports.paramHelper = exports.metadataHelper = exports.decorateHelper = exports.helperString = exports.compareEmitHelpers = exports.createEmitHelperFactory = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function createEmitHelperFactory(context) {
    var factory = context.factory;
    var immutableTrue = (0, ts_1.memoize)(function () { return (0, ts_1.setInternalEmitFlags)(factory.createTrue(), 8 /* InternalEmitFlags.Immutable */); });
    var immutableFalse = (0, ts_1.memoize)(function () { return (0, ts_1.setInternalEmitFlags)(factory.createFalse(), 8 /* InternalEmitFlags.Immutable */); });
    return {
        getUnscopedHelperName: getUnscopedHelperName,
        // TypeScript Helpers
        createDecorateHelper: createDecorateHelper,
        createMetadataHelper: createMetadataHelper,
        createParamHelper: createParamHelper,
        // ES Decorators Helpers
        createESDecorateHelper: createESDecorateHelper,
        createRunInitializersHelper: createRunInitializersHelper,
        // ES2018 Helpers
        createAssignHelper: createAssignHelper,
        createAwaitHelper: createAwaitHelper,
        createAsyncGeneratorHelper: createAsyncGeneratorHelper,
        createAsyncDelegatorHelper: createAsyncDelegatorHelper,
        createAsyncValuesHelper: createAsyncValuesHelper,
        // ES2018 Destructuring Helpers
        createRestHelper: createRestHelper,
        // ES2017 Helpers
        createAwaiterHelper: createAwaiterHelper,
        // ES2015 Helpers
        createExtendsHelper: createExtendsHelper,
        createTemplateObjectHelper: createTemplateObjectHelper,
        createSpreadArrayHelper: createSpreadArrayHelper,
        createPropKeyHelper: createPropKeyHelper,
        createSetFunctionNameHelper: createSetFunctionNameHelper,
        // ES2015 Destructuring Helpers
        createValuesHelper: createValuesHelper,
        createReadHelper: createReadHelper,
        // ES2015 Generator Helpers
        createGeneratorHelper: createGeneratorHelper,
        // ES Module Helpers
        createCreateBindingHelper: createCreateBindingHelper,
        createImportStarHelper: createImportStarHelper,
        createImportStarCallbackHelper: createImportStarCallbackHelper,
        createImportDefaultHelper: createImportDefaultHelper,
        createExportStarHelper: createExportStarHelper,
        // Class Fields Helpers
        createClassPrivateFieldGetHelper: createClassPrivateFieldGetHelper,
        createClassPrivateFieldSetHelper: createClassPrivateFieldSetHelper,
        createClassPrivateFieldInHelper: createClassPrivateFieldInHelper
    };
    /**
     * Gets an identifier for the name of an *unscoped* emit helper.
     */
    function getUnscopedHelperName(name) {
        return (0, ts_1.setEmitFlags)(factory.createIdentifier(name), 8192 /* EmitFlags.HelperName */ | 4 /* EmitFlags.AdviseOnEmitNode */);
    }
    // TypeScript Helpers
    function createDecorateHelper(decoratorExpressions, target, memberName, descriptor) {
        context.requestEmitHelper(exports.decorateHelper);
        var argumentsArray = [];
        argumentsArray.push(factory.createArrayLiteralExpression(decoratorExpressions, /*multiLine*/ true));
        argumentsArray.push(target);
        if (memberName) {
            argumentsArray.push(memberName);
            if (descriptor) {
                argumentsArray.push(descriptor);
            }
        }
        return factory.createCallExpression(getUnscopedHelperName("__decorate"), 
        /*typeArguments*/ undefined, argumentsArray);
    }
    function createMetadataHelper(metadataKey, metadataValue) {
        context.requestEmitHelper(exports.metadataHelper);
        return factory.createCallExpression(getUnscopedHelperName("__metadata"), 
        /*typeArguments*/ undefined, [
            factory.createStringLiteral(metadataKey),
            metadataValue
        ]);
    }
    function createParamHelper(expression, parameterOffset, location) {
        context.requestEmitHelper(exports.paramHelper);
        return (0, ts_1.setTextRange)(factory.createCallExpression(getUnscopedHelperName("__param"), 
        /*typeArguments*/ undefined, [
            factory.createNumericLiteral(parameterOffset + ""),
            expression
        ]), location);
    }
    // ES Decorators Helpers
    function createESDecorateClassContextObject(contextIn) {
        return factory.createObjectLiteralExpression([
            factory.createPropertyAssignment(factory.createIdentifier("kind"), factory.createStringLiteral("class")),
            factory.createPropertyAssignment(factory.createIdentifier("name"), contextIn.name)
        ]);
    }
    function createESDecorateClassElementAccessGetMethod(elementName) {
        var accessor = elementName.computed ?
            factory.createElementAccessExpression(factory.createIdentifier("obj"), elementName.name) :
            factory.createPropertyAccessExpression(factory.createIdentifier("obj"), elementName.name);
        return factory.createPropertyAssignment("get", factory.createArrowFunction(
        /*modifiers*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, factory.createIdentifier("obj"))], 
        /*type*/ undefined, 
        /*equalsGreaterThanToken*/ undefined, accessor));
    }
    function createESDecorateClassElementAccessSetMethod(elementName) {
        var accessor = elementName.computed ?
            factory.createElementAccessExpression(factory.createIdentifier("obj"), elementName.name) :
            factory.createPropertyAccessExpression(factory.createIdentifier("obj"), elementName.name);
        return factory.createPropertyAssignment("set", factory.createArrowFunction(
        /*modifiers*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, factory.createIdentifier("obj")),
            factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, factory.createIdentifier("value"))], 
        /*type*/ undefined, 
        /*equalsGreaterThanToken*/ undefined, factory.createBlock([
            factory.createExpressionStatement(factory.createAssignment(accessor, factory.createIdentifier("value")))
        ])));
    }
    function createESDecorateClassElementAccessHasMethod(elementName) {
        var propertyName = elementName.computed ? elementName.name :
            (0, ts_1.isIdentifier)(elementName.name) ? factory.createStringLiteralFromNode(elementName.name) :
                elementName.name;
        return factory.createPropertyAssignment("has", factory.createArrowFunction(
        /*modifiers*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, factory.createIdentifier("obj"))], 
        /*type*/ undefined, 
        /*equalsGreaterThanToken*/ undefined, factory.createBinaryExpression(propertyName, 103 /* SyntaxKind.InKeyword */, factory.createIdentifier("obj"))));
    }
    function createESDecorateClassElementAccessObject(name, access) {
        var properties = [];
        properties.push(createESDecorateClassElementAccessHasMethod(name));
        if (access.get)
            properties.push(createESDecorateClassElementAccessGetMethod(name));
        if (access.set)
            properties.push(createESDecorateClassElementAccessSetMethod(name));
        return factory.createObjectLiteralExpression(properties);
    }
    function createESDecorateClassElementContextObject(contextIn) {
        return factory.createObjectLiteralExpression([
            factory.createPropertyAssignment(factory.createIdentifier("kind"), factory.createStringLiteral(contextIn.kind)),
            factory.createPropertyAssignment(factory.createIdentifier("name"), contextIn.name.computed ? contextIn.name.name : factory.createStringLiteralFromNode(contextIn.name.name)),
            factory.createPropertyAssignment(factory.createIdentifier("static"), contextIn.static ? factory.createTrue() : factory.createFalse()),
            factory.createPropertyAssignment(factory.createIdentifier("private"), contextIn.private ? factory.createTrue() : factory.createFalse()),
            factory.createPropertyAssignment(factory.createIdentifier("access"), createESDecorateClassElementAccessObject(contextIn.name, contextIn.access))
        ]);
    }
    function createESDecorateContextObject(contextIn) {
        return contextIn.kind === "class" ? createESDecorateClassContextObject(contextIn) :
            createESDecorateClassElementContextObject(contextIn);
    }
    function createESDecorateHelper(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        context.requestEmitHelper(exports.esDecorateHelper);
        return factory.createCallExpression(getUnscopedHelperName("__esDecorate"), 
        /*typeArguments*/ undefined, [
            ctor !== null && ctor !== void 0 ? ctor : factory.createNull(),
            descriptorIn !== null && descriptorIn !== void 0 ? descriptorIn : factory.createNull(),
            decorators,
            createESDecorateContextObject(contextIn),
            initializers,
            extraInitializers
        ]);
    }
    function createRunInitializersHelper(thisArg, initializers, value) {
        context.requestEmitHelper(exports.runInitializersHelper);
        return factory.createCallExpression(getUnscopedHelperName("__runInitializers"), 
        /*typeArguments*/ undefined, value ? [thisArg, initializers, value] : [thisArg, initializers]);
    }
    // ES2018 Helpers
    function createAssignHelper(attributesSegments) {
        if ((0, ts_1.getEmitScriptTarget)(context.getCompilerOptions()) >= 2 /* ScriptTarget.ES2015 */) {
            return factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "assign"), 
            /*typeArguments*/ undefined, attributesSegments);
        }
        context.requestEmitHelper(exports.assignHelper);
        return factory.createCallExpression(getUnscopedHelperName("__assign"), 
        /*typeArguments*/ undefined, attributesSegments);
    }
    function createAwaitHelper(expression) {
        context.requestEmitHelper(exports.awaitHelper);
        return factory.createCallExpression(getUnscopedHelperName("__await"), /*typeArguments*/ undefined, [expression]);
    }
    function createAsyncGeneratorHelper(generatorFunc, hasLexicalThis) {
        context.requestEmitHelper(exports.awaitHelper);
        context.requestEmitHelper(exports.asyncGeneratorHelper);
        // Mark this node as originally an async function
        (generatorFunc.emitNode || (generatorFunc.emitNode = {})).flags |= 524288 /* EmitFlags.AsyncFunctionBody */ | 1048576 /* EmitFlags.ReuseTempVariableScope */;
        return factory.createCallExpression(getUnscopedHelperName("__asyncGenerator"), 
        /*typeArguments*/ undefined, [
            hasLexicalThis ? factory.createThis() : factory.createVoidZero(),
            factory.createIdentifier("arguments"),
            generatorFunc
        ]);
    }
    function createAsyncDelegatorHelper(expression) {
        context.requestEmitHelper(exports.awaitHelper);
        context.requestEmitHelper(exports.asyncDelegator);
        return factory.createCallExpression(getUnscopedHelperName("__asyncDelegator"), 
        /*typeArguments*/ undefined, [expression]);
    }
    function createAsyncValuesHelper(expression) {
        context.requestEmitHelper(exports.asyncValues);
        return factory.createCallExpression(getUnscopedHelperName("__asyncValues"), 
        /*typeArguments*/ undefined, [expression]);
    }
    // ES2018 Destructuring Helpers
    /** Given value: o, propName: p, pattern: { a, b, ...p } from the original statement
     * `{ a, b, ...p } = o`, create `p = __rest(o, ["a", "b"]);`
     */
    function createRestHelper(value, elements, computedTempVariables, location) {
        context.requestEmitHelper(exports.restHelper);
        var propertyNames = [];
        var computedTempVariableOffset = 0;
        for (var i = 0; i < elements.length - 1; i++) {
            var propertyName = (0, ts_1.getPropertyNameOfBindingOrAssignmentElement)(elements[i]);
            if (propertyName) {
                if ((0, ts_1.isComputedPropertyName)(propertyName)) {
                    ts_1.Debug.assertIsDefined(computedTempVariables, "Encountered computed property name but 'computedTempVariables' argument was not provided.");
                    var temp = computedTempVariables[computedTempVariableOffset];
                    computedTempVariableOffset++;
                    // typeof _tmp === "symbol" ? _tmp : _tmp + ""
                    propertyNames.push(factory.createConditionalExpression(factory.createTypeCheck(temp, "symbol"), 
                    /*questionToken*/ undefined, temp, 
                    /*colonToken*/ undefined, factory.createAdd(temp, factory.createStringLiteral(""))));
                }
                else {
                    propertyNames.push(factory.createStringLiteralFromNode(propertyName));
                }
            }
        }
        return factory.createCallExpression(getUnscopedHelperName("__rest"), 
        /*typeArguments*/ undefined, [
            value,
            (0, ts_1.setTextRange)(factory.createArrayLiteralExpression(propertyNames), location)
        ]);
    }
    // ES2017 Helpers
    function createAwaiterHelper(hasLexicalThis, hasLexicalArguments, promiseConstructor, body) {
        context.requestEmitHelper(exports.awaiterHelper);
        var generatorFunc = factory.createFunctionExpression(
        /*modifiers*/ undefined, factory.createToken(42 /* SyntaxKind.AsteriskToken */), 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, 
        /*parameters*/ [], 
        /*type*/ undefined, body);
        // Mark this node as originally an async function
        (generatorFunc.emitNode || (generatorFunc.emitNode = {})).flags |= 524288 /* EmitFlags.AsyncFunctionBody */ | 1048576 /* EmitFlags.ReuseTempVariableScope */;
        return factory.createCallExpression(getUnscopedHelperName("__awaiter"), 
        /*typeArguments*/ undefined, [
            hasLexicalThis ? factory.createThis() : factory.createVoidZero(),
            hasLexicalArguments ? factory.createIdentifier("arguments") : factory.createVoidZero(),
            promiseConstructor ? (0, ts_1.createExpressionFromEntityName)(factory, promiseConstructor) : factory.createVoidZero(),
            generatorFunc
        ]);
    }
    // ES2015 Helpers
    function createExtendsHelper(name) {
        context.requestEmitHelper(exports.extendsHelper);
        return factory.createCallExpression(getUnscopedHelperName("__extends"), 
        /*typeArguments*/ undefined, [name, factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */)]);
    }
    function createTemplateObjectHelper(cooked, raw) {
        context.requestEmitHelper(exports.templateObjectHelper);
        return factory.createCallExpression(getUnscopedHelperName("__makeTemplateObject"), 
        /*typeArguments*/ undefined, [cooked, raw]);
    }
    function createSpreadArrayHelper(to, from, packFrom) {
        context.requestEmitHelper(exports.spreadArrayHelper);
        return factory.createCallExpression(getUnscopedHelperName("__spreadArray"), 
        /*typeArguments*/ undefined, [to, from, packFrom ? immutableTrue() : immutableFalse()]);
    }
    function createPropKeyHelper(expr) {
        context.requestEmitHelper(exports.propKeyHelper);
        return factory.createCallExpression(getUnscopedHelperName("__propKey"), 
        /*typeArguments*/ undefined, [expr]);
    }
    function createSetFunctionNameHelper(f, name, prefix) {
        context.requestEmitHelper(exports.setFunctionNameHelper);
        return context.factory.createCallExpression(getUnscopedHelperName("__setFunctionName"), 
        /*typeArguments*/ undefined, prefix ? [f, name, context.factory.createStringLiteral(prefix)] : [f, name]);
    }
    // ES2015 Destructuring Helpers
    function createValuesHelper(expression) {
        context.requestEmitHelper(exports.valuesHelper);
        return factory.createCallExpression(getUnscopedHelperName("__values"), 
        /*typeArguments*/ undefined, [expression]);
    }
    function createReadHelper(iteratorRecord, count) {
        context.requestEmitHelper(exports.readHelper);
        return factory.createCallExpression(getUnscopedHelperName("__read"), 
        /*typeArguments*/ undefined, count !== undefined
            ? [iteratorRecord, factory.createNumericLiteral(count + "")]
            : [iteratorRecord]);
    }
    // ES2015 Generator Helpers
    function createGeneratorHelper(body) {
        context.requestEmitHelper(exports.generatorHelper);
        return factory.createCallExpression(getUnscopedHelperName("__generator"), 
        /*typeArguments*/ undefined, [factory.createThis(), body]);
    }
    // ES Module Helpers
    function createCreateBindingHelper(module, inputName, outputName) {
        context.requestEmitHelper(exports.createBindingHelper);
        return factory.createCallExpression(getUnscopedHelperName("__createBinding"), 
        /*typeArguments*/ undefined, __spreadArray([factory.createIdentifier("exports"), module, inputName], (outputName ? [outputName] : []), true));
    }
    function createImportStarHelper(expression) {
        context.requestEmitHelper(exports.importStarHelper);
        return factory.createCallExpression(getUnscopedHelperName("__importStar"), 
        /*typeArguments*/ undefined, [expression]);
    }
    function createImportStarCallbackHelper() {
        context.requestEmitHelper(exports.importStarHelper);
        return getUnscopedHelperName("__importStar");
    }
    function createImportDefaultHelper(expression) {
        context.requestEmitHelper(exports.importDefaultHelper);
        return factory.createCallExpression(getUnscopedHelperName("__importDefault"), 
        /*typeArguments*/ undefined, [expression]);
    }
    function createExportStarHelper(moduleExpression, exportsExpression) {
        if (exportsExpression === void 0) { exportsExpression = factory.createIdentifier("exports"); }
        context.requestEmitHelper(exports.exportStarHelper);
        context.requestEmitHelper(exports.createBindingHelper);
        return factory.createCallExpression(getUnscopedHelperName("__exportStar"), 
        /*typeArguments*/ undefined, [moduleExpression, exportsExpression]);
    }
    // Class Fields Helpers
    function createClassPrivateFieldGetHelper(receiver, state, kind, f) {
        context.requestEmitHelper(exports.classPrivateFieldGetHelper);
        var args;
        if (!f) {
            args = [receiver, state, factory.createStringLiteral(kind)];
        }
        else {
            args = [receiver, state, factory.createStringLiteral(kind), f];
        }
        return factory.createCallExpression(getUnscopedHelperName("__classPrivateFieldGet"), /*typeArguments*/ undefined, args);
    }
    function createClassPrivateFieldSetHelper(receiver, state, value, kind, f) {
        context.requestEmitHelper(exports.classPrivateFieldSetHelper);
        var args;
        if (!f) {
            args = [receiver, state, value, factory.createStringLiteral(kind)];
        }
        else {
            args = [receiver, state, value, factory.createStringLiteral(kind), f];
        }
        return factory.createCallExpression(getUnscopedHelperName("__classPrivateFieldSet"), /*typeArguments*/ undefined, args);
    }
    function createClassPrivateFieldInHelper(state, receiver) {
        context.requestEmitHelper(exports.classPrivateFieldInHelper);
        return factory.createCallExpression(getUnscopedHelperName("__classPrivateFieldIn"), /*typeArguments*/ undefined, [state, receiver]);
    }
}
exports.createEmitHelperFactory = createEmitHelperFactory;
/** @internal */
function compareEmitHelpers(x, y) {
    if (x === y)
        return 0 /* Comparison.EqualTo */;
    if (x.priority === y.priority)
        return 0 /* Comparison.EqualTo */;
    if (x.priority === undefined)
        return 1 /* Comparison.GreaterThan */;
    if (y.priority === undefined)
        return -1 /* Comparison.LessThan */;
    return (0, ts_1.compareValues)(x.priority, y.priority);
}
exports.compareEmitHelpers = compareEmitHelpers;
/**
 * @param input Template string input strings
 * @param args Names which need to be made file-level unique
 *
 * @internal
 */
function helperString(input) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return function (uniqueName) {
        var result = "";
        for (var i = 0; i < args.length; i++) {
            result += input[i];
            result += uniqueName(args[i]);
        }
        result += input[input.length - 1];
        return result;
    };
}
exports.helperString = helperString;
// TypeScript Helpers
/** @internal */
exports.decorateHelper = {
    name: "typescript:decorate",
    importName: "__decorate",
    scoped: false,
    priority: 2,
    text: "\n            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {\n                var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n                if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\n                else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n                return c > 3 && r && Object.defineProperty(target, key, r), r;\n            };"
};
/** @internal */
exports.metadataHelper = {
    name: "typescript:metadata",
    importName: "__metadata",
    scoped: false,
    priority: 3,
    text: "\n            var __metadata = (this && this.__metadata) || function (k, v) {\n                if (typeof Reflect === \"object\" && typeof Reflect.metadata === \"function\") return Reflect.metadata(k, v);\n            };"
};
/** @internal */
exports.paramHelper = {
    name: "typescript:param",
    importName: "__param",
    scoped: false,
    priority: 4,
    text: "\n            var __param = (this && this.__param) || function (paramIndex, decorator) {\n                return function (target, key) { decorator(target, key, paramIndex); }\n            };"
};
// ES Decorators Helpers
/** @internal */
exports.esDecorateHelper = {
    name: "typescript:esDecorate",
    importName: "__esDecorate",
    scoped: false,
    priority: 2,
    text: "\n        var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {\n            function accept(f) { if (f !== void 0 && typeof f !== \"function\") throw new TypeError(\"Function expected\"); return f; }\n            var kind = contextIn.kind, key = kind === \"getter\" ? \"get\" : kind === \"setter\" ? \"set\" : \"value\";\n            var target = !descriptorIn && ctor ? contextIn[\"static\"] ? ctor : ctor.prototype : null;\n            var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});\n            var _, done = false;\n            for (var i = decorators.length - 1; i >= 0; i--) {\n                var context = {};\n                for (var p in contextIn) context[p] = p === \"access\" ? {} : contextIn[p];\n                for (var p in contextIn.access) context.access[p] = contextIn.access[p];\n                context.addInitializer = function (f) { if (done) throw new TypeError(\"Cannot add initializers after decoration has completed\"); extraInitializers.push(accept(f || null)); };\n                var result = (0, decorators[i])(kind === \"accessor\" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);\n                if (kind === \"accessor\") {\n                    if (result === void 0) continue;\n                    if (result === null || typeof result !== \"object\") throw new TypeError(\"Object expected\");\n                    if (_ = accept(result.get)) descriptor.get = _;\n                    if (_ = accept(result.set)) descriptor.set = _;\n                    if (_ = accept(result.init)) initializers.unshift(_);\n                }\n                else if (_ = accept(result)) {\n                    if (kind === \"field\") initializers.unshift(_);\n                    else descriptor[key] = _;\n                }\n            }\n            if (target) Object.defineProperty(target, contextIn.name, descriptor);\n            done = true;\n        };"
};
/** @internal */
exports.runInitializersHelper = {
    name: "typescript:runInitializers",
    importName: "__runInitializers",
    scoped: false,
    priority: 2,
    text: "\n        var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {\n            var useValue = arguments.length > 2;\n            for (var i = 0; i < initializers.length; i++) {\n                value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);\n            }\n            return useValue ? value : void 0;\n        };"
};
// ES2018 Helpers
/** @internal */
exports.assignHelper = {
    name: "typescript:assign",
    importName: "__assign",
    scoped: false,
    priority: 1,
    text: "\n            var __assign = (this && this.__assign) || function () {\n                __assign = Object.assign || function(t) {\n                    for (var s, i = 1, n = arguments.length; i < n; i++) {\n                        s = arguments[i];\n                        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\n                            t[p] = s[p];\n                    }\n                    return t;\n                };\n                return __assign.apply(this, arguments);\n            };"
};
/** @internal */
exports.awaitHelper = {
    name: "typescript:await",
    importName: "__await",
    scoped: false,
    text: "\n            var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }"
};
/** @internal */
exports.asyncGeneratorHelper = {
    name: "typescript:asyncGenerator",
    importName: "__asyncGenerator",
    scoped: false,
    dependencies: [exports.awaitHelper],
    text: "\n            var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {\n                if (!Symbol.asyncIterator) throw new TypeError(\"Symbol.asyncIterator is not defined.\");\n                var g = generator.apply(thisArg, _arguments || []), i, q = [];\n                return i = {}, verb(\"next\"), verb(\"throw\"), verb(\"return\"), i[Symbol.asyncIterator] = function () { return this; }, i;\n                function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }\n                function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }\n                function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }\n                function fulfill(value) { resume(\"next\", value); }\n                function reject(value) { resume(\"throw\", value); }\n                function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }\n            };"
};
/** @internal */
exports.asyncDelegator = {
    name: "typescript:asyncDelegator",
    importName: "__asyncDelegator",
    scoped: false,
    dependencies: [exports.awaitHelper],
    text: "\n            var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {\n                var i, p;\n                return i = {}, verb(\"next\"), verb(\"throw\", function (e) { throw e; }), verb(\"return\"), i[Symbol.iterator] = function () { return this; }, i;\n                function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }\n            };"
};
/** @internal */
exports.asyncValues = {
    name: "typescript:asyncValues",
    importName: "__asyncValues",
    scoped: false,
    text: "\n            var __asyncValues = (this && this.__asyncValues) || function (o) {\n                if (!Symbol.asyncIterator) throw new TypeError(\"Symbol.asyncIterator is not defined.\");\n                var m = o[Symbol.asyncIterator], i;\n                return m ? m.call(o) : (o = typeof __values === \"function\" ? __values(o) : o[Symbol.iterator](), i = {}, verb(\"next\"), verb(\"throw\"), verb(\"return\"), i[Symbol.asyncIterator] = function () { return this; }, i);\n                function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }\n                function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }\n            };"
};
// ES2018 Destructuring Helpers
/** @internal */
exports.restHelper = {
    name: "typescript:rest",
    importName: "__rest",
    scoped: false,
    text: "\n            var __rest = (this && this.__rest) || function (s, e) {\n                var t = {};\n                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)\n                    t[p] = s[p];\n                if (s != null && typeof Object.getOwnPropertySymbols === \"function\")\n                    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {\n                        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))\n                            t[p[i]] = s[p[i]];\n                    }\n                return t;\n            };"
};
// ES2017 Helpers
/** @internal */
exports.awaiterHelper = {
    name: "typescript:awaiter",
    importName: "__awaiter",
    scoped: false,
    priority: 5,
    text: "\n            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n                function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n                return new (P || (P = Promise))(function (resolve, reject) {\n                    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n                    function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n                    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n                    step((generator = generator.apply(thisArg, _arguments || [])).next());\n                });\n            };"
};
// ES2015 Helpers
/** @internal */
exports.extendsHelper = {
    name: "typescript:extends",
    importName: "__extends",
    scoped: false,
    priority: 0,
    text: "\n            var __extends = (this && this.__extends) || (function () {\n                var extendStatics = function (d, b) {\n                    extendStatics = Object.setPrototypeOf ||\n                        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n                        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\n                    return extendStatics(d, b);\n                };\n\n                return function (d, b) {\n                    if (typeof b !== \"function\" && b !== null)\n                        throw new TypeError(\"Class extends value \" + String(b) + \" is not a constructor or null\");\n                    extendStatics(d, b);\n                    function __() { this.constructor = d; }\n                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n                };\n            })();"
};
/** @internal */
exports.templateObjectHelper = {
    name: "typescript:makeTemplateObject",
    importName: "__makeTemplateObject",
    scoped: false,
    priority: 0,
    text: "\n            var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {\n                if (Object.defineProperty) { Object.defineProperty(cooked, \"raw\", { value: raw }); } else { cooked.raw = raw; }\n                return cooked;\n            };"
};
/** @internal */
exports.readHelper = {
    name: "typescript:read",
    importName: "__read",
    scoped: false,
    text: "\n            var __read = (this && this.__read) || function (o, n) {\n                var m = typeof Symbol === \"function\" && o[Symbol.iterator];\n                if (!m) return o;\n                var i = m.call(o), r, ar = [], e;\n                try {\n                    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);\n                }\n                catch (error) { e = { error: error }; }\n                finally {\n                    try {\n                        if (r && !r.done && (m = i[\"return\"])) m.call(i);\n                    }\n                    finally { if (e) throw e.error; }\n                }\n                return ar;\n            };"
};
/** @internal */
exports.spreadArrayHelper = {
    name: "typescript:spreadArray",
    importName: "__spreadArray",
    scoped: false,
    text: "\n            var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {\n                if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {\n                    if (ar || !(i in from)) {\n                        if (!ar) ar = Array.prototype.slice.call(from, 0, i);\n                        ar[i] = from[i];\n                    }\n                }\n                return to.concat(ar || Array.prototype.slice.call(from));\n            };"
};
/** @internal */
exports.propKeyHelper = {
    name: "typescript:propKey",
    importName: "__propKey",
    scoped: false,
    text: "\n        var __propKey = (this && this.__propKey) || function (x) {\n            return typeof x === \"symbol\" ? x : \"\".concat(x);\n        };"
};
// https://tc39.es/ecma262/#sec-setfunctionname
/** @internal */
exports.setFunctionNameHelper = {
    name: "typescript:setFunctionName",
    importName: "__setFunctionName",
    scoped: false,
    text: "\n        var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {\n            if (typeof name === \"symbol\") name = name.description ? \"[\".concat(name.description, \"]\") : \"\";\n            return Object.defineProperty(f, \"name\", { configurable: true, value: prefix ? \"\".concat(prefix, \" \", name) : name });\n        };"
};
// ES2015 Destructuring Helpers
/** @internal */
exports.valuesHelper = {
    name: "typescript:values",
    importName: "__values",
    scoped: false,
    text: "\n            var __values = (this && this.__values) || function(o) {\n                var s = typeof Symbol === \"function\" && Symbol.iterator, m = s && o[s], i = 0;\n                if (m) return m.call(o);\n                if (o && typeof o.length === \"number\") return {\n                    next: function () {\n                        if (o && i >= o.length) o = void 0;\n                        return { value: o && o[i++], done: !o };\n                    }\n                };\n                throw new TypeError(s ? \"Object is not iterable.\" : \"Symbol.iterator is not defined.\");\n            };"
};
// ES2015 Generator Helpers
// The __generator helper is used by down-level transformations to emulate the runtime
// semantics of an ES2015 generator function. When called, this helper returns an
// object that implements the Iterator protocol, in that it has `next`, `return`, and
// `throw` methods that step through the generator when invoked.
//
// parameters:
//  @param thisArg  The value to use as the `this` binding for the transformed generator body.
//  @param body     A function that acts as the transformed generator body.
//
// variables:
//  _       Persistent state for the generator that is shared between the helper and the
//          generator body. The state object has the following members:
//            sent() - A method that returns or throws the current completion value.
//            label  - The next point at which to resume evaluation of the generator body.
//            trys   - A stack of protected regions (try/catch/finally blocks).
//            ops    - A stack of pending instructions when inside of a finally block.
//  f       A value indicating whether the generator is executing.
//  y       An iterator to delegate for a yield*.
//  t       A temporary variable that holds one of the following values (note that these
//          cases do not overlap):
//          - The completion value when resuming from a `yield` or `yield*`.
//          - The error value for a catch block.
//          - The current protected region (array of try/catch/finally/end labels).
//          - The verb (`next`, `throw`, or `return` method) to delegate to the expression
//            of a `yield*`.
//          - The result of evaluating the verb delegated to the expression of a `yield*`.
//  g       A temporary variable that holds onto the generator object until the generator
//          is started, allowing it to also act as the `suspendedStart` state.
//
// functions:
//  verb(n)     Creates a bound callback to the `step` function for opcode `n`.
//  step(op)    Evaluates opcodes in a generator body until execution is suspended or
//              completed.
//
// The __generator helper understands a limited set of instructions:
//  0: next(value?)     - Start or resume the generator with the specified value.
//  1: throw(error)     - Resume the generator with an exception. If the generator is
//                        suspended inside of one or more protected regions, evaluates
//                        any intervening finally blocks between the current label and
//                        the nearest catch block or function boundary. If uncaught, the
//                        exception is thrown to the caller.
//  2: return(value?)   - Resume the generator as if with a return. If the generator is
//                        suspended inside of one or more protected regions, evaluates any
//                        intervening finally blocks.
//  3: break(label)     - Jump to the specified label. If the label is outside of the
//                        current protected region, evaluates any intervening finally
//                        blocks.
//  4: yield(value?)    - Yield execution to the caller with an optional value. When
//                        resumed, the generator will continue at the next label.
//  5: yield*(value)    - Delegates evaluation to the supplied iterator. When
//                        delegation completes, the generator will continue at the next
//                        label.
//  6: catch(error)     - Handles an exception thrown from within the generator body. If
//                        the current label is inside of one or more protected regions,
//                        evaluates any intervening finally blocks between the current
//                        label and the nearest catch block or function boundary. If
//                        uncaught, the exception is thrown to the caller.
//  7: endfinally       - Ends a finally block, resuming the last instruction prior to
//                        entering a finally block.
//
// For examples of how these are used, see the comments in ./transformers/generators.ts
/** @internal */
exports.generatorHelper = {
    name: "typescript:generator",
    importName: "__generator",
    scoped: false,
    priority: 6,
    text: "\n            var __generator = (this && this.__generator) || function (thisArg, body) {\n                var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n                return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n                function verb(n) { return function (v) { return step([n, v]); }; }\n                function step(op) {\n                    if (f) throw new TypeError(\"Generator is already executing.\");\n                    while (g && (g = 0, op[0] && (_ = 0)), _) try {\n                        if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n                        if (y = 0, t) op = [op[0] & 2, t.value];\n                        switch (op[0]) {\n                            case 0: case 1: t = op; break;\n                            case 4: _.label++; return { value: op[1], done: false };\n                            case 5: _.label++; y = op[1]; op = [0]; continue;\n                            case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                            default:\n                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                                if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                                if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                                if (t[2]) _.ops.pop();\n                                _.trys.pop(); continue;\n                        }\n                        op = body.call(thisArg, _);\n                    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n                    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n                }\n            };"
};
// ES Module Helpers
/** @internal */
exports.createBindingHelper = {
    name: "typescript:commonjscreatebinding",
    importName: "__createBinding",
    scoped: false,
    priority: 1,
    text: "\n            var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n                if (k2 === undefined) k2 = k;\n                var desc = Object.getOwnPropertyDescriptor(m, k);\n                if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n                  desc = { enumerable: true, get: function() { return m[k]; } };\n                }\n                Object.defineProperty(o, k2, desc);\n            }) : (function(o, m, k, k2) {\n                if (k2 === undefined) k2 = k;\n                o[k2] = m[k];\n            }));"
};
/** @internal */
exports.setModuleDefaultHelper = {
    name: "typescript:commonjscreatevalue",
    importName: "__setModuleDefault",
    scoped: false,
    priority: 1,
    text: "\n            var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n                Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n            }) : function(o, v) {\n                o[\"default\"] = v;\n            });"
};
// emit helper for `import * as Name from "foo"`
/** @internal */
exports.importStarHelper = {
    name: "typescript:commonjsimportstar",
    importName: "__importStar",
    scoped: false,
    dependencies: [exports.createBindingHelper, exports.setModuleDefaultHelper],
    priority: 2,
    text: "\n            var __importStar = (this && this.__importStar) || function (mod) {\n                if (mod && mod.__esModule) return mod;\n                var result = {};\n                if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n                __setModuleDefault(result, mod);\n                return result;\n            };"
};
// emit helper for `import Name from "foo"`
/** @internal */
exports.importDefaultHelper = {
    name: "typescript:commonjsimportdefault",
    importName: "__importDefault",
    scoped: false,
    text: "\n            var __importDefault = (this && this.__importDefault) || function (mod) {\n                return (mod && mod.__esModule) ? mod : { \"default\": mod };\n            };"
};
/** @internal */
exports.exportStarHelper = {
    name: "typescript:export-star",
    importName: "__exportStar",
    scoped: false,
    dependencies: [exports.createBindingHelper],
    priority: 2,
    text: "\n            var __exportStar = (this && this.__exportStar) || function(m, exports) {\n                for (var p in m) if (p !== \"default\" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);\n            };"
};
/**
 * Parameters:
 *  @param receiver — The object from which the private member will be read.
 *  @param state — One of the following:
 *      - A WeakMap used to read a private instance field.
 *      - A WeakSet used as an instance brand for private instance methods and accessors.
 *      - A function value that should be the undecorated class constructor used to brand check private static fields, methods, and accessors.
 *  @param kind — (optional pre TS 4.3, required for TS 4.3+) One of the following values:
 *      - undefined — Indicates a private instance field (pre TS 4.3).
 *      - "f" — Indicates a private field (instance or static).
 *      - "m" — Indicates a private method (instance or static).
 *      - "a" — Indicates a private accessor (instance or static).
 *  @param f — (optional pre TS 4.3) Depends on the arguments for state and kind:
 *      - If kind is "m", this should be the function corresponding to the static or instance method.
 *      - If kind is "a", this should be the function corresponding to the getter method, or undefined if the getter was not defined.
 *      - If kind is "f" and state is a function, this should be an object holding the value of a static field, or undefined if the static field declaration has not yet been evaluated.
 * Usage:
 * This helper will only ever be used by the compiler in the following ways:
 *
 * Reading from a private instance field (pre TS 4.3):
 *      __classPrivateFieldGet(<any>, <WeakMap>)
 *
 * Reading from a private instance field (TS 4.3+):
 *      __classPrivateFieldGet(<any>, <WeakMap>, "f")
 *
 * Reading from a private instance get accessor (when defined, TS 4.3+):
 *      __classPrivateFieldGet(<any>, <WeakSet>, "a", <function>)
 *
 * Reading from a private instance get accessor (when not defined, TS 4.3+):
 *      __classPrivateFieldGet(<any>, <WeakSet>, "a", void 0)
 *      NOTE: This always results in a runtime error.
 *
 * Reading from a private instance method (TS 4.3+):
 *      __classPrivateFieldGet(<any>, <WeakSet>, "m", <function>)
 *
 * Reading from a private static field (TS 4.3+):
 *      __classPrivateFieldGet(<any>, <constructor>, "f", <{ value: any }>)
 *
 * Reading from a private static get accessor (when defined, TS 4.3+):
 *      __classPrivateFieldGet(<any>, <constructor>, "a", <function>)
 *
 * Reading from a private static get accessor (when not defined, TS 4.3+):
 *      __classPrivateFieldGet(<any>, <constructor>, "a", void 0)
 *      NOTE: This always results in a runtime error.
 *
 * Reading from a private static method (TS 4.3+):
 *      __classPrivateFieldGet(<any>, <constructor>, "m", <function>)
 *
 * @internal
 */
exports.classPrivateFieldGetHelper = {
    name: "typescript:classPrivateFieldGet",
    importName: "__classPrivateFieldGet",
    scoped: false,
    text: "\n            var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {\n                if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a getter\");\n                if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot read private member from an object whose class did not declare it\");\n                return kind === \"m\" ? f : kind === \"a\" ? f.call(receiver) : f ? f.value : state.get(receiver);\n            };"
};
/**
 * Parameters:
 *  @param receiver — The object on which the private member will be set.
 *  @param state — One of the following:
 *      - A WeakMap used to store a private instance field.
 *      - A WeakSet used as an instance brand for private instance methods and accessors.
 *      - A function value that should be the undecorated class constructor used to brand check private static fields, methods, and accessors.
 *  @param value — The value to set.
 *  @param kind — (optional pre TS 4.3, required for TS 4.3+) One of the following values:
 *       - undefined — Indicates a private instance field (pre TS 4.3).
 *       - "f" — Indicates a private field (instance or static).
 *       - "m" — Indicates a private method (instance or static).
 *       - "a" — Indicates a private accessor (instance or static).
 *   @param f — (optional pre TS 4.3) Depends on the arguments for state and kind:
 *       - If kind is "m", this should be the function corresponding to the static or instance method.
 *       - If kind is "a", this should be the function corresponding to the setter method, or undefined if the setter was not defined.
 *       - If kind is "f" and state is a function, this should be an object holding the value of a static field, or undefined if the static field declaration has not yet been evaluated.
 * Usage:
 * This helper will only ever be used by the compiler in the following ways:
 *
 * Writing to a private instance field (pre TS 4.3):
 *      __classPrivateFieldSet(<any>, <WeakMap>, <any>)
 *
 * Writing to a private instance field (TS 4.3+):
 *      __classPrivateFieldSet(<any>, <WeakMap>, <any>, "f")
 *
 * Writing to a private instance set accessor (when defined, TS 4.3+):
 *      __classPrivateFieldSet(<any>, <WeakSet>, <any>, "a", <function>)
 *
 * Writing to a private instance set accessor (when not defined, TS 4.3+):
 *      __classPrivateFieldSet(<any>, <WeakSet>, <any>, "a", void 0)
 *      NOTE: This always results in a runtime error.
 *
 * Writing to a private instance method (TS 4.3+):
 *      __classPrivateFieldSet(<any>, <WeakSet>, <any>, "m", <function>)
 *      NOTE: This always results in a runtime error.
 *
 * Writing to a private static field (TS 4.3+):
 *      __classPrivateFieldSet(<any>, <constructor>, <any>, "f", <{ value: any }>)
 *
 * Writing to a private static set accessor (when defined, TS 4.3+):
 *      __classPrivateFieldSet(<any>, <constructor>, <any>, "a", <function>)
 *
 * Writing to a private static set accessor (when not defined, TS 4.3+):
 *      __classPrivateFieldSet(<any>, <constructor>, <any>, "a", void 0)
 *      NOTE: This always results in a runtime error.
 *
 * Writing to a private static method (TS 4.3+):
 *      __classPrivateFieldSet(<any>, <constructor>, <any>, "m", <function>)
 *      NOTE: This always results in a runtime error.
 *
 * @internal
 */
exports.classPrivateFieldSetHelper = {
    name: "typescript:classPrivateFieldSet",
    importName: "__classPrivateFieldSet",
    scoped: false,
    text: "\n            var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {\n                if (kind === \"m\") throw new TypeError(\"Private method is not writable\");\n                if (kind === \"a\" && !f) throw new TypeError(\"Private accessor was defined without a setter\");\n                if (typeof state === \"function\" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError(\"Cannot write private member to an object whose class did not declare it\");\n                return (kind === \"a\" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;\n            };"
};
/**
 * Parameters:
 *  @param state — One of the following:
 *      - A WeakMap when the member is a private instance field.
 *      - A WeakSet when the member is a private instance method or accessor.
 *      - A function value that should be the undecorated class constructor when the member is a private static field, method, or accessor.
 *  @param receiver — The object being checked if it has the private member.
 *
 * Usage:
 * This helper is used to transform `#field in expression` to
 *      `__classPrivateFieldIn(<weakMap/weakSet/constructor>, expression)`
 *
 * @internal
 */
exports.classPrivateFieldInHelper = {
    name: "typescript:classPrivateFieldIn",
    importName: "__classPrivateFieldIn",
    scoped: false,
    text: "\n            var __classPrivateFieldIn = (this && this.__classPrivateFieldIn) || function(state, receiver) {\n                if (receiver === null || (typeof receiver !== \"object\" && typeof receiver !== \"function\")) throw new TypeError(\"Cannot use 'in' operator on non-object\");\n                return typeof state === \"function\" ? receiver === state : state.has(receiver);\n            };"
};
var allUnscopedEmitHelpers;
/** @internal */
function getAllUnscopedEmitHelpers() {
    return allUnscopedEmitHelpers || (allUnscopedEmitHelpers = (0, ts_1.arrayToMap)([
        exports.decorateHelper,
        exports.metadataHelper,
        exports.paramHelper,
        exports.esDecorateHelper,
        exports.runInitializersHelper,
        exports.assignHelper,
        exports.awaitHelper,
        exports.asyncGeneratorHelper,
        exports.asyncDelegator,
        exports.asyncValues,
        exports.restHelper,
        exports.awaiterHelper,
        exports.extendsHelper,
        exports.templateObjectHelper,
        exports.spreadArrayHelper,
        exports.valuesHelper,
        exports.readHelper,
        exports.propKeyHelper,
        exports.setFunctionNameHelper,
        exports.generatorHelper,
        exports.importStarHelper,
        exports.importDefaultHelper,
        exports.exportStarHelper,
        exports.classPrivateFieldGetHelper,
        exports.classPrivateFieldSetHelper,
        exports.classPrivateFieldInHelper,
        exports.createBindingHelper,
        exports.setModuleDefaultHelper
    ], function (helper) { return helper.name; }));
}
exports.getAllUnscopedEmitHelpers = getAllUnscopedEmitHelpers;
/** @internal */
exports.asyncSuperHelper = {
    name: "typescript:async-super",
    scoped: true,
    text: helperString(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            const ", " = name => super[name];"], ["\n            const ", " = name => super[name];"])), "_superIndex")
};
/** @internal */
exports.advancedAsyncSuperHelper = {
    name: "typescript:advanced-async-super",
    scoped: true,
    text: helperString(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n            const ", " = (function (geti, seti) {\n                const cache = Object.create(null);\n                return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });\n            })(name => super[name], (name, value) => super[name] = value);"], ["\n            const ", " = (function (geti, seti) {\n                const cache = Object.create(null);\n                return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });\n            })(name => super[name], (name, value) => super[name] = value);"])), "_superIndex")
};
/** @internal */
function isCallToHelper(firstSegment, helperName) {
    return (0, ts_1.isCallExpression)(firstSegment)
        && (0, ts_1.isIdentifier)(firstSegment.expression)
        && ((0, ts_1.getEmitFlags)(firstSegment.expression) & 8192 /* EmitFlags.HelperName */) !== 0
        && firstSegment.expression.escapedText === helperName;
}
exports.isCallToHelper = isCallToHelper;
var templateObject_1, templateObject_2;
