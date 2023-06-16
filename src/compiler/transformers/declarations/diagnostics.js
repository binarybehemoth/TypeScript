"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGetSymbolAccessibilityDiagnosticForNode = exports.createGetSymbolAccessibilityDiagnosticForNodeName = exports.canProduceDiagnostics = void 0;
var ts_1 = require("../../_namespaces/ts");
/** @internal */
function canProduceDiagnostics(node) {
    return (0, ts_1.isVariableDeclaration)(node) ||
        (0, ts_1.isPropertyDeclaration)(node) ||
        (0, ts_1.isPropertySignature)(node) ||
        (0, ts_1.isBindingElement)(node) ||
        (0, ts_1.isSetAccessor)(node) ||
        (0, ts_1.isGetAccessor)(node) ||
        (0, ts_1.isConstructSignatureDeclaration)(node) ||
        (0, ts_1.isCallSignatureDeclaration)(node) ||
        (0, ts_1.isMethodDeclaration)(node) ||
        (0, ts_1.isMethodSignature)(node) ||
        (0, ts_1.isFunctionDeclaration)(node) ||
        (0, ts_1.isParameter)(node) ||
        (0, ts_1.isTypeParameterDeclaration)(node) ||
        (0, ts_1.isExpressionWithTypeArguments)(node) ||
        (0, ts_1.isImportEqualsDeclaration)(node) ||
        (0, ts_1.isTypeAliasDeclaration)(node) ||
        (0, ts_1.isConstructorDeclaration)(node) ||
        (0, ts_1.isIndexSignatureDeclaration)(node) ||
        (0, ts_1.isPropertyAccessExpression)(node) ||
        (0, ts_1.isElementAccessExpression)(node) ||
        (0, ts_1.isBinaryExpression)(node) ||
        (0, ts_1.isJSDocTypeAlias)(node);
}
exports.canProduceDiagnostics = canProduceDiagnostics;
/** @internal */
function createGetSymbolAccessibilityDiagnosticForNodeName(node) {
    if ((0, ts_1.isSetAccessor)(node) || (0, ts_1.isGetAccessor)(node)) {
        return getAccessorNameVisibilityError;
    }
    else if ((0, ts_1.isMethodSignature)(node) || (0, ts_1.isMethodDeclaration)(node)) {
        return getMethodNameVisibilityError;
    }
    else {
        return createGetSymbolAccessibilityDiagnosticForNode(node);
    }
    function getAccessorNameVisibilityError(symbolAccessibilityResult) {
        var diagnosticMessage = getAccessorNameVisibilityDiagnosticMessage(symbolAccessibilityResult);
        return diagnosticMessage !== undefined ? {
            diagnosticMessage: diagnosticMessage,
            errorNode: node,
            typeName: node.name
        } : undefined;
    }
    function getAccessorNameVisibilityDiagnosticMessage(symbolAccessibilityResult) {
        if ((0, ts_1.isStatic)(node)) {
            return symbolAccessibilityResult.errorModuleName ?
                symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                    ts_1.Diagnostics.Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                    ts_1.Diagnostics.Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Public_static_property_0_of_exported_class_has_or_is_using_private_name_1;
        }
        else if (node.parent.kind === 262 /* SyntaxKind.ClassDeclaration */) {
            return symbolAccessibilityResult.errorModuleName ?
                symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                    ts_1.Diagnostics.Public_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                    ts_1.Diagnostics.Public_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Public_property_0_of_exported_class_has_or_is_using_private_name_1;
        }
        else {
            return symbolAccessibilityResult.errorModuleName ?
                ts_1.Diagnostics.Property_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Property_0_of_exported_interface_has_or_is_using_private_name_1;
        }
    }
    function getMethodNameVisibilityError(symbolAccessibilityResult) {
        var diagnosticMessage = getMethodNameVisibilityDiagnosticMessage(symbolAccessibilityResult);
        return diagnosticMessage !== undefined ? {
            diagnosticMessage: diagnosticMessage,
            errorNode: node,
            typeName: node.name
        } : undefined;
    }
    function getMethodNameVisibilityDiagnosticMessage(symbolAccessibilityResult) {
        if ((0, ts_1.isStatic)(node)) {
            return symbolAccessibilityResult.errorModuleName ?
                symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                    ts_1.Diagnostics.Public_static_method_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                    ts_1.Diagnostics.Public_static_method_0_of_exported_class_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Public_static_method_0_of_exported_class_has_or_is_using_private_name_1;
        }
        else if (node.parent.kind === 262 /* SyntaxKind.ClassDeclaration */) {
            return symbolAccessibilityResult.errorModuleName ?
                symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                    ts_1.Diagnostics.Public_method_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                    ts_1.Diagnostics.Public_method_0_of_exported_class_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Public_method_0_of_exported_class_has_or_is_using_private_name_1;
        }
        else {
            return symbolAccessibilityResult.errorModuleName ?
                ts_1.Diagnostics.Method_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Method_0_of_exported_interface_has_or_is_using_private_name_1;
        }
    }
}
exports.createGetSymbolAccessibilityDiagnosticForNodeName = createGetSymbolAccessibilityDiagnosticForNodeName;
/** @internal */
function createGetSymbolAccessibilityDiagnosticForNode(node) {
    if ((0, ts_1.isVariableDeclaration)(node) || (0, ts_1.isPropertyDeclaration)(node) || (0, ts_1.isPropertySignature)(node) || (0, ts_1.isPropertyAccessExpression)(node) || (0, ts_1.isElementAccessExpression)(node) || (0, ts_1.isBinaryExpression)(node) || (0, ts_1.isBindingElement)(node) || (0, ts_1.isConstructorDeclaration)(node)) {
        return getVariableDeclarationTypeVisibilityError;
    }
    else if ((0, ts_1.isSetAccessor)(node) || (0, ts_1.isGetAccessor)(node)) {
        return getAccessorDeclarationTypeVisibilityError;
    }
    else if ((0, ts_1.isConstructSignatureDeclaration)(node) || (0, ts_1.isCallSignatureDeclaration)(node) || (0, ts_1.isMethodDeclaration)(node) || (0, ts_1.isMethodSignature)(node) || (0, ts_1.isFunctionDeclaration)(node) || (0, ts_1.isIndexSignatureDeclaration)(node)) {
        return getReturnTypeVisibilityError;
    }
    else if ((0, ts_1.isParameter)(node)) {
        if ((0, ts_1.isParameterPropertyDeclaration)(node, node.parent) && (0, ts_1.hasSyntacticModifier)(node.parent, 8 /* ModifierFlags.Private */)) {
            return getVariableDeclarationTypeVisibilityError;
        }
        return getParameterDeclarationTypeVisibilityError;
    }
    else if ((0, ts_1.isTypeParameterDeclaration)(node)) {
        return getTypeParameterConstraintVisibilityError;
    }
    else if ((0, ts_1.isExpressionWithTypeArguments)(node)) {
        return getHeritageClauseVisibilityError;
    }
    else if ((0, ts_1.isImportEqualsDeclaration)(node)) {
        return getImportEntityNameVisibilityError;
    }
    else if ((0, ts_1.isTypeAliasDeclaration)(node) || (0, ts_1.isJSDocTypeAlias)(node)) {
        return getTypeAliasDeclarationVisibilityError;
    }
    else {
        return ts_1.Debug.assertNever(node, "Attempted to set a declaration diagnostic context for unhandled node kind: ".concat(ts_1.Debug.formatSyntaxKind(node.kind)));
    }
    function getVariableDeclarationTypeVisibilityDiagnosticMessage(symbolAccessibilityResult) {
        if (node.kind === 259 /* SyntaxKind.VariableDeclaration */ || node.kind === 207 /* SyntaxKind.BindingElement */) {
            return symbolAccessibilityResult.errorModuleName ?
                symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                    ts_1.Diagnostics.Exported_variable_0_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                    ts_1.Diagnostics.Exported_variable_0_has_or_is_using_name_1_from_private_module_2 :
                ts_1.Diagnostics.Exported_variable_0_has_or_is_using_private_name_1;
        }
        // This check is to ensure we don't report error on constructor parameter property as that error would be reported during parameter emit
        // The only exception here is if the constructor was marked as private. we are not emitting the constructor parameters at all.
        else if (node.kind === 171 /* SyntaxKind.PropertyDeclaration */ || node.kind === 210 /* SyntaxKind.PropertyAccessExpression */ || node.kind === 211 /* SyntaxKind.ElementAccessExpression */ || node.kind === 225 /* SyntaxKind.BinaryExpression */ || node.kind === 170 /* SyntaxKind.PropertySignature */ ||
            (node.kind === 168 /* SyntaxKind.Parameter */ && (0, ts_1.hasSyntacticModifier)(node.parent, 8 /* ModifierFlags.Private */))) {
            // TODO(jfreeman): Deal with computed properties in error reporting.
            if ((0, ts_1.isStatic)(node)) {
                return symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Public_static_property_0_of_exported_class_has_or_is_using_private_name_1;
            }
            else if (node.parent.kind === 262 /* SyntaxKind.ClassDeclaration */ || node.kind === 168 /* SyntaxKind.Parameter */) {
                return symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Public_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Public_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Public_property_0_of_exported_class_has_or_is_using_private_name_1;
            }
            else {
                // Interfaces cannot have types that cannot be named
                return symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Property_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Property_0_of_exported_interface_has_or_is_using_private_name_1;
            }
        }
    }
    function getVariableDeclarationTypeVisibilityError(symbolAccessibilityResult) {
        var diagnosticMessage = getVariableDeclarationTypeVisibilityDiagnosticMessage(symbolAccessibilityResult);
        return diagnosticMessage !== undefined ? {
            diagnosticMessage: diagnosticMessage,
            errorNode: node,
            typeName: node.name
        } : undefined;
    }
    function getAccessorDeclarationTypeVisibilityError(symbolAccessibilityResult) {
        var diagnosticMessage;
        if (node.kind === 177 /* SyntaxKind.SetAccessor */) {
            // Getters can infer the return type from the returned expression, but setters cannot, so the
            // "_from_external_module_1_but_cannot_be_named" case cannot occur.
            if ((0, ts_1.isStatic)(node)) {
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Parameter_type_of_public_static_setter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_type_of_public_static_setter_0_from_exported_class_has_or_is_using_private_name_1;
            }
            else {
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Parameter_type_of_public_setter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_type_of_public_setter_0_from_exported_class_has_or_is_using_private_name_1;
            }
        }
        else {
            if ((0, ts_1.isStatic)(node)) {
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Return_type_of_public_static_getter_0_from_exported_class_has_or_is_using_private_name_1;
            }
            else {
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Return_type_of_public_getter_0_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Return_type_of_public_getter_0_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Return_type_of_public_getter_0_from_exported_class_has_or_is_using_private_name_1;
            }
        }
        return {
            diagnosticMessage: diagnosticMessage,
            errorNode: node.name,
            typeName: node.name
        };
    }
    function getReturnTypeVisibilityError(symbolAccessibilityResult) {
        var diagnosticMessage;
        switch (node.kind) {
            case 179 /* SyntaxKind.ConstructSignature */:
                // Interfaces cannot have return types that cannot be named
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1 :
                    ts_1.Diagnostics.Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_0;
                break;
            case 178 /* SyntaxKind.CallSignature */:
                // Interfaces cannot have return types that cannot be named
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Return_type_of_call_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1 :
                    ts_1.Diagnostics.Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_name_0;
                break;
            case 180 /* SyntaxKind.IndexSignature */:
                // Interfaces cannot have return types that cannot be named
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Return_type_of_index_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1 :
                    ts_1.Diagnostics.Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_name_0;
                break;
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
                if ((0, ts_1.isStatic)(node)) {
                    diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                        symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                            ts_1.Diagnostics.Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named :
                            ts_1.Diagnostics.Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_private_module_1 :
                        ts_1.Diagnostics.Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_name_0;
                }
                else if (node.parent.kind === 262 /* SyntaxKind.ClassDeclaration */) {
                    diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                        symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                            ts_1.Diagnostics.Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named :
                            ts_1.Diagnostics.Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_private_module_1 :
                        ts_1.Diagnostics.Return_type_of_public_method_from_exported_class_has_or_is_using_private_name_0;
                }
                else {
                    // Interfaces cannot have return types that cannot be named
                    diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                        ts_1.Diagnostics.Return_type_of_method_from_exported_interface_has_or_is_using_name_0_from_private_module_1 :
                        ts_1.Diagnostics.Return_type_of_method_from_exported_interface_has_or_is_using_private_name_0;
                }
                break;
            case 261 /* SyntaxKind.FunctionDeclaration */:
                diagnosticMessage = symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Return_type_of_exported_function_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named :
                        ts_1.Diagnostics.Return_type_of_exported_function_has_or_is_using_name_0_from_private_module_1 :
                    ts_1.Diagnostics.Return_type_of_exported_function_has_or_is_using_private_name_0;
                break;
            default:
                return ts_1.Debug.fail("This is unknown kind for signature: " + node.kind);
        }
        return {
            diagnosticMessage: diagnosticMessage,
            errorNode: node.name || node
        };
    }
    function getParameterDeclarationTypeVisibilityError(symbolAccessibilityResult) {
        var diagnosticMessage = getParameterDeclarationTypeVisibilityDiagnosticMessage(symbolAccessibilityResult);
        return diagnosticMessage !== undefined ? {
            diagnosticMessage: diagnosticMessage,
            errorNode: node,
            typeName: node.name
        } : undefined;
    }
    function getParameterDeclarationTypeVisibilityDiagnosticMessage(symbolAccessibilityResult) {
        switch (node.parent.kind) {
            case 175 /* SyntaxKind.Constructor */:
                return symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_0_of_constructor_from_exported_class_has_or_is_using_private_name_1;
            case 179 /* SyntaxKind.ConstructSignature */:
            case 184 /* SyntaxKind.ConstructorType */:
                // Interfaces cannot have parameter types that cannot be named
                return symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1;
            case 178 /* SyntaxKind.CallSignature */:
                // Interfaces cannot have parameter types that cannot be named
                return symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1;
            case 180 /* SyntaxKind.IndexSignature */:
                // Interfaces cannot have parameter types that cannot be named
                return symbolAccessibilityResult.errorModuleName ?
                    ts_1.Diagnostics.Parameter_0_of_index_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_0_of_index_signature_from_exported_interface_has_or_is_using_private_name_1;
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
                if ((0, ts_1.isStatic)(node.parent)) {
                    return symbolAccessibilityResult.errorModuleName ?
                        symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                            ts_1.Diagnostics.Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                            ts_1.Diagnostics.Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                        ts_1.Diagnostics.Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1;
                }
                else if (node.parent.parent.kind === 262 /* SyntaxKind.ClassDeclaration */) {
                    return symbolAccessibilityResult.errorModuleName ?
                        symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                            ts_1.Diagnostics.Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                            ts_1.Diagnostics.Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_private_module_2 :
                        ts_1.Diagnostics.Parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1;
                }
                else {
                    // Interfaces cannot have parameter types that cannot be named
                    return symbolAccessibilityResult.errorModuleName ?
                        ts_1.Diagnostics.Parameter_0_of_method_from_exported_interface_has_or_is_using_name_1_from_private_module_2 :
                        ts_1.Diagnostics.Parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1;
                }
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 183 /* SyntaxKind.FunctionType */:
                return symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Parameter_0_of_exported_function_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Parameter_0_of_exported_function_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_0_of_exported_function_has_or_is_using_private_name_1;
            case 177 /* SyntaxKind.SetAccessor */:
            case 176 /* SyntaxKind.GetAccessor */:
                return symbolAccessibilityResult.errorModuleName ?
                    symbolAccessibilityResult.accessibility === 2 /* SymbolAccessibility.CannotBeNamed */ ?
                        ts_1.Diagnostics.Parameter_0_of_accessor_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named :
                        ts_1.Diagnostics.Parameter_0_of_accessor_has_or_is_using_name_1_from_private_module_2 :
                    ts_1.Diagnostics.Parameter_0_of_accessor_has_or_is_using_private_name_1;
            default:
                return ts_1.Debug.fail("Unknown parent for parameter: ".concat(ts_1.Debug.formatSyntaxKind(node.parent.kind)));
        }
    }
    function getTypeParameterConstraintVisibilityError() {
        // Type parameter constraints are named by user so we should always be able to name it
        var diagnosticMessage;
        switch (node.parent.kind) {
            case 262 /* SyntaxKind.ClassDeclaration */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_exported_class_has_or_is_using_private_name_1;
                break;
            case 263 /* SyntaxKind.InterfaceDeclaration */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_exported_interface_has_or_is_using_private_name_1;
                break;
            case 199 /* SyntaxKind.MappedType */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_exported_mapped_object_type_is_using_private_name_1;
                break;
            case 184 /* SyntaxKind.ConstructorType */:
            case 179 /* SyntaxKind.ConstructSignature */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1;
                break;
            case 178 /* SyntaxKind.CallSignature */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1;
                break;
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
                if ((0, ts_1.isStatic)(node.parent)) {
                    diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1;
                }
                else if (node.parent.parent.kind === 262 /* SyntaxKind.ClassDeclaration */) {
                    diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1;
                }
                else {
                    diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1;
                }
                break;
            case 183 /* SyntaxKind.FunctionType */:
            case 261 /* SyntaxKind.FunctionDeclaration */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_exported_function_has_or_is_using_private_name_1;
                break;
            case 194 /* SyntaxKind.InferType */:
                diagnosticMessage = ts_1.Diagnostics.Extends_clause_for_inferred_type_0_has_or_is_using_private_name_1;
                break;
            case 264 /* SyntaxKind.TypeAliasDeclaration */:
                diagnosticMessage = ts_1.Diagnostics.Type_parameter_0_of_exported_type_alias_has_or_is_using_private_name_1;
                break;
            default:
                return ts_1.Debug.fail("This is unknown parent for type parameter: " + node.parent.kind);
        }
        return {
            diagnosticMessage: diagnosticMessage,
            errorNode: node,
            typeName: node.name
        };
    }
    function getHeritageClauseVisibilityError() {
        var diagnosticMessage;
        // Heritage clause is written by user so it can always be named
        if ((0, ts_1.isClassDeclaration)(node.parent.parent)) {
            // Class or Interface implemented/extended is inaccessible
            diagnosticMessage = (0, ts_1.isHeritageClause)(node.parent) && node.parent.token === 119 /* SyntaxKind.ImplementsKeyword */ ?
                ts_1.Diagnostics.Implements_clause_of_exported_class_0_has_or_is_using_private_name_1 :
                node.parent.parent.name ? ts_1.Diagnostics.extends_clause_of_exported_class_0_has_or_is_using_private_name_1 :
                    ts_1.Diagnostics.extends_clause_of_exported_class_has_or_is_using_private_name_0;
        }
        else {
            // interface is inaccessible
            diagnosticMessage = ts_1.Diagnostics.extends_clause_of_exported_interface_0_has_or_is_using_private_name_1;
        }
        return {
            diagnosticMessage: diagnosticMessage,
            errorNode: node,
            typeName: (0, ts_1.getNameOfDeclaration)(node.parent.parent)
        };
    }
    function getImportEntityNameVisibilityError() {
        return {
            diagnosticMessage: ts_1.Diagnostics.Import_declaration_0_is_using_private_name_1,
            errorNode: node,
            typeName: node.name
        };
    }
    function getTypeAliasDeclarationVisibilityError(symbolAccessibilityResult) {
        return {
            diagnosticMessage: symbolAccessibilityResult.errorModuleName
                ? ts_1.Diagnostics.Exported_type_alias_0_has_or_is_using_private_name_1_from_module_2
                : ts_1.Diagnostics.Exported_type_alias_0_has_or_is_using_private_name_1,
            errorNode: (0, ts_1.isJSDocTypeAlias)(node) ? ts_1.Debug.checkDefined(node.typeExpression) : node.type,
            typeName: (0, ts_1.isJSDocTypeAlias)(node) ? (0, ts_1.getNameOfDeclaration)(node) : node.name,
        };
    }
}
exports.createGetSymbolAccessibilityDiagnosticForNode = createGetSymbolAccessibilityDiagnosticForNode;
