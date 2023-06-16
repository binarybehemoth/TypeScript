"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIndexSignatureDeclaration = exports.isConstructSignatureDeclaration = exports.isCallSignatureDeclaration = exports.isSetAccessorDeclaration = exports.isGetAccessorDeclaration = exports.isConstructorDeclaration = exports.isClassStaticBlockDeclaration = exports.isMethodDeclaration = exports.isMethodSignature = exports.isPropertyDeclaration = exports.isPropertySignature = exports.isDecorator = exports.isParameter = exports.isTypeParameterDeclaration = exports.isComputedPropertyName = exports.isQualifiedName = exports.isCaseKeyword = exports.isImportKeyword = exports.isSuperKeyword = exports.isAccessorModifier = exports.isOverrideModifier = exports.isAbstractModifier = exports.isStaticModifier = exports.isReadonlyKeyword = exports.isAwaitKeyword = exports.isAssertsKeyword = exports.isAsyncModifier = exports.isDefaultModifier = exports.isExportModifier = exports.isPrivateIdentifier = exports.isIdentifier = exports.isEqualsGreaterThanToken = exports.isQuestionDotToken = exports.isColonToken = exports.isQuestionToken = exports.isExclamationToken = exports.isAsteriskToken = exports.isMinusToken = exports.isPlusToken = exports.isCommaToken = exports.isDotDotDotToken = exports.isTemplateTail = exports.isTemplateMiddle = exports.isTemplateHead = exports.isNoSubstitutionTemplateLiteral = exports.isRegularExpressionLiteral = exports.isJsxText = exports.isStringLiteral = exports.isBigIntLiteral = exports.isNumericLiteral = void 0;
exports.isClassExpression = exports.isSpreadElement = exports.isYieldExpression = exports.isTemplateExpression = exports.isConditionalExpression = exports.isBinaryExpression = exports.isPostfixUnaryExpression = exports.isPrefixUnaryExpression = exports.isAwaitExpression = exports.isVoidExpression = exports.isTypeOfExpression = exports.isDeleteExpression = exports.isArrowFunction = exports.isFunctionExpression = exports.isParenthesizedExpression = exports.isTypeAssertionExpression = exports.isTaggedTemplateExpression = exports.isNewExpression = exports.isCallExpression = exports.isElementAccessExpression = exports.isPropertyAccessExpression = exports.isObjectLiteralExpression = exports.isArrayLiteralExpression = exports.isBindingElement = exports.isArrayBindingPattern = exports.isObjectBindingPattern = exports.isTemplateLiteralTypeNode = exports.isTemplateLiteralTypeSpan = exports.isImportTypeNode = exports.isLiteralTypeNode = exports.isMappedTypeNode = exports.isIndexedAccessTypeNode = exports.isTypeOperatorNode = exports.isThisTypeNode = exports.isParenthesizedTypeNode = exports.isInferTypeNode = exports.isConditionalTypeNode = exports.isIntersectionTypeNode = exports.isUnionTypeNode = exports.isRestTypeNode = exports.isOptionalTypeNode = exports.isNamedTupleMember = exports.isTupleTypeNode = exports.isArrayTypeNode = exports.isTypeLiteralNode = exports.isTypeQueryNode = exports.isConstructorTypeNode = exports.isFunctionTypeNode = exports.isTypeReferenceNode = exports.isTypePredicateNode = void 0;
exports.isNamedImports = exports.isNamespaceExport = exports.isNamespaceImport = exports.isAssertEntry = exports.isAssertClause = exports.isImportTypeAssertionContainer = exports.isImportClause = exports.isImportDeclaration = exports.isImportEqualsDeclaration = exports.isNamespaceExportDeclaration = exports.isCaseBlock = exports.isModuleBlock = exports.isModuleDeclaration = exports.isEnumDeclaration = exports.isTypeAliasDeclaration = exports.isInterfaceDeclaration = exports.isClassDeclaration = exports.isFunctionDeclaration = exports.isVariableDeclarationList = exports.isVariableDeclaration = exports.isDebuggerStatement = exports.isTryStatement = exports.isThrowStatement = exports.isLabeledStatement = exports.isSwitchStatement = exports.isWithStatement = exports.isReturnStatement = exports.isBreakStatement = exports.isContinueStatement = exports.isForOfStatement = exports.isForInStatement = exports.isForStatement = exports.isWhileStatement = exports.isDoStatement = exports.isIfStatement = exports.isExpressionStatement = exports.isEmptyStatement = exports.isVariableStatement = exports.isBlock = exports.isSemicolonClassElement = exports.isTemplateSpan = exports.isCommaListExpression = exports.isPartiallyEmittedExpression = exports.isSyntheticExpression = exports.isMetaProperty = exports.isNonNullExpression = exports.isSatisfiesExpression = exports.isAsExpression = exports.isExpressionWithTypeArguments = exports.isOmittedExpression = void 0;
exports.isJSDocSignature = exports.isJSDocTypeLiteral = exports.isJSDoc = exports.isJSDocNamepathType = exports.isJSDocVariadicType = exports.isJSDocFunctionType = exports.isJSDocOptionalType = exports.isJSDocNonNullableType = exports.isJSDocNullableType = exports.isJSDocUnknownType = exports.isJSDocAllType = exports.isJSDocLinkPlain = exports.isJSDocLinkCode = exports.isJSDocLink = exports.isJSDocMemberName = exports.isJSDocNameReference = exports.isJSDocTypeExpression = exports.isUnparsedSource = exports.isBundle = exports.isSourceFile = exports.isUnparsedPrepend = exports.isEnumMember = exports.isSpreadAssignment = exports.isShorthandPropertyAssignment = exports.isPropertyAssignment = exports.isCatchClause = exports.isHeritageClause = exports.isDefaultClause = exports.isCaseClause = exports.isJsxNamespacedName = exports.isJsxExpression = exports.isJsxSpreadAttribute = exports.isJsxAttributes = exports.isJsxAttribute = exports.isJsxClosingFragment = exports.isJsxOpeningFragment = exports.isJsxFragment = exports.isJsxClosingElement = exports.isJsxOpeningElement = exports.isJsxSelfClosingElement = exports.isJsxElement = exports.isExternalModuleReference = exports.isSyntheticReference = exports.isNotEmittedStatement = exports.isMissingDeclaration = exports.isExportSpecifier = exports.isNamedExports = exports.isExportDeclaration = exports.isExportAssignment = exports.isImportSpecifier = void 0;
exports.isSyntaxList = exports.isJSDocThrowsTag = exports.isJSDocSatisfiesTag = exports.isJSDocImplementsTag = exports.isJSDocPropertyTag = exports.isJSDocUnknownTag = exports.isJSDocTypedefTag = exports.isJSDocTemplateTag = exports.isJSDocTypeTag = exports.isJSDocThisTag = exports.isJSDocReturnTag = exports.isJSDocParameterTag = exports.isJSDocEnumTag = exports.isJSDocSeeTag = exports.isJSDocDeprecatedTag = exports.isJSDocOverloadTag = exports.isJSDocOverrideTag = exports.isJSDocReadonlyTag = exports.isJSDocProtectedTag = exports.isJSDocPrivateTag = exports.isJSDocPublicTag = exports.isJSDocCallbackTag = exports.isJSDocClassTag = exports.isJSDocAuthorTag = exports.isJSDocAugmentsTag = void 0;
// Literals
function isNumericLiteral(node) {
    return node.kind === 9 /* SyntaxKind.NumericLiteral */;
}
exports.isNumericLiteral = isNumericLiteral;
function isBigIntLiteral(node) {
    return node.kind === 10 /* SyntaxKind.BigIntLiteral */;
}
exports.isBigIntLiteral = isBigIntLiteral;
function isStringLiteral(node) {
    return node.kind === 11 /* SyntaxKind.StringLiteral */;
}
exports.isStringLiteral = isStringLiteral;
function isJsxText(node) {
    return node.kind === 12 /* SyntaxKind.JsxText */;
}
exports.isJsxText = isJsxText;
function isRegularExpressionLiteral(node) {
    return node.kind === 14 /* SyntaxKind.RegularExpressionLiteral */;
}
exports.isRegularExpressionLiteral = isRegularExpressionLiteral;
function isNoSubstitutionTemplateLiteral(node) {
    return node.kind === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */;
}
exports.isNoSubstitutionTemplateLiteral = isNoSubstitutionTemplateLiteral;
// Pseudo-literals
function isTemplateHead(node) {
    return node.kind === 16 /* SyntaxKind.TemplateHead */;
}
exports.isTemplateHead = isTemplateHead;
function isTemplateMiddle(node) {
    return node.kind === 17 /* SyntaxKind.TemplateMiddle */;
}
exports.isTemplateMiddle = isTemplateMiddle;
function isTemplateTail(node) {
    return node.kind === 18 /* SyntaxKind.TemplateTail */;
}
exports.isTemplateTail = isTemplateTail;
// Punctuation
function isDotDotDotToken(node) {
    return node.kind === 26 /* SyntaxKind.DotDotDotToken */;
}
exports.isDotDotDotToken = isDotDotDotToken;
/** @internal */
function isCommaToken(node) {
    return node.kind === 28 /* SyntaxKind.CommaToken */;
}
exports.isCommaToken = isCommaToken;
function isPlusToken(node) {
    return node.kind === 40 /* SyntaxKind.PlusToken */;
}
exports.isPlusToken = isPlusToken;
function isMinusToken(node) {
    return node.kind === 41 /* SyntaxKind.MinusToken */;
}
exports.isMinusToken = isMinusToken;
function isAsteriskToken(node) {
    return node.kind === 42 /* SyntaxKind.AsteriskToken */;
}
exports.isAsteriskToken = isAsteriskToken;
function isExclamationToken(node) {
    return node.kind === 54 /* SyntaxKind.ExclamationToken */;
}
exports.isExclamationToken = isExclamationToken;
function isQuestionToken(node) {
    return node.kind === 58 /* SyntaxKind.QuestionToken */;
}
exports.isQuestionToken = isQuestionToken;
function isColonToken(node) {
    return node.kind === 59 /* SyntaxKind.ColonToken */;
}
exports.isColonToken = isColonToken;
function isQuestionDotToken(node) {
    return node.kind === 29 /* SyntaxKind.QuestionDotToken */;
}
exports.isQuestionDotToken = isQuestionDotToken;
function isEqualsGreaterThanToken(node) {
    return node.kind === 39 /* SyntaxKind.EqualsGreaterThanToken */;
}
exports.isEqualsGreaterThanToken = isEqualsGreaterThanToken;
// Identifiers
function isIdentifier(node) {
    return node.kind === 80 /* SyntaxKind.Identifier */;
}
exports.isIdentifier = isIdentifier;
function isPrivateIdentifier(node) {
    return node.kind === 81 /* SyntaxKind.PrivateIdentifier */;
}
exports.isPrivateIdentifier = isPrivateIdentifier;
// Reserved Words
/** @internal */
function isExportModifier(node) {
    return node.kind === 95 /* SyntaxKind.ExportKeyword */;
}
exports.isExportModifier = isExportModifier;
/** @internal */
function isDefaultModifier(node) {
    return node.kind === 90 /* SyntaxKind.DefaultKeyword */;
}
exports.isDefaultModifier = isDefaultModifier;
/** @internal */
function isAsyncModifier(node) {
    return node.kind === 134 /* SyntaxKind.AsyncKeyword */;
}
exports.isAsyncModifier = isAsyncModifier;
function isAssertsKeyword(node) {
    return node.kind === 131 /* SyntaxKind.AssertsKeyword */;
}
exports.isAssertsKeyword = isAssertsKeyword;
function isAwaitKeyword(node) {
    return node.kind === 135 /* SyntaxKind.AwaitKeyword */;
}
exports.isAwaitKeyword = isAwaitKeyword;
/** @internal */
function isReadonlyKeyword(node) {
    return node.kind === 148 /* SyntaxKind.ReadonlyKeyword */;
}
exports.isReadonlyKeyword = isReadonlyKeyword;
/** @internal */
function isStaticModifier(node) {
    return node.kind === 126 /* SyntaxKind.StaticKeyword */;
}
exports.isStaticModifier = isStaticModifier;
/** @internal */
function isAbstractModifier(node) {
    return node.kind === 128 /* SyntaxKind.AbstractKeyword */;
}
exports.isAbstractModifier = isAbstractModifier;
/** @internal */
function isOverrideModifier(node) {
    return node.kind === 163 /* SyntaxKind.OverrideKeyword */;
}
exports.isOverrideModifier = isOverrideModifier;
/** @internal */
function isAccessorModifier(node) {
    return node.kind === 129 /* SyntaxKind.AccessorKeyword */;
}
exports.isAccessorModifier = isAccessorModifier;
/** @internal */
function isSuperKeyword(node) {
    return node.kind === 108 /* SyntaxKind.SuperKeyword */;
}
exports.isSuperKeyword = isSuperKeyword;
/** @internal */
function isImportKeyword(node) {
    return node.kind === 102 /* SyntaxKind.ImportKeyword */;
}
exports.isImportKeyword = isImportKeyword;
/** @internal */
function isCaseKeyword(node) {
    return node.kind === 84 /* SyntaxKind.CaseKeyword */;
}
exports.isCaseKeyword = isCaseKeyword;
// Names
function isQualifiedName(node) {
    return node.kind === 165 /* SyntaxKind.QualifiedName */;
}
exports.isQualifiedName = isQualifiedName;
function isComputedPropertyName(node) {
    return node.kind === 166 /* SyntaxKind.ComputedPropertyName */;
}
exports.isComputedPropertyName = isComputedPropertyName;
// Signature elements
function isTypeParameterDeclaration(node) {
    return node.kind === 167 /* SyntaxKind.TypeParameter */;
}
exports.isTypeParameterDeclaration = isTypeParameterDeclaration;
// TODO(rbuckton): Rename to 'isParameterDeclaration'
function isParameter(node) {
    return node.kind === 168 /* SyntaxKind.Parameter */;
}
exports.isParameter = isParameter;
function isDecorator(node) {
    return node.kind === 169 /* SyntaxKind.Decorator */;
}
exports.isDecorator = isDecorator;
// TypeMember
function isPropertySignature(node) {
    return node.kind === 170 /* SyntaxKind.PropertySignature */;
}
exports.isPropertySignature = isPropertySignature;
function isPropertyDeclaration(node) {
    return node.kind === 171 /* SyntaxKind.PropertyDeclaration */;
}
exports.isPropertyDeclaration = isPropertyDeclaration;
function isMethodSignature(node) {
    return node.kind === 172 /* SyntaxKind.MethodSignature */;
}
exports.isMethodSignature = isMethodSignature;
function isMethodDeclaration(node) {
    return node.kind === 173 /* SyntaxKind.MethodDeclaration */;
}
exports.isMethodDeclaration = isMethodDeclaration;
function isClassStaticBlockDeclaration(node) {
    return node.kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */;
}
exports.isClassStaticBlockDeclaration = isClassStaticBlockDeclaration;
function isConstructorDeclaration(node) {
    return node.kind === 175 /* SyntaxKind.Constructor */;
}
exports.isConstructorDeclaration = isConstructorDeclaration;
function isGetAccessorDeclaration(node) {
    return node.kind === 176 /* SyntaxKind.GetAccessor */;
}
exports.isGetAccessorDeclaration = isGetAccessorDeclaration;
function isSetAccessorDeclaration(node) {
    return node.kind === 177 /* SyntaxKind.SetAccessor */;
}
exports.isSetAccessorDeclaration = isSetAccessorDeclaration;
function isCallSignatureDeclaration(node) {
    return node.kind === 178 /* SyntaxKind.CallSignature */;
}
exports.isCallSignatureDeclaration = isCallSignatureDeclaration;
function isConstructSignatureDeclaration(node) {
    return node.kind === 179 /* SyntaxKind.ConstructSignature */;
}
exports.isConstructSignatureDeclaration = isConstructSignatureDeclaration;
function isIndexSignatureDeclaration(node) {
    return node.kind === 180 /* SyntaxKind.IndexSignature */;
}
exports.isIndexSignatureDeclaration = isIndexSignatureDeclaration;
// Type
function isTypePredicateNode(node) {
    return node.kind === 181 /* SyntaxKind.TypePredicate */;
}
exports.isTypePredicateNode = isTypePredicateNode;
function isTypeReferenceNode(node) {
    return node.kind === 182 /* SyntaxKind.TypeReference */;
}
exports.isTypeReferenceNode = isTypeReferenceNode;
function isFunctionTypeNode(node) {
    return node.kind === 183 /* SyntaxKind.FunctionType */;
}
exports.isFunctionTypeNode = isFunctionTypeNode;
function isConstructorTypeNode(node) {
    return node.kind === 184 /* SyntaxKind.ConstructorType */;
}
exports.isConstructorTypeNode = isConstructorTypeNode;
function isTypeQueryNode(node) {
    return node.kind === 185 /* SyntaxKind.TypeQuery */;
}
exports.isTypeQueryNode = isTypeQueryNode;
function isTypeLiteralNode(node) {
    return node.kind === 186 /* SyntaxKind.TypeLiteral */;
}
exports.isTypeLiteralNode = isTypeLiteralNode;
function isArrayTypeNode(node) {
    return node.kind === 187 /* SyntaxKind.ArrayType */;
}
exports.isArrayTypeNode = isArrayTypeNode;
function isTupleTypeNode(node) {
    return node.kind === 188 /* SyntaxKind.TupleType */;
}
exports.isTupleTypeNode = isTupleTypeNode;
function isNamedTupleMember(node) {
    return node.kind === 201 /* SyntaxKind.NamedTupleMember */;
}
exports.isNamedTupleMember = isNamedTupleMember;
function isOptionalTypeNode(node) {
    return node.kind === 189 /* SyntaxKind.OptionalType */;
}
exports.isOptionalTypeNode = isOptionalTypeNode;
function isRestTypeNode(node) {
    return node.kind === 190 /* SyntaxKind.RestType */;
}
exports.isRestTypeNode = isRestTypeNode;
function isUnionTypeNode(node) {
    return node.kind === 191 /* SyntaxKind.UnionType */;
}
exports.isUnionTypeNode = isUnionTypeNode;
function isIntersectionTypeNode(node) {
    return node.kind === 192 /* SyntaxKind.IntersectionType */;
}
exports.isIntersectionTypeNode = isIntersectionTypeNode;
function isConditionalTypeNode(node) {
    return node.kind === 193 /* SyntaxKind.ConditionalType */;
}
exports.isConditionalTypeNode = isConditionalTypeNode;
function isInferTypeNode(node) {
    return node.kind === 194 /* SyntaxKind.InferType */;
}
exports.isInferTypeNode = isInferTypeNode;
function isParenthesizedTypeNode(node) {
    return node.kind === 195 /* SyntaxKind.ParenthesizedType */;
}
exports.isParenthesizedTypeNode = isParenthesizedTypeNode;
function isThisTypeNode(node) {
    return node.kind === 196 /* SyntaxKind.ThisType */;
}
exports.isThisTypeNode = isThisTypeNode;
function isTypeOperatorNode(node) {
    return node.kind === 197 /* SyntaxKind.TypeOperator */;
}
exports.isTypeOperatorNode = isTypeOperatorNode;
function isIndexedAccessTypeNode(node) {
    return node.kind === 198 /* SyntaxKind.IndexedAccessType */;
}
exports.isIndexedAccessTypeNode = isIndexedAccessTypeNode;
function isMappedTypeNode(node) {
    return node.kind === 199 /* SyntaxKind.MappedType */;
}
exports.isMappedTypeNode = isMappedTypeNode;
function isLiteralTypeNode(node) {
    return node.kind === 200 /* SyntaxKind.LiteralType */;
}
exports.isLiteralTypeNode = isLiteralTypeNode;
function isImportTypeNode(node) {
    return node.kind === 204 /* SyntaxKind.ImportType */;
}
exports.isImportTypeNode = isImportTypeNode;
function isTemplateLiteralTypeSpan(node) {
    return node.kind === 203 /* SyntaxKind.TemplateLiteralTypeSpan */;
}
exports.isTemplateLiteralTypeSpan = isTemplateLiteralTypeSpan;
function isTemplateLiteralTypeNode(node) {
    return node.kind === 202 /* SyntaxKind.TemplateLiteralType */;
}
exports.isTemplateLiteralTypeNode = isTemplateLiteralTypeNode;
// Binding patterns
function isObjectBindingPattern(node) {
    return node.kind === 205 /* SyntaxKind.ObjectBindingPattern */;
}
exports.isObjectBindingPattern = isObjectBindingPattern;
function isArrayBindingPattern(node) {
    return node.kind === 206 /* SyntaxKind.ArrayBindingPattern */;
}
exports.isArrayBindingPattern = isArrayBindingPattern;
function isBindingElement(node) {
    return node.kind === 207 /* SyntaxKind.BindingElement */;
}
exports.isBindingElement = isBindingElement;
// Expression
function isArrayLiteralExpression(node) {
    return node.kind === 208 /* SyntaxKind.ArrayLiteralExpression */;
}
exports.isArrayLiteralExpression = isArrayLiteralExpression;
function isObjectLiteralExpression(node) {
    return node.kind === 209 /* SyntaxKind.ObjectLiteralExpression */;
}
exports.isObjectLiteralExpression = isObjectLiteralExpression;
function isPropertyAccessExpression(node) {
    return node.kind === 210 /* SyntaxKind.PropertyAccessExpression */;
}
exports.isPropertyAccessExpression = isPropertyAccessExpression;
function isElementAccessExpression(node) {
    return node.kind === 211 /* SyntaxKind.ElementAccessExpression */;
}
exports.isElementAccessExpression = isElementAccessExpression;
function isCallExpression(node) {
    return node.kind === 212 /* SyntaxKind.CallExpression */;
}
exports.isCallExpression = isCallExpression;
function isNewExpression(node) {
    return node.kind === 213 /* SyntaxKind.NewExpression */;
}
exports.isNewExpression = isNewExpression;
function isTaggedTemplateExpression(node) {
    return node.kind === 214 /* SyntaxKind.TaggedTemplateExpression */;
}
exports.isTaggedTemplateExpression = isTaggedTemplateExpression;
function isTypeAssertionExpression(node) {
    return node.kind === 215 /* SyntaxKind.TypeAssertionExpression */;
}
exports.isTypeAssertionExpression = isTypeAssertionExpression;
function isParenthesizedExpression(node) {
    return node.kind === 216 /* SyntaxKind.ParenthesizedExpression */;
}
exports.isParenthesizedExpression = isParenthesizedExpression;
function isFunctionExpression(node) {
    return node.kind === 217 /* SyntaxKind.FunctionExpression */;
}
exports.isFunctionExpression = isFunctionExpression;
function isArrowFunction(node) {
    return node.kind === 218 /* SyntaxKind.ArrowFunction */;
}
exports.isArrowFunction = isArrowFunction;
function isDeleteExpression(node) {
    return node.kind === 219 /* SyntaxKind.DeleteExpression */;
}
exports.isDeleteExpression = isDeleteExpression;
function isTypeOfExpression(node) {
    return node.kind === 220 /* SyntaxKind.TypeOfExpression */;
}
exports.isTypeOfExpression = isTypeOfExpression;
function isVoidExpression(node) {
    return node.kind === 221 /* SyntaxKind.VoidExpression */;
}
exports.isVoidExpression = isVoidExpression;
function isAwaitExpression(node) {
    return node.kind === 222 /* SyntaxKind.AwaitExpression */;
}
exports.isAwaitExpression = isAwaitExpression;
function isPrefixUnaryExpression(node) {
    return node.kind === 223 /* SyntaxKind.PrefixUnaryExpression */;
}
exports.isPrefixUnaryExpression = isPrefixUnaryExpression;
function isPostfixUnaryExpression(node) {
    return node.kind === 224 /* SyntaxKind.PostfixUnaryExpression */;
}
exports.isPostfixUnaryExpression = isPostfixUnaryExpression;
function isBinaryExpression(node) {
    return node.kind === 225 /* SyntaxKind.BinaryExpression */;
}
exports.isBinaryExpression = isBinaryExpression;
function isConditionalExpression(node) {
    return node.kind === 226 /* SyntaxKind.ConditionalExpression */;
}
exports.isConditionalExpression = isConditionalExpression;
function isTemplateExpression(node) {
    return node.kind === 227 /* SyntaxKind.TemplateExpression */;
}
exports.isTemplateExpression = isTemplateExpression;
function isYieldExpression(node) {
    return node.kind === 228 /* SyntaxKind.YieldExpression */;
}
exports.isYieldExpression = isYieldExpression;
function isSpreadElement(node) {
    return node.kind === 229 /* SyntaxKind.SpreadElement */;
}
exports.isSpreadElement = isSpreadElement;
function isClassExpression(node) {
    return node.kind === 230 /* SyntaxKind.ClassExpression */;
}
exports.isClassExpression = isClassExpression;
function isOmittedExpression(node) {
    return node.kind === 231 /* SyntaxKind.OmittedExpression */;
}
exports.isOmittedExpression = isOmittedExpression;
function isExpressionWithTypeArguments(node) {
    return node.kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */;
}
exports.isExpressionWithTypeArguments = isExpressionWithTypeArguments;
function isAsExpression(node) {
    return node.kind === 233 /* SyntaxKind.AsExpression */;
}
exports.isAsExpression = isAsExpression;
function isSatisfiesExpression(node) {
    return node.kind === 237 /* SyntaxKind.SatisfiesExpression */;
}
exports.isSatisfiesExpression = isSatisfiesExpression;
function isNonNullExpression(node) {
    return node.kind === 234 /* SyntaxKind.NonNullExpression */;
}
exports.isNonNullExpression = isNonNullExpression;
function isMetaProperty(node) {
    return node.kind === 235 /* SyntaxKind.MetaProperty */;
}
exports.isMetaProperty = isMetaProperty;
function isSyntheticExpression(node) {
    return node.kind === 236 /* SyntaxKind.SyntheticExpression */;
}
exports.isSyntheticExpression = isSyntheticExpression;
function isPartiallyEmittedExpression(node) {
    return node.kind === 359 /* SyntaxKind.PartiallyEmittedExpression */;
}
exports.isPartiallyEmittedExpression = isPartiallyEmittedExpression;
function isCommaListExpression(node) {
    return node.kind === 360 /* SyntaxKind.CommaListExpression */;
}
exports.isCommaListExpression = isCommaListExpression;
// Misc
function isTemplateSpan(node) {
    return node.kind === 238 /* SyntaxKind.TemplateSpan */;
}
exports.isTemplateSpan = isTemplateSpan;
function isSemicolonClassElement(node) {
    return node.kind === 239 /* SyntaxKind.SemicolonClassElement */;
}
exports.isSemicolonClassElement = isSemicolonClassElement;
// Elements
function isBlock(node) {
    return node.kind === 240 /* SyntaxKind.Block */;
}
exports.isBlock = isBlock;
function isVariableStatement(node) {
    return node.kind === 242 /* SyntaxKind.VariableStatement */;
}
exports.isVariableStatement = isVariableStatement;
function isEmptyStatement(node) {
    return node.kind === 241 /* SyntaxKind.EmptyStatement */;
}
exports.isEmptyStatement = isEmptyStatement;
function isExpressionStatement(node) {
    return node.kind === 243 /* SyntaxKind.ExpressionStatement */;
}
exports.isExpressionStatement = isExpressionStatement;
function isIfStatement(node) {
    return node.kind === 244 /* SyntaxKind.IfStatement */;
}
exports.isIfStatement = isIfStatement;
function isDoStatement(node) {
    return node.kind === 245 /* SyntaxKind.DoStatement */;
}
exports.isDoStatement = isDoStatement;
function isWhileStatement(node) {
    return node.kind === 246 /* SyntaxKind.WhileStatement */;
}
exports.isWhileStatement = isWhileStatement;
function isForStatement(node) {
    return node.kind === 247 /* SyntaxKind.ForStatement */;
}
exports.isForStatement = isForStatement;
function isForInStatement(node) {
    return node.kind === 248 /* SyntaxKind.ForInStatement */;
}
exports.isForInStatement = isForInStatement;
function isForOfStatement(node) {
    return node.kind === 249 /* SyntaxKind.ForOfStatement */;
}
exports.isForOfStatement = isForOfStatement;
function isContinueStatement(node) {
    return node.kind === 250 /* SyntaxKind.ContinueStatement */;
}
exports.isContinueStatement = isContinueStatement;
function isBreakStatement(node) {
    return node.kind === 251 /* SyntaxKind.BreakStatement */;
}
exports.isBreakStatement = isBreakStatement;
function isReturnStatement(node) {
    return node.kind === 252 /* SyntaxKind.ReturnStatement */;
}
exports.isReturnStatement = isReturnStatement;
function isWithStatement(node) {
    return node.kind === 253 /* SyntaxKind.WithStatement */;
}
exports.isWithStatement = isWithStatement;
function isSwitchStatement(node) {
    return node.kind === 254 /* SyntaxKind.SwitchStatement */;
}
exports.isSwitchStatement = isSwitchStatement;
function isLabeledStatement(node) {
    return node.kind === 255 /* SyntaxKind.LabeledStatement */;
}
exports.isLabeledStatement = isLabeledStatement;
function isThrowStatement(node) {
    return node.kind === 256 /* SyntaxKind.ThrowStatement */;
}
exports.isThrowStatement = isThrowStatement;
function isTryStatement(node) {
    return node.kind === 257 /* SyntaxKind.TryStatement */;
}
exports.isTryStatement = isTryStatement;
function isDebuggerStatement(node) {
    return node.kind === 258 /* SyntaxKind.DebuggerStatement */;
}
exports.isDebuggerStatement = isDebuggerStatement;
function isVariableDeclaration(node) {
    return node.kind === 259 /* SyntaxKind.VariableDeclaration */;
}
exports.isVariableDeclaration = isVariableDeclaration;
function isVariableDeclarationList(node) {
    return node.kind === 260 /* SyntaxKind.VariableDeclarationList */;
}
exports.isVariableDeclarationList = isVariableDeclarationList;
function isFunctionDeclaration(node) {
    return node.kind === 261 /* SyntaxKind.FunctionDeclaration */;
}
exports.isFunctionDeclaration = isFunctionDeclaration;
function isClassDeclaration(node) {
    return node.kind === 262 /* SyntaxKind.ClassDeclaration */;
}
exports.isClassDeclaration = isClassDeclaration;
function isInterfaceDeclaration(node) {
    return node.kind === 263 /* SyntaxKind.InterfaceDeclaration */;
}
exports.isInterfaceDeclaration = isInterfaceDeclaration;
function isTypeAliasDeclaration(node) {
    return node.kind === 264 /* SyntaxKind.TypeAliasDeclaration */;
}
exports.isTypeAliasDeclaration = isTypeAliasDeclaration;
function isEnumDeclaration(node) {
    return node.kind === 265 /* SyntaxKind.EnumDeclaration */;
}
exports.isEnumDeclaration = isEnumDeclaration;
function isModuleDeclaration(node) {
    return node.kind === 266 /* SyntaxKind.ModuleDeclaration */;
}
exports.isModuleDeclaration = isModuleDeclaration;
function isModuleBlock(node) {
    return node.kind === 267 /* SyntaxKind.ModuleBlock */;
}
exports.isModuleBlock = isModuleBlock;
function isCaseBlock(node) {
    return node.kind === 268 /* SyntaxKind.CaseBlock */;
}
exports.isCaseBlock = isCaseBlock;
function isNamespaceExportDeclaration(node) {
    return node.kind === 269 /* SyntaxKind.NamespaceExportDeclaration */;
}
exports.isNamespaceExportDeclaration = isNamespaceExportDeclaration;
function isImportEqualsDeclaration(node) {
    return node.kind === 270 /* SyntaxKind.ImportEqualsDeclaration */;
}
exports.isImportEqualsDeclaration = isImportEqualsDeclaration;
function isImportDeclaration(node) {
    return node.kind === 271 /* SyntaxKind.ImportDeclaration */;
}
exports.isImportDeclaration = isImportDeclaration;
function isImportClause(node) {
    return node.kind === 272 /* SyntaxKind.ImportClause */;
}
exports.isImportClause = isImportClause;
function isImportTypeAssertionContainer(node) {
    return node.kind === 301 /* SyntaxKind.ImportTypeAssertionContainer */;
}
exports.isImportTypeAssertionContainer = isImportTypeAssertionContainer;
function isAssertClause(node) {
    return node.kind === 299 /* SyntaxKind.AssertClause */;
}
exports.isAssertClause = isAssertClause;
function isAssertEntry(node) {
    return node.kind === 300 /* SyntaxKind.AssertEntry */;
}
exports.isAssertEntry = isAssertEntry;
function isNamespaceImport(node) {
    return node.kind === 273 /* SyntaxKind.NamespaceImport */;
}
exports.isNamespaceImport = isNamespaceImport;
function isNamespaceExport(node) {
    return node.kind === 279 /* SyntaxKind.NamespaceExport */;
}
exports.isNamespaceExport = isNamespaceExport;
function isNamedImports(node) {
    return node.kind === 274 /* SyntaxKind.NamedImports */;
}
exports.isNamedImports = isNamedImports;
function isImportSpecifier(node) {
    return node.kind === 275 /* SyntaxKind.ImportSpecifier */;
}
exports.isImportSpecifier = isImportSpecifier;
function isExportAssignment(node) {
    return node.kind === 276 /* SyntaxKind.ExportAssignment */;
}
exports.isExportAssignment = isExportAssignment;
function isExportDeclaration(node) {
    return node.kind === 277 /* SyntaxKind.ExportDeclaration */;
}
exports.isExportDeclaration = isExportDeclaration;
function isNamedExports(node) {
    return node.kind === 278 /* SyntaxKind.NamedExports */;
}
exports.isNamedExports = isNamedExports;
function isExportSpecifier(node) {
    return node.kind === 280 /* SyntaxKind.ExportSpecifier */;
}
exports.isExportSpecifier = isExportSpecifier;
function isMissingDeclaration(node) {
    return node.kind === 281 /* SyntaxKind.MissingDeclaration */;
}
exports.isMissingDeclaration = isMissingDeclaration;
function isNotEmittedStatement(node) {
    return node.kind === 358 /* SyntaxKind.NotEmittedStatement */;
}
exports.isNotEmittedStatement = isNotEmittedStatement;
/** @internal */
function isSyntheticReference(node) {
    return node.kind === 361 /* SyntaxKind.SyntheticReferenceExpression */;
}
exports.isSyntheticReference = isSyntheticReference;
// Module References
function isExternalModuleReference(node) {
    return node.kind === 282 /* SyntaxKind.ExternalModuleReference */;
}
exports.isExternalModuleReference = isExternalModuleReference;
// JSX
function isJsxElement(node) {
    return node.kind === 283 /* SyntaxKind.JsxElement */;
}
exports.isJsxElement = isJsxElement;
function isJsxSelfClosingElement(node) {
    return node.kind === 284 /* SyntaxKind.JsxSelfClosingElement */;
}
exports.isJsxSelfClosingElement = isJsxSelfClosingElement;
function isJsxOpeningElement(node) {
    return node.kind === 285 /* SyntaxKind.JsxOpeningElement */;
}
exports.isJsxOpeningElement = isJsxOpeningElement;
function isJsxClosingElement(node) {
    return node.kind === 286 /* SyntaxKind.JsxClosingElement */;
}
exports.isJsxClosingElement = isJsxClosingElement;
function isJsxFragment(node) {
    return node.kind === 287 /* SyntaxKind.JsxFragment */;
}
exports.isJsxFragment = isJsxFragment;
function isJsxOpeningFragment(node) {
    return node.kind === 288 /* SyntaxKind.JsxOpeningFragment */;
}
exports.isJsxOpeningFragment = isJsxOpeningFragment;
function isJsxClosingFragment(node) {
    return node.kind === 289 /* SyntaxKind.JsxClosingFragment */;
}
exports.isJsxClosingFragment = isJsxClosingFragment;
function isJsxAttribute(node) {
    return node.kind === 290 /* SyntaxKind.JsxAttribute */;
}
exports.isJsxAttribute = isJsxAttribute;
function isJsxAttributes(node) {
    return node.kind === 291 /* SyntaxKind.JsxAttributes */;
}
exports.isJsxAttributes = isJsxAttributes;
function isJsxSpreadAttribute(node) {
    return node.kind === 292 /* SyntaxKind.JsxSpreadAttribute */;
}
exports.isJsxSpreadAttribute = isJsxSpreadAttribute;
function isJsxExpression(node) {
    return node.kind === 293 /* SyntaxKind.JsxExpression */;
}
exports.isJsxExpression = isJsxExpression;
function isJsxNamespacedName(node) {
    return node.kind === 294 /* SyntaxKind.JsxNamespacedName */;
}
exports.isJsxNamespacedName = isJsxNamespacedName;
// Clauses
function isCaseClause(node) {
    return node.kind === 295 /* SyntaxKind.CaseClause */;
}
exports.isCaseClause = isCaseClause;
function isDefaultClause(node) {
    return node.kind === 296 /* SyntaxKind.DefaultClause */;
}
exports.isDefaultClause = isDefaultClause;
function isHeritageClause(node) {
    return node.kind === 297 /* SyntaxKind.HeritageClause */;
}
exports.isHeritageClause = isHeritageClause;
function isCatchClause(node) {
    return node.kind === 298 /* SyntaxKind.CatchClause */;
}
exports.isCatchClause = isCatchClause;
// Property assignments
function isPropertyAssignment(node) {
    return node.kind === 302 /* SyntaxKind.PropertyAssignment */;
}
exports.isPropertyAssignment = isPropertyAssignment;
function isShorthandPropertyAssignment(node) {
    return node.kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */;
}
exports.isShorthandPropertyAssignment = isShorthandPropertyAssignment;
function isSpreadAssignment(node) {
    return node.kind === 304 /* SyntaxKind.SpreadAssignment */;
}
exports.isSpreadAssignment = isSpreadAssignment;
// Enum
function isEnumMember(node) {
    return node.kind === 305 /* SyntaxKind.EnumMember */;
}
exports.isEnumMember = isEnumMember;
// Unparsed
// TODO(rbuckton): isUnparsedPrologue
/** @deprecated */
function isUnparsedPrepend(node) {
    return node.kind === 307 /* SyntaxKind.UnparsedPrepend */;
}
exports.isUnparsedPrepend = isUnparsedPrepend;
// TODO(rbuckton): isUnparsedText
// TODO(rbuckton): isUnparsedInternalText
// TODO(rbuckton): isUnparsedSyntheticReference
// Top-level nodes
function isSourceFile(node) {
    return node.kind === 311 /* SyntaxKind.SourceFile */;
}
exports.isSourceFile = isSourceFile;
function isBundle(node) {
    return node.kind === 312 /* SyntaxKind.Bundle */;
}
exports.isBundle = isBundle;
/** @deprecated */
function isUnparsedSource(node) {
    return node.kind === 313 /* SyntaxKind.UnparsedSource */;
}
exports.isUnparsedSource = isUnparsedSource;
// TODO(rbuckton): isInputFiles
// JSDoc Elements
function isJSDocTypeExpression(node) {
    return node.kind === 315 /* SyntaxKind.JSDocTypeExpression */;
}
exports.isJSDocTypeExpression = isJSDocTypeExpression;
function isJSDocNameReference(node) {
    return node.kind === 316 /* SyntaxKind.JSDocNameReference */;
}
exports.isJSDocNameReference = isJSDocNameReference;
function isJSDocMemberName(node) {
    return node.kind === 317 /* SyntaxKind.JSDocMemberName */;
}
exports.isJSDocMemberName = isJSDocMemberName;
function isJSDocLink(node) {
    return node.kind === 330 /* SyntaxKind.JSDocLink */;
}
exports.isJSDocLink = isJSDocLink;
function isJSDocLinkCode(node) {
    return node.kind === 331 /* SyntaxKind.JSDocLinkCode */;
}
exports.isJSDocLinkCode = isJSDocLinkCode;
function isJSDocLinkPlain(node) {
    return node.kind === 332 /* SyntaxKind.JSDocLinkPlain */;
}
exports.isJSDocLinkPlain = isJSDocLinkPlain;
function isJSDocAllType(node) {
    return node.kind === 318 /* SyntaxKind.JSDocAllType */;
}
exports.isJSDocAllType = isJSDocAllType;
function isJSDocUnknownType(node) {
    return node.kind === 319 /* SyntaxKind.JSDocUnknownType */;
}
exports.isJSDocUnknownType = isJSDocUnknownType;
function isJSDocNullableType(node) {
    return node.kind === 320 /* SyntaxKind.JSDocNullableType */;
}
exports.isJSDocNullableType = isJSDocNullableType;
function isJSDocNonNullableType(node) {
    return node.kind === 321 /* SyntaxKind.JSDocNonNullableType */;
}
exports.isJSDocNonNullableType = isJSDocNonNullableType;
function isJSDocOptionalType(node) {
    return node.kind === 322 /* SyntaxKind.JSDocOptionalType */;
}
exports.isJSDocOptionalType = isJSDocOptionalType;
function isJSDocFunctionType(node) {
    return node.kind === 323 /* SyntaxKind.JSDocFunctionType */;
}
exports.isJSDocFunctionType = isJSDocFunctionType;
function isJSDocVariadicType(node) {
    return node.kind === 324 /* SyntaxKind.JSDocVariadicType */;
}
exports.isJSDocVariadicType = isJSDocVariadicType;
function isJSDocNamepathType(node) {
    return node.kind === 325 /* SyntaxKind.JSDocNamepathType */;
}
exports.isJSDocNamepathType = isJSDocNamepathType;
function isJSDoc(node) {
    return node.kind === 326 /* SyntaxKind.JSDoc */;
}
exports.isJSDoc = isJSDoc;
function isJSDocTypeLiteral(node) {
    return node.kind === 328 /* SyntaxKind.JSDocTypeLiteral */;
}
exports.isJSDocTypeLiteral = isJSDocTypeLiteral;
function isJSDocSignature(node) {
    return node.kind === 329 /* SyntaxKind.JSDocSignature */;
}
exports.isJSDocSignature = isJSDocSignature;
// JSDoc Tags
function isJSDocAugmentsTag(node) {
    return node.kind === 334 /* SyntaxKind.JSDocAugmentsTag */;
}
exports.isJSDocAugmentsTag = isJSDocAugmentsTag;
function isJSDocAuthorTag(node) {
    return node.kind === 336 /* SyntaxKind.JSDocAuthorTag */;
}
exports.isJSDocAuthorTag = isJSDocAuthorTag;
function isJSDocClassTag(node) {
    return node.kind === 338 /* SyntaxKind.JSDocClassTag */;
}
exports.isJSDocClassTag = isJSDocClassTag;
function isJSDocCallbackTag(node) {
    return node.kind === 344 /* SyntaxKind.JSDocCallbackTag */;
}
exports.isJSDocCallbackTag = isJSDocCallbackTag;
function isJSDocPublicTag(node) {
    return node.kind === 339 /* SyntaxKind.JSDocPublicTag */;
}
exports.isJSDocPublicTag = isJSDocPublicTag;
function isJSDocPrivateTag(node) {
    return node.kind === 340 /* SyntaxKind.JSDocPrivateTag */;
}
exports.isJSDocPrivateTag = isJSDocPrivateTag;
function isJSDocProtectedTag(node) {
    return node.kind === 341 /* SyntaxKind.JSDocProtectedTag */;
}
exports.isJSDocProtectedTag = isJSDocProtectedTag;
function isJSDocReadonlyTag(node) {
    return node.kind === 342 /* SyntaxKind.JSDocReadonlyTag */;
}
exports.isJSDocReadonlyTag = isJSDocReadonlyTag;
function isJSDocOverrideTag(node) {
    return node.kind === 343 /* SyntaxKind.JSDocOverrideTag */;
}
exports.isJSDocOverrideTag = isJSDocOverrideTag;
function isJSDocOverloadTag(node) {
    return node.kind === 345 /* SyntaxKind.JSDocOverloadTag */;
}
exports.isJSDocOverloadTag = isJSDocOverloadTag;
function isJSDocDeprecatedTag(node) {
    return node.kind === 337 /* SyntaxKind.JSDocDeprecatedTag */;
}
exports.isJSDocDeprecatedTag = isJSDocDeprecatedTag;
function isJSDocSeeTag(node) {
    return node.kind === 353 /* SyntaxKind.JSDocSeeTag */;
}
exports.isJSDocSeeTag = isJSDocSeeTag;
function isJSDocEnumTag(node) {
    return node.kind === 346 /* SyntaxKind.JSDocEnumTag */;
}
exports.isJSDocEnumTag = isJSDocEnumTag;
function isJSDocParameterTag(node) {
    return node.kind === 347 /* SyntaxKind.JSDocParameterTag */;
}
exports.isJSDocParameterTag = isJSDocParameterTag;
function isJSDocReturnTag(node) {
    return node.kind === 348 /* SyntaxKind.JSDocReturnTag */;
}
exports.isJSDocReturnTag = isJSDocReturnTag;
function isJSDocThisTag(node) {
    return node.kind === 349 /* SyntaxKind.JSDocThisTag */;
}
exports.isJSDocThisTag = isJSDocThisTag;
function isJSDocTypeTag(node) {
    return node.kind === 350 /* SyntaxKind.JSDocTypeTag */;
}
exports.isJSDocTypeTag = isJSDocTypeTag;
function isJSDocTemplateTag(node) {
    return node.kind === 351 /* SyntaxKind.JSDocTemplateTag */;
}
exports.isJSDocTemplateTag = isJSDocTemplateTag;
function isJSDocTypedefTag(node) {
    return node.kind === 352 /* SyntaxKind.JSDocTypedefTag */;
}
exports.isJSDocTypedefTag = isJSDocTypedefTag;
function isJSDocUnknownTag(node) {
    return node.kind === 333 /* SyntaxKind.JSDocTag */;
}
exports.isJSDocUnknownTag = isJSDocUnknownTag;
function isJSDocPropertyTag(node) {
    return node.kind === 354 /* SyntaxKind.JSDocPropertyTag */;
}
exports.isJSDocPropertyTag = isJSDocPropertyTag;
function isJSDocImplementsTag(node) {
    return node.kind === 335 /* SyntaxKind.JSDocImplementsTag */;
}
exports.isJSDocImplementsTag = isJSDocImplementsTag;
function isJSDocSatisfiesTag(node) {
    return node.kind === 356 /* SyntaxKind.JSDocSatisfiesTag */;
}
exports.isJSDocSatisfiesTag = isJSDocSatisfiesTag;
function isJSDocThrowsTag(node) {
    return node.kind === 355 /* SyntaxKind.JSDocThrowsTag */;
}
exports.isJSDocThrowsTag = isJSDocThrowsTag;
// Synthesized list
/** @internal */
function isSyntaxList(n) {
    return n.kind === 357 /* SyntaxKind.SyntaxList */;
}
exports.isSyntaxList = isSyntaxList;
