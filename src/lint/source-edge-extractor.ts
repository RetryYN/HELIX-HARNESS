import ts from "typescript";

export type SourceEdgeKind =
  | "import"
  | "type_import"
  | "re_export"
  | "dynamic_import"
  | "literal_require"
  | "import_equals"
  | "unknown_edge_kind";

export interface SourceDocument {
  path: string;
  source: string;
}

export interface SourceEdge {
  from: string;
  specifier: string | null;
  kind: SourceEdgeKind;
  line: number;
  reason: string;
}

function literalText(node: ts.Expression): string | null {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : null;
}

function sourceFile(document: SourceDocument): ts.SourceFile {
  return ts.createSourceFile(document.path, document.source, ts.ScriptTarget.Latest, true);
}

function lineOf(file: ts.SourceFile, node: ts.Node): number {
  return file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
}

/** PLAN-L7-452 / U-SBOUND-008: supported syntaxを一つのSourceEdgeへ正規化する。 */
export function extractSourceEdges(documents: readonly SourceDocument[]): SourceEdge[] {
  const edges: SourceEdge[] = [];
  for (const document of documents) {
    const file = sourceFile(document);
    const push = (node: ts.Node, kind: SourceEdgeKind, specifier: string | null, reason: string) =>
      edges.push({ from: document.path, specifier, kind, line: lineOf(file, node), reason });

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        push(
          node,
          node.importClause?.isTypeOnly === true ? "type_import" : "import",
          node.moduleSpecifier.text,
          "static import declaration",
        );
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        push(
          node,
          "re_export",
          ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : null,
          "re-export declaration",
        );
      } else if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference)
      ) {
        const expression = node.moduleReference.expression;
        push(
          node,
          expression ? "import_equals" : "unknown_edge_kind",
          expression ? literalText(expression) : null,
          expression ? "TypeScript import-equals" : "import-equals without literal module",
        );
      } else if (ts.isCallExpression(node)) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const specifier = node.arguments[0] ? literalText(node.arguments[0]) : null;
          push(
            node,
            specifier === null ? "unknown_edge_kind" : "dynamic_import",
            specifier,
            specifier === null ? "computed dynamic import" : "literal dynamic import",
          );
        } else if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
          const specifier = node.arguments[0] ? literalText(node.arguments[0]) : null;
          push(
            node,
            specifier === null ? "unknown_edge_kind" : "literal_require",
            specifier,
            specifier === null ? "computed or nonliteral require" : "literal require",
          );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  return edges.sort(
    (left, right) =>
      left.from.localeCompare(right.from) ||
      left.line - right.line ||
      left.kind.localeCompare(right.kind),
  );
}
