import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDesignDeclarations,
  parseDesignDeclarationDoc,
} from "../src/vmodel/design-declarations";

describe("typed design declarations (VMFIT)", () => {
  it("frontmatter の spec.defines / refs を typed declaration として読む", () => {
    const doc = parseDesignDeclarationDoc(
      "docs/design/helix/L3-requirements/sample.md",
      `---
layer: L3
spec:
  defines:
    - id: R-001
      kind: 要求
      title: 現在地を明確化する
      layer: L3
      owner: TL
    - id: F-001
      kind: 機能要件
      title: current-location ledger
      layer: L3
  refs:
    - from: F-001
      to: R-001
      kind: derives
---

# sample

| ID | 内容 |
|----|------|
| R-001 | 要求定義 |
| F-001 | 機能定義 |
`,
    );

    expect(doc.ok).toBe(true);
    expect(doc.declarations).toEqual([
      {
        id: "R-001",
        kind: "要求",
        title: "現在地を明確化する",
        layer: "L3",
        owner: "TL",
        status: undefined,
        sourcePath: "docs/design/helix/L3-requirements/sample.md",
        source: "frontmatter",
      },
      {
        id: "F-001",
        kind: "機能要件",
        title: "current-location ledger",
        layer: "L3",
        owner: undefined,
        status: undefined,
        sourcePath: "docs/design/helix/L3-requirements/sample.md",
        source: "frontmatter",
      },
    ]);
    expect(doc.references).toEqual([
      {
        from: "F-001",
        to: "R-001",
        kind: "derives",
        sourcePath: "docs/design/helix/L3-requirements/sample.md",
        source: "frontmatter",
      },
    ]);
  });

  it("本文の fenced yaml spec も読む", () => {
    const doc = parseDesignDeclarationDoc(
      "docs/design/helix/L5-detailed-design/sample.md",
      `---
layer: L5
---

\`\`\`yaml
spec:
  defines:
    - id: TD-001
      kind: テーブル
      name: design_declarations
  traces:
    - from: TD-001
      to: TD-001
\`\`\`

| ID | 内容 |
|----|------|
| TD-001 | design_declarations table |
`,
    );

    expect(doc.ok).toBe(true);
    expect(doc.declarations).toHaveLength(1);
    expect(doc.declarations[0]).toMatchObject({
      id: "TD-001",
      kind: "テーブル",
      title: "design_declarations",
      source: "fenced_yaml",
    });
    expect(doc.references[0]).toMatchObject({
      from: "TD-001",
      to: "TD-001",
      kind: "traces",
    });
  });

  it("spec が無い文書は heuristic-only として warning にする", () => {
    const doc = parseDesignDeclarationDoc(
      "docs/design/helix/L3-requirements/no-spec.md",
      "---\nlayer: L3\n---\n\n# no spec\n",
    );

    expect(doc.ok).toBe(true);
    expect(doc.declarations).toHaveLength(0);
    expect(doc.findings).toEqual([
      {
        code: "spec_missing",
        severity: "warn",
        path: "docs/design/helix/L3-requirements/no-spec.md",
        detail: "spec.defines が無い。heuristic-only detection は完了根拠にしない",
      },
    ]);
  });

  it("defines は id/kind 必須、refs は from/to 必須", () => {
    const doc = parseDesignDeclarationDoc(
      "docs/design/helix/L3-requirements/bad.md",
      `---
spec:
  defines:
    - id: F-001
  refs:
    - from: F-001
---
`,
    );

    expect(doc.ok).toBe(false);
    expect(doc.findings.map((finding) => finding.code)).toEqual([
      "invalid_define",
      "invalid_reference",
    ]);
  });

  it("複数文書で重複定義・未解決参照・参照元欠落を検出する", () => {
    const result = analyzeDesignDeclarations([
      {
        path: "a.md",
        content: `---
spec:
  defines:
    - id: F-001
      kind: 機能要件
  refs:
    - from: F-001
      to: R-404
---

| ID | 内容 |
|----|------|
| F-001 | feature |
`,
      },
      {
        path: "b.md",
        content: `---
spec:
  defines:
    - id: F-001
      kind: 機能要件
  refs:
    - from: X-999
      to: F-001
---

| ID | 内容 |
|----|------|
| F-001 | duplicate feature |
`,
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code).sort()).toEqual([
      "duplicate_define",
      "reference_source_missing",
      "unresolved_reference",
    ]);
  });

  it("宣言のみ・本文未宣言の drift を検出する", () => {
    const result = analyzeDesignDeclarations([
      {
        path: "drift.md",
        content: `---
spec:
  defines:
    - id: F-DECLARED
      kind: 機能要件
---

| ID | 内容 |
|----|------|
| F-UNDECLARED | 本文だけの定義 |
`,
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.findings.map((finding) => finding.code).sort()).toEqual([
      "declaration_only",
      "undeclared_definition",
    ]);
  });

  it("同一 section の本文定義 ID 重複を検出する", () => {
    const doc = parseDesignDeclarationDoc(
      "duplicate-body.md",
      `---
spec:
  defines:
    - id: D-001
      kind: 判断
---

## 判断

| ID | 内容 |
|----|------|
| D-001 | first |
| D-001 | duplicate |
`,
    );

    expect(doc.ok).toBe(false);
    expect(doc.findings).toContainEqual({
      code: "duplicate_body_definition",
      severity: "error",
      path: "duplicate-body.md",
      detail: "D-001: 同一 section の本文定義 ID が重複している",
    });
  });

  it("L5 operation scope contract は実在文書として drift しない", () => {
    const path = "docs/design/helix/L5-detail/operation-scope.md";
    const doc = parseDesignDeclarationDoc(path, readFileSync(path, "utf8"));

    expect(doc.ok).toBe(true);
    expect(doc.findings.filter((finding) => finding.severity === "error")).toEqual([]);
    expect(doc.declarations.map((declaration) => declaration.id)).toEqual(
      expect.arrayContaining([
        "HOD-OPS-LOG-DESIGN",
        "HOD-OPS-KPI-METRIC",
        "HOD-OPS-RUNTIME-VERIFICATION",
        "HOD-OPS-OPERATION-TEST",
        "HOD-OPS-CLASS-METHOD-CONTRACT",
        "HOD-OPS-INCIDENT-RECOVERY-ROUTE",
      ]),
    );
  });

  it("ZIP adoption matrix の判断 ID は section 内で一意", () => {
    const path = "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md";
    const doc = parseDesignDeclarationDoc(path, readFileSync(path, "utf8"));

    expect(doc.ok).toBe(true);
    expect(doc.findings.filter((finding) => finding.code === "duplicate_body_definition")).toEqual(
      [],
    );
    expect(doc.declarations.map((declaration) => declaration.id)).toEqual(
      expect.arrayContaining(["HVM-REJECT-01", "HVM-REJECT-02", "HVM-REJECT-03"]),
    );
  });

  it("UTF-8等の技術用語を未宣言のdesign IDとして誤検出しない", () => {
    const result = analyzeDesignDeclarations([
      {
        path: "technical-terms.md",
        content: `---
spec:
  defines:
    - id: R-001
      kind: 要求
---

| ID | 内容 |
|----|------|
| R-001 | UTF-8 / ISO-8601 / RFC-3339 / SHA-256 を使う |
| R-UNDECLARED | 未宣言の正当な ID |
`,
      },
    ]);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        code: "undeclared_definition",
        detail: expect.stringContaining("R-UNDECLARED"),
      }),
    );
    expect(result.findings).not.toContainEqual(
      expect.objectContaining({
        code: "undeclared_definition",
        detail: expect.stringContaining("UTF-8"),
      }),
    );
  });
});
