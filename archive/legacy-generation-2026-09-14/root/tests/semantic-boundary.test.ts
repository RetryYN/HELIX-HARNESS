// @helix-repo-wide-guard
// PLAN-L7-527-psc-gate-wiring / U-PSC-006（#230 slice5、SA-PSC-03 の実 gate 面）。
// L8テスト設計スライス5表を機械検査する。
import { describe, expect, it } from "vitest";
import { checkSemanticBoundary } from "../src/doctor";
import {
  analyzeSemanticBoundary,
  loadSemanticBoundaryInputs,
  type SemanticBoundaryInputV1,
  semanticBoundaryMessages,
} from "../src/lint/semantic-boundary";

function cleanInput(): SemanticBoundaryInputV1 {
  return {
    semanticSources: [
      {
        path: "src/semantic/semantic-contract-revalidator.ts",
        text: 'import { createHash } from "node:crypto";\nexport function ok() { return 1; }\n',
      },
      {
        path: "src/semantic/semantic-commit-store.ts",
        text: 'import type { HarnessDb } from "../state-db";\ndb.prepare("INSERT INTO semantic_result_records (envelope_digest) VALUES (?)");\n',
      },
    ],
    writerCandidates: [
      {
        path: "src/semantic/semantic-commit-store.ts",
        text: 'db.prepare("INSERT INTO semantic_result_receipts (receipt_id) VALUES (?)");\nUPDATE semantic_result_heads SET semantic_head = ?\n',
      },
      { path: "src/cli.ts", text: "// no semantic write here\n" },
    ],
    semanticTableNames: ["semantic_result_records", "semantic_result_receipts"],
    immutableTableNames: ["semantic_result_records", "semantic_result_receipts", "other_receipts"],
  };
}

