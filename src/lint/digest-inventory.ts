import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

export const DIGEST_VARIANTS = [
  "prefixed_sha256",
  "bare_sha256",
  "truncated_identity",
  "canonical_json",
  "file_stream_digest",
  "pure_lint_embedded",
] as const;
export type DigestVariant = (typeof DIGEST_VARIANTS)[number];
export interface DigestHit {
  hit_id: string;
  path: string;
  line: number;
  symbol: string;
  algorithm: string;
  input_kind: string;
  output_encoding: string;
  prefix: string | null;
  truncation: number | null;
  canonicalization: string;
  variant: DigestVariant;
  disposition: "typed_utility" | "explicit_nonmigration";
  rationale: string;
  expected_test: string;
  citation: string;
}
const EXCLUDED = new Set(["src/lint/digest-inventory.ts"]);
export const DIGEST_FALSE_POSITIVE_ALLOWLIST: Record<string, string> = {
  "src/state-db/historical-vpair-migration-authority.ts:createHash:sha1":
    "Git blob OID requires SHA-1 by Git object-format contract; it is not a SHA-256 digest candidate",
  "src/state-db/projection-writer.ts:createHash:sha1":
    "advisory subject uses a legacy bounded SHA-1 identity contract and is not a SHA-256 digest candidate",
};
const migrated: Record<string, string> = {
  "src/runtime/agent-ssot-runtime-projection.ts": "tests/digest-consumer-compatibility.test.ts",
  "src/runtime/change-package-delta-archive.ts": "tests/digest-consumer-compatibility.test.ts",
  "src/runtime/constitution-template-stack.ts": "tests/digest-consumer-compatibility.test.ts",
  "src/runtime/retirement-preserve.ts": "tests/digest-consumer-compatibility.test.ts",
};
function files(root: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      const f = join(d, n),
        s = statSync(f);
      if (s.isDirectory()) walk(f);
      else if (n.endsWith(".ts")) {
        const p = relative(root, f).replace(/\\/g, "/");
        if (!EXCLUDED.has(p)) out.push(f);
      }
    }
  };
  walk(join(root, "src"));
  return out.sort();
}
function literal(node: ts.Expression | undefined): string | null {
  return node && ts.isStringLiteralLike(node) ? node.text : null;
}
function owner(node: ts.Node): string {
  for (let n: ts.Node | undefined = node; n; n = n.parent) {
    if (
      (ts.isFunctionDeclaration(n) || ts.isClassDeclaration(n) || ts.isVariableDeclaration(n)) &&
      n.name
    )
      return n.name.getText();
  }
  return "module";
}
export function scanDigestInventory(root: string): DigestHit[] {
  const hits: DigestHit[] = [];
  const migratedSeen = new Set<string>();
  for (const full of files(root)) {
    const path = relative(root, full).replace(/\\/g, "/");
    const text = readFileSync(full, "utf8");
    const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
    const aliases = new Set<string>();
    for (const st of sf.statements)
      if (
        ts.isImportDeclaration(st) &&
        ts.isStringLiteral(st.moduleSpecifier) &&
        /^(?:node:)?crypto$/.test(st.moduleSpecifier.text)
      ) {
        for (const el of st.importClause?.namedBindings &&
        ts.isNamedImports(st.importClause.namedBindings)
          ? st.importClause.namedBindings.elements
          : [])
          if ((el.propertyName?.text ?? el.name.text) === "createHash") aliases.add(el.name.text);
      }
    const ord = new Map<string, number>();
    const add = (node: ts.Node, signature: string, algorithm: string, canonical = false) => {
      const symbol = owner(node),
        key = `${symbol}:${signature}`,
        n = (ord.get(key) ?? 0) + 1;
      ord.set(key, n);
      const start = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      const context = text.slice(node.getStart(sf), Math.min(text.length, node.end + 160));
      const trunc = context.match(/\.slice\(0,\s*(\d+)\)/)?.[1];
      const prefixed = context.includes("sha256:") || signature.startsWith("sha256Digest");
      const variant: DigestVariant =
        path === "src/lint/handover-resurrection.ts"
          ? "pure_lint_embedded"
          : canonical
            ? "canonical_json"
            : trunc
              ? "truncated_identity"
              : prefixed
                ? "prefixed_sha256"
                : "bare_sha256";
      const typed = Boolean(migrated[path]) && !migratedSeen.has(path);
      if (typed) migratedSeen.add(path);
      hits.push({
        hit_id: `${path}::${key}::${n}`,
        path,
        line: start.line + 1,
        symbol,
        algorithm,
        input_kind: /readFile|Buffer|Uint8Array/.test(context) ? "bytes" : "string",
        output_encoding: canonical ? "json" : "hex",
        prefix: prefixed ? "sha256:" : null,
        truncation: trunc ? Number(trunc) : null,
        canonicalization: canonical ? "sorted-object-keys-array-order-preserved" : "none",
        variant,
        disposition: typed ? "typed_utility" : "explicit_nonmigration",
        rationale: typed
          ? `${path} ${symbol} ${signature} occurrence ${n} uses ${variant} public artifact encoding`
          : `${path} ${symbol} ${signature} occurrence ${n} preserves ${variant} output until its byte oracle is frozen`,
        expected_test: typed ? (migrated[path] ?? "tests/digest.test.ts") : "tests/digest.test.ts",
        citation: typed ? "IT-DIGEST-001" : "ST-DIGEST-001",
      });
    };
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const expr = node.expression;
        const name = ts.isIdentifier(expr)
          ? expr.text
          : ts.isPropertyAccessExpression(expr)
            ? expr.name.text
            : "";
        if (aliases.has(name)) {
          const alg = literal(node.arguments[0]);
          const normalized = alg?.toLowerCase().replace("-", "");
          if (normalized !== "sha256") {
            if (alg && DIGEST_FALSE_POSITIVE_ALLOWLIST[`${path}:${name}:${alg.toLowerCase()}`]) {
              ts.forEachChild(node, visit);
              return;
            }
            throw new Error(
              `unknown digest algorithm ${path}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
            );
          }
          add(node, `${name}(sha256)`, "sha256");
        } else if (name === "sha256Digest") add(node, "sha256Digest()", "sha256");
        else if (
          name === "digest" &&
          ts.isPropertyAccessExpression(expr) &&
          /subtle/i.test(expr.expression.getText())
        ) {
          const alg = literal(node.arguments[0]);
          if (alg?.toLowerCase().replace("-", "") !== "sha256")
            throw new Error(`unknown SubtleCrypto algorithm ${path}`);
          add(node, "SubtleCrypto.digest(SHA-256)", "sha256");
        }
      } else if (ts.isNewExpression(node) && node.expression.getText() === "CryptoHasher") {
        const alg = literal(node.arguments?.[0]);
        if (alg?.toLowerCase().replace("-", "") !== "sha256")
          throw new Error(`unknown CryptoHasher algorithm ${path}`);
        add(node, "new CryptoHasher(sha256)", "sha256");
      } else if (
        (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
        node.name &&
        /^(canonicalJson|canonicalize|stableJson|stable)$/.test(node.name.getText())
      )
        add(node, `${ts.SyntaxKind[node.kind]} ${node.name.getText()}`, "canonical-json", true);
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return hits;
}
