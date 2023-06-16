"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canHaveDecorators = exports.canHaveModifiers = exports.setTextRange = void 0;
var ts_1 = require("../_namespaces/ts");
function setTextRange(range, location) {
    return location ? (0, ts_1.setTextRangePosEnd)(range, location.pos, location.end) : range;
}
exports.setTextRange = setTextRange;
function canHaveModifiers(node) {
    var kind = node.kind;
    return kind === 167 /* SyntaxKind.TypeParameter */
        || kind === 168 /* SyntaxKind.Parameter */
        || kind === 170 /* SyntaxKind.PropertySignature */
        || kind === 171 /* SyntaxKind.PropertyDeclaration */
        || kind === 172 /* SyntaxKind.MethodSignature */
        || kind === 173 /* SyntaxKind.MethodDeclaration */
        || kind === 175 /* SyntaxKind.Constructor */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */
        || kind === 180 /* SyntaxKind.IndexSignature */
        || kind === 184 /* SyntaxKind.ConstructorType */
        || kind === 217 /* SyntaxKind.FunctionExpression */
        || kind === 218 /* SyntaxKind.ArrowFunction */
        || kind === 230 /* SyntaxKind.ClassExpression */
        || kind === 242 /* SyntaxKind.VariableStatement */
        || kind === 261 /* SyntaxKind.FunctionDeclaration */
        || kind === 262 /* SyntaxKind.ClassDeclaration */
        || kind === 263 /* SyntaxKind.InterfaceDeclaration */
        || kind === 264 /* SyntaxKind.TypeAliasDeclaration */
        || kind === 265 /* SyntaxKind.EnumDeclaration */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */
        || kind === 270 /* SyntaxKind.ImportEqualsDeclaration */
        || kind === 271 /* SyntaxKind.ImportDeclaration */
        || kind === 276 /* SyntaxKind.ExportAssignment */
        || kind === 277 /* SyntaxKind.ExportDeclaration */;
}
exports.canHaveModifiers = canHaveModifiers;
function canHaveDecorators(node) {
    var kind = node.kind;
    return kind === 168 /* SyntaxKind.Parameter */
        || kind === 171 /* SyntaxKind.PropertyDeclaration */
        || kind === 173 /* SyntaxKind.MethodDeclaration */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */
        || kind === 230 /* SyntaxKind.ClassExpression */
        || kind === 262 /* SyntaxKind.ClassDeclaration */;
}
exports.canHaveDecorators = canHaveDecorators;