describe("semantic boundary gate (PLAN-L7-527)", () => {
  it("U-PSC-006: ADR-010境界の3不変条件を検査し、違反を種別ごとに全列挙する", () => {
    const green = analyzeSemanticBoundary(cleanInput());
    expect(green.ok, JSON.stringify(green.violations).slice(0, 300)).toBe(true);
    expect(green.violations).toEqual([]);
    expect(semanticBoundaryMessages(green)[0]).toContain("OK");

    // (1) Python 非露出: src/semantic から DB path / credential / .helix/ への到達は違反
    for (const [label, text] of [
      ["db-path", "const path = defaultHarnessDbPath(process.cwd());\n"],
      ["credential", "const token = process.env.GITHUB_TOKEN;\n"],
      ["helix-state", 'const p = ".helix/state/psc-out.json";\n'],
      ["repository-write", 'writeFileSync("docs/generated/out.json", body);\n'],
      ["process-spawn", 'spawnSync("python3", [entry], { env });\n'],
    ] as const) {
      const leaky = cleanInput();
      leaky.semanticSources = [
        { path: "src/semantic/semantic-worker-bridge.ts", text },
        ...cleanInput().semanticSources,
      ];
      const result = analyzeSemanticBoundary(leaky);
      expect(result.ok, label).toBe(false);
      expect(
        result.violations.some((v) => v.rule === "python-exposure"),
        label,
      ).toBe(true);
    }

    // (2) 単一 writer: semantic_result_* へ write する別 source があれば違反
    const rogue = cleanInput();
    rogue.writerCandidates = [
      ...cleanInput().writerCandidates,
      {
        path: "src/adapters/rogue-writer.ts",
        text: 'db.exec("INSERT INTO semantic_result_records VALUES (1)");\n',
      },
    ];
    // 動的テーブル名（テンプレートリテラル / 文字列連結 / ORM 風）でのバイパスも捕捉する
    // （review round1 probe527_2 の恒久 oracle）
    for (const [label, text] of [
      [
        "template-literal",
        'const table = "semantic_result_records";\ndb.prepare("INSERT INTO " + table + " VALUES (?)").run(1);\n',
      ],
      [
        "concat",
        'const t = "semantic_result_heads";\ndb.exec("UPDATE " + t + " SET semantic_head = 1");\n',
      ],
      ["orm", 'db.table("semantic_result_records").insert({ a: 1 });\n'],
    ] as const) {
      const dynamic = cleanInput();
      dynamic.writerCandidates = [
        ...cleanInput().writerCandidates,
        { path: "src/adapters/dynamic-writer.ts", text },
      ];
      const dynamicResult = analyzeSemanticBoundary(dynamic);
      expect(dynamicResult.ok, label).toBe(false);
      expect(
        dynamicResult.violations.some((v) => v.rule === "single-writer"),
        label,
      ).toBe(true);
    }

    // 宣言と使用が何行離れていても捕捉する（review round2 probe527_r2_c の恒久 oracle。
    // 3 行窓では gap=2 行で破れていた）
    for (const gap of [0, 2, 5, 10]) {
      const filler = Array.from({ length: gap }, (_, i) => `const filler${i} = ${i};`).join("\n");
      const far = cleanInput();
      far.writerCandidates = [
        ...cleanInput().writerCandidates,
        {
          path: "src/adapters/far-writer.ts",
          text: `const table = "semantic_result_records";\n${filler}\ndb.exec("INSERT INTO " + table + " VALUES (1)");\n`,
        },
      ];
      const farResult = analyzeSemanticBoundary(far);
      expect(farResult.ok, `gap=${gap}`).toBe(false);
      expect(
        farResult.violations.some((v) => v.rule === "single-writer"),
        `gap=${gap}`,
      ).toBe(true);
    }

    // 同名変数の偶発一致は違反にしない（review round3 probe527_r3_b の恒久 oracle。
    // 識別子追跡は SQL キーワードを伴う行に限定して CI の false alarm を避ける）
    const collision = cleanInput();
    collision.writerCandidates = [
      ...cleanInput().writerCandidates,
      {
        path: "src/adapters/ascii-renderer.ts",
        text: [
          'const table = "semantic_result_records";',
          "logger.info(known(table));",
          "",
          "function renderAscii(rows: string[]) {",
          '  const table = rows.join("\\n");',
          "  return renderer.run(table);",
          "}",
          "",
        ].join("\n"),
      },
    ];
    expect(analyzeSemanticBoundary(collision).ok).toBe(true);

    // 登録簿（table 名の列挙だけ）は誤検出しない: 近接検査で write 動詞が同居しない
    const registry = cleanInput();
    registry.writerCandidates = [
      ...cleanInput().writerCandidates,
      {
        path: "src/state-db/projection-writer.ts",
        text: 'const IMMUTABLE = new Set([\n  "semantic_result_records",\n  "semantic_result_heads",\n]);\n',
      },
    ];
    expect(analyzeSemanticBoundary(registry).ok).toBe(true);

    // 文字列リテラル中の `//` が同一行の実違反を隠蔽しない（round1 probe527_3 の恒久 oracle）
    const slashInString = cleanInput();
    slashInString.semanticSources = [
      {
        path: "src/semantic/slash.ts",
        text: 'const s = "see // notes"; const p = defaultHarnessDbPath(cwd);\n',
      },
      ...cleanInput().semanticSources,
    ];
    const slashResult = analyzeSemanticBoundary(slashInString);
    expect(slashResult.ok).toBe(false);
    expect(slashResult.violations.some((v) => v.rule === "python-exposure")).toBe(true);

    const rogueResult = analyzeSemanticBoundary(rogue);
    expect(rogueResult.ok).toBe(false);
    expect(rogueResult.violations.some((v) => v.rule === "single-writer")).toBe(true);
    expect(rogueResult.violations.some((v) => v.path === "src/adapters/rogue-writer.ts")).toBe(
      true,
    );

    // (3) rebuild 保持: IMMUTABLE 未登録の semantic table があれば違反
    const unregistered = cleanInput();
    unregistered.immutableTableNames = ["semantic_result_records"];
    const unregisteredResult = analyzeSemanticBoundary(unregistered);
    expect(unregisteredResult.ok).toBe(false);
    expect(unregisteredResult.violations.some((v) => v.rule === "immutable-registration")).toBe(
      true,
    );
    expect(
      unregisteredResult.violations.some((v) => v.detail.includes("semantic_result_receipts")),
    ).toBe(true);

    // 複数種別の違反は全列挙（1 件目で打ち切らない）
    const mixed = cleanInput();
    mixed.semanticSources = [
      { path: "src/semantic/leak.ts", text: "const t = process.env.GITHUB_TOKEN;\n" },
      ...cleanInput().semanticSources,
    ];
    mixed.immutableTableNames = [];
    const mixedResult = analyzeSemanticBoundary(mixed);
    expect(mixedResult.ok).toBe(false);
    const rules = new Set(mixedResult.violations.map((v) => v.rule));
    expect(rules.has("python-exposure")).toBe(true);
    expect(rules.has("immutable-registration")).toBe(true);
    expect(semanticBoundaryMessages(mixedResult)[0]).toContain("violation");
  });

  it("実 repo regression fence: 境界違反 0 で doctor 経由も同判定", () => {
    const real = analyzeSemanticBoundary(loadSemanticBoundaryInputs(process.cwd()));
    expect(real.violations).toEqual([]);
    expect(real.ok).toBe(true);
    expect(real.semanticSourceCount).toBeGreaterThan(0);

    // fence の実効性: 実 repo 入力へ違反を注入すると必ず落ちる（検出力ゼロの空虚な fence でない）
    const realInputs = loadSemanticBoundaryInputs(process.cwd());
    for (const injected of [
      {
        semanticSources: [
          ...realInputs.semanticSources,
          { path: "src/semantic/injected.ts", text: "const t = process.env.GITHUB_TOKEN;\n" },
        ],
      },
      {
        writerCandidates: [
          ...realInputs.writerCandidates,
          {
            path: "src/adapters/injected-writer.ts",
            text: 'db.exec("UPDATE semantic_result_heads SET semantic_head = ?");\n',
          },
        ],
      },
      { immutableTableNames: [] },
    ]) {
      const mutated = analyzeSemanticBoundary({ ...realInputs, ...injected });
      expect(mutated.ok, JSON.stringify(Object.keys(injected))).toBe(false);
    }

    const doctorResult = checkSemanticBoundary(process.cwd());
    expect(doctorResult.ok).toBe(true);
    expect(doctorResult.messages.join("\n")).toContain("semantic-boundary - OK");
  });
});
